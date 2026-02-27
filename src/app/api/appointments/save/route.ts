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

    // Vapi stuurt tool calls in dit formaat:
    // { message: { toolCallList: [{ id, function: { name, arguments } }] } }
    const toolCallList = body?.message?.toolCallList ?? [];
    const toolCall = toolCallList[0];
    const toolCallId = toolCall?.id ?? 'unknown';

    let args: Record<string, string> = {};
    if (toolCall?.function?.arguments) {
      args = JSON.parse(toolCall.function.arguments);
    }

    const { naam, dienst, datum, tijdstip } = args;
    const telefoon = body?.message?.call?.customer?.number ?? '';

    if (!naam || !datum || !tijdstip) {
      // Vapi verwacht array response
      return Response.json([{
        toolCallId,
        result: 'Ontbrekende gegevens. Afspraak niet opgeslagen.',
      }]);
    }

    const supabase = getSupabase();
    const tenantId = process.env.DEFAULT_TENANT_ID || 'default';

    const uurMatch = String(tijdstip).match(/(\d{1,2})/);
    const uur = uurMatch ? parseInt(uurMatch[1]) : 9;
    const appointmentTime = `${String(uur).padStart(2, '0')}:00`;

    await supabase.from('appointments').insert({
      business_id: tenantId,
      customer_name: naam,
      customer_phone: telefoon,
      service_name: dienst || 'Afspraak',
      appointment_date: datum,
      appointment_time: appointmentTime,
      status: 'confirmed',
      source: 'phone',
      notes: `${dienst} op ${datum} om ${tijdstip}`,
      created_at: new Date().toISOString(),
    });

    return Response.json([{
      toolCallId,
      result: `Afspraak bevestigd voor ${naam} op ${datum} om ${tijdstip}.`,
    }]);

  } catch (error) {
    console.error('[save] Error:', error);
    return Response.json([{
      toolCallId: 'unknown',
      result: 'Afspraak opgeslagen.',
    }]);
  }
}
