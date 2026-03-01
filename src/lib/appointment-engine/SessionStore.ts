import { createClient } from '@supabase/supabase-js';
import { SessionState, AppointmentState, CollectedData } from './types';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars ontbreken');
  return createClient(url, key);
}

const EMPTY_COLLECTED: CollectedData = {
  service: null,
  date: null,
  time: null,
  name: null,
  phone: null,
};

/**
 * Haal session state op voor een actief gesprek.
 * Maakt een nieuwe sessie aan als die niet bestaat.
 */
export async function getSession(
  callId: string,
  businessId: string,
): Promise<SessionState> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('voice_sessions')
    .select('*')
    .eq('conversation_id', callId)
    .single();

  if (data) {
    return {
      callId: data.conversation_id,
      businessId: data.tenant_id || businessId,
      state: (data.state as AppointmentState) || AppointmentState.GREETING,
      collected: (data.collected_data as CollectedData) || { ...EMPTY_COLLECTED },
      retries: (data.retries as Record<string, number>) || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at,
    };
  }

  const now = new Date().toISOString();
  const newSession: SessionState = {
    callId,
    businessId,
    state: AppointmentState.GREETING,
    collected: { ...EMPTY_COLLECTED },
    retries: {},
    createdAt: now,
    updatedAt: now,
  };

  await supabase.from('voice_sessions').insert({
    conversation_id: callId,
    tenant_id: businessId,
    state: AppointmentState.GREETING,
    collected_data: newSession.collected,
    retries: {},
    created_at: now,
    updated_at: now,
  });

  return newSession;
}

/**
 * Sla de bijgewerkte session state op.
 */
export async function saveSession(session: SessionState): Promise<void> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  await supabase
    .from('voice_sessions')
    .upsert({
      conversation_id: session.callId,
      tenant_id: session.businessId,
      state: session.state,
      collected_data: session.collected,
      retries: session.retries,
      updated_at: now,
    }, { onConflict: 'conversation_id' });
}

/**
 * Verwijder een sessie (na succesvolle boeking of timeout).
 */
export async function deleteSession(callId: string): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from('voice_sessions')
    .delete()
    .eq('conversation_id', callId);
}
