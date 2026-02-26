/**
 * ElevenLabs TTS met Supabase Storage caching
 * Vaste zinnen worden 1x gegenereerd en gecached — 0ms latency bij herhaling
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'ANHrhmaFeVN0QJaa0PhL';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const BUCKET = 'voice-audio';

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function cacheKey(text: string): string {
  const hash = crypto.createHash('md5').update(text).digest('hex').slice(0, 16);
  return `tts/${hash}.mp3`;
}

export async function textToAudioUrl(text: string): Promise<string> {
  const sb = supabase();
  const key = cacheKey(text);

  // Check cache
  const { data: files } = await sb.storage.from(BUCKET).list('tts', {
    search: key.replace('tts/', ''),
    limit: 1,
  });

  if (files && files.length > 0) {
    const { data } = sb.storage.from(BUCKET).getPublicUrl(key);
    console.log('[tts] cache hit:', text.slice(0, 40));
    return data.publicUrl;
  }

  // Genereer via ElevenLabs
  console.log('[tts] genereren:', text.slice(0, 60));
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs ${response.status}: ${await response.text()}`);
  }

  const buffer = await response.arrayBuffer();
  await sb.storage.from(BUCKET).upload(key, buffer, {
    contentType: 'audio/mpeg',
    upsert: true,
  });

  const { data } = sb.storage.from(BUCKET).getPublicUrl(key);
  console.log('[tts] gecached:', key);
  return data.publicUrl;
}

// Pre-genereer alle vaste zinnen bij opstart — 0ms latency tijdens calls
export async function warmupCache(businessName: string): Promise<void> {
  const zinnen = [
    `Goeiedag! ${businessName}, wat mag het zijn?`,
    'En nog iets daarbij?',
    'Is dat afhalen of wil je dat laten leveren?',
    'Op welke naam mag ik dat zetten?',
    'Excuseer, ik heb dat niet goed gehoord. Kunt u dat herhalen?',
    'Dat heb ik niet gevonden in ons aanbod. Wat wenst u precies?',
  ];

  await Promise.allSettled(zinnen.map(z => textToAudioUrl(z)));
  console.log('[tts] warmup klaar voor:', businessName);
}
