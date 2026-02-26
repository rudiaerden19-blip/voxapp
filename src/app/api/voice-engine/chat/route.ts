/**
 * VAPI Custom LLM endpoint — OpenAI-compatible Chat Completions API.
 *
 * VAPI calls this endpoint on every conversation turn.
 * The state machine derives the current state from the conversation history
 * and returns a deterministic, fixed-template response.
 *
 * No free AI text generation — 100% deterministic workflow.
 *
 * Configure in VAPI assistant:
 *   Model → Custom LLM
 *   URL: https://www.voxapp.tech/api/voice-engine/chat
 *   Model ID: voice-order-v1
 *
 * Pass business_id in VAPI assistant metadata:
 *   metadata.business_id: "<uuid>"
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processConversation, buildOrderContext } from '@/lib/voice-engine/stateMachine';
import { Message, MenuItem } from '@/lib/voice-engine/types';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface VapiChatRequest {
  model?: string;
  messages: Message[];
  stream?: boolean;
  call?: {
    id?: string;
    metadata?: {
      business_id?: string;
    };
  };
}

async function loadMenu(businessId: string): Promise<MenuItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, price, category, is_available')
    .eq('business_id', businessId)
    .eq('is_available', true)
    .eq('is_modifier', false)
    .order('sort_order', { ascending: true });

  if (error || !data) {
    console.error('[voice-engine] Failed to load menu:', error?.message);
    return [];
  }

  return data as MenuItem[];
}

async function loadBusinessName(businessId: string): Promise<string> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('businesses')
    .select('name')
    .eq('id', businessId)
    .single();

  return data?.name ?? 'Frituur';
}

async function saveCompletedOrder(
  businessId: string,
  callId: string | undefined,
  messages: Message[],
  menu: MenuItem[]
): Promise<void> {
  const ctx = buildOrderContext(messages, menu);
  if (ctx.items.length === 0) return;

  const supabase = getSupabase();
  const total = ctx.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      business_id: businessId,
      status: 'pending',
      source: 'phone',
      customer_name: ctx.customerName,
      delivery_type: ctx.deliveryType,
      delivery_address: ctx.deliveryAddress,
      total_amount: total,
      notes: callId ? `VAPI call: ${callId}` : null,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[voice-engine] Failed to save order:', orderError?.message);
    return;
  }

  const orderItems = ctx.items.map(item => ({
    order_id: order.id,
    business_id: businessId,
    menu_item_id: item.id,
    name: item.name,
    quantity: item.qty,
    unit_price: item.price,
    total_price: item.price * item.qty,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) {
    console.error('[voice-engine] Failed to save order items:', itemsError.message);
  } else {
    console.log('[voice-engine] Order saved:', order.id, '— items:', ctx.items.length);
  }
}

export async function POST(request: NextRequest) {
  let body: VapiChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { messages = [], call } = body;
  const businessId =
    call?.metadata?.business_id ?? '0267c0ae-c997-421a-a259-e7559840897b';
  const callId = call?.id;

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0f1a73aa-b288-4694-976b-ca856d570f3d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'12fe0b'},body:JSON.stringify({sessionId:'12fe0b',location:'chat/route.ts:entry',message:'Request ontvangen',data:{callId,businessId,messageCount:messages.length,roles:messages.map((m:Message)=>m.role),supabaseUrl:process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0,30),hasServiceKey:!!process.env.SUPABASE_SERVICE_ROLE_KEY},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  // Filter out system messages — our state machine handles state, not the system prompt
  const conversationMessages = messages.filter(
    (m): m is Message => m.role === 'user' || m.role === 'assistant'
  );

  let menu: MenuItem[] = [];
  let businessName = 'Frituur';
  try {
    [menu, businessName] = await Promise.all([
      loadMenu(businessId),
      loadBusinessName(businessId),
    ]);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f1a73aa-b288-4694-976b-ca856d570f3d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'12fe0b'},body:JSON.stringify({sessionId:'12fe0b',location:'chat/route.ts:menu-loaded',message:'Menu geladen',data:{menuCount:menu.length,businessName,businessId},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f1a73aa-b288-4694-976b-ca856d570f3d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'12fe0b'},body:JSON.stringify({sessionId:'12fe0b',location:'chat/route.ts:menu-error',message:'FOUT bij laden menu',data:{error:String(err)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.error('[voice-engine] Menu load error:', err);
  }

  let result;
  try {
    result = processConversation(conversationMessages, menu, businessName);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f1a73aa-b288-4694-976b-ca856d570f3d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'12fe0b'},body:JSON.stringify({sessionId:'12fe0b',location:'chat/route.ts:state-result',message:'State machine resultaat',data:{state:result.state,response:result.response,endCall:result.endCall,lastUserMsg:conversationMessages.filter(m=>m.role==='user').slice(-1)[0]?.content},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f1a73aa-b288-4694-976b-ca856d570f3d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'12fe0b'},body:JSON.stringify({sessionId:'12fe0b',location:'chat/route.ts:state-error',message:'FOUT in state machine',data:{error:String(err)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.error('[voice-engine] State machine error:', err);
    result = { state: 'TAKING_ORDER' as const, response: 'Kunt u dat herhalen?', endCall: false };
  }

  console.log(
    `[voice-engine] state=${result.state} business=${businessId} call=${callId ?? 'unknown'} response="${result.response}"`
  );

  if (result.endCall) {
    saveCompletedOrder(businessId, callId, conversationMessages, menu).catch(err =>
      console.error('[voice-engine] Order save error:', err)
    );
  }

  return NextResponse.json({
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'voice-order-v1',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: result.response,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  });
}
