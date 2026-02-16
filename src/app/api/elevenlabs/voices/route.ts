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

// Detecteer taal op basis van naam en labels
function detectLanguage(voice: ElevenLabsVoice): string | null {
  const name = voice.name.toLowerCase();
  const labels = voice.labels || {};
  const allText = `${name} ${Object.values(labels).join(' ')}`.toLowerCase();
  
  // Nederlands/Vlaams
  if (allText.includes('dutch') || allText.includes('flemish') || allText.includes('vlaams') || 
      allText.includes('belgian') || allText.includes('nederland') || allText.includes('nl-') ||
      name.includes('diederik') || name.includes('schevenels') || name.includes('vlaamse') ||
      name.includes('roos') || name.includes('jerry') || name.includes('dynamische')) {
    return 'NL';
  }
  
  // Frans
  if (allText.includes('french') || allText.includes('français') || allText.includes('france') ||
      allText.includes('fr-') || allText.includes('parisian')) {
    return 'FR';
  }
  
  // Duits
  if (allText.includes('german') || allText.includes('deutsch') || allText.includes('germany') ||
      allText.includes('de-') || allText.includes('austrian')) {
    return 'DE';
  }
  
  // Engels
  if (allText.includes('english') || allText.includes('british') || allText.includes('american') ||
      allText.includes('australian') || allText.includes('en-') || allText.includes('uk') ||
      allText.includes('us accent')) {
    return 'EN';
  }
  
  // Multilingual stemmen tellen als NL (ze ondersteunen alles)
  if (allText.includes('multilingual') || allText.includes('multi-lingual')) {
    return 'NL';
  }
  
  return null;
}

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.error('ELEVENLABS_API_KEY not configured');
    return NextResponse.json({ error: 'API key niet geconfigureerd' }, { status: 500 });
  }

  try {
    // Haal zowel eigen voices als shared library voices op
    const [ownResponse, sharedResponse] = await Promise.all([
      fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': apiKey },
      }),
      // Shared library - zoek naar Dutch, French, German voices
      fetch('https://api.elevenlabs.io/v1/shared-voices?page_size=50&language=nl,fr,de', {
        headers: { 'xi-api-key': apiKey },
      }).catch(() => null), // Don't fail if shared voices fail
    ]);

    if (!ownResponse.ok) {
      console.error('ElevenLabs API returned:', ownResponse.status);
      return NextResponse.json({ error: 'Kon stemmen niet ophalen' }, { status: 502 });
    }

    const ownData = await ownResponse.json();
    let sharedVoices: ElevenLabsVoice[] = [];
    
    if (sharedResponse?.ok) {
      const sharedData = await sharedResponse.json();
      if (sharedData.voices && Array.isArray(sharedData.voices)) {
        sharedVoices = sharedData.voices;
      }
    }
    
    // Combineer eigen en shared voices
    const allVoices = [...(ownData.voices || []), ...sharedVoices];
    
    if (!allVoices.length) {
      console.error('No voices found');
      return NextResponse.json({ error: 'Geen stemmen gevonden' }, { status: 404 });
    }
    
    const data = { voices: allVoices };

    // Categoriseer stemmen per taal
    const voicesByLang: Record<string, VoiceResponse[]> = {
      NL: [],
      FR: [],
      DE: [],
      EN: [],
    };

    for (const voice of data.voices as ElevenLabsVoice[]) {
      const lang = detectLanguage(voice);
      
      if (lang && voicesByLang[lang]) {
        const labels = voice.labels || {};
        
        // Gender naar Nederlands
        let gender = 'Onbekend';
        const genderLower = (labels.gender || '').toLowerCase();
        if (genderLower === 'female') gender = 'Vrouw';
        else if (genderLower === 'male') gender = 'Man';
        
        // Accent
        let accent = labels.accent || labels.description || '';
        if (lang === 'NL') accent = 'Vlaams/Nederlands';
        else if (lang === 'FR') accent = 'Frans';
        else if (lang === 'DE') accent = 'Duits';
        else if (lang === 'EN') accent = 'Engels';
        
        voicesByLang[lang].push({
          voice_id: voice.voice_id,
          name: voice.name,
          preview_url: voice.preview_url || null,
          labels: {
            gender,
            language: lang,
            accent,
          },
        });
      }
    }

    // Voeg fallback stemmen toe als categorieën leeg zijn
    // Deze ElevenLabs stemmen zijn multilingual en werken voor alle talen
    if (voicesByLang.FR.length === 0) {
      // Gebruik multilingual stemmen die Frans kunnen spreken
      const multilingualForFrench = [
        { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'Vrouw' },
        { voice_id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'Vrouw' },
        { voice_id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'Man' },
        { voice_id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'Man' },
      ];
      for (const v of multilingualForFrench) {
        voicesByLang.FR.push({
          voice_id: v.voice_id,
          name: v.name + ' (Multilingual)',
          preview_url: null,
          labels: { gender: v.gender, language: 'FR', accent: 'Frans' },
        });
      }
    }
    
    if (voicesByLang.DE.length === 0) {
      // Gebruik multilingual stemmen die Duits kunnen spreken
      const multilingualForGerman = [
        { voice_id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', gender: 'Vrouw' },
        { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'Vrouw' },
        { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'Man' },
        { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'Man' },
      ];
      for (const v of multilingualForGerman) {
        voicesByLang.DE.push({
          voice_id: v.voice_id,
          name: v.name + ' (Multilingual)',
          preview_url: null,
          labels: { gender: v.gender, language: 'DE', accent: 'Duits' },
        });
      }
    }

    // Log wat we gevonden hebben
    console.log('Voices found:', {
      NL: voicesByLang.NL.length,
      FR: voicesByLang.FR.length,
      DE: voicesByLang.DE.length,
      EN: voicesByLang.EN.length,
    });

    // Combineer alle stemmen, gesorteerd per taal
    const result: VoiceResponse[] = [
      ...voicesByLang.NL,
      ...voicesByLang.FR,
      ...voicesByLang.DE,
      ...voicesByLang.EN.slice(0, 8), // Limiteer Engels tot 8
    ];

    if (result.length === 0) {
      return NextResponse.json({ error: 'Geen stemmen gevonden' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    return NextResponse.json({ error: 'Fout bij ophalen stemmen' }, { status: 500 });
  }
}
