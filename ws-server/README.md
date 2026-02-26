# Telnyx Streaming Echo

## Environment variables

```
TELNYX_API_KEY=
PUBLIC_BASE_URL=
PUBLIC_WSS_URL=wss://your-railway-domain.up.railway.app
```

## Deploy to Railway

1. New Project → Deploy from GitHub → Root Directory: `ws-server`
2. Add environment variables above
3. Deploy

## Configure Telnyx

Voice API Application → Webhook URL:
```
https://your-domain/api/telnyx/voice
```

## Test

Call your Telnyx number. You hear your own voice echoed back in near realtime.
