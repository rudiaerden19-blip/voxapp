/**
 * VoxApp WebSocket Server — Railway
 *
 * Ontvangt Telnyx MediaStream audio → Google STT nl-BE → state machine → ElevenLabs TTS
 *
 * Telnyx verbindt via WebSocket met dit endpoint:
 *   wss://jouw-railway-url/media-stream/:callControlId
 */

import 'dotenv/config';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { handleMediaStream } from './mediaHandler';

const PORT = parseInt(process.env.PORT ?? '8080', 10);

const app = express();
app.use(express.json());

// Health check voor Railway
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'voxapp-ws-server', timestamp: new Date().toISOString() });
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket, req) => {
  const url = req.url ?? '';
  // URL formaat: /media-stream/:callControlId?businessId=xxx
  const match = url.match(/\/media-stream\/([^?]+)/);
  const callControlId = match ? decodeURIComponent(match[1]) : 'unknown';
  const params = new URLSearchParams(url.split('?')[1] ?? '');
  const businessId = params.get('businessId') ?? process.env.DEFAULT_BUSINESS_ID ?? '';

  console.log(`[ws] nieuwe verbinding: callControlId=${callControlId.slice(0, 20)} businessId=${businessId}`);

  handleMediaStream(ws, callControlId, businessId);

  ws.on('close', () => {
    console.log(`[ws] verbinding gesloten: ${callControlId.slice(0, 20)}`);
  });

  ws.on('error', (err) => {
    console.error(`[ws] fout: ${err.message}`);
  });
});

server.listen(PORT, () => {
  console.log(`[ws] server gestart op poort ${PORT}`);
});
