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
  throw new Error("Missing environment variables");
}

/*
--------------------------------------------------
TELNYX VOICE WEBHOOK
--------------------------------------------------
*/

app.post("/api/telnyx/voice", async (req, res) => {
  const event = req.body.data?.event_type;
  const callControlId = req.body.data?.payload?.call_control_id;

  if (!callControlId) {
    return res.sendStatus(200);
  }

  try {
    if (event === "call.initiated") {
      await axios.post(
        `https://api.telnyx.com/v2/calls/${callControlId}/actions/answer`,
        {},
        {
          headers: {
            Authorization: `Bearer ${TELNYX_API_KEY}`
          }
        }
      );
    }

    if (event === "call.answered") {
      await axios.post(
        `https://api.telnyx.com/v2/calls/${callControlId}/actions/streaming_start`,
        {
          stream_url: `${PUBLIC_WSS_URL}/ws/telnyx`,
          stream_track: "inbound_track"
        },
        {
          headers: {
            Authorization: `Bearer ${TELNYX_API_KEY}`
          }
        }
      );
    }
  } catch (err) {
    console.error(err);
  }

  res.sendStatus(200);
});

/*
--------------------------------------------------
WEBSOCKET STREAM SERVER
--------------------------------------------------
*/

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
  console.log("Telnyx streaming connected");

  ws.on("message", (message: Buffer) => {
    const msg = JSON.parse(message.toString());

    if (msg.event === "media") {
      // Echo the exact same audio frame back immediately
      ws.send(
        JSON.stringify({
          event: "media",
          media: {
            payload: msg.media.payload
          }
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("Streaming closed");
  });
});

/*
--------------------------------------------------
START SERVER
--------------------------------------------------
*/

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
