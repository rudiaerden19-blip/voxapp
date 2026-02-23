const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');
const https = require('https');

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const VERCEL_API_URL = process.env.VERCEL_API_URL;

const activeSessions = new Map();

class VoiceSession {
  constructor(ws) {
    this.ws = ws;
    this.streamSid = null;
    this.callSid = null;
    this.businessId = null;
    this.callerId = null;
    this.conversationId = null;
    this.deepgramConn = null;
    this.isSpeaking = false;
    this.ttsPlaying = false;
    this.utteranceBuffer = '';
    this.sessionId = `vs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.markCounter = 0;
    this.pendingMarks = new Set();

    this.log('Session created');
  }

  static activeSessions() {
    return activeSessions.size;
  }

  log(msg, data) {
    const entry = { ts: new Date().toISOString(), session: this.sessionId, msg };
    if (data) entry.data = data;
    console.log(JSON.stringify(entry));
  }

  start() {
    activeSessions.set(this.sessionId, this);

    this.ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);
        this.handleTwilioMessage(msg);
      } catch (err) {
        this.log('Parse error', { error: err.message });
      }
    });

    this.ws.on('close', () => {
      this.log('WebSocket closed');
      this.cleanup();
    });

    this.ws.on('error', (err) => {
      this.log('WebSocket error', { error: err.message });
      this.cleanup();
    });
  }

  handleTwilioMessage(msg) {
    switch (msg.event) {
      case 'connected':
        this.log('Twilio connected', { protocol: msg.protocol });
        break;

      case 'start':
        this.streamSid = msg.start.streamSid;
        this.callSid = msg.start.callSid;
        this.conversationId = `call_${this.callSid}`;

        if (msg.start.customParameters) {
          this.businessId = msg.start.customParameters.business_id;
          this.callerId = msg.start.customParameters.caller_id;
        }

        this.log('Stream started', {
          streamSid: this.streamSid,
          callSid: this.callSid,
          businessId: this.businessId,
          callerId: this.callerId,
        });

        this.startDeepgram();
        this.sendGreeting();
        break;

      case 'media':
        if (this.deepgramConn) {
          const audio = Buffer.from(msg.media.payload, 'base64');
          this.deepgramConn.send(audio);
        }
        break;

      case 'mark':
        this.pendingMarks.delete(msg.mark.name);
        if (this.pendingMarks.size === 0) {
          this.ttsPlaying = false;
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
      endpointing: 200,
    });

    this.deepgramConn.on(LiveTranscriptionEvents.Open, () => {
      this.log('Deepgram connected');
    });

    this.deepgramConn.on(LiveTranscriptionEvents.Transcript, (data) => {
      const alt = data.channel?.alternatives?.[0];
      if (!alt) return;

      const transcript = alt.transcript?.trim();
      if (!transcript) return;

      if (data.is_final) {
        this.utteranceBuffer += (this.utteranceBuffer ? ' ' : '') + transcript;
        this.log('Deepgram final', { text: transcript, buffer: this.utteranceBuffer });
      }
    });

    this.deepgramConn.on(LiveTranscriptionEvents.UtteranceEnd, () => {
      if (this.utteranceBuffer) {
        this.log('Utterance complete', { text: this.utteranceBuffer });

        if (this.ttsPlaying) {
          this.stopTTS();
        }

        this.processUtterance(this.utteranceBuffer);
        this.utteranceBuffer = '';
      }
    });

    this.deepgramConn.on(LiveTranscriptionEvents.SpeechStarted, () => {
      if (this.ttsPlaying) {
        this.log('Barge-in detected — stopping TTS');
        this.stopTTS();
      }
    });

    this.deepgramConn.on(LiveTranscriptionEvents.Error, (err) => {
      this.log('Deepgram error', { error: err.message });
    });

    this.deepgramConn.on(LiveTranscriptionEvents.Close, () => {
      this.log('Deepgram closed');
    });
  }

  async sendGreeting() {
    const response = await this.callBusinessLogic('__greeting__');
    if (response) {
      await this.speak(response);
    }
  }

  async processUtterance(text) {
    this.log('Processing', { text });
    const t0 = Date.now();

    const response = await this.callBusinessLogic(text);
    const elapsed = Date.now() - t0;
    this.log('Business logic response', { elapsed_ms: elapsed, response: response?.slice(0, 100) });

    if (response) {
      await this.speak(response);
    }
  }

  async callBusinessLogic(transcript) {
    try {
      const url = `${VERCEL_API_URL}/api/voice-engine/stream`;
      const body = JSON.stringify({
        business_id: this.businessId,
        transcript,
        conversation_id: this.conversationId,
        caller_id: this.callerId,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!response.ok) {
        const errText = await response.text();
        this.log('Business logic error', { status: response.status, body: errText });
        return null;
      }

      const data = await response.json();
      return data.response;
    } catch (err) {
      this.log('Business logic fetch error', { error: err.message });
      return null;
    }
  }

  async speak(text) {
    this.log('TTS start', { text: text.slice(0, 100) });
    this.ttsPlaying = true;
    const t0 = Date.now();
    let firstByteMs = 0;

    try {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream?output_format=ulaw_8000`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.log('TTS error', { status: response.status, body: errText.slice(0, 200) });
        this.ttsPlaying = false;
        return;
      }

      const reader = response.body.getReader();
      let residual = Buffer.alloc(0);
      const CHUNK_SIZE = 640;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!this.ttsPlaying) {
          this.log('TTS interrupted mid-stream');
          reader.cancel();
          break;
        }

        if (!firstByteMs) {
          firstByteMs = Date.now() - t0;
          this.log('TTS first byte', { ms: firstByteMs });
        }

        let buf = Buffer.concat([residual, Buffer.from(value)]);
        residual = Buffer.alloc(0);

        while (buf.length >= CHUNK_SIZE) {
          const chunk = buf.slice(0, CHUNK_SIZE);
          buf = buf.slice(CHUNK_SIZE);

          if (this.ws.readyState === 1) {
            this.ws.send(JSON.stringify({
              event: 'media',
              streamSid: this.streamSid,
              media: { payload: chunk.toString('base64') },
            }));
          }
        }
        if (buf.length > 0) residual = buf;
      }

      if (residual.length > 0 && this.ttsPlaying && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({
          event: 'media',
          streamSid: this.streamSid,
          media: { payload: residual.toString('base64') },
        }));
      }

      const markName = `tts_${++this.markCounter}`;
      this.pendingMarks.add(markName);
      if (this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({
          event: 'mark',
          streamSid: this.streamSid,
          mark: { name: markName },
        }));
      }

      this.log('TTS complete', { total_ms: Date.now() - t0, first_byte_ms: firstByteMs });
    } catch (err) {
      this.log('TTS error', { error: err.message });
      this.ttsPlaying = false;
    }
  }

  stopTTS() {
    this.ttsPlaying = false;
    this.pendingMarks.clear();

    if (this.ws.readyState === 1) {
      this.ws.send(JSON.stringify({
        event: 'clear',
        streamSid: this.streamSid,
      }));
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

module.exports = { VoiceSession };
