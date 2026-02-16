import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');
  return createClient(url, key);
}

function normalizePhoneNumber(phone: string): string {
  let n = (phone || '').replace(/[^\d+]/g, '');
  if (!n.startsWith('+')) {
    if (n.startsWith('0')) n = '+32' + n.slice(1);
    else if (n.startsWith('32')) n = '+' + n;
    else n = '+' + n;
  }
  return n;
}

function parseDiversion(diversion: string | undefined): string | null {
  if (!diversion) return null;
  const m = diversion.match(/sip:(\+?\d+)@/i) || diversion.match(/tel:(\+?\d+)/i) || diversion.match(/(\+?\d{9,15})/);
  return m ? normalizePhoneNumber(m[1]) : null;
}

// Telnyx Call Control webhook: inkomende gesprekken naar poolnummers
// Stel in Telnyx bij je Connection de Webhook URL in op: https://jouw-domein.com/api/telnyx/webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.event_type;
    const payload = body.data?.payload ?? body.payload ?? body;

    if (eventType !== 'call.initiated') {
      return NextResponse.json({ accepted: true });
    }

    const to = normalizePhoneNumber(payload.to ?? payload.called_number ?? '');
    const from = normalizePhoneNumber(payload.from ?? payload.caller_number ?? '');
    const callControlId = payload.call_control_id;
    const diversion = parseDiversion(
      payload.diversion ?? payload.sip_headers?.['Diversion'] ?? payload.original_dialed_number
    );

    const supabase = getSupabase();

    // Bepaal business: via doorgestuurde nummer (Diversion) of enige klant op dit poolnummer
    let businessId: string | null = null;
    let agentId: string | null = null;

    // Alleen bij doorsturen hebben we het oorspronkelijke nummer (Diversion); daarmee bepalen we de klant
    if (!diversion) {
      return NextResponse.json({
        message: 'no_diversion',
        error: 'Doorgestuurde oproep zonder Diversion – stel doorsturen in bij je provider',
      }, { status: 200 });
    }

    const { data: forwarding } = await supabase
      .from('forwarding_numbers')
      .select('business_id')
      .eq('phone_number', diversion)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (forwarding?.business_id) {
      businessId = forwarding.business_id;
      const { data: business } = await supabase
        .from('businesses')
        .select('elevenlabs_agent_id')
        .eq('id', businessId)
        .single();
      agentId = business?.elevenlabs_agent_id ?? null;
    }

    if (!agentId) {
      return NextResponse.json({
        message: 'no_agent_configured',
        error: 'Geen AI-agent voor dit nummer',
      }, { status: 200 });
    }

    const apiKey = process.env.TELNYX_API_KEY;
    const elevenlabsSipDomain = process.env.ELEVENLABS_SIP_DOMAIN || 'sip.rtc.elevenlabs.io';
    const sipUri = `sip:${agentId}@${elevenlabsSipDomain}`;

    if (!apiKey) {
      console.error('TELNYX_API_KEY niet gezet – kan gesprek niet doorverbinden');
      return NextResponse.json({ error: 'Server config' }, { status: 500 });
    }

    // Beantwoorden en doorverbinden naar ElevenLabs SIP
    const answerRes = await fetch(`https://api.telnyx.com/v2/call_control/${callControlId}/actions/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({}),
    });

    if (!answerRes.ok) {
      const errText = await answerRes.text();
      console.error('Telnyx answer failed:', answerRes.status, errText);
      return NextResponse.json({ error: 'Answer failed' }, { status: 500 });
    }

    const transferRes = await fetch(`https://api.telnyx.com/v2/call_control/${callControlId}/actions/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: sipUri,
        from: to,
        timeout_secs: 30,
      }),
    });

    if (!transferRes.ok) {
      const errText = await transferRes.text();
      console.error('Telnyx transfer failed:', transferRes.status, errText);
    }

    return NextResponse.json({
      accepted: true,
      business_id: businessId,
      agent_id: agentId,
      transferred_to: sipUri,
    });
  } catch (err) {
    console.error('Telnyx webhook error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Telnyx webhook',
    usage: 'POST only – stel deze URL in als Webhook bij je Telnyx Connection',
  });
}
