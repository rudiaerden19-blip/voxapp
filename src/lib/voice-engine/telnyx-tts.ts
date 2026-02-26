/**
 * ElevenLabs TTS → Supabase Storage → publieke URL voor Telnyx play_audio.
 *
 * Caching: elke unieke tekst wordt 1x gegenereerd en opgeslagen.
 * Telnyx speelt de audio af via de publieke Supabase Storage URL.
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'ANHrhmaFeVN0QJaa0PhL'; // Anja
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const STORAGE_BUCKET = 'voice-audio';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function cacheKey(text: string): string {
  const hash = crypto.createHash('md5').update(text).digest('hex').slice(0, 16);
  return `tts/${hash}.mp3`;
}

/**
 * Converteert tekst naar audio-URL (ElevenLabs → Supabase Storage).
 * Resultaat wordt gecached — dezelfde tekst = dezelfde URL.
 */
export async function textToAudioUrl(text: string): Promise<string> {
  const supabase = getSupabase();
  const key = cacheKey(text);

  // Check of al gecached
  const { data: existing } = await supabase.storage.from(STORAGE_BUCKET).list('tts', {
    search: key.replace('tts/', ''),
    limit: 1,
  });

  if (existing && existing.length > 0) {
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(key);
    console.log('[tts] cache hit:', text.slice(0, 40));
    return data.publicUrl;
  }

  // Genereer via ElevenLabs
  console.log('[tts] generating:', text.slice(0, 60));
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs TTS error ${response.status}: ${err}`);
  }

  const audioBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(key, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload error: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(key);
  console.log('[tts] uploaded:', key);
  return data.publicUrl;
}

/**
 * Pre-genereert alle vaste zinnen voor een business zodat eerste call snel is.
 */
export async function warmupAudioCache(businessName: string): Promise<void> {
  const { TEMPLATES } = await import('./templates');
  const phrases = [
    TEMPLATES.greeting(businessName),
    TEMPLATES.confirmMore(),
    TEMPLATES.pickupOrDelivery(),
    TEMPLATES.getName(),
    TEMPLATES.notUnderstood(),
    TEMPLATES.itemNotFound(),
  ];

  await Promise.allSettled(phrases.map(p => textToAudioUrl(p)));
  console.log('[tts] warmup complete voor:', businessName);
}
