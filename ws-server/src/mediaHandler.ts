/**
 * Verwerkt 1 Telnyx MediaStream WebSocket verbinding.
 * Audio in → Google STT → State machine → ElevenLabs audio URL → Telnyx play
 */

import { WebSocket } from 'ws';
import { createSttStream } from './googleStt';
import { textToAudioUrl } from './ttsCache';
import { createSession, processUserInput, getSession } from './sessionManager';

const TELNYX_API = 'https://api.telnyx.com/v2';

async function telnyxPlay(callControlId: string, audioUrl: string): Promise<void> {
  const url = `${TELNYX_API}/calls/${encodeURIComponent(callControlId)}/actions/play_audio`;
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ audio_url: audioUrl, loop: 1 }),
  });
}

async function telnyxHangup(callControlId: string): Promise<void> {
  await fetch(`${TELNYX_API}/calls/${encodeURIComponent(callControlId)}/actions/hangup`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
}

export function handleMediaStream(
  ws: WebSocket,
  callControlId: string,
  businessId: string
): void {
  let sttStream: ReturnType<typeof createSttStream> | null = null;
  let sessionReady = false;

  // Maak sessie aan en stuur begroeting
  createSession(callControlId, businessId)
    .then(async (session) => {
      sessionReady = true;
      const audioUrl = await textToAudioUrl(session.greetingText);
      await telnyxPlay(callControlId, audioUrl);
      console.log(`[handler] begroeting gespeeld: ${callControlId.slice(0, 20)}`);
    })
    .catch((err) => console.error('[handler] sessie aanmaken fout:', err));

  // Start Google STT stream
  sttStream = createSttStream({
    onTranscript: async (transcript, isFinal) => {
      if (!isFinal || !sessionReady) return;
      console.log(`[handler] transcript: "${transcript}"`);

      const result = await processUserInput(callControlId, transcript);
      if (!result) return;

      const audioUrl = await textToAudioUrl(result.response);
      await telnyxPlay(callControlId, audioUrl);

      if (result.endCall) {
        // Wacht tot audio klaar is dan hangup
        setTimeout(() => telnyxHangup(callControlId), 5000);
      }
    },
    onError: (err) => {
      console.error('[handler] STT fout:', err.message);
    },
  });

  // Verwerk binnenkomende WebSocket berichten van Telnyx
  ws.on('message', (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.event === 'media' && msg.media?.payload) {
        // Telnyx stuurt audio als base64 encoded L16
        const audioBuffer = Buffer.from(msg.media.payload, 'base64');
        sttStream?.write(audioBuffer);
      } else if (msg.event === 'stop') {
        sttStream?.stop();
      }
    } catch {
      // Negeer parse fouten
    }
  });

  ws.on('close', () => {
    sttStream?.stop();
    sttStream = null;
  });
}
