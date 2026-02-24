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
  call_analysis?: RetellCallAnalysis;
  metadata?: Record<string, string>;
  from_number?: string;
  to_number?: string;
  start_timestamp?: number;
  end_timestamp?: number;
}

interface RetellWebhookBody {
  event: string;
  call: RetellCallData;
}

export async function POST(request: NextRequest) {
  let body: RetellWebhookBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event, call } = body;
  console.log('[Retell webhook]', event, call?.call_id);

  if (event === 'call_started') {
    console.log('[Retell] call started:', call.call_id, 'from:', call.from_number);
    return NextResponse.json({ received: true });
  }

  if (event === 'call_ended' || event === 'call_analyzed') {
    const analysis = call.call_analysis;
    const supabase = getSupabase();

    const businessId = call.metadata?.business_id ?? null;
    const callerPhone = call.from_number ?? null;

    if (analysis?.bestelling_geslaagd === 'ja' && analysis?.bestelde_items) {
      try {
        const { data: order, error } = await supabase
          .from('orders')
          .insert({
            business_id: businessId,
            retell_call_id: call.call_id,
            caller_phone: callerPhone,
            customer_name: analysis.naam_klant ?? null,
            customer_phone: analysis.telefoon_klant ?? callerPhone,
            delivery_type: analysis.levering_type ?? 'afhalen',
            delivery_address: analysis.leveringsadres ?? null,
            items_text: analysis.bestelde_items,
            total_price: analysis.totaalprijs ?? null,
            transcript: call.transcript ?? null,
            duration_ms: call.duration_ms ?? null,
            status: 'nieuw',
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
        console.error('[Retell] Order opslaan fout:', err);
      }
    }

    try {
      await supabase.from('calls').insert({
        business_id: businessId,
        retell_call_id: call.call_id,
        caller_phone: callerPhone,
        duration_ms: call.duration_ms ?? null,
        transcript: call.transcript ?? null,
        summary: analysis?.bestelde_items ?? null,
        status: call.call_status,
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
