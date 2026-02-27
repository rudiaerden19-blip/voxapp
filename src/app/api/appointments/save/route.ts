export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Vapi stuurt tool call resultaten via message.toolCallList
    const toolCall = body?.message?.toolCallList?.[0];
    const args = toolCall?.function?.arguments
      ? JSON.parse(toolCall.function.arguments)
      : body;

    const { dienst, datum, datum_iso, tijdstip, naam, telefoon } = args;

    if (!naam || !datum || !tijdstip) {
      return Response.json({ result: 'Ontbrekende gegevens: naam, datum of tijdstip.' });
    }

    const supabase = getSupabase();
    const tenantId = process.env.DEFAULT_TENANT_ID || 'default';

    // Zet tijdstip om naar HH:MM formaat
    const uurMatch = String(tijdstip).match(/(\d{1,2})/);
    const uur = uurMatch ? parseInt(uurMatch[1]) : 9;
    const appointmentTime = `${String(uur).padStart(2, '0')}:00`;

    // Datum ISO — als niet meegegeven, gebruik datum string
    const appointmentDate = datum_iso || datum;

    await supabase.from('appointments').insert({
      business_id: tenantId,
      customer_name: naam,
      customer_phone: telefoon || '',
      service_name: dienst || 'Afspraak',
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: 'confirmed',
      source: 'phone',
      notes: `${dienst} op ${datum} om ${tijdstip}`,
      created_at: new Date().toISOString(),
    });

    return Response.json({
      result: `Afspraak bevestigd voor ${naam} op ${datum} om ${tijdstip} voor ${dienst || 'een behandeling'}.`,
    });

  } catch (error) {
    console.error('[save] Error:', error);
    return Response.json({ result: 'Afspraak kon niet worden opgeslagen.' });
  }
}
