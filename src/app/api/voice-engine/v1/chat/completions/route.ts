import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  VoiceOrderSystem,
  OrderState,
  createEmptySession,
  type SessionData,
  type BusinessConfig,
} from '@/lib/voice-engine/VoiceOrderSystem';

// ============================================================
// SUPABASE
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any;

async function loadSession(supabase: DB, sessionId: string): Promise<SessionData | null> {
  const { data } = await supabase
    .from('voice_sessions')
    .select('session_data')
    .eq('conversation_id', sessionId)
    .single();
  return data?.session_data || null;
}

async function saveSession(supabase: DB, sessionId: string, session: SessionData, businessId: string): Promise<void> {
  await supabase
    .from('voice_sessions')
    .upsert({
      conversation_id: sessionId,
      business_id: businessId,
      session_data: session,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'conversation_id' });
}

async function deleteSession(supabase: DB, sessionId: string): Promise<void> {
  await supabase.from('voice_sessions').delete().eq('conversation_id', sessionId);
}

async function loadMenu(supabase: DB, businessId: string) {
  const { data } = await supabase
    .from('menu_items')
    .select('name, price')
    .eq('business_id', businessId)
    .eq('is_available', true);
  const items: string[] = [];
  const prices: Record<string, number> = {};
  if (Array.isArray(data)) {
    for (const row of data) {
      if (row.name && typeof row.price === 'number') {
        const lower = row.name.toLowerCase();
        items.push(lower);
        prices[lower] = row.price;
      }
    }
  }
  return { items, prices };
}

interface BusinessRow {
  id: string;
  name: string;
  welcome_message: string | null;
  ai_name: string | null;
  prep_time_pickup: number | null;
  prep_time_delivery: number | null;
  delivery_enabled: boolean | null;
}

const BUSINESS_SELECT = 'id, name, welcome_message, ai_name, prep_time_pickup, prep_time_delivery, delivery_enabled';

async function resolveBusiness(supabase: DB, agentId?: string): Promise<BusinessRow | null> {
  // 1. Try by ElevenLabs agent_id
  if (agentId) {
    const { data } = await supabase
      .from('businesses')
      .select(BUSINESS_SELECT)
      .eq('agent_id', agentId)
      .single();
    if (data) return data as BusinessRow;
  }

  // 2. Fallback: first frituur business that has menu items
  const { data } = await supabase
    .from('businesses')
    .select(BUSINESS_SELECT)
    .eq('type', 'frituur')
    .order('created_at', { ascending: true });

  if (Array.isArray(data)) {
    for (const biz of data) {
      const { count } = await supabase
        .from('menu_items')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', biz.id)
        .eq('is_available', true);
      if (count && count > 0) return biz as BusinessRow;
    }
    if (data.length > 0) return data[0] as BusinessRow;
  }

  return null;
}

function buildConfig(biz: BusinessRow): BusinessConfig {
  return {
    name: biz.name,
    ai_name: biz.ai_name || 'Anja',
    welcome_message: biz.welcome_message || `Hallo, met ${biz.name}, wat kan ik voor u doen?`,
    prep_time_pickup: biz.prep_time_pickup || 20,
    prep_time_delivery: biz.prep_time_delivery || 30,
    delivery_enabled: biz.delivery_enabled ?? true,
  };
}

// ============================================================
// SSE HELPERS — OpenAI Chat Completions format
// ============================================================

function buildSSEChunk(content: string, model: string, finishReason: string | null = null): string {
  const chunk = {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{
      index: 0,
      delta: finishReason ? {} : { content },
      finish_reason: finishReason,
    }],
  };
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

// ============================================================
// POST — OpenAI-compatible /v1/chat/completions endpoint
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const messages: { role: string; content: string }[] = body.messages || [];
    const model: string = body.model || 'voice-order-system';
    const userId: string | null = body.user_id || null;
    const extraBody = body.elevenlabs_extra_body || body.extra_body || {};

    // Agent ID from ElevenLabs request
    const agentId: string | undefined =
      extraBody.agent_id ||
      body.agent_id ||
      request.nextUrl.searchParams.get('agent_id') ||
      undefined;

    // Session ID: conversation_id > user_id > hash
    const sessionId =
      extraBody.conversation_id ||
      userId ||
      `session_${hashMessages(messages)}`;

    // Extract the LAST user message
    let userMessage = '';
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMessage = messages[i].content?.trim() || '';
        break;
      }
    }

    const supabase = getSupabase();
    const business = await resolveBusiness(supabase, agentId);
    if (!business) {
      return sseResponse('Excuseer, er is een probleem. Probeer later opnieuw.', model);
    }

    const config = buildConfig(business);
    const { items: menuItems, prices: menuPrices } = await loadMenu(supabase, business.id);
    const engine = new VoiceOrderSystem(menuItems, menuPrices, config);

    // First turn — no user message yet → return greeting
    if (!userMessage) {
      return sseResponse(engine.getGreeting(), model);
    }

    // Load or create session
    let session = await loadSession(supabase, sessionId);
    if (!session) {
      session = createEmptySession();
    }

    // Run state machine
    const result = engine.handle(session, userMessage);
    session = result.session;

    // If DONE → insert order, delete session
    if (session.state === OrderState.DONE) {
      const orderData = engine.buildOrderData(session);
      const { notes, total } = engine.buildReceiptNotes(session);

      await supabase.from('orders').insert({
        business_id: business.id,
        customer_name: orderData.name || 'Telefoon klant',
        customer_phone: orderData.phone || '',
        order_type: orderData.delivery_type === 'levering' ? 'delivery' : 'pickup',
        notes,
        status: 'pending',
        source: 'phone',
        total_amount: total,
        created_at: orderData.timestamp,
      });

      console.log(`[voice-engine] Order created — ${business.name} — ${orderData.name} — ${orderData.items.length} items — €${total.toFixed(2)}`);
      await deleteSession(supabase, sessionId);
    } else {
      await saveSession(supabase, sessionId, session, business.id);
    }

    return sseResponse(result.response, model);

  } catch (error: unknown) {
    console.error('[voice-engine] Error:', error);
    return sseResponse('Excuseer, kan je dat herhalen?', 'voice-order-system');
  }
}

// ============================================================
// SSE RESPONSE BUILDER
// ============================================================

function sseResponse(text: string, model: string): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(buildSSEChunk(text, model)));
      controller.enqueue(encoder.encode(buildSSEChunk('', model, 'stop')));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// ============================================================
// HASH HELPER — stable session key from messages
// ============================================================

function hashMessages(messages: { role: string; content: string }[]): string {
  const str = messages.slice(0, 3).map(m => `${m.role}:${m.content?.slice(0, 50)}`).join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
