import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/telnyx/failover
 * Telnyx failover webhook — wordt alleen aangeroepen als Vapi EU niet bereikbaar is.
 * Beantwoordt de call met een TTS-boodschap en hangt op.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const callControlId = body?.data?.payload?.call_control_id;
    const eventType = body?.data?.event_type ?? body?.event_type;

    if (!callControlId) {
      return NextResponse.json({ ok: false, error: 'Geen call_control_id' }, { status: 400 });
    }

    const telnyxKey = process.env.TELNYX_API_KEY;
    if (!telnyxKey) {
      return NextResponse.json({ ok: false, error: 'TELNYX_API_KEY ontbreekt' }, { status: 500 });
    }

    if (eventType === 'call.initiated' || eventType === 'call.answered') {
      await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/answer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${telnyxKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
    }

    // Speak a message and hang up
    if (eventType === 'call.initiated' || eventType === 'call.answered' || eventType === 'call.speak.ended') {
      if (eventType !== 'call.speak.ended') {
        await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/speak`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${telnyxKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payload: 'Onze receptie is momenteel niet bereikbaar. Probeer het over enkele minuten opnieuw of laat een bericht achter na de piep.',
            language: 'nl-NL',
            voice: 'female',
          }),
        });
      } else {
        await fetch(`https://api.telnyx.com/v2/calls/${callControlId}/actions/hangup`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${telnyxKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
      }
    }

    return NextResponse.json({ ok: true, event: eventType });
  } catch (error) {
    console.error('[telnyx/failover]', error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
