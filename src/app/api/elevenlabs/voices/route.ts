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
  labels: {
    gender: string;
    language: string;
    accent: string;
  };
}

// Mapping van ElevenLabs language labels naar onze taalcodes
const languageMapping: Record<string, { code: string; accent: string }> = {
  // Nederlands
  'dutch': { code: 'NL', accent: 'Nederlands' },
  'nl': { code: 'NL', accent: 'Nederlands' },
  'netherlands': { code: 'NL', accent: 'Nederlands' },
  'flemish': { code: 'NL', accent: 'Nederlands' },
  // Frans
  'french': { code: 'FR', accent: 'Frans' },
  'fr': { code: 'FR', accent: 'Frans' },
  'france': { code: 'FR', accent: 'Frans' },
  // Duits
  'german': { code: 'DE', accent: 'Duits' },
  'de': { code: 'DE', accent: 'Duits' },
  'germany': { code: 'DE', accent: 'Duits' },
  // Engels
  'english': { code: 'EN', accent: 'Engels' },
  'en': { code: 'EN', accent: 'Engels' },
  'british': { code: 'EN', accent: 'Engels' },
  'american': { code: 'EN', accent: 'Engels' },
  'en-us': { code: 'EN', accent: 'Engels' },
  'en-gb': { code: 'EN', accent: 'Engels' },
  'en-au': { code: 'EN', accent: 'Engels' },
};

// Fallback stemmen als API faalt
const fallbackVoices: VoiceResponse[] = [
  // Nederlands
  { voice_id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', preview_url: null, labels: { gender: 'female', language: 'NL', accent: 'Nederlands' } },
  { voice_id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', preview_url: null, labels: { gender: 'female', language: 'NL', accent: 'Nederlands' } },
  { voice_id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', preview_url: null, labels: { gender: 'male', language: 'NL', accent: 'Nederlands' } },
  { voice_id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', preview_url: null, labels: { gender: 'male', language: 'NL', accent: 'Nederlands' } },
  // Frans
  { voice_id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', preview_url: null, labels: { gender: 'female', language: 'FR', accent: 'Frans' } },
  { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', preview_url: null, labels: { gender: 'female', language: 'FR', accent: 'Frans' } },
  { voice_id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', preview_url: null, labels: { gender: 'male', language: 'FR', accent: 'Frans' } },
  { voice_id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', preview_url: null, labels: { gender: 'male', language: 'FR', accent: 'Frans' } },
  // Duits
  { voice_id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', preview_url: null, labels: { gender: 'female', language: 'DE', accent: 'Duits' } },
  { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', preview_url: null, labels: { gender: 'female', language: 'DE', accent: 'Duits' } },
  { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', preview_url: null, labels: { gender: 'male', language: 'DE', accent: 'Duits' } },
  { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', preview_url: null, labels: { gender: 'male', language: 'DE', accent: 'Duits' } },
  // Engels
  { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', preview_url: null, labels: { gender: 'female', language: 'EN', accent: 'Engels' } },
  { voice_id: 'jBpfuIE2acCO8z3wKNLl', name: 'Gigi', preview_url: null, labels: { gender: 'female', language: 'EN', accent: 'Engels' } },
  { voice_id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', preview_url: null, labels: { gender: 'male', language: 'EN', accent: 'Engels' } },
  { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', preview_url: null, labels: { gender: 'male', language: 'EN', accent: 'Engels' } },
];

// Detecteer taal uit voice labels
function detectLanguage(voice: ElevenLabsVoice): { code: string; accent: string } | null {
  const labels = voice.labels || {};
  
  // Check alle label velden voor taalinformatie
  const fieldsToCheck = ['language', 'accent', 'locale', 'description'];
  
  for (const field of fieldsToCheck) {
    const value = labels[field]?.toLowerCase();
    if (value) {
      for (const [key, mapping] of Object.entries(languageMapping)) {
        if (value.includes(key)) {
          return mapping;
        }
      }
    }
  }
  
  // Check voice name voor taalhinten
  const nameLower = voice.name.toLowerCase();
  for (const [key, mapping] of Object.entries(languageMapping)) {
    if (nameLower.includes(key)) {
      return mapping;
    }
  }
  
  return null;
}

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  // Geen API key = gebruik fallback
  if (!apiKey) {
    console.log('No ELEVENLABS_API_KEY, using fallback voices');
    return NextResponse.json(fallbackVoices);
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
    });

    if (!response.ok) {
      console.error('ElevenLabs API returned:', response.status);
      return NextResponse.json(fallbackVoices);
    }

    const data = await response.json();
    
    if (!data.voices || !Array.isArray(data.voices)) {
      console.error('Invalid response from ElevenLabs');
      return NextResponse.json(fallbackVoices);
    }

    // Categoriseer alle stemmen per taal
    const voicesByLang: Record<string, VoiceResponse[]> = {
      NL: [],
      FR: [],
      DE: [],
      EN: [],
    };

    for (const voice of data.voices as ElevenLabsVoice[]) {
      // Probeer taal te detecteren
      const langInfo = detectLanguage(voice);
      
      // Als we een taal detecteren, voeg toe aan die categorie
      if (langInfo && voicesByLang[langInfo.code]) {
        voicesByLang[langInfo.code].push({
          voice_id: voice.voice_id,
          name: voice.name,
          preview_url: voice.preview_url || null,
          labels: {
            gender: voice.labels?.gender || 'unknown',
            language: langInfo.code,
            accent: langInfo.accent,
          },
        });
      }
    }

    // Als we geen stemmen vonden met taaldetectie, neem de eerste 16 stemmen
    // en verdeel ze over de 4 talen (4 per taal)
    const totalFound = Object.values(voicesByLang).reduce((sum, arr) => sum + arr.length, 0);
    
    if (totalFound === 0) {
      console.log('No language-specific voices found, using all available voices');
      
      // Neem alle stemmen en verdeel ze
      const allVoices = (data.voices as ElevenLabsVoice[]).slice(0, 16);
      const languages = ['NL', 'FR', 'DE', 'EN'];
      const accents = ['Nederlands', 'Frans', 'Duits', 'Engels'];
      
      allVoices.forEach((voice, index) => {
        const langIndex = index % 4;
        voicesByLang[languages[langIndex]].push({
          voice_id: voice.voice_id,
          name: voice.name,
          preview_url: voice.preview_url || null,
          labels: {
            gender: voice.labels?.gender || 'unknown',
            language: languages[langIndex],
            accent: accents[langIndex],
          },
        });
      });
    }

    // Limiteer tot 4 stemmen per taal
    const result: VoiceResponse[] = [];
    for (const lang of ['NL', 'FR', 'DE', 'EN']) {
      result.push(...voicesByLang[lang].slice(0, 4));
    }

    // Als we nog steeds geen stemmen hebben, gebruik fallback
    if (result.length === 0) {
      console.log('No voices found, using fallback');
      return NextResponse.json(fallbackVoices);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    return NextResponse.json(fallbackVoices);
  }
}
