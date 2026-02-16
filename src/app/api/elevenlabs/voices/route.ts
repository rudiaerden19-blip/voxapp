import { NextResponse } from 'next/server';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
  preview_url?: string;
  category?: string;
}

interface VoiceResponse {
  voice_id: string;
  name: string;
  preview_url: string | null;
  description: string;
  labels: {
    gender: string;
    accent: string;
    age: string;
    use_case: string;
  };
}

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.error('ELEVENLABS_API_KEY not configured');
    return NextResponse.json({ error: 'API key niet geconfigureerd' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
    });

    if (!response.ok) {
      console.error('ElevenLabs API returned:', response.status);
      return NextResponse.json({ error: 'Kon stemmen niet ophalen' }, { status: 502 });
    }

    const data = await response.json();
    
    if (!data.voices || !Array.isArray(data.voices)) {
      console.error('Invalid response from ElevenLabs');
      return NextResponse.json({ error: 'Ongeldige response' }, { status: 502 });
    }

    // Map all voices to our format
    const voices: VoiceResponse[] = data.voices.map((voice: ElevenLabsVoice) => {
      const labels = voice.labels || {};
      
      // Get gender in Dutch
      let gender = 'Onbekend';
      const genderLower = (labels.gender || '').toLowerCase();
      if (genderLower === 'female') gender = 'Vrouw';
      else if (genderLower === 'male') gender = 'Man';
      
      // Get accent/description
      const accent = labels.accent || labels.description || '';
      const age = labels.age || '';
      const useCase = labels.use_case || labels['use case'] || '';
      
      // Build description
      let description = gender;
      if (accent) description += ` • ${accent}`;
      
      return {
        voice_id: voice.voice_id,
        name: voice.name,
        preview_url: voice.preview_url || null,
        description,
        labels: {
          gender,
          accent,
          age,
          use_case: useCase,
        },
      };
    });

    // Sort: premade voices first, then by name
    voices.sort((a, b) => {
      // Put professional/premade voices first based on common ElevenLabs voice names
      const premadeNames = ['Rachel', 'Domi', 'Bella', 'Antoni', 'Elli', 'Josh', 'Arnold', 'Adam', 'Sam', 'Charlotte', 'Alice', 'Matilda', 'Sarah', 'Laura', 'Charlie', 'George', 'Emily', 'Nicole', 'Lily', 'Daniel', 'Brian', 'Callum', 'Liam', 'Dorothy', 'Gigi'];
      const aIsPremade = premadeNames.some(n => a.name.includes(n));
      const bIsPremade = premadeNames.some(n => b.name.includes(n));
      
      if (aIsPremade && !bIsPremade) return -1;
      if (!aIsPremade && bIsPremade) return 1;
      
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(voices);
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    return NextResponse.json({ error: 'Fout bij ophalen stemmen' }, { status: 500 });
  }
}
