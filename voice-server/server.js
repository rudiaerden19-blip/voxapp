const express = require('express');
const http = require('http');
const url = require('url');
const { WebSocketServer } = require('ws');
const { VoiceSession } = require('./voice-session');
const { TelnyxSession } = require('./telnyx-session');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

const PORT = process.env.PORT || 8080;

const REQUIRED_ENV = ['DEEPGRAM_API_KEY', 'ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID', 'VERCEL_API_URL'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required env: ${key}`);
    process.exit(1);
  }
}

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    twilio_sessions: VoiceSession.activeSessions(),
    telnyx_sessions: TelnyxSession.activeSessions(),
  });
});

app.get('/debug', (_req, res) => {
  const mask = (v) => v ? `${v.slice(0, 6)}...${v.slice(-4)} (${v.length} chars)` : 'NOT SET';
  res.json({
    env: {
      DEEPGRAM_API_KEY: mask(process.env.DEEPGRAM_API_KEY),
      ELEVENLABS_API_KEY: mask(process.env.ELEVENLABS_API_KEY),
      ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID || 'NOT SET',
      VERCEL_API_URL: process.env.VERCEL_API_URL || 'NOT SET',
      RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL || 'NOT SET',
      PORT: process.env.PORT || '8080',
    },
  });
});

app.get('/audio/:id', (req, res) => {
  const audio = TelnyxSession.getAudio(req.params.id);
  if (!audio) return res.status(404).send('Not found');
  res.set('Content-Type', 'audio/mpeg');
  res.set('Content-Length', audio.length);
  res.send(audio);
});

server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;
  const query = Object.fromEntries(new URL(request.url, `http://${request.headers.host}`).searchParams);

  console.log(`[WS] Upgrade request for ${pathname}`);

  wss.handleUpgrade(request, socket, head, (ws) => {
    if (pathname === '/telnyx-stream') {
      console.log(`[WS] Telnyx stream connection`, query);
      const session = new TelnyxSession(ws, {
        call_control_id: query.call_control_id || null,
        business_id: query.business_id || null,
        caller_id: query.caller_id || null,
      });
      session.start();
    } else {
      console.log(`[WS] Twilio stream connection`);
      const session = new VoiceSession(ws);
      session.start();
    }
  });
});

server.listen(PORT, () => {
  console.log(`Voice server listening on port ${PORT}`);
  console.log(`Deepgram: ready`);
  console.log(`ElevenLabs TTS voice: ${process.env.ELEVENLABS_VOICE_ID}`);
  console.log(`Business logic: ${process.env.VERCEL_API_URL}`);
});
