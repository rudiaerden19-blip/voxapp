# voice-engine

Standalone Node.js + Express + WebSocket server for Telnyx streaming echo test.

Completely isolated — no imports from the main Next.js app.

## Env vars required

```
TELNYX_API_KEY=your_telnyx_api_key
PUBLIC_WSS_URL=https://your-railway-domain.up.railway.app
PORT=3001
```

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | /telnyx/voice | Telnyx webhook (answer + streaming_start) |
| WS | /ws/telnyx | Telnyx media stream (echo) |

## Flow

1. Telnyx sends `call.initiated` → server answers the call
2. Telnyx sends `call.answered` → server starts streaming to `/ws/telnyx`
3. Telnyx connects WebSocket and streams inbound audio frames
4. Server echoes each `media` frame back immediately

## Deploy (Railway)

1. Create new Railway project → link this folder as root
2. Set env vars in Railway dashboard
3. Set Telnyx Call Control webhook URL to: `https://your-domain.up.railway.app/telnyx/voice`

## Run locally

```bash
npm install
npm run dev
```
