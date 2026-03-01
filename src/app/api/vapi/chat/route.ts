import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseTranscript } from '@/lib/appointment-engine/NLU';
import { transition } from '@/lib/appointment-engine/StateMachine';
import { getSession, saveSession } from '@/lib/appointment-engine/SessionStore';
import { generateResponse } from '@/lib/appointment-engine/ResponseGenerator';
import {
  checkAvailability,
  getServices,
  matchService,
  getBusinessByAssistantId,
} from '@/lib/appointment-engine/AvailabilityChecker';
import { AppointmentState, SessionState, CollectedData } from '@/lib/appointment-engine/types';
import { logInfo, logError } from '@/lib/apiLogger';

const ROUTE = '/api/vapi/chat';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars ontbreken');
  return createClient(url, key);
}

const EMPTY_COLLECTED: CollectedData = {
  service: null, date: null, time: null, name: null, phone: null,
};

/**
 * Rebuild session state from Vapi message history.
 * Vapi stuurt het volledige gesprek als messages[] bij elk request,
 * zodat we state kunnen reconstrueren als de DB sessie ontbreekt.
 */
function rebuildSessionFromMessages(
  messages: { role: string; content: string }[],
  callId: string,
  businessId: string,
): SessionState {
  const session: SessionState = {
    callId,
    businessId,
    state: AppointmentState.GREETING,
    collected: { ...EMPTY_COLLECTED },
    retries: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Replay alle user messages om entities te verzamelen
  for (const msg of messages) {
    if (msg.role !== 'user' || !msg.content?.trim()) continue;
    const intent = parseTranscript(msg.content.trim());

    if (intent.entities.service) session.collected.service = intent.entities.service;
    if (intent.entities.date) session.collected.date = intent.entities.date;
    if (intent.entities.time) session.collected.time = intent.entities.time;
    if (intent.entities.name) session.collected.name = intent.entities.name;
    if (intent.entities.phone) session.collected.phone = intent.entities.phone;
  }

  // Bepaal state op basis van wat al verzameld is
  if (session.collected.service) session.state = AppointmentState.COLLECT_DATE;
  if (session.collected.date) session.state = AppointmentState.COLLECT_TIME;
  if (session.collected.time) session.state = AppointmentState.COLLECT_NAME;
  if (session.collected.name) session.state = AppointmentState.CHECK_AVAILABILITY;

  return session;
}

/**
 * POST /api/vapi/chat
 *
 * Custom LLM endpoint voor Vapi EU.
 * Ontvangt OpenAI-compatible chat completion requests,
 * orkestreert via deterministische state machine,
 * retourneert altijd SSE stream (nooit plain JSON).
 */
export async function POST(request: NextRequest) {
  const startMs = Date.now();

  try {
    const body = await request.json();

    console.log('[vapi/chat] Request keys:', Object.keys(body));
    console.log('[vapi/chat] body.call:', JSON.stringify(body.call || null).slice(0, 500));
    console.log('[vapi/chat] body.metadata:', JSON.stringify(body.metadata || null).slice(0, 300));
    console.log('[vapi/chat] messages count:', (body.messages || []).length);

    const messages: { role: string; content: string }[] = body.messages || [];
    const callId = body.call?.id || body.metadata?.call_id || `call_${Date.now()}`;
    const assistantId =
      body.call?.assistantId ||
      body.call?.assistant?.id ||
      body.metadata?.assistantId ||
      process.env.VAPI_ASSISTANT_ID ||
      '';

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const transcript = lastUserMsg?.content?.trim() || '';

    console.log('[vapi/chat] callId:', callId, '| assistantId:', assistantId, '| transcript:', transcript.slice(0, 120));
    logInfo(ROUTE, 'Inkomend', { callId, assistantId, transcript: transcript.slice(0, 100) });

    // --- Business lookup (met meerdere fallback niveaus) ---
    let businessId = '';
    let businessName = 'onze zaak';
    let dbAvailable = true;

    try {
      if (assistantId) {
        const biz = await getBusinessByAssistantId(assistantId);
        if (biz) {
          businessId = biz.id;
          businessName = biz.name;
        }
      }

      if (!businessId) {
        const fallback = process.env.DEFAULT_TENANT_ID;
        if (fallback) {
          businessId = fallback;
          console.log('[vapi/chat] Fallback naar DEFAULT_TENANT_ID:', fallback);
        }
      }
    } catch (bizError) {
      console.error('[vapi/chat] Business lookup fout:', bizError instanceof Error ? bizError.message : bizError);
      dbAvailable = false;
    }

    // --- Session ophalen of reconstrueren ---
    let session: SessionState;

    if (businessId && dbAvailable) {
      try {
        session = await getSession(callId, businessId);
        console.log('[vapi/chat] DB session state:', session.state, '| collected:', JSON.stringify(session.collected));
      } catch (sessionError) {
        console.error('[vapi/chat] Session ophalen mislukt, rebuild van messages:', sessionError instanceof Error ? sessionError.message : sessionError);
        session = rebuildSessionFromMessages(messages, callId, businessId);
        dbAvailable = false;
      }
    } else {
      console.log('[vapi/chat] Geen business gevonden, stateless mode');
      session = rebuildSessionFromMessages(messages, callId, businessId || 'no-tenant');
      dbAvailable = false;
    }

    // Als dit het eerste bericht is (GREETING state en geen transcript)
    if (session.state === AppointmentState.GREETING && !transcript) {
      let services;
      try { services = businessId ? await getServices(businessId) : undefined; } catch { /* ignore */ }
      const greeting = generateResponse('GREETING', session.collected, businessName, { services });
      return sseResponse(greeting);
    }

    // Parse het transcript
    const intent = parseTranscript(transcript);
    console.log('[vapi/chat] Intent:', intent.intent, '| entities:', JSON.stringify(intent.entities));
    logInfo(ROUTE, 'Parsed intent', {
      callId, intent: intent.intent, entities: intent.entities, confidence: intent.confidence,
    });

    // In GREETING of COLLECT_SERVICE: probeer service te matchen
    if (
      (session.state === AppointmentState.GREETING || session.state === AppointmentState.COLLECT_SERVICE)
      && !session.collected.service
    ) {
      try {
        const services = businessId ? await getServices(businessId) : [];
        if (services.length > 0) {
          const matched = matchService(transcript, services);
          if (matched) {
            intent.entities.service = matched.name;
            session.collected.service = matched.name;
            console.log('[vapi/chat] Service gematcht:', matched.name);
          }
        }
        // Geen services in DB of geen match: accepteer input als service
        if (!session.collected.service && transcript.length >= 2) {
          const cleaned = transcript.replace(/^(om te|ik wil|graag|een)\s+/i, '').trim();
          if (cleaned.length >= 2) {
            intent.entities.service = cleaned;
            session.collected.service = cleaned;
            console.log('[vapi/chat] Service uit vrije tekst:', cleaned);
          }
        }
      } catch { /* services ophalen mislukt, gaat door met state machine */ }
    }

    // State machine transition
    const result = transition(session, intent);
    session.state = result.newState;
    console.log('[vapi/chat] Transition →', result.newState, '| response:', result.response);

    // Check availability
    if (result.shouldCheckAvailability && session.collected.date && session.collected.time && businessId) {
      try {
        const services = await getServices(businessId);
        const matchedService = session.collected.service
          ? services.find(s => s.name.toLowerCase() === session.collected.service!.toLowerCase())
          : null;
        const duration = matchedService?.duration_minutes || 30;

        const avail = await checkAvailability(
          businessId, session.collected.date, session.collected.time, duration,
        );

        if (!avail.available) {
          const responseCode = avail.reason?.includes('gesloten') ? 'CLOSED_ON_DAY' : 'SLOT_UNAVAILABLE';
          session.state = AppointmentState.COLLECT_TIME;
          if (responseCode === 'SLOT_UNAVAILABLE') {
            session.collected.time = null;
          } else {
            session.collected.date = null;
            session.collected.time = null;
          }
          if (dbAvailable) await saveSession(session);

          const response = generateResponse(responseCode, session.collected, businessName, { availability: avail });
          return sseResponse(response);
        }

        session.state = AppointmentState.CONFIRM;
        if (dbAvailable) await saveSession(session);
        return sseResponse(generateResponse('CONFIRM_DETAILS', session.collected, businessName));
      } catch (availError) {
        console.error('[vapi/chat] Availability check mislukt:', availError instanceof Error ? availError.message : availError);
      }
    }

    // Boek als nodig
    if (result.shouldBook && businessId) {
      try {
        const bookingResult = await bookAppointment(session, businessId);
        if (bookingResult.success) {
          session.state = AppointmentState.SUCCESS;
          if (dbAvailable) await saveSession(session);
          const response = generateResponse('BOOKING_SUCCESS', session.collected, businessName);
          logInfo(ROUTE, 'Afspraak geboekt', { callId, naam: session.collected.name });
          return sseResponse(response);
        } else {
          session.state = AppointmentState.ERROR;
          if (dbAvailable) await saveSession(session);
          return sseResponse(generateResponse('BOOKING_FAILED', session.collected, businessName));
        }
      } catch (bookError) {
        console.error('[vapi/chat] Booking mislukt:', bookError instanceof Error ? bookError.message : bookError);
        return sseResponse(generateResponse('BOOKING_FAILED', session.collected, businessName));
      }
    }

    // Sla sessie op (als DB beschikbaar)
    if (dbAvailable) {
      try { await saveSession(session); } catch { /* ignore save errors */ }
    }

    // Genereer response
    let services;
    try {
      services = session.state === AppointmentState.COLLECT_SERVICE && businessId
        ? await getServices(businessId) : undefined;
    } catch { /* ignore */ }

    const response = generateResponse(result.response, session.collected, businessName, { services });

    logInfo(ROUTE, 'Response', {
      callId, state: session.state, response: response.slice(0, 100), durationMs: Date.now() - startMs,
    });

    return sseResponse(response);

  } catch (error) {
    logError(ROUTE, error);
    console.error('[vapi/chat] FATAL:', error instanceof Error ? `${error.message}\n${error.stack}` : error);
    return sseResponse('Sorry, er ging iets mis. Probeer het later opnieuw.');
  }
}

/**
 * Boek de afspraak in Supabase.
 */
async function bookAppointment(
  session: { collected: { name: string | null; service: string | null; date: string | null; time: string | null; phone: string | null }; businessId: string },
  businessId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    const { name, service, date, time, phone } = session.collected;

    if (!name || !date || !time) {
      return { success: false, error: 'Incomplete gegevens' };
    }

    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    // Duplicate check
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id')
      .eq('business_id', businessId)
      .neq('status', 'cancelled')
      .gte('start_time', startTime.toISOString())
      .lt('start_time', endTime.toISOString())
      .limit(1);

    if (conflicts && conflicts.length > 0) {
      return { success: false, error: 'Tijdstip bezet' };
    }

    const { error: insertError } = await supabase.from('appointments').insert({
      business_id: businessId,
      customer_name: name,
      customer_phone: phone || '',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'confirmed',
      booked_by: 'ai-orchestrator',
      notes: `${service || 'afspraak'} - geboekt via eigen orchestratie`,
    });

    if (insertError) {
      if (insertError.code === '23505') {
        return { success: false, error: 'Tijdstip net geboekt' };
      }
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Onbekende fout' };
  }
}

/**
 * SSE streaming response in OpenAI format.
 * Vapi verwacht dit formaat.
 */
function sseResponse(content: string): Response {
  const id = `chatcmpl-voxapp-${Date.now()}`;

  const chunk = {
    id,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'voxapp-orchestrator',
    choices: [{
      index: 0,
      delta: { role: 'assistant', content },
      finish_reason: null,
    }],
  };

  const doneChunk = {
    id,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'voxapp-orchestrator',
    choices: [{
      index: 0,
      delta: {},
      finish_reason: 'stop',
    }],
  };

  const body = `data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify(doneChunk)}\n\ndata: [DONE]\n\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

