# READ_FIRST.md — VERPLICHT LEZEN VOOR ELKE AGENT

## STACK (VAST, NIET WIJZIGEN)

- **Hosting**: Render (1 Node.js service — `voice-server/`)
- **STT**: Deepgram Realtime Streaming WebSocket
- **LLM**: Gemini API (JSON-only)
- **TTS**: ElevenLabs Streaming TTS
- **Telecom**: Telnyx (webhook op Vercel, audio stream naar Render)
- **Frontend**: Vercel (Next.js)
- **Database**: Supabase

## ARCHITECTUUR

```
Caller → Telnyx → Vercel webhook → Render WebSocket
→ Deepgram STT → Gemini extractie → State machine → ElevenLabs TTS → Telnyx playback
```

## REGELS

1. GEEN nieuwe services, abonnementen of hostingplatformen
2. GEEN architectuurwijzigingen zonder expliciete toestemming
3. GEEN extra dependencies zonder expliciete vraag
4. GEEN refactor tenzij gevraagd
5. Gemini doet product-matching — GEEN handmatige dictionary voor producten
6. State machine bepaalt flow — LLM nooit
7. Normalize.js: alleen structurele STT-correcties (geen product-namen)

## BESTANDEN

```
voice-server/
  server.js          — Express + WebSocket server
  stt/deepgram.js    — Deepgram streaming STT
  nlu/gemini.js      — Gemini JSON extractie
  tts/eleven.js      — ElevenLabs TTS
  logic/stateMachine.js — State machine
  logic/productMap.js   — Product matching
  utils/normalize.js    — Structurele transcript correcties

src/app/api/telnyx/webhook/route.ts — Telnyx inkomende calls
```

## WAT WERKT (BEWEZEN)

- Deepgram verbindt en transcribeert Nederlands ✅
- Gemini extraheert items, naam, telefoon correct ✅
- State machine stuurt gesprek ✅
- ElevenLabs TTS speelt audio ✅
- Orders worden opgeslagen in Supabase ✅

## DEPLOY

Push naar GitHub → Render deployt automatisch.
Vercel deployt automatisch via GitHub.
