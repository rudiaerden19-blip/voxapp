/**
 * Sessiebeheer — Supabase voice_sessions
 * Laadt menu, verwerkt user input via state machine
 */

import { createClient } from '@supabase/supabase-js';
import { processInput, SessionState } from '../../src/lib/voice-engine/sessionStateMachine';
import { SCRIPT } from '../../src/config/voice-script';

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  is_available: boolean;
}

interface SessionData {
  greetingText: string;
  businessName: string;
  menu: MenuItem[];
}

export async function createSession(
  callControlId: string,
  businessId: string
): Promise<SessionData> {
  const sb = supabase();

  const [{ data: business }, { data: menuItems }] = await Promise.all([
    sb.from('businesses').select('name').eq('id', businessId).single(),
    sb.from('menu_items')
      .select('id, name, price, category, is_available')
      .eq('business_id', businessId)
      .eq('is_available', true)
      .eq('is_modifier', false)
      .order('sort_order', { ascending: true }),
  ]);

  const businessName = business?.name ?? 'Frituur';
  const menu = (menuItems ?? []) as MenuItem[];
  const greetingText = SCRIPT.begroeting(businessName);

  await sb.from('voice_sessions').upsert({
    call_control_id: callControlId,
    business_id: businessId,
    business_name: businessName,
    state: 'TAKING_ORDER',
    order_items: [],
    delivery_type: null,
    customer_name: null,
    delivery_address: null,
  });

  return { greetingText, businessName, menu };
}

export async function processUserInput(
  callControlId: string,
  transcript: string
): Promise<{ response: string; endCall: boolean } | null> {
  const sb = supabase();

  const { data: sessionRow } = await sb
    .from('voice_sessions')
    .select('*')
    .eq('call_control_id', callControlId)
    .single();

  if (!sessionRow) return null;

  const { data: menuItems } = await sb
    .from('menu_items')
    .select('id, name, price, category, is_available')
    .eq('business_id', sessionRow.business_id)
    .eq('is_available', true)
    .eq('is_modifier', false);

  const menu = (menuItems ?? []) as MenuItem[];
  const businessName = sessionRow.business_name ?? 'Frituur';

  const session: SessionState = {
    state: sessionRow.state,
    orderItems: sessionRow.order_items ?? [],
    deliveryType: sessionRow.delivery_type,
    customerName: sessionRow.customer_name,
    deliveryAddress: sessionRow.delivery_address,
  };

  const result = processInput(session, transcript, menu, businessName);

  // Sessie updaten
  await sb.from('voice_sessions').update({
    state: result.updatedSession.state,
    order_items: result.updatedSession.orderItems,
    delivery_type: result.updatedSession.deliveryType,
    customer_name: result.updatedSession.customerName,
    delivery_address: result.updatedSession.deliveryAddress,
  }).eq('call_control_id', callControlId);

  // Order opslaan bij einde gesprek
  if (result.endCall && result.updatedSession.orderItems.length > 0) {
    const total = result.updatedSession.orderItems.reduce(
      (sum, i) => sum + i.price * i.qty, 0
    );
    const { data: order } = await sb.from('orders').insert({
      business_id: sessionRow.business_id,
      status: 'pending',
      source: 'phone',
      customer_name: result.updatedSession.customerName,
      delivery_type: result.updatedSession.deliveryType,
      delivery_address: result.updatedSession.deliveryAddress,
      total_amount: total,
      notes: `Telnyx call: ${callControlId}`,
    }).select('id').single();

    if (order) {
      await sb.from('order_items').insert(
        result.updatedSession.orderItems.map(i => ({
          order_id: order.id,
          business_id: sessionRow.business_id,
          menu_item_id: i.id,
          name: i.name,
          quantity: i.qty,
          unit_price: i.price,
          total_price: i.price * i.qty,
        }))
      );
    }

    await sb.from('voice_sessions').delete().eq('call_control_id', callControlId);
  }

  return { response: result.response, endCall: result.endCall };
}

export async function getSession(callControlId: string) {
  const sb = supabase();
  const { data } = await sb.from('voice_sessions').select('*').eq('call_control_id', callControlId).single();
  return data;
}
