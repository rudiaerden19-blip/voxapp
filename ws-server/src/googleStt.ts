/**
 * Google Cloud Speech-to-Text streaming — nl-BE (Belgisch Nederlands)
 * Ontvangt audio chunks van Telnyx MediaStream (L16, 16kHz)
 * Geeft real-time transcript terug via callback
 */

import speech from '@google-cloud/speech';

const client = new speech.SpeechClient({
  apiKey: process.env.GOOGLE_SPEECH_API_KEY,
});

export interface SttCallbacks {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onError: (err: Error) => void;
}

export function createSttStream(callbacks: SttCallbacks) {
  const recognizeStream = client.streamingRecognize({
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'nl-BE',
      model: 'phone_call',
      useEnhanced: true,
      enableAutomaticPunctuation: false,
      metadata: {
        interactionType: 'PHONE_CALL',
        microphoneDistance: 'NEARFIELD',
        originalMediaType: 'AUDIO',
        recordingDeviceType: 'PHONE_LINE',
      },
    },
    interimResults: false, // Alleen finale resultaten voor deterministisch gedrag
  });

  recognizeStream.on('data', (data) => {
    const result = data.results?.[0];
    if (!result) return;
    const transcript = result.alternatives?.[0]?.transcript ?? '';
    const isFinal = result.isFinal ?? false;
    if (transcript) {
      callbacks.onTranscript(transcript, isFinal);
    }
  });

  recognizeStream.on('error', (err) => {
    console.error('[stt] fout:', err.message);
    callbacks.onError(err);
  });

  recognizeStream.on('end', () => {
    console.log('[stt] stream gestopt');
  });

  return {
    write: (audioChunk: Buffer) => {
      if (!recognizeStream.destroyed) {
        recognizeStream.write(audioChunk);
      }
    },
    stop: () => {
      if (!recognizeStream.destroyed) {
        recognizeStream.end();
      }
    },
  };
}
