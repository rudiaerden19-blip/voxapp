import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  VoiceOrderSystem,
  OrderState,
  createEmptySession,
  type SessionData,
  type BusinessConfig,
  type OrderItem,
} from '@/lib/voice-engine/VoiceOrderSystem';
import { extractWithGemini, extractNamePhoneWithGemini, type MenuItem } from '@/lib/voice-engine/geminiExtractor';
import { requireTenantFromBusiness, TenantError } from '@/lib/tenant';
import { createCallLog, logCall, logError } from '@/lib/logger';

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

async function saveSession(supabase: DB, sessionId: string, session: SessionData, tenantId: string): Promise<void> {
  await supabase
    .from('voice_sessions')
    .upsert({
      conversation_id: sessionId,
      business_id: tenantId,
      session_data: session,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'conversation_id' });
}

async function deleteSession(supabase: DB, sessionId: string): Promise<void> {
  await supabase.from('voice_sessions').delete().eq('conversation_id', sessionId);
}

// ── Menu cache: 1 DB call per tenant per 5 minuten ────────
const menuCache = new Map<string, { data: MenuData; ts: number }>();
const MENU_CACHE_TTL = 5 * 60 * 1000;

interface MenuData {
  items: string[];
  prices: Record<string, number>;
  modifiers: Set<string>;
  raw: MenuItem[];
}

async function loadMenu(supabase: DB, tenantId: string): Promise<MenuData> {
  const cached = menuCache.get(tenantId);
  if (cached && Date.now() - cached.ts < MENU_CACHE_TTL) return cached.data;

  const { data } = await supabase
    .from('menu_items')
    .select('name, price, is_modifier, category')
    .eq('business_id', tenantId)
    .eq('is_available', true);

  const items: string[] = [];
  const prices: Record<string, number> = {};
  const modifiers = new Set<string>();
  const raw: MenuItem[] = [];

  if (Array.isArray(data)) {
    for (const row of data) {
      if (row.name && typeof row.price === 'number') {
        const lower = row.name.toLowerCase();
        items.push(lower);
        prices[lower] = row.price;
        if (row.is_modifier) modifiers.add(lower);
        raw.push({
          name: row.name,
          price: row.price,
          category: row.category || 'Overig',
          is_modifier: !!row.is_modifier,
        });
      }
    }
  }

  const menuData: MenuData = { items, prices, modifiers, raw };
  menuCache.set(tenantId, { data: menuData, ts: Date.now() });
  return menuData;
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
  if (agentId) {
    const { data } = await supabase
      .from('businesses')
      .select(BUSINESS_SELECT)
      .eq('agent_id', agentId)
      .single();
    if (data) return data as BusinessRow;
  }

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
  const startTime = Date.now();

  try {
    const body = await request.json();

    const messages: { role: string; content: string }[] = body.messages || [];
    const model: string = body.model || 'voice-order-system';
    const userId: string | null = body.user_id || null;
    const extraBody = body.elevenlabs_extra_body || body.extra_body || {};

    const agentId: string | undefined =
      extraBody.agent_id ||
      body.agent_id ||
      request.nextUrl.searchParams.get('agent_id') ||
      undefined;

    const sessionId =
      extraBody.conversation_id ||
      userId ||
      `session_${hashMessages(messages)}`;

    // Caller ID van Twilio (beller telefoonnummer)
    const callerPhone: string | null =
      extraBody.caller_id ||
      extraBody.from ||
      body.caller_id ||
      body.from ||
      body.phone_number ||
      extraBody.phone_number ||
      null;

    console.log(JSON.stringify({
      _tag: 'CALLER_ID_DEBUG',
      conversation_id: sessionId,
      caller_phone: callerPhone,
      extra_body_keys: Object.keys(extraBody),
      extra_body_full: extraBody,
      body_keys: Object.keys(body),
    }));

    let userMessage = '';
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMessage = messages[i].content?.trim() || '';
        break;
      }
    }

    const supabase = getSupabase();
    const business = await resolveBusiness(supabase, agentId);

    // TENANT GUARD — hard fail without tenant
    const tenant = requireTenantFromBusiness(business);
    const tenantId = tenant.tenant_id;

    const callLog = createCallLog(sessionId, tenantId);

    const config = buildConfig(business!);
    const menu = await loadMenu(supabase, tenantId);
    const engine = new VoiceOrderSystem(menu.items, menu.prices, config, menu.modifiers);

    if (!userMessage) {
      callLog.state_transitions.push('GREETING');
      callLog.completion_status = 'in_progress';
      callLog.duration_ms = Date.now() - startTime;
      logCall(callLog);
      return sseResponse(engine.getGreeting(), model);
    }

    let session = await loadSession(supabase, sessionId);
    const prevState = session?.state || 'NEW';
    if (!session) {
      session = createEmptySession();
      if (callerPhone) {
        session.phone = callerPhone;
      }
    }

    // Gemini extractie per state
    let geminiItems: OrderItem[] | null = null;
    let geminiNamePhone: { name: string | null; phone: string | null } | null = null;

    if (session.state === OrderState.TAKING_ORDER) {
      geminiItems = await extractWithGemini(userMessage, menu.raw);
    } else if (session.state === OrderState.GET_NAME_PHONE) {
      geminiNamePhone = await extractNamePhoneWithGemini(userMessage);
    }

    const result = engine.handle(session, userMessage, sessionId, geminiItems, geminiNamePhone);
    session = result.session;

    callLog.state_transitions.push(`${prevState} → ${session.state}`);

    if (session.state === OrderState.DONE) {
      const orderData = engine.buildOrderData(session);
      const { notes, total } = engine.buildReceiptNotes(session);

      console.log(JSON.stringify({
        _tag: 'ORDER_TRACE',
        conversation_id: sessionId,
        step: '6_KITCHEN',
        order_data: orderData,
        receipt_notes: notes,
        receipt_total: total,
      }));

      await supabase.from('orders').insert({
        business_id: tenantId,
        customer_name: orderData.name || 'Telefoon klant',
        customer_phone: orderData.phone || '',
        order_type: orderData.delivery_type === 'levering' ? 'delivery' : 'pickup',
        notes,
        status: 'pending',
        source: 'phone',
        total_amount: total,
        created_at: orderData.timestamp,
      });

      await deleteSession(supabase, sessionId);

      callLog.completion_status = 'completed';
      callLog.items_count = orderData.items.length;
      callLog.total_amount = total;
    } else {
      await saveSession(supabase, sessionId, session, tenantId);
      callLog.completion_status = 'in_progress';
    }

    callLog.end_time = new Date().toISOString();
    callLog.duration_ms = Date.now() - startTime;
    logCall(callLog);

    return sseResponse(result.response, model);

  } catch (error: unknown) {
    if (error instanceof TenantError) {
      logError('UNKNOWN', 'UNKNOWN', error);
      return sseResponse('Excuseer, er is een probleem. Probeer later opnieuw.', 'voice-order-system');
    }
    logError('UNKNOWN', 'UNKNOWN', error);
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
