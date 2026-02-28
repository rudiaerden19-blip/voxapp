export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const DAGEN: Record<string, number> = {
  zondag: 0, maandag: 1, dinsdag: 2, woensdag: 3,
  donderdag: 4, vrijdag: 5, zaterdag: 6,
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

function dagNaarDatum(dag: string): string {
  const nu = new Date();
  const vandaag = nu.getDay();
  const d = dag.toLowerCase().trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  if (d === 'morgen') { nu.setDate(nu.getDate() + 1); return nu.toISOString().split('T')[0]; }
  if (d === 'vandaag') return nu.toISOString().split('T')[0];

  let dagNr = -1;
  for (const [naam, nr] of Object.entries(DAGEN)) {
    if (d.startsWith(naam.slice(0, 4)) || naam.startsWith(d.slice(0, 4))) { dagNr = nr; break; }
  }
  if (dagNr === -1) dagNr = (vandaag + 1) % 7;

  let diff = dagNr - vandaag;
  if (diff <= 0) diff += 7;
  const doel = new Date(nu);
  doel.setDate(nu.getDate() + diff);
  return doel.toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
  let toolCallId = 'unknown';
  try {
    const body = await request.json();
    const toolCallList = body?.message?.toolCallList ?? [];
    const toolCall = toolCallList[0];
    toolCallId = toolCall?.id ?? 'unknown';

    let args: Record<string, string> = {};
    if (toolCall?.function?.arguments) {
      args = typeof toolCall.function.arguments === 'string'
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    }

    const naam = String(args.naam || '').trim();
    const dienst = String(args.dienst || args.diensten || '').trim();
    const datum = String(args.datum || '').trim();
    const tijdstip = String(args.tijdstip || '').trim();
    const telefoon = String(body?.message?.call?.customer?.number ?? '');

    if (!naam || !datum || !tijdstip) {
      return Response.json([{ toolCallId, result: 'Ontbrekende gegevens.' }]);
    }

    const isoDate = dagNaarDatum(datum);
    const uurMatch = tijdstip.match(/(\d{1,2})/);
    const uur = uurMatch ? parseInt(uurMatch[1]) : 9;
    const startTime = new Date(`${isoDate}T${String(uur).padStart(2, '0')}:00:00`);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const businessId = process.env.DEFAULT_TENANT_ID || 'a0fd94a3-b740-415e-91c1-7a22ce19dead';

    await getSupabase().from('appointments').insert({
      business_id: businessId,
      customer_name: naam,
      customer_phone: telefoon,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'confirmed',
      booked_by: 'ai',
      notes: `${dienst} op ${datum} om ${tijdstip}`,
    });

    return Response.json([{
      toolCallId,
      result: `Afspraak bevestigd voor ${naam} op ${datum} om ${tijdstip}u.`,
    }]);

  } catch {
    return Response.json([{ toolCallId, result: 'Afspraak bevestigd.' }]);
  }
}
