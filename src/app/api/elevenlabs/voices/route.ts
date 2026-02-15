import { NextResponse } from 'next/server';

// Fallback voices als API niet werkt
const fallbackVoices = [
  { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', labels: { gender: 'female', accent: 'American' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2571e8c1fa.mp3' },
  { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', labels: { gender: 'female', accent: 'American' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-5c96-470d-8571-1da0f67a3ee3.mp3' },
  { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', labels: { gender: 'male', accent: 'American' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/38a69695-2ca9-4b9e-b9ec-f07ced494e58.mp3' },
  { voice_id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', labels: { gender: 'male', accent: 'American' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/06a09203-e8d5-4a02-9e9b-65be0abce7b1.mp3' },
  { voice_id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', labels: { gender: 'male', accent: 'British' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/6da409c1-5ba1-4cb0-b52e-c1ae8142fd55.mp3' },
  { voice_id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', labels: { gender: 'female', accent: 'Swedish' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/XB0fDUnXU5powFXDhCwa/1a8dc032-188f-4ffb-9a87-4e03f9ebe44c.mp3' },
  { voice_id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', labels: { gender: 'female', accent: 'British' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pFZP5JQG7iQjIQuC4Bku/0abc46ea-ad15-4ca3-bc36-743541390cdd.mp3' },
  { voice_id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', labels: { gender: 'male', accent: 'American' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/699e4a3d-2f72-4fb8-8891-b6b4af8e0fbc.mp3' },
];

// GET - Fetch real ElevenLabs voices from API
export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.log('No ElevenLabs API key, returning fallback voices');
      return NextResponse.json(fallbackVoices);
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      console.error('ElevenLabs API returned:', response.status);
      return NextResponse.json(fallbackVoices);
    }

    const data = await response.json();
    
    // Return all voices with their real labels
    const voices = data.voices.map((v: { 
      voice_id: string; 
      name: string; 
      labels?: Record<string, string>;
      preview_url?: string;
    }) => ({
      voice_id: v.voice_id,
      name: v.name,
      labels: v.labels || {},
      preview_url: v.preview_url,
    }));

    return NextResponse.json(voices);
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    return NextResponse.json(fallbackVoices);
  }
}
