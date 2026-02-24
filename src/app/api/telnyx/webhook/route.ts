import { NextRequest, NextResponse } from 'next/server';

// Telnyx webhook – calls gaan nu rechtstreeks via SIP trunk naar Retell.
// Deze webhook ontvangt events van de VoxApp-Deepgram connection (US nummer).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.data?.event_type ?? body.event_type;

    console.log('[Telnyx webhook]', eventType);

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
