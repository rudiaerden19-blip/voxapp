import express from "express";
import axios from "axios";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!;
const PUBLIC_WSS_URL = process.env.PUBLIC_WSS_URL!;

if (!TELNYX_API_KEY || !PUBLIC_WSS_URL) {
  throw new Error("Missing required env vars: TELNYX_API_KEY, PUBLIC_WSS_URL");
}

async function telnyxAction(
  callControlId: string,
  action: string,
  body: Record<string, unknown> = {}
) {
  await axios.post(
    `https://api.telnyx.com/v2/calls/${callControlId}/actions/${action}`,
    body,
    { headers: { Authorization: `Bearer ${TELNYX_API_KEY}` } }
  );
}

app.post("/telnyx/voice", async (req, res) => {
  const event = req.body?.data?.event_type as string | undefined;
  const callControlId = req.body?.data?.payload?.call_control_id as string | undefined;

  if (!callControlId) {
    res.sendStatus(200);
    return;
  }

  try {
    if (event === "call.initiated") {
      await telnyxAction(callControlId, "answer");
    }

    if (event === "call.answered") {
      await telnyxAction(callControlId, "streaming_start", {
        stream_url: `${PUBLIC_WSS_URL}/ws/telnyx`,
        stream_track: "inbound_track",
      });
    }
  } catch (err) {
    console.error("Telnyx action error:", err);
  }

  res.sendStatus(200);
});

server.on("upgrade", (request, socket, head) => {
  if (request.url === "/ws/telnyx") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (ws) => {
  console.log("[WS] Telnyx streaming connected");

  ws.on("message", (message: Buffer) => {
    try {
      const msg = JSON.parse(message.toString()) as {
        event: string;
        media?: { payload: string };
      };

      if (msg.event === "media" && msg.media?.payload) {
        ws.send(
          JSON.stringify({ event: "media", media: { payload: msg.media.payload } })
        );
      }
    } catch {
      // ignore malformed frames
    }
  });

  ws.on("close", () => {
    console.log("[WS] Streaming closed");
  });

  ws.on("error", (err) => {
    console.error("[WS] Error:", err);
  });
});

const PORT = process.env.PORT ?? 3001;
server.listen(PORT, () => {
  console.log(`[server] Voice engine running on port ${PORT}`);
});
