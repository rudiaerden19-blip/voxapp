import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

interface VapiAnalysis {
  bestelde_items?: string;
  naam_klant?: string;
  levering_type?: string;
  leveringsadres?: string;
  ophaal_of_leveringstijd?: string;
  bestelling_geslaagd?: string;
}

interface VapiCallEndedPayload {
  message: {
    type: string;
    call: {
      id: string;
      assistantId: string;
      status: string;
      startedAt?: string;
      endedAt?: string;
      endedReason?: string;
      transcript?: string;
      recordingUrl?: string;
      summary?: string;
      analysis?: {
        summary?: string;
        structuredData?: VapiAnalysis;
      };
      customer?: {
        number?: string;
      };
      phoneNumber?: {
        number?: string;
      };
      costBreakdown?: {
        total?: number;
      };
    };
  };
}

const BUSINESS_ID = '0267c0ae-c997-421a-a259-e7559840897b';

export async function POST(request: NextRequest) {
  let body: VapiCallEndedPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { message } = body;

  if (!message) {
    return NextResponse.json({ received: true });
  }

  console.log('[Vapi webhook]', message.type, message.call?.id);

  if (message.type !== 'end-of-call-report') {
    return NextResponse.json({ received: true });
  }

  const call = message.call;
  const analysis = call.analysis?.structuredData;
  const callerPhone = call.customer?.number ?? null;

  const supabase = getSupabase();

  // Bestelling opslaan in orders tabel
  if (analysis?.bestelde_items) {
    try {
      const orderType = analysis.levering_type === 'levering' ? 'delivery' : 'pickup';

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          business_id: BUSINESS_ID,
          customer_name: analysis.naam_klant ?? null,
          customer_phone: callerPhone,
          order_type: orderType,
          status: 'pending',
          total_amount: 0,
          notes: analysis.bestelde_items,
          source: 'ai_phone',
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('[Vapi] Order opslaan mislukt:', error.message);
      } else {
        console.log('[Vapi] Order opgeslagen:', order?.id);
      }
    } catch (err) {
      console.error('[Vapi] Order fout:', err);
    }
  }

  // Gesprek loggen in call_logs tabel
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('call_logs') as any).insert({
      business_id: BUSINESS_ID,
      conversation_id: call.id,
      agent_id: call.assistantId ?? null,
      caller_phone: callerPhone,
      duration_seconds: call.startedAt && call.endedAt
        ? Math.round((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
        : 0,
      duration_minutes: call.startedAt && call.endedAt
        ? Math.round((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 60000 * 10) / 10
        : 0,
      status: 'completed',
      transcript: call.transcript ?? null,
      summary: analysis?.bestelde_items ?? call.analysis?.summary ?? null,
      metadata: {
        bestelling_geslaagd: analysis?.bestelling_geslaagd ?? 'onbekend',
        ophaal_tijd: analysis?.ophaal_of_leveringstijd ?? null,
        levering_type: analysis?.levering_type ?? null,
        ended_reason: call.endedReason ?? null,
        provider: 'vapi',
      },
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Vapi] Call log fout:', err);
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ service: 'Vapi webhook - VoxApp' });
}
