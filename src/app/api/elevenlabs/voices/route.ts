import { NextResponse } from 'next/server';

// Sample texts per language
export const sampleTexts: Record<string, string> = {
  NL: 'Goedendag, welkom. Waarmee kan ik u helpen vandaag?',
  FR: 'Bonjour et bienvenue. Comment puis-je vous aider aujourd\'hui?',
  DE: 'Guten Tag und herzlich willkommen. Wie kann ich Ihnen heute helfen?',
  EN: 'Good day and welcome. How may I help you today?',
};

// Curated multilingual voices for NL/FR/DE/EN
const multilingualVoices = [
  // Nederlands / Belgisch
  { voice_id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', labels: { accent: 'Nederlands', gender: 'female', language: 'NL' } },
  { voice_id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', labels: { accent: 'Nederlands', gender: 'female', language: 'NL' } },
  { voice_id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', labels: { accent: 'Nederlands', gender: 'male', language: 'NL' } },
  { voice_id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', labels: { accent: 'Nederlands', gender: 'male', language: 'NL' } },
  
  // Frans / Belgisch Frans
  { voice_id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', labels: { accent: 'Frans', gender: 'female', language: 'FR' } },
  { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', labels: { accent: 'Frans', gender: 'female', language: 'FR' } },
  { voice_id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', labels: { accent: 'Frans', gender: 'male', language: 'FR' } },
  { voice_id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', labels: { accent: 'Frans', gender: 'male', language: 'FR' } },
  
  // Duits
  { voice_id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', labels: { accent: 'Duits', gender: 'female', language: 'DE' } },
  { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', labels: { accent: 'Duits', gender: 'female', language: 'DE' } },
  { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', labels: { accent: 'Duits', gender: 'male', language: 'DE' } },
  { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', labels: { accent: 'Duits', gender: 'male', language: 'DE' } },
  
  // Engels
  { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', labels: { accent: 'Engels (US)', gender: 'female', language: 'EN' } },
  { voice_id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', labels: { accent: 'Engels (UK)', gender: 'male', language: 'EN' } },
  { voice_id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', labels: { accent: 'Engels (UK)', gender: 'male', language: 'EN' } },
  { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', labels: { accent: 'Engels (US)', gender: 'male', language: 'EN' } },
];

// GET - Fetch ElevenLabs voices
export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    // Always return curated multilingual voices
    // These work with eleven_multilingual_v2 model for all languages
    return NextResponse.json(multilingualVoices);
    
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    return NextResponse.json(multilingualVoices);
  }
}
