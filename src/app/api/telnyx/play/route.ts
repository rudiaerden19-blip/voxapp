import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { call_control_id, audio_url } = await request.json();
    const apiKey = process.env.TELNYX_API_KEY;

    if (!apiKey || !call_control_id || !audio_url) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    const res = await fetch(`https://api.telnyx.com/v2/calls/${call_control_id}/actions/playback_start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ audio_url, overlay: false }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Telnyx playback_start failed:', res.status, err);
      return NextResponse.json({ error: 'Playback failed', detail: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Telnyx play error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
