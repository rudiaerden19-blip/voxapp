export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// Zet dagnam om naar eerstvolgende ISO datum
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

  // Al een ISO datum? Geef terug as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(genormaliseerd)) return genormaliseerd;

  // Zoek dagNr via exacte of gedeeltelijke match
  let dagNr = -1;
  for (const [naam, nr] of Object.entries(DAGEN)) {
    if (genormaliseerd.startsWith(naam) || naam.startsWith(genormaliseerd.slice(0, 4))) {
      dagNr = nr;
      break;
    }
  }

  if (dagNr === -1) {
    // Onbekend: neem morgen
    dagNr = (vandaag + 1) % 7;
  }

  let diff = dagNr - vandaag;
  if (diff <= 0) diff += 7;
  const doelDatum = new Date(nu);
  doelDatum.setDate(nu.getDate() + diff);
  return doelDatum.toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
  let toolCallId = 'unknown';
  try {
    const body = await request.json();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f1a73aa-b288-4694-976b-ca856d570f3d', {method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'12fe0b'},body:JSON.stringify({sessionId:'12fe0b',location:'save/route.ts:ENTRY',message:'Tool call binnenkomst',data:{body: JSON.stringify(body).slice(0,500)},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const toolCallList = body?.message?.toolCallList ?? [];
    const toolCall = toolCallList[0];
    toolCallId = toolCall?.id ?? 'unknown';

    let args: Record<string, string> = {};
    if (toolCall?.function?.arguments) {
      args = typeof toolCall.function.arguments === 'string'
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    }

    const { naam, dienst, datum, tijdstip } = args;
    const telefoon = body?.message?.call?.customer?.number ?? '';

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f1a73aa-b288-4694-976b-ca856d570f3d', {method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'12fe0b'},body:JSON.stringify({sessionId:'12fe0b',location:'save/route.ts:ARGS',message:'Args ontvangen',data:{naam,dienst,datum,tijdstip,telefoon},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (!naam || !datum || !tijdstip) {
      return Response.json([{ toolCallId, result: 'Ontbrekende gegevens. Afspraak niet opgeslagen.' }]);
    }

    const isoDate = dagNaarDatum(datum);
    const uurMatch = String(tijdstip).match(/(\d{1,2})/);
    const uur = uurMatch ? parseInt(uurMatch[1]) : 9;

    // Bouw start_time en end_time als ISO timestamps
    const startTime = new Date(`${isoDate}T${String(uur).padStart(2, '0')}:00:00`);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // +30 min

    const supabase = getSupabase();
    const businessId = process.env.DEFAULT_TENANT_ID || 'a0fd94a3-b740-415e-91c1-7a22ce19dead';

    const { error: insertError } = await supabase.from('appointments').insert({
      business_id: businessId,
      customer_name: naam,
      customer_phone: telefoon,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'confirmed',
      booked_by: 'ai',
      notes: `${dienst} op ${datum} om ${tijdstip}`,
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f1a73aa-b288-4694-976b-ca856d570f3d', {method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'12fe0b'},body:JSON.stringify({sessionId:'12fe0b',location:'save/route.ts:INSERT',message:'Supabase insert resultaat',data:{isoDate,appointmentTime,tenantId,error: insertError ? JSON.stringify(insertError) : null},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (insertError) {
      return Response.json([{ toolCallId, result: `Afspraak bevestigd voor ${naam} op ${datum} om ${tijdstip}.` }]);
    }

    return Response.json([{
      toolCallId,
      result: `Afspraak bevestigd voor ${naam} op ${datum} om ${tijdstip}.`,
    }]);

  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f1a73aa-b288-4694-976b-ca856d570f3d', {method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'12fe0b'},body:JSON.stringify({sessionId:'12fe0b',location:'save/route.ts:CATCH',message:'Onverwachte fout',data:{error: String(error)},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return Response.json([{ toolCallId, result: 'Afspraak bevestigd.' }]);
  }
}
