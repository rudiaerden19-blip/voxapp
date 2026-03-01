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
import { AppointmentState } from '@/lib/appointment-engine/types';
import { logInfo, logError } from '@/lib/apiLogger';

const ROUTE = '/api/vapi/chat';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars ontbreken');
  return createClient(url, key);
}

/**
 * POST /api/vapi/chat
 *
 * Custom LLM endpoint voor Vapi EU.
 * Ontvangt OpenAI-compatible chat completion requests,
 * orkestreert via deterministische state machine,
 * retourneert SSE stream of JSON.
 */
export async function POST(request: NextRequest) {
  const startMs = Date.now();

  try {
    const body = await request.json();
    const messages: { role: string; content: string }[] = body.messages || [];
    const callId = body.call?.id || body.metadata?.call_id || `call_${Date.now()}`;
    const assistantId = body.call?.assistantId || body.metadata?.assistantId || '';

    // Pak de laatste user message
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const transcript = lastUserMsg?.content?.trim() || '';

    logInfo(ROUTE, 'Inkomend transcript', { callId, transcript: transcript.slice(0, 100) });

    // Lookup business
    let businessId = '';
    let businessName = 'onze zaak';

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
      } else {
        logError(ROUTE, 'Geen business gevonden', { assistantId });
        return jsonResponse('Er ging iets mis. Probeer later opnieuw.');
      }
    }

    // Haal of maak sessie
    const session = await getSession(callId, businessId);

    // Als dit het eerste bericht is (GREETING state en geen transcript)
    if (session.state === AppointmentState.GREETING && !transcript) {
      const services = await getServices(businessId);
      const greeting = generateResponse('GREETING', session.collected, businessName, { services });
      return sseResponse(greeting);
    }

    // Parse het transcript
    const intent = parseTranscript(transcript);
    logInfo(ROUTE, 'Parsed intent', {
      callId,
      intent: intent.intent,
      entities: intent.entities,
      confidence: intent.confidence,
    });

    // In COLLECT_SERVICE state: probeer de input te matchen tegen diensten
    if (session.state === AppointmentState.COLLECT_SERVICE && !session.collected.service) {
      const services = await getServices(businessId);
      if (services.length > 0) {
        const matched = matchService(transcript, services);
        if (matched) {
          intent.entities.service = matched.name;
          session.collected.service = matched.name;
        }
      }
      // Als het niet matcht, laat de state machine het afhandelen via retry
    }

    // State machine transition
    const result = transition(session, intent);

    // Update session state
    session.state = result.newState;

    // Check availability als nodig
    if (result.shouldCheckAvailability && session.collected.date && session.collected.time) {
      const services = await getServices(businessId);
      const matchedService = session.collected.service
        ? services.find(s => s.name.toLowerCase() === session.collected.service!.toLowerCase())
        : null;
      const duration = matchedService?.duration_minutes || 30;

      const avail = await checkAvailability(
        businessId,
        session.collected.date,
        session.collected.time,
        duration,
      );

      if (!avail.available) {
        // Slot niet beschikbaar — genereer response met alternatieven
        const responseCode = avail.reason?.includes('gesloten') ? 'CLOSED_ON_DAY' : 'SLOT_UNAVAILABLE';
        session.state = AppointmentState.COLLECT_TIME;
        // Reset tijd zodat klant nieuw uur kan kiezen
        if (responseCode === 'SLOT_UNAVAILABLE') {
          session.collected.time = null;
        } else {
          session.collected.date = null;
          session.collected.time = null;
        }
        await saveSession(session);

        const response = generateResponse(responseCode, session.collected, businessName, {
          availability: avail,
        });
        logInfo(ROUTE, 'Slot niet beschikbaar', { callId, avail });
        return sseResponse(response);
      }

      // Slot beschikbaar → ga naar CONFIRM
      session.state = AppointmentState.CONFIRM;
      await saveSession(session);

      const response = generateResponse('CONFIRM_DETAILS', session.collected, businessName);
      return sseResponse(response);
    }

    // Boek als nodig
    if (result.shouldBook) {
      const bookingResult = await bookAppointment(session, businessId);
      if (bookingResult.success) {
        session.state = AppointmentState.SUCCESS;
        await saveSession(session);
        const response = generateResponse('BOOKING_SUCCESS', session.collected, businessName);
        logInfo(ROUTE, 'Afspraak geboekt', {
          callId,
          naam: session.collected.name,
          datum: session.collected.date,
          tijd: session.collected.time,
        });
        return sseResponse(response);
      } else {
        session.state = AppointmentState.ERROR;
        await saveSession(session);
        const response = generateResponse('BOOKING_FAILED', session.collected, businessName);
        logError(ROUTE, bookingResult.error || 'Booking failed', { callId });
        return sseResponse(response);
      }
    }

    // Sla sessie op
    await saveSession(session);

    // Genereer response
    const services = session.state === AppointmentState.COLLECT_SERVICE
      ? await getServices(businessId) : undefined;

    const response = generateResponse(
      result.response,
      session.collected,
      businessName,
      { services },
    );

    logInfo(ROUTE, 'Response', {
      callId,
      state: session.state,
      response: response.slice(0, 100),
      durationMs: Date.now() - startMs,
    });

    return sseResponse(response);

  } catch (error) {
    logError(ROUTE, error);
    return jsonResponse('Er ging iets mis. Probeer het later opnieuw.');
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

/**
 * Fallback JSON response (non-streaming).
 */
function jsonResponse(content: string): Response {
  return Response.json({
    id: `chatcmpl-voxapp-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'voxapp-orchestrator',
    choices: [{
      index: 0,
      message: { role: 'assistant', content },
      finish_reason: 'stop',
    }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  });
}
