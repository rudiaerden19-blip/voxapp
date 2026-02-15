import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const voiceId = searchParams.get('voice_id');

  if (!voiceId) {
    return NextResponse.json({ error: 'voice_id required' }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
  }

  try {
    // Generate a short sample text
    const sampleText = 'Hallo, dit is een voorbeeldstem. Hoe kan ik u vandaag helpen?';

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: sampleText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs TTS error:', response.status, errorText);
      return NextResponse.json({ error: 'Kon preview niet genereren' }, { status: 500 });
    }

    // Return the audio as a stream
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json({ error: 'Fout bij genereren preview' }, { status: 500 });
  }
}
