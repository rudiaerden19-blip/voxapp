import { NextResponse } from 'next/server';

// GET - Fetch ElevenLabs voices
export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      // Return default voices if no API key
      return NextResponse.json([
        { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', labels: { accent: 'American', gender: 'female' } },
        { voice_id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', labels: { accent: 'American', gender: 'male' } },
        { voice_id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', labels: { accent: 'British', gender: 'female' } },
        { voice_id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', labels: { accent: 'British', gender: 'female' } },
        { voice_id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', labels: { accent: 'British', gender: 'male' } },
        { voice_id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', labels: { accent: 'British', gender: 'male' } },
      ]);
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }

    const data = await response.json();
    
    // Filter for multilingual voices (better for Dutch/French/German)
    const voices = data.voices
      .filter((v: { category?: string }) => v.category === 'premade' || v.category === 'professional')
      .slice(0, 12) // Limit to 12 voices
      .map((v: { voice_id: string; name: string; labels?: { accent?: string; gender?: string } }) => ({
        voice_id: v.voice_id,
        name: v.name,
        labels: v.labels || {},
      }));

    return NextResponse.json(voices);
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    // Return fallback voices
    return NextResponse.json([
      { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', labels: { accent: 'American', gender: 'female' } },
      { voice_id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', labels: { accent: 'American', gender: 'male' } },
      { voice_id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', labels: { accent: 'British', gender: 'female' } },
      { voice_id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', labels: { accent: 'British', gender: 'male' } },
    ]);
  }
}
