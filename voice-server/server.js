const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { VoiceSession } = require('./voice-session');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;

const REQUIRED_ENV = ['DEEPGRAM_API_KEY', 'ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID', 'VERCEL_API_URL'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required env: ${key}`);
    process.exit(1);
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', sessions: VoiceSession.activeSessions() });
});

wss.on('connection', (ws, req) => {
  console.log(`[WS] New connection from ${req.socket.remoteAddress}`);
  const session = new VoiceSession(ws);
  session.start();
});

server.listen(PORT, () => {
  console.log(`Voice server listening on port ${PORT}`);
  console.log(`Deepgram: ready`);
  console.log(`ElevenLabs TTS voice: ${process.env.ELEVENLABS_VOICE_ID}`);
  console.log(`Business logic: ${process.env.VERCEL_API_URL}`);
});
