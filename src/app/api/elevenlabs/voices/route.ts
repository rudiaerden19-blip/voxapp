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
  priority?: number;
  labels: {
    gender: string;
    language: string;
    accent: string;
  };
}

// Mapping van ElevenLabs language labels naar onze taalcodes
// PRIORITEIT: Belgisch/Vlaams eerst, dan pas Nederlands
const languageMapping: Record<string, { code: string; accent: string; priority: number }> = {
  // Belgisch/Vlaams - HOOGSTE PRIORITEIT
  'flemish': { code: 'NL', accent: 'Belgisch', priority: 1 },
  'belgian': { code: 'NL', accent: 'Belgisch', priority: 1 },
  'belgium': { code: 'NL', accent: 'Belgisch', priority: 1 },
  'vlaams': { code: 'NL', accent: 'Belgisch', priority: 1 },
  'be-nl': { code: 'NL', accent: 'Belgisch', priority: 1 },
  // Nederlands - lagere prioriteit
  'dutch': { code: 'NL', accent: 'Nederlands', priority: 2 },
  'nl': { code: 'NL', accent: 'Nederlands', priority: 2 },
  'netherlands': { code: 'NL', accent: 'Nederlands', priority: 2 },
  'nl-nl': { code: 'NL', accent: 'Nederlands', priority: 2 },
  // Frans - Belgisch Frans eerst
  'belgian french': { code: 'FR', accent: 'Belgisch Frans', priority: 1 },
  'be-fr': { code: 'FR', accent: 'Belgisch Frans', priority: 1 },
  'french': { code: 'FR', accent: 'Frans', priority: 2 },
  'fr': { code: 'FR', accent: 'Frans', priority: 2 },
  'france': { code: 'FR', accent: 'Frans', priority: 2 },
  // Duits
  'german': { code: 'DE', accent: 'Duits', priority: 2 },
  'de': { code: 'DE', accent: 'Duits', priority: 2 },
  'germany': { code: 'DE', accent: 'Duits', priority: 2 },
  // Engels
  'english': { code: 'EN', accent: 'Engels', priority: 2 },
  'en': { code: 'EN', accent: 'Engels', priority: 2 },
  'british': { code: 'EN', accent: 'Engels', priority: 2 },
  'american': { code: 'EN', accent: 'Engels', priority: 2 },
  'en-us': { code: 'EN', accent: 'Engels', priority: 2 },
  'en-gb': { code: 'EN', accent: 'Engels', priority: 2 },
  'en-au': { code: 'EN', accent: 'Engels', priority: 2 },
};

// Fallback stemmen als API faalt - Belgische stemmen
const fallbackVoices: VoiceResponse[] = [
  // Belgisch/Vlaams
  { voice_id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', preview_url: null, labels: { gender: 'Vrouw', language: 'NL', accent: 'Belgisch' } },
  { voice_id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', preview_url: null, labels: { gender: 'Vrouw', language: 'NL', accent: 'Belgisch' } },
  { voice_id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', preview_url: null, labels: { gender: 'Man', language: 'NL', accent: 'Belgisch' } },
  { voice_id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', preview_url: null, labels: { gender: 'Man', language: 'NL', accent: 'Belgisch' } },
  // Frans
  { voice_id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', preview_url: null, labels: { gender: 'Vrouw', language: 'FR', accent: 'Frans' } },
  { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', preview_url: null, labels: { gender: 'Vrouw', language: 'FR', accent: 'Frans' } },
  { voice_id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', preview_url: null, labels: { gender: 'Man', language: 'FR', accent: 'Frans' } },
  { voice_id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', preview_url: null, labels: { gender: 'Man', language: 'FR', accent: 'Frans' } },
  // Duits
  { voice_id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', preview_url: null, labels: { gender: 'Vrouw', language: 'DE', accent: 'Duits' } },
  { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', preview_url: null, labels: { gender: 'Vrouw', language: 'DE', accent: 'Duits' } },
  { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', preview_url: null, labels: { gender: 'Man', language: 'DE', accent: 'Duits' } },
  { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', preview_url: null, labels: { gender: 'Man', language: 'DE', accent: 'Duits' } },
  // Engels
  { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', preview_url: null, labels: { gender: 'Vrouw', language: 'EN', accent: 'Engels' } },
  { voice_id: 'jBpfuIE2acCO8z3wKNLl', name: 'Gigi', preview_url: null, labels: { gender: 'Vrouw', language: 'EN', accent: 'Engels' } },
  { voice_id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', preview_url: null, labels: { gender: 'Man', language: 'EN', accent: 'Engels' } },
  { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', preview_url: null, labels: { gender: 'Man', language: 'EN', accent: 'Engels' } },
];

// Detecteer taal uit voice labels - prioriteit voor Belgisch/Vlaams
function detectLanguage(voice: ElevenLabsVoice): { code: string; accent: string; priority: number } | null {
  const labels = voice.labels || {};
  
  // Check alle label velden voor taalinformatie
  const fieldsToCheck = ['language', 'accent', 'locale', 'description'];
  
  // Eerst zoeken naar Belgisch/Vlaams (hoogste prioriteit)
  for (const field of fieldsToCheck) {
    const value = labels[field]?.toLowerCase();
    if (value) {
      // Check specifiek voor Belgisch/Vlaams eerst
      if (value.includes('flemish') || value.includes('belgian') || value.includes('belgium') || value.includes('vlaams') || value.includes('be-nl')) {
        return { code: 'NL', accent: 'Belgisch', priority: 1 };
      }
    }
  }
  
  // Dan andere talen
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
  if (nameLower.includes('flemish') || nameLower.includes('belgian') || nameLower.includes('vlaams')) {
    return { code: 'NL', accent: 'Belgisch', priority: 1 };
  }
  
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
        // Map gender to Dutch
        let genderNL = 'Onbekend';
        const genderLower = (voice.labels?.gender || '').toLowerCase();
        if (genderLower === 'female' || genderLower === 'vrouw') genderNL = 'Vrouw';
        else if (genderLower === 'male' || genderLower === 'man') genderNL = 'Man';
        
        voicesByLang[langInfo.code].push({
          voice_id: voice.voice_id,
          name: voice.name,
          preview_url: voice.preview_url || null,
          priority: langInfo.priority,
          labels: {
            gender: genderNL,
            language: langInfo.code,
            accent: langInfo.accent,
          },
        });
      }
    }
    
    // Sorteer elke taal op prioriteit (Belgisch eerst)
    for (const lang of Object.keys(voicesByLang)) {
      voicesByLang[lang].sort((a, b) => (a.priority || 99) - (b.priority || 99));
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

    // Limiteer tot 4 stemmen per taal, vul aan met fallback indien nodig
    const result: VoiceResponse[] = [];
    for (const lang of ['NL', 'FR', 'DE', 'EN']) {
      const langVoices = voicesByLang[lang].slice(0, 4);
      
      // Als een taal leeg is, gebruik fallback stemmen voor die taal
      if (langVoices.length === 0) {
        const fallbackForLang = fallbackVoices.filter(v => v.labels.language === lang);
        result.push(...fallbackForLang);
      } else {
        result.push(...langVoices);
      }
    }

    // Als we nog steeds geen stemmen hebben, gebruik alle fallbacks
    if (result.length === 0) {
      console.log('No voices found, using all fallback voices');
      return NextResponse.json(fallbackVoices);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    return NextResponse.json(fallbackVoices);
  }
}
