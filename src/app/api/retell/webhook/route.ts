import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

interface RetellCallAnalysis {
  bestelde_items?: string;
  naam_klant?: string;
  telefoon_klant?: string;
  levering_type?: 'afhalen' | 'levering';
  leveringsadres?: string;
  totaalprijs?: number;
  bestelling_geslaagd?: 'ja' | 'nee' | 'onvolledig';
}

interface RetellCallData {
  call_id: string;
  agent_id: string;
  call_status: string;
  duration_ms?: number;
  transcript?: string;
  call_analysis?: {
    custom_analysis_data?: RetellCallAnalysis;
    call_summary?: string;
    user_sentiment?: string;
    in_voicemail?: boolean;
  };
  metadata?: Record<string, string>;
  from_number?: string;
  to_number?: string;
}

interface RetellWebhookBody {
  event: string;
  call: RetellCallData;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logToSupabase(message: string, data: Record<string, unknown>) {
  try {
    const sb = getSupabase() as any;
    const { error } = await sb.from('call_logs').insert({
      business_id: '0267c0ae-c997-421a-a259-e7559840897b',
      conversation_id: `dbg_${Date.now()}`,
      status: 'completed',
      summary: message,
      metadata: data,
      created_at: new Date().toISOString(),
    });
    if (error) console.error('[logToSupabase]', error.message);
  } catch (e) { console.error('[logToSupabase catch]', e); }
}

export async function POST(request: NextRequest) {
  let rawBody: string;
  let body: RetellWebhookBody;

  try {
    rawBody = await request.text();
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Log raw payload naar Supabase voor debugging
  await logToSupabase('webhook_ontvangen', {
    raw: rawBody.slice(0, 500),
    headers: Object.fromEntries(request.headers),
  });

  const { event, call } = body;
  console.log('[Retell webhook]', event, call?.call_id);

  if (event === 'call_started') {
    return NextResponse.json({ received: true });
  }

  if (event === 'call_ended' || event === 'call_analyzed') {
    const analysis = call.call_analysis?.custom_analysis_data;
    const businessId = call.metadata?.business_id ?? '0267c0ae-c997-421a-a259-e7559840897b';
    const callerPhone = call.from_number ?? null;
    const durationMs = call.duration_ms ?? 0;

    await logToSupabase('call_ended_analyzed', {
      event,
      call_id: call.call_id,
      has_analysis: !!analysis,
      bestelling_geslaagd: analysis?.bestelling_geslaagd,
      has_items: !!analysis?.bestelde_items,
    });

    const supabase = getSupabase();

    // Bestelling opslaan in orders tabel (correct kolomnamen)
    if (analysis?.bestelde_items) {
      try {
        const orderType = analysis.levering_type === 'levering' ? 'delivery' : 'pickup';

        const { data: order, error } = await supabase
          .from('orders')
          .insert({
            business_id: businessId,
            customer_name: analysis.naam_klant ?? null,
            customer_phone: analysis.telefoon_klant ?? callerPhone,
            order_type: orderType,
            status: 'pending',
            total_amount: analysis.totaalprijs ?? 0,
            notes: analysis.bestelde_items,
            source: 'ai_phone',
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) {
          console.error('[Retell] Order opslaan mislukt:', error.message);
        } else {
          console.log('[Retell] Order opgeslagen:', order?.id);
        }
      } catch (err) {
        console.error('[Retell] Order fout:', err);
      }
    }

    // Gesprek loggen in call_logs tabel
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('call_logs') as any).insert({
        business_id: businessId,
        conversation_id: call.call_id,
        agent_id: call.agent_id ?? null,
        caller_phone: callerPhone,
        duration_seconds: Math.round(durationMs / 1000),
        duration_minutes: Math.round(durationMs / 60000 * 10) / 10,
        status: 'completed',
        transcript: call.transcript ?? null,
        summary: analysis?.bestelde_items ?? null,
        metadata: { bestelling_geslaagd: analysis?.bestelling_geslaagd ?? 'onbekend', retell_status: call.call_status },
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[Retell] Call log fout:', err);
    }

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true, event });
}

export async function GET() {
  return NextResponse.json({ service: 'Retell webhook - VoxApp' });
}
