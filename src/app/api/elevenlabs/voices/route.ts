import { NextResponse } from 'next/server';

// 16 gecureerde ElevenLabs stemmen in 4 talen
// voice_id → taal mapping voor filtering
const voiceLanguageMap: Record<string, { language: string; accent: string }> = {
  // NEDERLANDS
  'pFZP5JQG7iQjIQuC4Bku': { language: 'NL', accent: 'Nederlands' }, // Lily
  'XB0fDUnXU5powFXDhCwa': { language: 'NL', accent: 'Nederlands' }, // Charlotte
  'onwK4e9ZLuTAKqWW03F9': { language: 'NL', accent: 'Nederlands' }, // Daniel
  'TX3LPaxmHKxFdv7VOQHJ': { language: 'NL', accent: 'Nederlands' }, // Liam
  // FRANS
  'XrExE9yKIg1WjnnlVkGX': { language: 'FR', accent: 'Frans' }, // Matilda
  'EXAVITQu4vr4xnSDxMaL': { language: 'FR', accent: 'Frans' }, // Sarah
  'CYw3kZ02Hs0563khs1Fj': { language: 'FR', accent: 'Frans' }, // Dave
  'N2lVS1w4EtoT3dr4eOWO': { language: 'FR', accent: 'Frans' }, // Callum
  // DUITS
  'ThT5KcBeYPX3keUQqHPh': { language: 'DE', accent: 'Duits' }, // Dorothy
  'AZnzlk1XvdvUeBnXmlld': { language: 'DE', accent: 'Duits' }, // Domi
  'VR6AewLTigWG4xSOukaG': { language: 'DE', accent: 'Duits' }, // Arnold
  'pNInz6obpgDQGcFmaJgB': { language: 'DE', accent: 'Duits' }, // Adam
  // ENGELS
  '21m00Tcm4TlvDq8ikWAM': { language: 'EN', accent: 'Engels' }, // Rachel
  'jBpfuIE2acCO8z3wKNLl': { language: 'EN', accent: 'Engels' }, // Gigi
  'TxGEqnHWrfWFTfGW9XjX': { language: 'EN', accent: 'Engels' }, // Josh
  'ErXwobaYiN019PkySvjV': { language: 'EN', accent: 'Engels' }, // Antoni
};

const curatedVoiceIds = Object.keys(voiceLanguageMap);

// GET - Fetch real preview URLs from ElevenLabs, but only return our curated 16 voices
export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      // Return fallback without preview URLs
      return NextResponse.json(curatedVoiceIds.map(voice_id => ({
        voice_id,
        name: getVoiceName(voice_id),
        labels: {
          gender: getVoiceGender(voice_id),
          ...voiceLanguageMap[voice_id],
        },
        preview_url: null,
      })));
    }

    // Fetch all voices from ElevenLabs to get real preview URLs
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('ElevenLabs API error:', response.status);
      return NextResponse.json(curatedVoiceIds.map(voice_id => ({
        voice_id,
        name: getVoiceName(voice_id),
        labels: {
          gender: getVoiceGender(voice_id),
          ...voiceLanguageMap[voice_id],
        },
        preview_url: null,
      })));
    }

    const data = await response.json();
    
    // Create a map of voice_id → voice data from ElevenLabs
    const elevenLabsVoices = new Map<string, { name: string; preview_url: string; labels: Record<string, string> }>();
    for (const v of data.voices) {
      elevenLabsVoices.set(v.voice_id, {
        name: v.name,
        preview_url: v.preview_url,
        labels: v.labels || {},
      });
    }

    // Build our curated list with real preview URLs
    const voices = curatedVoiceIds.map(voice_id => {
      const elevenVoice = elevenLabsVoices.get(voice_id);
      const langInfo = voiceLanguageMap[voice_id];
      
      return {
        voice_id,
        name: elevenVoice?.name || getVoiceName(voice_id),
        labels: {
          gender: elevenVoice?.labels?.gender || getVoiceGender(voice_id),
          language: langInfo.language,
          accent: langInfo.accent,
        },
        preview_url: elevenVoice?.preview_url || null,
      };
    });

    return NextResponse.json(voices);
  } catch (error) {
    console.error('Voices API error:', error);
    return NextResponse.json(curatedVoiceIds.map(voice_id => ({
      voice_id,
      name: getVoiceName(voice_id),
      labels: {
        gender: getVoiceGender(voice_id),
        ...voiceLanguageMap[voice_id],
      },
      preview_url: null,
    })));
  }
}

// Helper functions for fallback
function getVoiceName(voice_id: string): string {
  const names: Record<string, string> = {
    'pFZP5JQG7iQjIQuC4Bku': 'Lily',
    'XB0fDUnXU5powFXDhCwa': 'Charlotte',
    'onwK4e9ZLuTAKqWW03F9': 'Daniel',
    'TX3LPaxmHKxFdv7VOQHJ': 'Liam',
    'XrExE9yKIg1WjnnlVkGX': 'Matilda',
    'EXAVITQu4vr4xnSDxMaL': 'Sarah',
    'CYw3kZ02Hs0563khs1Fj': 'Dave',
    'N2lVS1w4EtoT3dr4eOWO': 'Callum',
    'ThT5KcBeYPX3keUQqHPh': 'Dorothy',
    'AZnzlk1XvdvUeBnXmlld': 'Domi',
    'VR6AewLTigWG4xSOukaG': 'Arnold',
    'pNInz6obpgDQGcFmaJgB': 'Adam',
    '21m00Tcm4TlvDq8ikWAM': 'Rachel',
    'jBpfuIE2acCO8z3wKNLl': 'Gigi',
    'TxGEqnHWrfWFTfGW9XjX': 'Josh',
    'ErXwobaYiN019PkySvjV': 'Antoni',
  };
  return names[voice_id] || 'Unknown';
}

function getVoiceGender(voice_id: string): string {
  const females = ['pFZP5JQG7iQjIQuC4Bku', 'XB0fDUnXU5powFXDhCwa', 'XrExE9yKIg1WjnnlVkGX', 'EXAVITQu4vr4xnSDxMaL', 'ThT5KcBeYPX3keUQqHPh', 'AZnzlk1XvdvUeBnXmlld', '21m00Tcm4TlvDq8ikWAM', 'jBpfuIE2acCO8z3wKNLl'];
  return females.includes(voice_id) ? 'female' : 'male';
}
