export const runtime = 'edge';

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
// AGENDA CHECK — is datum+uur vrij?
// ============================================================

async function isSlotVrij(
  supabase: DB,
  tenantId: string,
  datumIso: string,
  uur: number,
): Promise<boolean> {
  const { data } = await supabase
    .from('appointments')
    .select('id')
    .eq('business_id', tenantId)
    .eq('appointment_date', datumIso)
    .eq('appointment_time', `${String(uur).padStart(2, '0')}:00`)
    .neq('status', 'cancelled');

  return !data || data.length === 0;
}

// ============================================================
// BUSINESS + DIENSTEN LOADER
// ============================================================

const bizCache = new Map<string, { config: BusinessConfig; tenantId: string; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function loadBusiness(supabase: DB, agentId?: string): Promise<{ config: BusinessConfig; tenantId: string } | null> {
  const cacheKey = agentId || 'default';
  const cached = bizCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { config: cached.config, tenantId: cached.tenantId };
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

  const finalServices = services.length > 0 ? services : [
    { name: 'Knippen', duration_minutes: 30 },
    { name: 'Knippen en wassen', duration_minutes: 45 },
    { name: 'Brushen', duration_minutes: 45 },
    { name: 'Kleuren', duration_minutes: 90 },
    { name: 'Highlights', duration_minutes: 120 },
    { name: 'Baard trimmen', duration_minutes: 20 },
  ];

  const config: BusinessConfig = {
    name: bizRow.name || 'ons kapsalon',
    ai_name: bizRow.ai_name || 'Anja',
    services: finalServices,
  };

  bizCache.set(cacheKey, { config, tenantId: bizRow.id, ts: Date.now() });
  return { config, tenantId: bizRow.id };
}

// ============================================================
// SSE HELPERS
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
    const messages = body.messages || [];
    const model = body.model || "appointment-system";

    console.log("DEBUG BODY:", JSON.stringify(body));

    const call = body.call || {};
    const agentId: string | undefined =
      call.assistantId || body.assistantId ||
      request.nextUrl.searchParams.get('agent_id') || undefined;

    const sessionId: string = call.id || `session_${Date.now()}`;
    const callerPhone: string | null = call.customer?.number || null;

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

    if (!userMessage) {
      return sseResponse(engine.getGreeting(), model);
    }

    let session = await loadSession(supabase, sessionId);
    if (!session) {
      session = createEmptySession();
    }

    if (callerPhone && !session.telefoon) {
      session.telefoon = callerPhone;
    }

    const result = engine.handle(session, userMessage);
    session = result.session;

    if (
      result.shouldCheckAvailability === true &&
      typeof session.datum_iso === "string" &&
      typeof session.tijdstip_h === "number"
    ) {
      const vrij = await isSlotVrij(supabase, tenantId, session.datum_iso, session.tijdstip_h);

      if (vrij) {
        const available = engine.availableResponse(session);
        session = available.session;
        await saveSession(supabase, sessionId, session, tenantId);
        return sseResponse(available.response, model);
      } else {
        const unavailable = engine.unavailableResponse(session);
        session = unavailable.session;
        await saveSession(supabase, sessionId, session, tenantId);
        return sseResponse(unavailable.response, model);
      }
    }

    if (session.state === AppointmentState.DONE) {
      const data = engine.buildAppointmentData(session);

      await supabase.from('appointments').insert({
        business_id: tenantId,
        customer_name: data.naam,
        customer_phone: data.telefoon || session.telefoon || '',
        service_name: data.dienst,
        appointment_date: data.datum_iso,
        appointment_time: `${String(session.tijdstip_h ?? 0).padStart(2, '0')}:00`,
        status: 'confirmed',
        source: 'phone',
        notes: `${data.dienst} op ${data.datum} om ${data.tijdstip}`,
        created_at: new Date().toISOString(),
      });

      await deleteSession(supabase, sessionId);
    } else {
      await saveSession(supabase, sessionId, session, tenantId);
    }

    if (!result.response || result.response.trim() === "") {
      return sseResponse("Kan je dat even herhalen?", model);
    }

    return sseResponse(result.response, model);

  } catch (error) {
    console.error("[appointments] Error:", error);

    try {
      const cloned = request.clone();
      const debugBody = await cloned.json();
      console.error("[appointments] Request body:", JSON.stringify(debugBody));
    } catch (e) {
      console.error("[appointments] Could not log request body");
    }

    return sseResponse("Excuseer, kan u dat herhalen?", "appointment-system");
  }
}
