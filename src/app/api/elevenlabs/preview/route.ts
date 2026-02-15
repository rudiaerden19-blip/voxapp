import { NextRequest, NextResponse } from 'next/server';

// POST - Generate voice preview
export async function POST(request: NextRequest) {
  try {
    const { voice_id, text } = await request.json();
    
    if (!voice_id || !text) {
      return NextResponse.json({ error: 'voice_id and text required' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs TTS error:', error);
      return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Preview API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
