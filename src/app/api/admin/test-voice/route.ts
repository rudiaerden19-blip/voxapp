/**
 * Test endpoint: simuleert volledige voice flow zonder echte call.
 * GET /api/admin/test-voice?key=TEST
 */
import { NextRequest, NextResponse } from 'next/server';
import { textToAudioUrl } from '@/lib/voice-engine/telnyx-tts';
import { getGreeting } from '@/lib/voice-engine/sessionStateMachine';

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  if (key !== 'TEST') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  try {
    const greetingText = getGreeting('frituur nolim');
    results.greetingText = greetingText;

    const audioUrl = await textToAudioUrl(greetingText);
    results.audioUrl = audioUrl;
    results.ok = true;
  } catch (err) {
    results.ok = false;
    results.error = err instanceof Error ? err.message : String(err);
    results.stack = err instanceof Error ? err.stack?.slice(0, 500) : undefined;
  }

  return NextResponse.json(results);
}
