import { NextRequest, NextResponse } from 'next/server';

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

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f1a73aa-b288-4694-976b-ca856d570f3d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '12fe0b' },
      body: JSON.stringify({
        sessionId: '12fe0b',
        location: 'telnyx/webhook/route.ts:POST',
        message: 'telnyx_event_ontvangen',
        hypothesisId: 'A',
        data: {
          event_type: eventType,
          call_control_id: payload.call_control_id,
          call_session_id: payload.call_session_id,
          call_leg_id: payload.call_leg_id,
          from: payload.from,
          to: payload.to,
          direction: payload.direction,
          state: payload.state,
          hangup_cause: payload.hangup_cause,
          hangup_source: payload.hangup_source,
          sip_hangup_cause: payload.sip_hangup_cause,
          sip_uri_called: payload.sip_uri_called,
          connection_id: payload.connection_id,
          raw_preview: rawBody.slice(0, 600),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    console.log('[Telnyx webhook]', eventType, {
      from: payload.from,
      to: payload.to,
      direction: payload.direction,
      state: payload.state,
      hangup_cause: payload.hangup_cause,
      sip_hangup_cause: payload.sip_hangup_cause,
    });

    return NextResponse.json({ accepted: true, event: eventType });
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f1a73aa-b288-4694-976b-ca856d570f3d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '12fe0b' },
      body: JSON.stringify({
        sessionId: '12fe0b',
        location: 'telnyx/webhook/route.ts:POST:catch',
        message: 'telnyx_webhook_error',
        hypothesisId: 'A',
        data: { error: err instanceof Error ? err.message : String(err) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
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
