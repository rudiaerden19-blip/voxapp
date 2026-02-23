// Deepgram realtime STT. Dutch. Nova-2. WebSocket.

const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');

function createStream({ onTranscript, onUtteranceEnd, onError }) {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

  const conn = deepgram.listen.live({
    language: 'nl',
    model: 'nova-2',
    encoding: 'mulaw',
    sample_rate: 8000,
    channels: 1,
    punctuate: true,
    interim_results: true,
    utterance_end_ms: 800,
    vad_events: true,
    smart_format: true,
    numerals: true,
    endpointing: 200,
  });

  conn.on(LiveTranscriptionEvents.Open, () => {
    console.log(JSON.stringify({ _tag: 'STT', event: 'connected' }));
  });

  conn.on(LiveTranscriptionEvents.Transcript, (data) => {
    const transcript = data.channel?.alternatives?.[0]?.transcript?.trim();
    if (!transcript) return;

    const confidence = data.channel?.alternatives?.[0]?.confidence || 0;
    onTranscript(transcript, data.is_final, confidence);
  });

  conn.on(LiveTranscriptionEvents.UtteranceEnd, () => {
    onUtteranceEnd();
  });

  conn.on(LiveTranscriptionEvents.Error, (err) => {
    console.log(JSON.stringify({ _tag: 'STT', event: 'error', error: err.message }));
    if (onError) onError(err);
  });

  conn.on(LiveTranscriptionEvents.Close, () => {
    console.log(JSON.stringify({ _tag: 'STT', event: 'closed' }));
  });

  return conn;
}

module.exports = { createStream };
