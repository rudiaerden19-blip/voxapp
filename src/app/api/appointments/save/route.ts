export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars ontbreken');
  return createClient(url, key);
}

function vapiResult(toolCallId: string, result: string) {
  return Response.json({ results: [{ toolCallId, result }] });
}

function dagNaarDatum(dag: string): string {
  const DAGEN: Record<string, number> = {
    zondag: 0, maandag: 1, dinsdag: 2, woensdag: 3,
    donderdag: 4, vrijdag: 5, zaterdag: 6,
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6,
  };
  const nu = new Date();
  const vandaag = nu.getDay();
  const genormaliseerd = dag.toLowerCase().trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(genormaliseerd)) return genormaliseerd;

  let dagNr = -1;
  for (const [naam, nr] of Object.entries(DAGEN)) {
    if (genormaliseerd.startsWith(naam) || naam.startsWith(genormaliseerd.slice(0, 4))) {
      dagNr = nr;
      break;
    }
  }

  if (dagNr === -1) dagNr = (vandaag + 1) % 7;

  let diff = dagNr - vandaag;
  if (diff <= 0) diff += 7;
  const doelDatum = new Date(nu);
  doelDatum.setDate(nu.getDate() + diff);
  return doelDatum.toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
  let toolCallId = 'unknown';
  try {
    // ── Webhook secret verificatie ──
    const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
    if (webhookSecret) {
      const incoming = request.headers.get('x-webhook-secret') ?? request.headers.get('x-vapi-secret');
      if (incoming !== webhookSecret) {
        console.error('[appointments/save] Webhook secret mismatch');
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();

    const toolCallList = body?.message?.toolCallList ?? [];
    const toolCall = toolCallList[0];
    toolCallId = toolCall?.id ?? 'unknown';

    let args: Record<string, string> = {};
    if (toolCall?.function?.arguments) {
      try {
        args = typeof toolCall.function.arguments === 'string'
          ? JSON.parse(toolCall.function.arguments)
          : toolCall.function.arguments;
      } catch {
        console.error('[appointments/save] Ongeldige JSON in function.arguments');
        return vapiResult(toolCallId, 'Er ging iets mis met de gegevens. Kan je het opnieuw proberen?');
      }
    }

    const { naam, dienst, datum, tijdstip } = args;
    const telefoon = body?.message?.call?.customer?.number ?? '';

    if (!naam || !datum || !tijdstip) {
      return vapiResult(toolCallId, 'Ik heb je naam, dag en tijdstip nodig om een afspraak te boeken.');
    }

    const isoDate = dagNaarDatum(datum);
    const uurMatch = String(tijdstip).match(/(\d{1,2})/);
    const uur = uurMatch ? parseInt(uurMatch[1]) : 9;

    const startTime = new Date(`${isoDate}T${String(uur).padStart(2, '0')}:00:00`);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const supabase = getSupabase();

    // ── Multi-tenant: business lookup via assistantId ──
    const assistantId = String(body?.message?.call?.assistantId ?? '').trim();
    let businessId: string | null = null;

    if (assistantId) {
      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .eq('vapi_assistant_id', assistantId)
        .single();
      if (biz) businessId = biz.id;
    }

    if (!businessId) {
      const fallback = process.env.DEFAULT_TENANT_ID;
      if (fallback) {
        businessId = fallback;
      } else {
        console.error('[appointments/save] Geen business gevonden voor assistantId:', assistantId);
        return vapiResult(toolCallId, 'Er ging iets mis. Probeer het later opnieuw.');
      }
    }

    // ── Duplicate / conflict check ──
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id')
      .eq('business_id', businessId)
      .neq('status', 'cancelled')
      .gte('start_time', startTime.toISOString())
      .lt('start_time', endTime.toISOString())
      .limit(1);

    if (conflicts && conflicts.length > 0) {
      return vapiResult(toolCallId, `Dat tijdstip is helaas al bezet. Heb je een ander uur in gedachten?`);
    }

    // ── Insert ──
    const { error: insertError } = await supabase.from('appointments').insert({
      business_id: businessId,
      customer_name: naam,
      customer_phone: telefoon,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'confirmed',
      booked_by: 'ai',
      notes: `${dienst || 'afspraak'} op ${datum} om ${tijdstip}`,
    });

    if (insertError) {
      if (insertError.code === '23505') {
        return vapiResult(toolCallId, 'Dat tijdstip is net geboekt door iemand anders. Kies een ander uur.');
      }
      console.error('[appointments/save] Insert error:', insertError);
      return vapiResult(toolCallId, 'Er ging iets mis bij het opslaan. Probeer het later opnieuw.');
    }

    return vapiResult(toolCallId, `Afspraak bevestigd voor ${naam} op ${datum} om ${tijdstip}.`);

  } catch (error) {
    console.error('[appointments/save] Onverwachte fout:', error instanceof Error ? error.message : error);
    return vapiResult(toolCallId, 'Er ging iets mis. De afspraak is niet opgeslagen. Probeer het later opnieuw.');
  }
}
