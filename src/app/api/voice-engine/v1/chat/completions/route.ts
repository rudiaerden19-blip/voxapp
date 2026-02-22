import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  VoiceOrderSystem,
  OrderState,
  createEmptySession,
  type SessionData,
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

async function resolveBusiness(supabase: DB, agentId?: string): Promise<{ id: string; name: string } | null> {
  // If agent_id is provided, look up by elevenlabs_agent_id
  if (agentId) {
    const { data } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('elevenlabs_agent_id', agentId)
      .single();
    if (data) return data as { id: string; name: string };
  }

  // Fallback: find frituur nolim specifically
  const { data } = await supabase
    .from('businesses')
    .select('id, name')
    .ilike('name', '%nolim%')
    .limit(1)
    .single();
  return data as { id: string; name: string } | null;
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
    const extraBody = body.elevenlabs_extra_body || {};

    // Session ID: use user_id, or extra_body conversation_id, or hash from messages
    const sessionId = userId || extraBody.conversation_id || `session_${hashMessages(messages)}`;

    // Extract the LAST user message
    let userMessage = '';
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMessage = messages[i].content?.trim() || '';
        break;
      }
    }

    // If no user message yet (first turn), return the greeting
    if (!userMessage) {
      return sseResponse('Hallo, met Frituur Nolim, met Anja. Kan ik uw bestelling opnemen?', model);
    }

    const supabase = getSupabase();
    const business = await resolveBusiness(supabase, extraBody.agent_id);
    if (!business) {
      return sseResponse('Excuseer, er is een probleem. Probeer later opnieuw.', model);
    }

    const { items: menuItems, prices: menuPrices } = await loadMenu(supabase, business.id);

    // Load or create session
    let session = await loadSession(supabase, sessionId);
    if (!session) {
      session = createEmptySession();
    }

    // Run state machine
    const engine = new VoiceOrderSystem(menuItems, menuPrices);
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

      console.log('Voice engine: order created —', orderData.name, '—', orderData.items.length, 'items — €' + total.toFixed(2));
      await deleteSession(supabase, sessionId);
    } else {
      await saveSession(supabase, sessionId, session, business.id);
    }

    return sseResponse(result.response, model);

  } catch (error: unknown) {
    console.error('Voice engine error:', error);
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
      // Send the response text as a single chunk
      controller.enqueue(encoder.encode(buildSSEChunk(text, model)));
      // Send finish
      controller.enqueue(encoder.encode(buildSSEChunk('', model, 'stop')));
      // Send done
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
