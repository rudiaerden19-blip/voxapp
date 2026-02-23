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
import { requireTenantFromBusiness, TenantError } from '@/lib/tenant';
import { createCallLog, logCall, logError } from '@/lib/logger';

// ============================================================
// SUPABASE ADMIN CLIENT
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
// SESSION STORAGE (Supabase voice_sessions table)
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
// LOAD MENU FROM DATABASE
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
// RESOLVE BUSINESS FROM AGENT ID
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

async function resolveBusiness(supabase: DB, agentId: string | null): Promise<BusinessRow | null> {
  if (agentId) {
    const { data } = await supabase
      .from('businesses')
      .select(BIZ_SELECT)
      .eq('agent_id', agentId)
      .single();
    if (data) return data as BusinessRow;
  }
  const { data } = await supabase
    .from('businesses')
    .select(BIZ_SELECT)
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
// POST — Custom LLM endpoint for ElevenLabs
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const conversationId: string = body.conversation_id || body.session_id || `tmp_${Date.now()}`;
    const agentId: string | null = body.agent_id || null;
    const transcript: { role?: string; message?: string; text?: string }[] = body.transcript || body.messages || [];

    // Caller ID van Twilio
    const callerPhone: string | null =
      body.caller_id || body.from || body.phone_number || null;

    console.log(JSON.stringify({
      _tag: 'CALLER_ID_DEBUG',
      conversation_id: conversationId,
      caller_phone: callerPhone,
      body_keys: Object.keys(body),
      body_full: body,
    }));

    let userMessage = '';
    for (let i = transcript.length - 1; i >= 0; i--) {
      if (transcript[i].role === 'user') {
        userMessage = (transcript[i].message || transcript[i].text || '').trim();
        break;
      }
    }

    const supabase = getSupabase();

    const business = await resolveBusiness(supabase, agentId);
    const tenant = requireTenantFromBusiness(business);
    const tenantId = tenant.tenant_id;

    const config = buildConfig(business!);
    const menu = await loadMenu(supabase, tenantId);
    const engine = new VoiceOrderSystem(menu.items, menu.prices, config, menu.modifiers);
    const callLog = createCallLog(conversationId, tenantId);

    if (!userMessage) {
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
      geminiItems = await extractWithGemini(userMessage, menu.raw);
    } else if (session.state === OrderState.GET_NAME_PHONE) {
      geminiNamePhone = await extractNamePhoneWithGemini(userMessage);
    }

    const result = engine.handle(session, userMessage, conversationId, geminiItems, geminiNamePhone);
    session = result.session;

    if (session.state === OrderState.DONE) {
      const orderData = engine.buildOrderData(session);
      const { notes, total } = engine.buildReceiptNotes(session);

      console.log(JSON.stringify({
        _tag: 'ORDER_TRACE',
        conversation_id: conversationId,
        step: '6_KITCHEN',
        order_data: orderData,
        receipt_notes: notes,
        receipt_total: total,
      }));

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
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

      if (orderError) {
        callLog.error_count++;
        logError(tenantId, conversationId, orderError);
      } else {
        callLog.completion_status = 'completed';
        callLog.items_count = orderData.items.length;
        callLog.total_amount = total;
        logCall(callLog);
      }

      // Clean up session
      await deleteSession(supabase, conversationId);
    } else {
      // Save session for next turn
      await saveSession(supabase, conversationId, session, tenantId);
    }

    return NextResponse.json({ response: result.response });

  } catch (error: unknown) {
    if (error instanceof TenantError) {
      logError('UNKNOWN', 'UNKNOWN', error);
      return NextResponse.json({ response: 'Excuseer, er is een probleem. Probeer later opnieuw.' });
    }
    logError('UNKNOWN', 'UNKNOWN', error);
    return NextResponse.json({ response: 'Excuseer, kan je dat herhalen?' });
  }
}

// ============================================================
// GET — Health check
// ============================================================

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    engine: 'VoiceOrderSystem',
    mode: 'custom_llm',
  });
}
