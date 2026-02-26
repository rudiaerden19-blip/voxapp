import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!;
const PUBLIC_WSS_URL = process.env.PUBLIC_WSS_URL!; // e.g. wss://your-app.railway.app/ws/telnyx
const PORT = parseInt(process.env.PORT ?? '3000', 10);

const app = express();
app.use(express.json());

// ─── POST /api/telnyx/voice ───────────────────────────────────────────────────

app.post('/api/telnyx/voice', async (req: Request, res: Response) => {
  const event = req.body?.data;
  const eventType: string = event?.event_type ?? '';
  const payload = event?.payload ?? {};
  const callControlId: string = payload?.call_control_id ?? '';

  console.log(`[webhook] ${eventType} | ${callControlId.slice(0, 24)}`);

  res.json({ received: true });

  if (eventType === 'call.initiated') {
    await telnyxAction(callControlId, 'answer', {});
  }

  if (eventType === 'call.answered') {
    await telnyxAction(callControlId, 'streaming_start', {
      stream_url: PUBLIC_WSS_URL,
      stream_track: 'inbound_track',
      enable_dialogflow: false,
    });
  }
});

// ─── Telnyx API helper ────────────────────────────────────────────────────────

async function telnyxAction(
  callControlId: string,
  action: string,
  body: Record<string, unknown>
): Promise<void> {
  const url = `https://api.telnyx.com/v2/calls/${encodeURIComponent(callControlId)}/actions/${action}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[telnyx] ${action} FAIL ${res.status}:`, text.slice(0, 200));
  } else {
    console.log(`[telnyx] ${action} OK`);
  }
}

// ─── WebSocket server at /ws/telnyx ──────────────────────────────────────────

const httpServer = createServer(app);

const wss = new WebSocketServer({ server: httpServer, path: '/ws/telnyx' });

wss.on('connection', (ws: WebSocket) => {
  console.log('[ws] Telnyx connected');
  let frameCount = 0;

  ws.on('message', (raw: Buffer) => {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.event === 'media') {
      const payload = (msg.media as Record<string, unknown>)?.payload as string | undefined;
      if (!payload) return;

      frameCount++;
      const t = Date.now();

      // Echo: stuur exact hetzelfde frame terug naar Telnyx
      const echoMsg = JSON.stringify({
        event: 'media',
        media: { payload },
      });

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(echoMsg);
      }

      if (frameCount % 100 === 0) {
        console.log(`[ws] frame ${frameCount} | t=${t}`);
      }
    }

    if (msg.event === 'start') {
      console.log('[ws] stream started:', JSON.stringify(msg).slice(0, 120));
    }

    if (msg.event === 'stop') {
      console.log('[ws] stream stopped');
    }
  });

  ws.on('close', () => {
    console.log(`[ws] disconnected | frames=${frameCount}`);
  });

  ws.on('error', (err) => {
    console.error('[ws] error:', err.message);
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`);
  console.log(`[server] webhook: POST /api/telnyx/voice`);
  console.log(`[server] websocket: ${PUBLIC_WSS_URL}`);
});
