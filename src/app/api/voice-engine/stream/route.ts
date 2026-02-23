import { NextRequest, NextResponse } from 'next/server';
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

// ============================================================
// SESSION STORAGE
// ============================================================

async function loadSession(supabase: DB, conversationId: string): Promise<SessionData | null> {
  const { data } = await supabase
    .from('voice_sessions')
    .select('session_data')
    .eq('conversation_id', conversationId)
    .single();
  return data?.session_data || null;
}

async function saveSession(supabase: DB, conversationId: string, session: SessionData, businessId: string): Promise<void> {
  await supabase
    .from('voice_sessions')
    .upsert({
      conversation_id: conversationId,
      business_id: businessId,
      session_data: session,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'conversation_id' });
}

async function deleteSession(supabase: DB, conversationId: string): Promise<void> {
  await supabase
    .from('voice_sessions')
    .delete()
    .eq('conversation_id', conversationId);
}

// ============================================================
// MENU CACHE
// ============================================================

const menuCache = new Map<string, { data: MenuData; ts: number }>();
const MENU_CACHE_TTL = 5 * 60 * 1000;

interface MenuData {
  items: string[];
  prices: Record<string, number>;
  modifiers: Set<string>;
  raw: MenuItem[];
}

async function loadMenu(supabase: DB, businessId: string): Promise<MenuData> {
  const cached = menuCache.get(businessId);
  if (cached && Date.now() - cached.ts < MENU_CACHE_TTL) return cached.data;

  const { data } = await supabase
    .from('menu_items')
    .select('name, price, is_modifier, category')
    .eq('business_id', businessId)
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
  menuCache.set(businessId, { data: menuData, ts: Date.now() });
  return menuData;
}

// ============================================================
// RESOLVE BUSINESS BY ID
// ============================================================

interface BusinessRow {
  id: string;
  name: string;
  welcome_message: string | null;
  ai_name: string | null;
  prep_time_pickup: number | null;
  prep_time_delivery: number | null;
  delivery_enabled: boolean | null;
}

const BIZ_SELECT = 'id, name, welcome_message, ai_name, prep_time_pickup, prep_time_delivery, delivery_enabled';

async function resolveBusinessById(supabase: DB, businessId: string): Promise<BusinessRow | null> {
  const { data } = await supabase
    .from('businesses')
    .select(BIZ_SELECT)
    .eq('id', businessId)
    .single();
  return data as BusinessRow | null;
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
// TELNYX SPEAK — audio terugsturen naar beller
// ============================================================

async function telnyxSpeak(callControlId: string, text: string) {
  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) return;

  const res = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/speak`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      payload: text,
      voice: 'female',
      language: 'nl-NL',
    }),
  });

  if (!res.ok) {
    console.error('Telnyx speak failed:', res.status, await res.text());
  }
}

// ============================================================
// POST — Simplified endpoint for voice-server pipeline
// Input:  { business_id, transcript, conversation_id, caller_id }
// Output: { response: string }
// ============================================================

export async function POST(request: NextRequest) {
  const t0 = Date.now();

  try {
    const body = await request.json();
    const businessId: string = body.business_id;
    const transcript: string = body.transcript || '';
    const conversationId: string = body.conversation_id || `stream_${Date.now()}`;
    const callerPhone: string | null = body.caller_id || null;

    const callControlId: string | null = body.call_control_id || null;

    if (!businessId) {
      return NextResponse.json({ response: 'Configuratiefout. Probeer later opnieuw.' }, { status: 400 });
    }

    const supabase = getSupabase();
    const business = await resolveBusinessById(supabase, businessId);
    if (!business) {
      return NextResponse.json({ response: 'Bedrijf niet gevonden.' }, { status: 404 });
    }

    const config = buildConfig(business);
    const menu = await loadMenu(supabase, businessId);
    const engine = new VoiceOrderSystem(menu.items, menu.prices, config, menu.modifiers);

    if (transcript === '__greeting__') {
      console.log(JSON.stringify({ _tag: 'STREAM', event: 'greeting', business_id: businessId, elapsed: Date.now() - t0 }));
      return NextResponse.json({ response: engine.getGreeting() });
    }

    let session = await loadSession(supabase, conversationId);
    if (!session) {
      session = createEmptySession();
      if (callerPhone) {
        session.phone = callerPhone;
      }
    }

    let geminiItems: OrderItem[] | null = null;
    let geminiNamePhone: { name: string | null; phone: string | null } | null = null;

    if (session.state === OrderState.TAKING_ORDER) {
      geminiItems = await extractWithGemini(transcript, menu.raw);
    } else if (session.state === OrderState.GET_NAME_PHONE) {
      geminiNamePhone = await extractNamePhoneWithGemini(transcript);
    }

    const result = engine.handle(session, transcript, conversationId, geminiItems, geminiNamePhone);
    session = result.session;

    console.log(JSON.stringify({
      _tag: 'STREAM',
      event: 'handled',
      conversation_id: conversationId,
      state: session.state,
      transcript: transcript.slice(0, 100),
      response: result.response.slice(0, 100),
      elapsed: Date.now() - t0,
    }));

    if (session.state === OrderState.DONE) {
      const orderData = engine.buildOrderData(session);
      const { notes, total } = engine.buildReceiptNotes(session);
      const callLog = createCallLog(conversationId, businessId);

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          business_id: businessId,
          customer_name: orderData.name || 'Telefoon klant',
          customer_phone: orderData.phone || '',
          order_type: orderData.delivery_type === 'levering' ? 'delivery' : 'pickup',
          notes,
          status: 'pending',
          source: 'phone',
          total_amount: total,
          created_at: orderData.timestamp,
        });

      if (orderError) {
        callLog.error_count++;
        logError(businessId, conversationId, orderError);
      } else {
        callLog.completion_status = 'completed';
        callLog.items_count = orderData.items.length;
        callLog.total_amount = total;
        logCall(callLog);
      }

      await deleteSession(supabase, conversationId);
    } else {
      await saveSession(supabase, conversationId, session, businessId);
    }

    // Telnyx speak: stuur audio terug naar de beller via Telnyx API
    if (callControlId && process.env.TELNYX_API_KEY) {
      telnyxSpeak(callControlId, result.response).catch((err) => {
        console.error('Telnyx speak error:', err);
      });
    }

    return NextResponse.json({ response: result.response });

  } catch (error: unknown) {
    console.log(JSON.stringify({ _tag: 'STREAM', event: 'error', error: String(error), elapsed: Date.now() - t0 }));
    return NextResponse.json({ response: 'Excuseer, kan je dat herhalen?' });
  }
}
