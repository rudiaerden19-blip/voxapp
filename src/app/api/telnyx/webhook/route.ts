import { NextRequest, NextResponse } from 'next/server';

// Telnyx webhook – FAILOVER van api.vapi.ai/telnyx/inbound_call
// Anchorsite: Amsterdam, Netherlands | Codecs: G711U eerst | Webhooks parallel
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let body: Record<string, unknown>;
    try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const data = (body.data ?? {}) as Record<string, unknown>;
    const eventType = (data.event_type as string) ?? (body.event_type as string) ?? 'unknown';
    const payload = (data.payload ?? {}) as Record<string, unknown>;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f1a73aa-b288-4694-976b-ca856d570f3d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '12fe0b' },
      body: JSON.stringify({
        sessionId: '12fe0b', location: 'telnyx/webhook:FAILOVER', message: 'failover_event_ontvangen',
        hypothesisId: 'H-I-J',
        data: {
          event_type: eventType,
          from: payload.from, to: payload.to,
          direction: payload.direction, state: payload.state,
          hangup_cause: payload.hangup_cause,
          sip_hangup_cause: payload.sip_hangup_cause,
          call_control_id: payload.call_control_id,
          raw: rawBody.slice(0, 400),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    // Dit is de FAILOVER webhook — betekent VAPI's webhook is gevraild
    console.error('[Telnyx FAILOVER webhook] event:', eventType, 'from:', payload.from, 'to:', payload.to, 'hangup:', payload.hangup_cause);

    return NextResponse.json({ accepted: true, event: eventType, source: 'failover' });
  } catch (err) {
    console.error('Telnyx failover webhook error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Telnyx webhook – VoxApp',
    pipeline: 'Retell AI via SIP trunk',
  });
}
