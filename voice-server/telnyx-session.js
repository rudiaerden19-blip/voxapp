const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const VERCEL_API_URL = process.env.VERCEL_API_URL;
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 8080}`;

const activeSessions = new Map();
const audioStore = new Map();

class TelnyxSession {
  constructor(ws, params) {
    this.ws = ws;
    this.callControlId = params.call_control_id || null;
    this.businessId = params.business_id || null;
    this.callerId = params.caller_id || null;
    this.conversationId = `telnyx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.sessionId = `ts_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.deepgramConn = null;
    this.utteranceBuffer = '';
    this.processing = false;

    this.log('Session created', { callControlId: this.callControlId, businessId: this.businessId });
  }

  static activeSessions() { return activeSessions.size; }
  static getAudio(id) { return audioStore.get(id); }

  log(msg, data) {
    const entry = { ts: new Date().toISOString(), session: this.sessionId, msg };
    if (data) entry.data = data;
    console.log(JSON.stringify(entry));
  }

  start() {
    activeSessions.set(this.sessionId, this);

    this.ws.on('message', (raw) => {
      try { this.handleMessage(JSON.parse(raw)); }
      catch (err) { this.log('Parse error', { error: err.message }); }
    });
    this.ws.on('close', () => { this.log('WS closed'); this.cleanup(); });
    this.ws.on('error', (err) => { this.log('WS error', { error: err.message }); this.cleanup(); });

    this.startDeepgram();
    this.sendGreeting();
  }

  handleMessage(msg) {
    switch (msg.event) {
      case 'connected':
        this.log('Telnyx stream connected');
        break;
      case 'start':
        if (msg.start?.call_control_id) this.callControlId = msg.start.call_control_id;
        this.log('Stream started', { callControlId: this.callControlId });
        break;
      case 'media':
        if (this.deepgramConn && msg.media?.payload) {
          this.deepgramConn.send(Buffer.from(msg.media.payload, 'base64'));
        }
        break;
      case 'stop':
        this.log('Stream stopped');
        this.cleanup();
        break;
    }
  }

  startDeepgram() {
    const deepgram = createClient(DEEPGRAM_API_KEY);
    this.deepgramConn = deepgram.listen.live({
      language: 'nl', model: 'nova-2', encoding: 'mulaw',
      sample_rate: 8000, channels: 1, punctuate: true,
      interim_results: true, utterance_end_ms: 800,
      vad_events: true, smart_format: true, endpointing: 200,
    });

    this.deepgramConn.on(LiveTranscriptionEvents.Open, () => this.log('Deepgram connected'));

    this.deepgramConn.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel?.alternatives?.[0]?.transcript?.trim();
      if (!transcript) return;
      if (data.is_final) {
        this.utteranceBuffer += (this.utteranceBuffer ? ' ' : '') + transcript;
        this.log('STT final', { text: transcript, buffer: this.utteranceBuffer });
      }
    });

    this.deepgramConn.on(LiveTranscriptionEvents.UtteranceEnd, () => {
      if (this.utteranceBuffer && !this.processing) {
        this.log('Utterance complete', { text: this.utteranceBuffer });
        this.processUtterance(this.utteranceBuffer);
        this.utteranceBuffer = '';
      }
    });

    this.deepgramConn.on(LiveTranscriptionEvents.Error, (err) => this.log('Deepgram error', { error: err.message }));
    this.deepgramConn.on(LiveTranscriptionEvents.Close, () => this.log('Deepgram closed'));
  }

  async sendGreeting() {
    await this.processAndSpeak('__greeting__');
  }

  async processUtterance(text) {
    this.processing = true;
    await this.processAndSpeak(text);
    this.processing = false;
  }

  async processAndSpeak(transcript) {
    const t0 = Date.now();

    // Step 1: Get response text from business logic
    let responseText;
    try {
      const res = await fetch(`${VERCEL_API_URL}/api/voice-engine/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: this.businessId,
          transcript,
          conversation_id: this.conversationId,
          caller_id: this.callerId,
        }),
      });
      if (!res.ok) {
        this.log('Business logic error', { status: res.status });
        return;
      }
      const data = await res.json();
      responseText = data.response;
    } catch (err) {
      this.log('Business logic fetch error', { error: err.message });
      return;
    }

    if (!responseText) return;
    this.log('Got response', { ms: Date.now() - t0, text: responseText.slice(0, 80) });

    // Step 2: Generate ElevenLabs TTS → MP3
    let audioBuffer;
    try {
      const ttsRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}?output_format=mp3_44100_64`,
        {
          method: 'POST',
          headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: responseText,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: { stability: 0.5, similarity_boost: 0.8 },
          }),
        }
      );
      if (!ttsRes.ok) {
        this.log('ElevenLabs TTS error', { status: ttsRes.status });
        return;
      }
      audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
    } catch (err) {
      this.log('TTS fetch error', { error: err.message });
      return;
    }

    this.log('TTS generated', { ms: Date.now() - t0, bytes: audioBuffer.length });

    // Step 3: Store audio and get URL
    const audioId = `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    audioStore.set(audioId, audioBuffer);
    setTimeout(() => audioStore.delete(audioId), 120000);

    const audioUrl = `${RENDER_EXTERNAL_URL}/audio/${audioId}`;

    // Step 4: Tell Vercel to call Telnyx playback_start
    if (!this.callControlId) {
      this.log('No call_control_id, cannot play audio');
      return;
    }

    try {
      const playRes = await fetch(`${VERCEL_API_URL}/api/telnyx/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_control_id: this.callControlId,
          audio_url: audioUrl,
        }),
      });
      if (!playRes.ok) {
        this.log('Play endpoint error', { status: playRes.status, body: await playRes.text() });
      } else {
        this.log('Audio playing', { total_ms: Date.now() - t0, audioUrl });
      }
    } catch (err) {
      this.log('Play fetch error', { error: err.message });
    }
  }

  cleanup() {
    activeSessions.delete(this.sessionId);
    if (this.deepgramConn) {
      try { this.deepgramConn.finish(); } catch {}
      this.deepgramConn = null;
    }
  }
}

module.exports = { TelnyxSession };
