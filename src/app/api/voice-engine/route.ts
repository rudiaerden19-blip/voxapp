import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  VoiceOrderSystem,
  OrderState,
  createEmptySession,
  type SessionData,
} from '@/lib/voice-engine/VoiceOrderSystem';

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

async function loadMenu(supabase: DB, businessId: string): Promise<{ items: string[]; prices: Record<string, number> }> {
  const { data } = await supabase
    .from('menu_items')
    .select('name, price')
    .eq('business_id', businessId)
    .eq('is_available', true);

  const items: string[] = [];
  const prices: Record<string, number> = {};
  if (Array.isArray(data)) {
    for (const row of data) {
      if (row.name && typeof row.price === 'number') {
        const lower = row.name.toLowerCase();
        items.push(lower);
        prices[lower] = row.price;
      }
    }
  }
  return { items, prices };
}

// ============================================================
// RESOLVE BUSINESS FROM AGENT ID
// ============================================================

async function resolveBusiness(supabase: DB, agentId: string | null): Promise<{ id: string; name: string } | null> {
  if (agentId) {
    const { data } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('agent_id', agentId)
      .single();
    if (data) return data as { id: string; name: string };
  }
  const { data } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('type', 'frituur')
    .limit(1)
    .single();
  return data as { id: string; name: string } | null;
}

// ============================================================
// POST — Custom LLM endpoint for ElevenLabs
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ElevenLabs Custom LLM sends conversation context
    const conversationId: string = body.conversation_id || body.session_id || `tmp_${Date.now()}`;
    const agentId: string | null = body.agent_id || null;
    const transcript: { role?: string; message?: string; text?: string }[] = body.transcript || body.messages || [];

    // Get the LAST user message only
    let userMessage = '';
    for (let i = transcript.length - 1; i >= 0; i--) {
      if (transcript[i].role === 'user') {
        userMessage = (transcript[i].message || transcript[i].text || '').trim();
        break;
      }
    }

    if (!userMessage) {
      return NextResponse.json({ response: 'Hallo, met Frituur Nolim, met Anja. Kan ik uw bestelling opnemen?' });
    }

    const supabase = getSupabase();

    // Resolve business
    const business = await resolveBusiness(supabase, agentId);
    if (!business) {
      console.error('Voice engine: no business found for agent', agentId);
      return NextResponse.json({ response: 'Excuseer, er is een probleem. Probeer later opnieuw.' });
    }

    // Load menu
    const { items: menuItems, prices: menuPrices } = await loadMenu(supabase, business.id);

    // Load or create session
    let session = await loadSession(supabase, conversationId);
    if (!session) {
      session = createEmptySession();
    }

    // Process through state machine
    const engine = new VoiceOrderSystem(menuItems, menuPrices);
    const result = engine.handle(session, userMessage);
    session = result.session;

    // If DONE → insert order into Supabase, delete session
    if (session.state === OrderState.DONE) {
      const orderData = engine.buildOrderData(session);
      const { notes, total } = engine.buildReceiptNotes(session);

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          business_id: business.id,
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
        console.error('Voice engine: order insert error', orderError);
      } else {
        console.log('Voice engine: order created for', business.name, '—', orderData.name, '—', orderData.items.length, 'items');
      }

      // Clean up session
      await deleteSession(supabase, conversationId);
    } else {
      // Save session for next turn
      await saveSession(supabase, conversationId, session, business.id);
    }

    return NextResponse.json({ response: result.response });

  } catch (error: unknown) {
    console.error('Voice engine error:', error);
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
