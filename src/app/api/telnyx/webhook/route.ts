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

// Telnyx Call Control webhook: inkomende gesprekken
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.data?.event_type ?? body.event_type;
    const payload = body.data?.payload ?? body.payload ?? body;

    const apiKey = process.env.TELNYX_API_KEY;
    if (!apiKey) {
      console.error('TELNYX_API_KEY niet gezet');
      return NextResponse.json({ error: 'Server config' }, { status: 500 });
    }

    const callControlId = payload.call_control_id;
    const voiceServerUrl = process.env.VOICE_SERVER_URL;

    // ======== CALL INITIATED ========
    if (eventType === 'call.initiated') {
      const to = normalizePhoneNumber(payload.to ?? payload.called_number ?? '');
      const from = normalizePhoneNumber(payload.from ?? payload.caller_number ?? '');
      const diversion = parseDiversion(
        payload.diversion ?? payload.sip_headers?.['Diversion'] ?? payload.original_dialed_number
      );

      console.log('Telnyx call.initiated:', { to, from, diversion, voiceServerUrl: !!voiceServerUrl });

      const supabase = getSupabase();

      let businessId: string | null = null;
      let agentId: string | null = null;

      // 1. Probeer via Diversion header (doorgestuurd nummer)
      if (diversion) {
        const { data: forwarding } = await supabase
          .from('forwarding_numbers')
          .select('business_id')
          .eq('phone_number', diversion)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (forwarding?.business_id) {
          businessId = forwarding.business_id;
        }
      }

      // 2. Probeer via het gebelde nummer (ai_phone_number in businesses)
      if (!businessId && to) {
        const { data: bizByPhone } = await supabase
          .from('businesses')
          .select('id, agent_id')
          .eq('ai_phone_number', to)
          .limit(1)
          .maybeSingle();

        if (bizByPhone) {
          businessId = bizByPhone.id;
          agentId = bizByPhone.agent_id ?? null;
        }
      }

      // 3. Fallback: frituur nolim (hardcoded voor nu)
      if (!businessId) {
        businessId = '0267c0ae-c997-421a-a259-e7559840897b';
        console.log('Fallback: using frituur nolim');
      }

      // Agent ID ophalen als we een business hebben
      if (businessId && !agentId) {
        const { data: business } = await supabase
          .from('businesses')
          .select('agent_id')
          .eq('id', businessId)
          .single();
        agentId = business?.agent_id ?? null;
      }

      if (!businessId) {
        console.error('No business found for call', { to, from, diversion });
        return NextResponse.json({ message: 'no_agent_configured' }, { status: 200 });
      }

      // Answer the call
      const answerRes = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          client_state: Buffer.from(JSON.stringify({ business_id: businessId, caller_id: from, agent_id: agentId })).toString('base64'),
        }),
      });

      if (!answerRes.ok) {
        console.error('Telnyx answer failed:', answerRes.status, await answerRes.text());
        return NextResponse.json({ error: 'Answer failed' }, { status: 500 });
      }

      console.log('Call answered, waiting for call.answered event');
      return NextResponse.json({ accepted: true, pipeline: voiceServerUrl ? 'deepgram' : 'elevenlabs' });
    }

    // ======== CALL ANSWERED ========
    if (eventType === 'call.answered') {
      let clientData: { business_id?: string; caller_id?: string; agent_id?: string } = {};
      try {
        if (payload.client_state) {
          clientData = JSON.parse(Buffer.from(payload.client_state, 'base64').toString());
        }
      } catch {}

      console.log('Telnyx call.answered:', { clientData, voiceServerUrl: !!voiceServerUrl });

      if (voiceServerUrl && clientData.business_id) {
        // NEW PIPELINE: Start WebSocket stream to voice-server
        const wsUrl = voiceServerUrl.replace('https://', 'wss://').replace('http://', 'ws://');
        const streamParams = new URLSearchParams({
          call_control_id: callControlId || '',
          business_id: clientData.business_id || '',
          caller_id: clientData.caller_id || '',
        });

        const streamRes = await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/streaming_start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            stream_url: `${wsUrl}/telnyx-stream?${streamParams.toString()}`,
            stream_track: 'inbound_track',
            enable_dialogflow: false,
            client_state: payload.client_state,
          }),
        });

        if (!streamRes.ok) {
          console.error('Telnyx streaming_start failed:', streamRes.status, await streamRes.text());
        } else {
          console.log('Telnyx streaming started to voice-server');
        }

        return NextResponse.json({ accepted: true, pipeline: 'deepgram', streaming: true });
      } else {
        // LEGACY: Transfer to ElevenLabs SIP
        const agentId = clientData.agent_id;
        if (!agentId) {
          return NextResponse.json({ error: 'No agent' }, { status: 200 });
        }

        const elevenlabsSipDomain = process.env.ELEVENLABS_SIP_DOMAIN || 'sip.rtc.elevenlabs.io';
        const sipUri = `sip:${agentId}@${elevenlabsSipDomain}`;

        await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/transfer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ to: sipUri, from: payload.to ?? '', timeout_secs: 30 }),
        });

        return NextResponse.json({ accepted: true, pipeline: 'elevenlabs', transferred_to: sipUri });
      }
    }

    // ======== OTHER EVENTS ========
    return NextResponse.json({ accepted: true, event: eventType });
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
