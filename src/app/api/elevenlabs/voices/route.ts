import { NextResponse } from 'next/server';

// Welke voice IDs willen we tonen, per taal
const voiceConfig: Record<string, { ids: string[]; accent: string }> = {
  NL: { ids: ['pFZP5JQG7iQjIQuC4Bku', 'XB0fDUnXU5powFXDhCwa', 'onwK4e9ZLuTAKqWW03F9', 'TX3LPaxmHKxFdv7VOQHJ'], accent: 'Nederlands' },
  FR: { ids: ['XrExE9yKIg1WjnnlVkGX', 'EXAVITQu4vr4xnSDxMaL', 'CYw3kZ02Hs0563khs1Fj', 'N2lVS1w4EtoT3dr4eOWO'], accent: 'Frans' },
  DE: { ids: ['ThT5KcBeYPX3keUQqHPh', 'AZnzlk1XvdvUeBnXmlld', 'VR6AewLTigWG4xSOukaG', 'pNInz6obpgDQGcFmaJgB'], accent: 'Duits' },
  EN: { ids: ['21m00Tcm4TlvDq8ikWAM', 'jBpfuIE2acCO8z3wKNLl', 'TxGEqnHWrfWFTfGW9XjX', 'ErXwobaYiN019PkySvjV'], accent: 'Engels' },
};

// Alle voice IDs die we willen
const allVoiceIds = new Set(Object.values(voiceConfig).flatMap(c => c.ids));

// Mapping voice_id → taal
const voiceToLang: Record<string, string> = {};
for (const [lang, config] of Object.entries(voiceConfig)) {
  for (const id of config.ids) {
    voiceToLang[id] = lang;
  }
}

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'ElevenLabs API error' }, { status: 500 });
    }

    const data = await response.json();
    
    // Filter alleen de stemmen die we willen
    const voices = data.voices
      .filter((v: { voice_id: string }) => allVoiceIds.has(v.voice_id))
      .map((v: { voice_id: string; name: string; labels?: Record<string, string>; preview_url?: string }) => {
        const lang = voiceToLang[v.voice_id];
        const config = voiceConfig[lang];
        return {
          voice_id: v.voice_id,
          name: v.name,
          preview_url: v.preview_url,
          labels: {
            gender: v.labels?.gender || 'unknown',
            language: lang,
            accent: config.accent,
          },
        };
      });

    return NextResponse.json(voices);
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
