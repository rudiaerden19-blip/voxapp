/**
 * Telnyx Call Control webhook — Volledig eigen voice order engine.
 * Geen VAPI. Geen GPT. Deterministisch.
 *
 * Flow:
 *   call.initiated    → answer()
 *   call.answered     → sessie aanmaken → begroeting afspelen → luisteren
 *   call.gather.ended → transcript → state machine → volgende audio → luisteren
 *   call.hangup       → sessie opruimen
 *
 * Configureer in Telnyx:
 *   Call Control Application → Webhook URL: https://www.voxapp.tech/api/telnyx/voice
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { textToAudioUrl } from '@/lib/voice-engine/telnyx-tts';
import { processInput, getGreeting, SessionState } from '@/lib/voice-engine/sessionStateMachine';
import { MenuItem, ParsedItem } from '@/lib/voice-engine/types';

const TELNYX_API_BASE = 'https://api.telnyx.com/v2';
const STT_LANGUAGE = 'nl-NL';
const SPEECH_TIMEOUT = 'auto'; // Telnyx detecteert automatisch einde van speech
const DEFAULT_BUSINESS_ID = '0267c0ae-c997-421a-a259-e7559840897b';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── Telnyx Call Control API ──────────────────────────────────────────────────

async function telnyxAction(
  callControlId: string,
  action: string,
  payload: Record<string, unknown> = {}
): Promise<void> {
  const url = `${TELNYX_API_BASE}/calls/${encodeURIComponent(callControlId)}/actions/${action}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[telnyx/voice] action ${action} failed (${response.status}):`, text);
  } else {
    console.log(`[telnyx/voice] action ${action} OK`);
  }
}

/**
 * Speelt audio af + start luisteren in één Telnyx-commando.
 */
async function gatherWithAudio(callControlId: string, audioUrl: string): Promise<void> {
  await telnyxAction(callControlId, 'gather_using_speech', {
    audio_url: audioUrl,
    language: STT_LANGUAGE,
    speech_timeout: SPEECH_TIMEOUT,
    maximum_tries: 3,
    minimum_length: 1,
  });
}

/**
 * Speelt audio af zonder daarna te luisteren (voor eindbevestiging).
 */
async function playAudio(callControlId: string, audioUrl: string): Promise<void> {
  await telnyxAction(callControlId, 'play_audio', {
    audio_url: audioUrl,
    loop: 1,
  });
}

// ─── Supabase sessie management ───────────────────────────────────────────────

async function getBusinessIdForNumber(phoneNumber: string): Promise<string> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('pool_numbers')
    .select('business_id')
    .eq('phone_number', phoneNumber)
    .single();
  return data?.business_id ?? DEFAULT_BUSINESS_ID;
}

async function loadBusinessInfo(
  businessId: string
): Promise<{ name: string; menu: MenuItem[] }> {
  const supabase = getSupabase();
  const [{ data: business }, { data: menuData }] = await Promise.all([
    supabase.from('businesses').select('name').eq('id', businessId).single(),
    supabase
      .from('menu_items')
      .select('id, name, price, category, is_available')
      .eq('business_id', businessId)
      .eq('is_available', true)
      .eq('is_modifier', false)
      .order('sort_order', { ascending: true }),
  ]);
  return {
    name: business?.name ?? 'Frituur',
    menu: (menuData ?? []) as MenuItem[],
  };
}

async function createSession(
  callControlId: string,
  businessId: string,
  businessName: string,
  callerPhone: string
): Promise<void> {
  const supabase = getSupabase();
  await supabase.from('voice_sessions').upsert({
    call_control_id: callControlId,
    business_id: businessId,
    business_name: businessName,
    state: 'GREETING',
    order_items: [],
    delivery_type: null,
    customer_name: null,
    delivery_address: null,
    caller_phone: callerPhone,
  });
}

async function getSession(
  callControlId: string
): Promise<{ session: SessionState; businessId: string; businessName: string; menu: MenuItem[] } | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('voice_sessions')
    .select('*')
    .eq('call_control_id', callControlId)
    .single();

  if (!data) return null;

  const { menu } = await loadBusinessInfo(data.business_id);

  return {
    session: {
      state: data.state,
      orderItems: (data.order_items ?? []) as ParsedItem[],
      deliveryType: data.delivery_type,
      customerName: data.customer_name,
      deliveryAddress: data.delivery_address,
    },
    businessId: data.business_id,
    businessName: data.business_name ?? 'Frituur',
    menu,
  };
}

async function updateSession(
  callControlId: string,
  updated: SessionState
): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from('voice_sessions')
    .update({
      state: updated.state,
      order_items: updated.orderItems,
      delivery_type: updated.deliveryType,
      customer_name: updated.customerName,
      delivery_address: updated.deliveryAddress,
    })
    .eq('call_control_id', callControlId);
}

async function deleteSession(callControlId: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.from('voice_sessions').delete().eq('call_control_id', callControlId);
}

async function saveOrder(
  callControlId: string,
  businessId: string,
  session: SessionState
): Promise<void> {
  if (session.orderItems.length === 0) return;

  const supabase = getSupabase();
  const total = session.orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      business_id: businessId,
      status: 'pending',
      source: 'phone',
      customer_name: session.customerName,
      delivery_type: session.deliveryType,
      delivery_address: session.deliveryAddress,
      total_amount: total,
      notes: `Telnyx call: ${callControlId}`,
    })
    .select('id')
    .single();

  if (error || !order) {
    console.error('[telnyx/voice] order save error:', error?.message);
    return;
  }

  const items = session.orderItems.map(i => ({
    order_id: order.id,
    business_id: businessId,
    menu_item_id: i.id,
    name: i.name,
    quantity: i.qty,
    unit_price: i.price,
    total_price: i.price * i.qty,
  }));

  await supabase.from('order_items').insert(items);
  console.log('[telnyx/voice] order saved:', order.id);
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Telnyx stuurt events in body.data
  const event = body.data as Record<string, unknown> | undefined;
  const eventType = event?.event_type as string | undefined;
  const payload = event?.payload as Record<string, unknown> | undefined;
  const callControlId = payload?.call_control_id as string | undefined;

  console.log('[telnyx/voice] event:', eventType, callControlId?.slice(0, 20));

  if (!callControlId || !eventType) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (eventType) {

      case 'call.initiated': {
        // Beantwoord de inkomende call
        await telnyxAction(callControlId, 'answer', {});
        break;
      }

      case 'call.answered': {
        const toNumber = payload.to as string ?? '';
        const fromNumber = payload.from as string ?? '';
        const businessId = await getBusinessIdForNumber(toNumber);
        const { name: businessName, menu } = await loadBusinessInfo(businessId);

        await createSession(callControlId, businessId, businessName, fromNumber);

        // Genereer begroeting en start luisteren
        const greetingText = getGreeting(businessName);
        console.log('[telnyx/voice] greeting:', greetingText);
        const audioUrl = await textToAudioUrl(greetingText);
        await gatherWithAudio(callControlId, audioUrl);
        break;
      }

      case 'call.gather.ended': {
        const gatherResult = payload.speech_result as Record<string, unknown> | undefined;
        const transcript = (gatherResult?.transcript as string ?? '').trim();
        const status = payload.status as string ?? '';

        console.log('[telnyx/voice] transcript:', transcript, '| status:', status);

        const sessionData = await getSession(callControlId);
        if (!sessionData) {
          console.error('[telnyx/voice] sessie niet gevonden:', callControlId);
          await telnyxAction(callControlId, 'hangup', {});
          break;
        }

        const { session, businessId, businessName, menu } = sessionData;

        if (!transcript || status === 'no_input') {
          // Geen input → herhaal vraag
          const audioUrl = await textToAudioUrl('Sorry, ik heb u niet gehoord. Kunt u dat herhalen?');
          await gatherWithAudio(callControlId, audioUrl);
          break;
        }

        // State machine verwerkt de input
        const result = processInput(session, transcript, menu, businessName);
        console.log('[telnyx/voice] state:', session.state, '→', result.nextState, '|', result.response.slice(0, 60));

        // Sessie bijwerken
        await updateSession(callControlId, result.updatedSession);

        const audioUrl = await textToAudioUrl(result.response);

        if (result.endCall) {
          // Bestelling opslaan
          await saveOrder(callControlId, businessId, result.updatedSession);
          // Speel eindbevestiging af en hang op
          await playAudio(callControlId, audioUrl);
          // Geef audio tijd om af te spelen (5 seconden) dan hangup
          setTimeout(() => {
            telnyxAction(callControlId, 'hangup', {}).catch(console.error);
          }, 5000);
        } else {
          await gatherWithAudio(callControlId, audioUrl);
        }
        break;
      }

      case 'call.hangup': {
        console.log('[telnyx/voice] call ended:', callControlId?.slice(0, 20));
        await deleteSession(callControlId);
        break;
      }

      default:
        // Andere events negeren we stilletjes
        break;
    }
  } catch (err) {
    console.error('[telnyx/voice] unhandled error:', err);
    // Probeer call netjes te beëindigen bij een onverwachte fout
    try {
      await telnyxAction(callControlId, 'hangup', {});
    } catch { /* ignore */ }
  }

  // Telnyx verwacht altijd een snelle 200 OK
  return NextResponse.json({ received: true });
}
