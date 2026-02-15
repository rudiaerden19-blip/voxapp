import { NextResponse } from 'next/server';

// 16 stemmen in 5 talen: Nederlands, Frans, Duits, Engels, Spaans
const fallbackVoices = [
  // NEDERLANDS (4 stemmen)
  { voice_id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', labels: { gender: 'female', accent: 'Nederlands', language: 'NL' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pFZP5JQG7iQjIQuC4Bku/0abc46ea-ad15-4ca3-bc36-743541390cdd.mp3' },
  { voice_id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', labels: { gender: 'female', accent: 'Nederlands', language: 'NL' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/XB0fDUnXU5powFXDhCwa/1a8dc032-188f-4ffb-9a87-4e03f9ebe44c.mp3' },
  { voice_id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', labels: { gender: 'male', accent: 'Nederlands', language: 'NL' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/6da409c1-5ba1-4cb0-b52e-c1ae8142fd55.mp3' },
  { voice_id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', labels: { gender: 'male', accent: 'Nederlands', language: 'NL' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/699e4a3d-2f72-4fb8-8891-b6b4af8e0fbc.mp3' },
  
  // FRANS (4 stemmen)
  { voice_id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', labels: { gender: 'female', accent: 'Frans', language: 'FR' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/XrExE9yKIg1WjnnlVkGX/22afa633-a092-4c43-a54a-b48ab9d11fed.mp3' },
  { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', labels: { gender: 'female', accent: 'Frans', language: 'FR' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2571e8c1fa.mp3' },
  { voice_id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', labels: { gender: 'male', accent: 'Frans', language: 'FR' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/CYw3kZ02Hs0563khs1Fj/51d54d11-8b09-437f-9013-fe50e0a3d8c1.mp3' },
  { voice_id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', labels: { gender: 'male', accent: 'Frans', language: 'FR' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/N2lVS1w4EtoT3dr4eOWO/3a3e4f6b-b2e0-437b-a691-b9e5c6e1a4f2.mp3' },
  
  // DUITS (4 stemmen)
  { voice_id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', labels: { gender: 'female', accent: 'Duits', language: 'DE' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/ThT5KcBeYPX3keUQqHPh/86d16d2e-57a7-426e-b5cb-ea9b3c6c5c5f.mp3' },
  { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', labels: { gender: 'female', accent: 'Duits', language: 'DE' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/508e1259-3e7f-47cf-8b32-928b5c94dba4.mp3' },
  { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', labels: { gender: 'male', accent: 'Duits', language: 'DE' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4xSOukaG/3c7de517-8c0a-4e84-b8f6-32b8d8e9a5f0.mp3' },
  { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', labels: { gender: 'male', accent: 'Duits', language: 'DE' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/38a69695-2ca9-4b9e-b9ec-f07ced494e58.mp3' },
  
  // ENGELS (4 stemmen)
  { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', labels: { gender: 'female', accent: 'Engels', language: 'EN' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-5c96-470d-8571-1da0f67a3ee3.mp3' },
  { voice_id: 'jBpfuIE2acCO8z3wKNLl', name: 'Gigi', labels: { gender: 'female', accent: 'Engels', language: 'EN' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/jBpfuIE2acCO8z3wKNLl/e1ddd5bb-3c22-4d0e-9dae-11a3c91d4ec4.mp3' },
  { voice_id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', labels: { gender: 'male', accent: 'Engels', language: 'EN' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/06a09203-e8d5-4a02-9e9b-65be0abce7b1.mp3' },
  { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', labels: { gender: 'male', accent: 'Engels', language: 'EN' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/38d8f8d7-8f5e-4b1c-a1d7-3d3f3e4c9b0f.mp3' },
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
