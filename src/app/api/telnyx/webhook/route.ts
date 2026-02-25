import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Telnyx webhook – calls gaan nu rechtstreeks via SIP trunk naar Retell.
// Deze webhook ontvangt events van de VoxApp-Deepgram connection (US nummer).
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const data = (body.data ?? {}) as Record<string, unknown>;
    const eventType: string = (data.event_type as string) ?? (body.event_type as string) ?? 'unknown';
    const payload = (data.payload ?? {}) as Record<string, unknown>;

    const logEntry = {
      event_type: eventType,
      call_control_id: payload.call_control_id ?? null,
      call_session_id: payload.call_session_id ?? null,
      call_leg_id: payload.call_leg_id ?? null,
      from: payload.from ?? null,
      to: payload.to ?? null,
      direction: payload.direction ?? null,
      state: payload.state ?? null,
      hangup_cause: payload.hangup_cause ?? null,
      hangup_source: payload.hangup_source ?? null,
      sip_hangup_cause: payload.sip_hangup_cause ?? null,
      sip_uri_called: payload.sip_uri_called ?? null,
      connection_id: payload.connection_id ?? null,
      raw_preview: rawBody.slice(0, 800),
    };

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f1a73aa-b288-4694-976b-ca856d570f3d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '12fe0b' },
      body: JSON.stringify({ sessionId: '12fe0b', location: 'telnyx/webhook/route.ts:POST', message: 'telnyx_event', hypothesisId: 'B', data: logEntry, timestamp: Date.now() }),
    }).catch(() => {});
    // #endregion

    console.log('[Telnyx webhook]', JSON.stringify(logEntry));

    // Persisteer in Supabase zodat we mislukte calls kunnen analyseren
    try {
      const sb = getSupabase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (sb.from('call_logs') as any).insert({
        business_id: '0267c0ae-c997-421a-a259-e7559840897b',
        conversation_id: `telnyx_${payload.call_control_id ?? Date.now()}`,
        status: eventType,
        summary: `[Telnyx] ${eventType} | hangup: ${payload.hangup_cause ?? '-'} | sip: ${payload.sip_hangup_cause ?? '-'}`,
        metadata: logEntry,
        created_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.error('[Telnyx] Supabase log fout:', dbErr);
    }

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
    service: 'Telnyx webhook – VoxApp',
    pipeline: 'Retell AI via SIP trunk',
  });
}
