/**
 * VAPI Custom LLM endpoint — OpenAI-compatible Chat Completions API.
 * Supports both streaming (SSE) and non-streaming responses.
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

async function logToSupabase(callId: string | undefined, event: string, data: Record<string, unknown>) {
  try {
    const supabase = getSupabase();
    await supabase.from('voice_debug_logs').insert({
      call_id: callId ?? 'unknown',
      event,
      data,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Non-critical — ignore
  }
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

/**
 * Returns an SSE streaming response — required when VAPI sends stream: true.
 */
function streamResponse(content: string): Response {
  const id = `chatcmpl-${Date.now()}`;
  const created = Math.floor(Date.now() / 1000);
  const model = 'voice-order-v1';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // First chunk: role
      const roleChunk = {
        id, object: 'chat.completion.chunk', created, model,
        choices: [{ index: 0, delta: { role: 'assistant', content: '' }, finish_reason: null }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(roleChunk)}\n\n`));

      // Content in one chunk (no need to split for voice)
      const contentChunk = {
        id, object: 'chat.completion.chunk', created, model,
        choices: [{ index: 0, delta: { content }, finish_reason: null }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(contentChunk)}\n\n`));

      // Finish chunk
      const finishChunk = {
        id, object: 'chat.completion.chunk', created, model,
        choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(finishChunk)}\n\n`));
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

export async function POST(request: NextRequest) {
  let body: VapiChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { messages = [], call, stream } = body;
  const businessId =
    call?.metadata?.business_id ?? '0267c0ae-c997-421a-a259-e7559840897b';
  const callId = call?.id;

  console.log('[voice-engine] entry', { callId, businessId, messageCount: messages.length, stream, hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY });

  // Filter out system messages
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
    console.log('[voice-engine] menu loaded', { count: menu.length, businessName });
  } catch (err) {
    console.error('[voice-engine] menu load error:', err);
    await logToSupabase(callId, 'menu_error', { error: String(err) });
  }

  let result;
  try {
    result = processConversation(conversationMessages, menu, businessName);
  } catch (err) {
    console.error('[voice-engine] state machine error:', err);
    await logToSupabase(callId, 'state_error', { error: String(err) });
    result = { state: 'TAKING_ORDER' as const, response: 'Kunt u dat herhalen?', endCall: false };
  }

  const lastUserMsg = conversationMessages.filter(m => m.role === 'user').slice(-1)[0]?.content;
  console.log('[voice-engine] result', { state: result.state, response: result.response, stream, lastUserMsg });
  await logToSupabase(callId, 'turn', {
    state: result.state,
    response: result.response,
    stream: !!stream,
    messageCount: conversationMessages.length,
    lastUserMsg,
    menuCount: menu.length,
  });

  if (result.endCall) {
    saveCompletedOrder(businessId, callId, conversationMessages, menu).catch(err =>
      console.error('[voice-engine] order save error:', err)
    );
  }

  // VAPI requires SSE streaming when stream: true
  if (stream) {
    return streamResponse(result.response);
  }

  return NextResponse.json({
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'voice-order-v1',
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: result.response },
        finish_reason: 'stop',
      },
    ],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  });
}
