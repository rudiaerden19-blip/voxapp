const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { createClient } = require('@supabase/supabase-js');

const deepgram = require('./stt/deepgram');
const gemini = require('./nlu/gemini');
const tts = require('./tts/eleven');
const { normalizeTranscript } = require('./utils/normalize');
const { buildCatalog, mapProducts } = require('./logic/productMap');
const { OrderState, VoiceOrderSystem, createSession } = require('./logic/stateMachine');

// ── ENV CHECK ───────────────────────────────────────────────
const REQUIRED_ENV = [
  'DEEPGRAM_API_KEY',
  'GEMINI_API_KEY',
  'ELEVENLABS_API_KEY',
  'ELEVENLABS_VOICE_ID',
  'TELNYX_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required env: ${key}`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 8080;
const PUBLIC_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

// ── SUPABASE ────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── MENU CACHE ──────────────────────────────────────────────
const menuCache = new Map();
const MENU_TTL = 5 * 60 * 1000;

async function loadMenu(businessId) {
  const cached = menuCache.get(businessId);
  if (cached && Date.now() - cached.ts < MENU_TTL) return cached.data;

  const { data } = await supabase
    .from('menu_items')
    .select('name, price, is_modifier, category')
    .eq('business_id', businessId)
    .eq('is_available', true);

  const items = [];
  const prices = {};
  const modifiers = new Set();
  const raw = [];

  if (Array.isArray(data)) {
    for (const row of data) {
      if (row.name && typeof row.price === 'number') {
        const lower = row.name.toLowerCase();
        items.push(lower);
        prices[lower] = row.price;
        if (row.is_modifier) modifiers.add(lower);
        raw.push({
          name: row.name,
          price: row.price,
          category: row.category || 'Overig',
          is_modifier: !!row.is_modifier,
        });
      }
    }
  }

  const menuData = { items, prices, modifiers, raw };
  menuCache.set(businessId, { data: menuData, ts: Date.now() });
  return menuData;
}

async function loadBusiness(businessId) {
  const { data } = await supabase
    .from('businesses')
    .select('id, name, welcome_message, ai_name, prep_time_pickup, prep_time_delivery, delivery_enabled')
    .eq('id', businessId)
    .single();
  return data || null;
}

function buildConfig(biz) {
  return {
    name: biz.name,
    ai_name: biz.ai_name || 'Anja',
    welcome_message: biz.welcome_message || `Hallo, met ${biz.name}, wat kan ik voor u doen?`,
    prep_time_pickup: biz.prep_time_pickup || 20,
    prep_time_delivery: biz.prep_time_delivery || 30,
    delivery_enabled: biz.delivery_enabled ?? true,
  };
}

// ── AUDIO STORE (temp TTS buffers) ──────────────────────────
const audioStore = new Map();

// ── TELNYX PLAYBACK ─────────────────────────────────────────
async function telnyxPlay(callControlId, audioUrl) {
  const res = await fetch(
    `https://api.telnyx.com/v2/calls/${callControlId}/actions/playback_start`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
      },
      body: JSON.stringify({ audio_url: audioUrl, overlay: false }),
    }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.log(JSON.stringify({ _tag: 'TELNYX', event: 'play_error', status: res.status, body: body.slice(0, 200) }));
  }
}

// ── CALL SESSION ────────────────────────────────────────────
const activeSessions = new Map();

class CallSession {
  constructor(ws, params) {
    this.ws = ws;
    this.callControlId = params.call_control_id || null;
    this.businessId = params.business_id || null;
    this.callerId = params.caller_id || null;
    this.conversationId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.sessionId = `cs_${Date.now()}`;

    this.session = null;
    this.engine = null;
    this.menu = null;
    this.deepgramConn = null;
    this.utteranceBuffer = '';
    this.processing = false;
  }

  async start() {
    activeSessions.set(this.sessionId, this);
    this.log('Call started');

    // 1. Load business + menu
    if (!this.businessId) {
      this.log('No business_id');
      this.cleanup();
      return;
    }

    try {
      const business = await loadBusiness(this.businessId);
      if (!business) {
        this.log('Business not found');
        this.cleanup();
        return;
      }

      this.menu = await loadMenu(this.businessId);
      const config = buildConfig(business);
      this.engine = new VoiceOrderSystem(this.menu, config);
      this.session = createSession();
      if (this.callerId) this.session.phone = this.callerId;

      this.log('Business loaded', { name: business.name, menu_count: this.menu.items.length });
    } catch (err) {
      this.log('Init error', { error: err.message });
      this.cleanup();
      return;
    }

    // 2. WebSocket handlers
    this.ws.on('message', (raw) => {
      try { this.handleTelnyxMessage(JSON.parse(raw)); }
      catch (err) { this.log('Parse error', { error: err.message }); }
    });
    this.ws.on('close', () => { this.log('WS closed'); this.cleanup(); });
    this.ws.on('error', (err) => { this.log('WS error', { error: err.message }); this.cleanup(); });

    // 3. Start Deepgram STT
    this.startSTT();

    // 4. Send greeting
    await this.speak(this.engine.getGreeting());
  }

  handleTelnyxMessage(msg) {
    switch (msg.event) {
      case 'connected':
        this.log('Stream connected');
        break;
      case 'start':
        if (msg.start?.call_control_id) this.callControlId = msg.start.call_control_id;
        this.log('Stream started', { callControlId: this.callControlId });
        break;
      case 'media':
        if (this.deepgramConn && msg.media?.payload) {
          this.deepgramConn.send(Buffer.from(msg.media.payload, 'base64'));
        }
        break;
      case 'stop':
        this.log('Stream stopped');
        this.cleanup();
        break;
    }
  }

  startSTT() {
    this.deepgramConn = deepgram.createStream({
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          this.utteranceBuffer += (this.utteranceBuffer ? ' ' : '') + text;
          this.log('STT final', { text, buffer: this.utteranceBuffer.slice(0, 100) });
        }
      },
      onUtteranceEnd: () => {
        if (this.utteranceBuffer && !this.processing) {
          this.log('Utterance complete', { text: this.utteranceBuffer.slice(0, 100) });
          this.processUtterance(this.utteranceBuffer);
          this.utteranceBuffer = '';
        }
      },
      onError: (err) => {
        this.log('STT error', { error: err.message });
      },
    });
  }

  async processUtterance(text) {
    this.processing = true;
    const t0 = Date.now();

    try {
      // Step 1: Normalize
      const normalized = normalizeTranscript(text);
      this.log('Normalized', { raw: text.slice(0, 80), normalized: normalized.slice(0, 80) });

      // Step 2: Extract based on state
      let mappedItems = null;
      let namePhone = null;

      if (this.session.state === OrderState.TAKING_ORDER) {
        const geminiResult = await gemini.extractItems(normalized, this.menu.raw);
        if (geminiResult && geminiResult.items.length > 0) {
          const catalog = buildCatalog(this.menu.raw);
          const mapped = mapProducts(geminiResult.items, catalog);
          const resolved = mapped.filter(m => !m.unresolved);
          if (resolved.length > 0) {
            mappedItems = resolved.map(m => ({
              product: m.product,
              quantity: m.quantity,
              price: m.price,
            }));
          }
        }
      } else if (this.session.state === OrderState.GET_NAME_PHONE) {
        namePhone = await gemini.extractNamePhone(normalized);
      }

      // Step 3: State machine
      const result = this.engine.handle(
        this.session, normalized, this.conversationId, mappedItems, namePhone
      );
      this.session = result.session;

      // Step 4: Save order if done
      if (this.session.state === OrderState.DONE) {
        await this.saveOrder();
      }

      // Step 5: TTS + playback
      this.log('Pipeline done', { ms: Date.now() - t0, state: this.session.state });
      await this.speak(result.response);

    } catch (err) {
      this.log('Pipeline error', { error: err.message });
      await this.speak('Excuseer, kan u dat herhalen?');
    }

    this.processing = false;
  }

  async speak(text) {
    const t0 = Date.now();
    try {
      const audio = await tts.generateSpeech(text);

      const audioId = `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      audioStore.set(audioId, audio);
      setTimeout(() => audioStore.delete(audioId), 120_000);

      const audioUrl = `${PUBLIC_URL}/audio/${audioId}`;
      this.log('TTS done', { ms: Date.now() - t0, bytes: audio.length });

      if (this.callControlId) {
        await telnyxPlay(this.callControlId, audioUrl);
        this.log('Audio playing', { url: audioUrl, total_ms: Date.now() - t0 });
      }
    } catch (err) {
      this.log('Speak error', { error: err.message });
    }
  }

  async saveOrder() {
    try {
      const orderData = this.engine.buildOrderData(this.session);
      const { notes, total } = this.engine.buildReceiptNotes(this.session);

      console.log(JSON.stringify({
        _tag: 'ORDER', conversation_id: this.conversationId,
        order: orderData, notes, total,
      }));

      await supabase.from('orders').insert({
        business_id: this.businessId,
        customer_name: orderData.name || 'Telefoon klant',
        customer_phone: orderData.phone || '',
        order_type: orderData.delivery_type === 'levering' ? 'delivery' : 'pickup',
        notes,
        status: 'pending',
        source: 'phone',
        total_amount: total,
        created_at: orderData.timestamp,
      });

      this.log('Order saved', { total, items: orderData.items.length });
    } catch (err) {
      this.log('Save error', { error: err.message });
    }
  }

  log(msg, data) {
    const entry = { ts: new Date().toISOString(), session: this.sessionId, msg };
    if (data) entry.data = data;
    console.log(JSON.stringify(entry));
  }

  cleanup() {
    activeSessions.delete(this.sessionId);
    if (this.deepgramConn) {
      try { this.deepgramConn.finish(); } catch {}
      this.deepgramConn = null;
    }
  }
}

// ── EXPRESS ─────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', sessions: activeSessions.size });
});

app.get('/audio/:id', (req, res) => {
  const audio = audioStore.get(req.params.id);
  if (!audio) return res.status(404).send('Not found');
  res.set('Content-Type', 'audio/mpeg');
  res.set('Content-Length', audio.length);
  res.send(audio);
});

// ── WEBSOCKET ───────────────────────────────────────────────
server.on('upgrade', (request, socket, head) => {
  const params = Object.fromEntries(
    new URL(request.url, `http://${request.headers.host}`).searchParams
  );

  console.log(JSON.stringify({ _tag: 'WS', event: 'upgrade', params }));

  wss.handleUpgrade(request, socket, head, (ws) => {
    const session = new CallSession(ws, {
      call_control_id: params.call_control_id || null,
      business_id: params.business_id || null,
      caller_id: params.caller_id || null,
    });
    session.start();
  });
});

// ── START ────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`Voice server on port ${PORT}`);
  console.log(`Public URL: ${PUBLIC_URL}`);
  console.log(`Stack: Deepgram STT → Gemini NLU → ElevenLabs TTS`);
});
