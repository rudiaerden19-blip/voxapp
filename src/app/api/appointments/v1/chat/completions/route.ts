import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  AppointmentSystem,
  AppointmentState,
  createEmptySession,
  type AppointmentSession,
  type BusinessConfig,
  type ServiceConfig,
} from '@/lib/appointment-engine/AppointmentSystem';

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

async function loadSession(supabase: DB, sessionId: string): Promise<AppointmentSession | null> {
  const { data } = await supabase
    .from('voice_sessions')
    .select('session_data')
    .eq('conversation_id', sessionId)
    .single();
  return data?.session_data || null;
}

async function saveSession(supabase: DB, sessionId: string, session: AppointmentSession, tenantId: string): Promise<void> {
  await supabase.from('voice_sessions').upsert({
    conversation_id: sessionId,
    business_id: tenantId,
    session_data: session,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'conversation_id' });
}

async function deleteSession(supabase: DB, sessionId: string): Promise<void> {
  await supabase.from('voice_sessions').delete().eq('conversation_id', sessionId);
}

// ============================================================
// BUSINESS + DIENSTEN LOADER
// ============================================================

const bizCache = new Map<string, { data: BusinessConfig; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function loadBusiness(supabase: DB, agentId?: string): Promise<{ config: BusinessConfig; tenantId: string } | null> {
  const cacheKey = agentId || 'default';
  const cached = bizCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { config: cached.data, tenantId: cacheKey };
  }

  let bizRow: DB = null;

  if (agentId) {
    const { data } = await supabase
      .from('businesses')
      .select('id, name, ai_name, welcome_message')
      .eq('agent_id', agentId)
      .single();
    bizRow = data;
  }

  if (!bizRow) {
    const { data } = await supabase
      .from('businesses')
      .select('id, name, ai_name, welcome_message')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    bizRow = data;
  }

  if (!bizRow) return null;

  const { data: servicesData } = await supabase
    .from('services')
    .select('name, duration_minutes')
    .eq('business_id', bizRow.id)
    .eq('is_active', true)
    .order('name');

  const services: ServiceConfig[] = (servicesData || []).map((s: DB) => ({
    name: s.name,
    duration_minutes: s.duration_minutes || 30,
  }));

  // Fallback kapper diensten als DB leeg is
  const finalServices = services.length > 0 ? services : [
    { name: 'Knippen', duration_minutes: 30 },
    { name: 'Knippen en wassen', duration_minutes: 45 },
    { name: 'Kleuren', duration_minutes: 90 },
    { name: 'Highlights', duration_minutes: 120 },
    { name: 'Baard trimmen', duration_minutes: 20 },
  ];

  const config: BusinessConfig = {
    name: bizRow.name,
    ai_name: bizRow.ai_name || 'Anja',
    welcome_message: bizRow.welcome_message ||
      `Goeiedag, u spreekt met ${bizRow.name}. Waarvoor wil u een afspraak maken?`,
    services: finalServices,
  };

  bizCache.set(cacheKey, { data: config, ts: Date.now() });
  return { config, tenantId: bizRow.id };
}

// ============================================================
// SSE HELPERS — OpenAI Chat Completions formaat
// ============================================================

function sseChunk(content: string, model: string, finish: string | null = null): string {
  return `data: ${JSON.stringify({
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, delta: finish ? {} : { content }, finish_reason: finish }],
  })}\n\n`;
}

function sseResponse(text: string, model: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(sseChunk(text, model)));
      controller.enqueue(encoder.encode(sseChunk('', model, 'stop')));
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
// POST — Vapi Custom LLM endpoint
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: { role: string; content: string }[] = body.messages || [];
    const model = body.model || 'appointment-system';

    const extraBody = body.vapi_extra_body || body.extra_body || {};
    const agentId: string | undefined =
      extraBody.assistant_id || body.assistant_id ||
      request.nextUrl.searchParams.get('agent_id') || undefined;

    const sessionId: string =
      extraBody.call_id || body.call_id ||
      `session_${Date.now()}`;

    // Laatste user bericht
    let userMessage = '';
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMessage = messages[i].content?.trim() || '';
        break;
      }
    }

    const supabase = getSupabase();
    const biz = await loadBusiness(supabase, agentId);

    if (!biz) {
      return sseResponse('Excuseer, er is een technisch probleem. Probeer later opnieuw.', model);
    }

    const { config, tenantId } = biz;
    const engine = new AppointmentSystem(config);

    // Eerste begroeting (geen user message)
    if (!userMessage) {
      return sseResponse(engine.getGreeting(), model);
    }

    let session = await loadSession(supabase, sessionId);
    if (!session) session = createEmptySession();

    const result = engine.handle(session, userMessage);
    session = result.session;

    if (session.state === AppointmentState.DONE) {
      const data = engine.buildAppointmentData(session);

      await supabase.from('appointments').insert({
        business_id: tenantId,
        customer_name: data.naam,
        customer_phone: data.telefoon,
        service_name: data.dienst,
        appointment_date: data.datum,
        appointment_time: data.tijdstip,
        status: 'pending',
        source: 'phone',
        notes: `Geboekt via AI | ${data.dienst} op ${data.datum} om ${data.tijdstip}`,
        created_at: data.timestamp,
      });

      await deleteSession(supabase, sessionId);
    } else {
      await saveSession(supabase, sessionId, session, tenantId);
    }

    return sseResponse(result.response, model);

  } catch (error) {
    console.error('[appointments] Error:', error);
    return sseResponse('Excuseer, kan u dat herhalen?', 'appointment-system');
  }
}
