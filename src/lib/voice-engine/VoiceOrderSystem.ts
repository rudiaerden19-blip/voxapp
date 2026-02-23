// ============================================================
// VOICE ORDER SYSTEM v2 — Geen productnamen uitspreken
// ============================================================
//
// De AI spreekt NOOIT productnamen uit. Alleen vaste zinnen.
// Bestelling gaat naar de bon + SMS. Uitspraakproblemen opgelost.
//

export enum OrderState {
  TAKING_ORDER = 'TAKING_ORDER',
  GET_NAME_PHONE = 'GET_NAME_PHONE',
  DELIVERY_TYPE = 'DELIVERY_TYPE',
  GET_ADDRESS = 'GET_ADDRESS',
  DONE = 'DONE',
}

export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

export interface OrderData {
  timestamp: string;
  name: string | null;
  delivery_type: 'afhalen' | 'levering' | null;
  address: string | null;
  phone: string | null;
  items: OrderItem[];
}

export interface SessionData {
  state: OrderState;
  order: OrderItem[];
  delivery_type: 'afhalen' | 'levering' | null;
  name: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
}

export interface BusinessConfig {
  name: string;
  ai_name: string;
  welcome_message: string;
  prep_time_pickup: number;
  prep_time_delivery: number;
  delivery_enabled: boolean;
}

// ============================================================
// STT NORMALIZER — fixes common speech-to-text errors
// ============================================================

const HARDCODED_REPLACEMENTS: [string, string][] = [
  ['gebakken servla', 'cervela'],
  ['frikadel speciaal', 'frikandel speciaal'],
  ['zoute mayonaise', 'zoete mayonaise'],
  ['zoute mayo', 'zoete mayonaise'],
  ['biggie burger', 'bicky burger'],
  ['bickyburger', 'bicky burger'],
  ['koude boulet', 'gebakken boulet'],
  ['cerbella', 'cervela'],
  ['cebella', 'cervela'],
  ['servela', 'cervela'],
  ['cervella', 'cervela'],
  ['cerbéla', 'cervela'],
  ['cerbela', 'cervela'],
  ['servelade', 'cervela'],
  ['boelet', 'gebakken boulet'],
  ['boelett', 'gebakken boulet'],
  ['frikadel', 'frikandel'],
  ['tomatenketchup', 'tom ketchup'],
  ['tomaten ketchup', 'tom ketchup'],
  ['met samurai', 'met samurai saus'],
  ['met andalouse', 'met andalouse saus'],
  ['met cocktail', 'met cocktail saus'],
  ['met amerikaanse', 'met amerikaanse saus'],
  ['met joppie', 'met joppie saus'],
  ['met bbq', 'met bbq saus'],
  ['met look', 'met looksaus'],
];

function normalizeInput(text: string): string {
  let t = text.toLowerCase().trim();
  for (const [wrong, correct] of HARDCODED_REPLACEMENTS) {
    const escaped = wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (correct.length > wrong.length && t.includes(correct)) continue;
    t = t.replace(new RegExp(escaped, 'gi'), correct);
  }
  return t;
}

// ============================================================
// MATCHING HELPERS
// ============================================================

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return dp[m][n];
}

function fuzzyMatch(phrase: string, menuItems: string[], cutoff = 0.82): string | null {
  let best: string | null = null;
  let bestScore = 0;
  for (const item of menuItems) {
    const maxLen = Math.max(phrase.length, item.length);
    if (maxLen === 0) continue;
    const score = 1 - levenshtein(phrase, item) / maxLen;
    if (score > bestScore && score >= cutoff) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}

// ============================================================
// ITEM EXTRACTION
// ============================================================

const NUM_WORDS: Record<string, number> = {
  een: 1, één: 1, twee: 2, drie: 3, vier: 4, vijf: 5,
  zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10,
};

const QTY_PATTERN = /^(een|één|eén|twee|drie|vier|vijf|zes|zeven|acht|negen|tien)\s+/i;
const SPLIT_PATTERN = /[.]\s*|,\s*|\s+(?:en|eén|één)\s+/i;

export function extractItems(
  text: string,
  menuItems: string[],
  menuPrices: Record<string, number>,
  modifiers: Set<string> = new Set()
): OrderItem[] {
  const items: OrderItem[] = [];
  const modOnlyFlags: boolean[] = [];

  const parts = text
    .split(SPLIT_PATTERN)
    .map(p => p.trim())
    .filter(p => p.length > 2);

  for (const part of parts) {
    let qty = 1;
    let rest = part;

    rest = rest.replace(/^(doe daar|doe er|zet er)\s+/i, '').trim();
    rest = rest.replace(/^(en|ook)\s+/i, '').trim();
    rest = rest.replace(/^(ik wil\w*|ik wou|ik zou graag|graag|nog|eh|euh|uh|voor mij)\s+/i, '').trim();

    const numMatch = rest.match(/^(\d+)\s*[x×]?\s*/);
    if (numMatch) {
      qty = parseInt(numMatch[1]) || 1;
      rest = rest.substring(numMatch[0].length).trim();
    } else {
      const wordMatch = rest.match(QTY_PATTERN);
      if (wordMatch) {
        qty = NUM_WORDS[wordMatch[1].toLowerCase()] || NUM_WORDS[wordMatch[1].toLowerCase().replace('eé', 'éé')] || 1;
        rest = rest.substring(wordMatch[0].length).trim();
      }
    }

    rest = rest.replace(/^(een|één|eén|ene)\s+/i, '').trim();
    rest = rest.replace(/^(blikje|bakje|potje|portie|stuk)\s+/i, '').trim();
    rest = rest.replace(/\s+(bij|erbij|alsjeblieft|aub|asjeblieft)$/i, '').trim();
    if (rest.length < 2) continue;

    const excludedItems = new Set<string>();
    let zonderNote = '';
    const zonderMatch = rest.match(/\s+zonder\s+(.+)$/i);
    if (zonderMatch) {
      const zonderText = zonderMatch[1].toLowerCase();
      for (const menuItem of menuItems) {
        if (zonderText.includes(menuItem)) {
          excludedItems.add(menuItem);
        }
      }
      zonderNote = ' ' + zonderMatch[0].trim();
      rest = rest.replace(/\s+zonder\s+.+$/i, '').trim();
    }

    if (rest.length < 2) continue;
    const lower = rest.toLowerCase();

    const allMatches: { item: string; pos: number }[] = [];
    for (const menuItem of menuItems) {
      if (excludedItems.has(menuItem)) continue;
      const pos = lower.indexOf(menuItem);
      if (pos >= 0) {
        const dominated = allMatches.some(
          m => pos >= m.pos && pos + menuItem.length <= m.pos + m.item.length
        );
        if (!dominated) {
          for (let i = allMatches.length - 1; i >= 0; i--) {
            const m = allMatches[i];
            if (m.pos >= pos && m.pos + m.item.length <= pos + menuItem.length) {
              allMatches.splice(i, 1);
            }
          }
          allMatches.push({ item: menuItem, pos });
        }
      }
    }

    allMatches.sort((a, b) => a.pos - b.pos);

    let baseProduct: string | null = null;
    let totalPrice = 0;
    let isModifierOnly = false;

    if (allMatches.length > 0) {
      const baseMatch = allMatches.find(m => !modifiers.has(m.item)) || allMatches[0];
      baseProduct = baseMatch.item;
      isModifierOnly = allMatches.every(m => modifiers.has(m.item));
      for (const m of allMatches) {
        totalPrice += menuPrices[m.item] || 0;
      }
    }

    if (!baseProduct) {
      const words = rest.split(/\s+/);
      if (words.length >= 3) baseProduct = fuzzyMatch(`${words[0]} ${words[1]} ${words[2]}`, menuItems);
      if (!baseProduct && words.length >= 2) baseProduct = fuzzyMatch(`${words[0]} ${words[1]}`, menuItems);
      if (!baseProduct) baseProduct = fuzzyMatch(words[0], menuItems);
      if (baseProduct) {
        totalPrice = menuPrices[baseProduct] || 0;
      }
    }

    if (!baseProduct) continue;

    let displayName = allMatches.length > 1
      ? allMatches.map(m => m.item).join(' met ')
      : baseProduct;
    if (zonderNote) displayName += zonderNote;

    const existing = items.find(i => i.product === displayName);
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({ product: displayName, quantity: qty, price: totalPrice });
      modOnlyFlags.push(isModifierOnly);
    }
  }

  for (let i = items.length - 1; i >= 1; i--) {
    if (modOnlyFlags[i] && items[i].quantity === 1) {
      items[i - 1].price += items[i].price;
      items[i - 1].product += ' met ' + items[i].product;
      items.splice(i, 1);
      modOnlyFlags.splice(i, 1);
    }
  }

  return items;
}

// ============================================================
// PHONE NUMBER EXTRACTION
// ============================================================

function extractPhone(text: string): string | null {
  const digits = text.replace(/[^\d+]/g, '');
  if (digits.length >= 9) return digits;
  const spaced = text.match(/[\d]{2,4}[\s\-.]?[\d]{2,3}[\s\-.]?[\d]{2,3}[\s\-.]?[\d]{0,3}/);
  if (spaced) {
    const clean = spaced[0].replace(/[\s\-.]/g, '');
    if (clean.length >= 9) return clean;
  }
  return null;
}

// ============================================================
// NAME EXTRACTION
// ============================================================

const NAME_INTRO = /^(mijn naam is|het is|ik ben|dit is|naam is)\s+/i;
const NAME_REJECT_WORDS = new Set([
  'ja', 'nee', 'neen', 'ok', 'oké', 'niet', 'klopt', 'wacht', 'even', 'denken',
  'goed', 'idee', 'prima', 'perfect', 'lekker', 'mooi', 'precies', 'juist',
  'dat', 'het', 'een', 'nog', 'best', 'graag', 'dank', 'bedankt', 'euh',
]);

function cleanName(transcript: string): string | null {
  let name = transcript.trim();
  name = name.replace(NAME_INTRO, '').trim();
  name = name.replace(/[.!?,]+$/g, '').trim();
  if (name.length < 2) return null;
  const words = name.split(/\s+/);
  if (words.length > 4) return null;
  if (words.some(w => NAME_REJECT_WORDS.has(w.toLowerCase()))) return null;
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) return null;
  return name;
}

// ============================================================
// NAME + PHONE COMBINED EXTRACTION
// ============================================================

function extractNameAndPhone(transcript: string): { name: string | null; phone: string | null } {
  const phone = extractPhone(transcript);
  let textForName = transcript;
  if (phone) {
    textForName = transcript.replace(/[\d+\s\-.]{9,}/g, '').trim();
  }
  const name = cleanName(textForName);
  return { name, phone };
}

// ============================================================
// VOICE ORDER SYSTEM v2 — STATE MACHINE
// ============================================================

export class VoiceOrderSystem {
  private menuItems: string[];
  private menuPrices: Record<string, number>;
  private modifiers: Set<string>;
  private config: BusinessConfig;

  constructor(
    menuItems: string[],
    menuPrices: Record<string, number>,
    config: BusinessConfig,
    modifiers: Set<string> = new Set()
  ) {
    this.menuItems = menuItems;
    this.menuPrices = menuPrices;
    this.config = config;
    this.modifiers = modifiers;
  }

  handle(session: SessionData, transcript: string, conversationId?: string): { response: string; session: SessionData } {
    const input = normalizeInput(transcript);
    const cid = conversationId || 'unknown';
    const stateBefore = session.state;

    console.log(JSON.stringify({
      _tag: 'ORDER_TRACE', conversation_id: cid, step: '1_INPUT',
      raw_transcript: transcript, normalized_input: input,
      state_before: stateBefore, order_before: session.order,
    }));

    switch (session.state) {

      // ── BESTELLING OPNEMEN ─────────────────────────────────
      // Klant zegt bestelling in één keer. Zodra items herkend:
      // direct door naar naam+telefoon. Geen "nog iets anders?".
      case OrderState.TAKING_ORDER: {
        const items = extractItems(input, this.menuItems, this.menuPrices, this.modifiers);

        console.log(JSON.stringify({
          _tag: 'ORDER_TRACE', conversation_id: cid, step: '2_EXTRACT',
          extracted_items: items, menu_items_count: this.menuItems.length,
        }));

        if (items.length > 0) {
          session.order.push(...items);
          session.state = OrderState.GET_NAME_PHONE;
          return this.traced(session,
            'Ok, dat heb ik genoteerd. Mag ik uw naam en telefoonnummer alstublieft?',
            cid, stateBefore);
        }

        return this.traced(session,
          'Excuseer, dat heb ik niet goed verstaan. Kan u uw bestelling herhalen?',
          cid, stateBefore);
      }

      // ── STAP 3: NAAM + TELEFOON ───────────────────────────
      case OrderState.GET_NAME_PHONE: {
        const { name, phone } = extractNameAndPhone(transcript);

        if (name && !session.name) session.name = name;
        if (phone && !session.phone) session.phone = phone;

        if (!session.name) {
          return this.traced(session, 'Mag ik uw naam alstublieft?', cid, stateBefore);
        }
        if (!session.phone) {
          return this.traced(session, `Ok ${session.name}, en uw telefoonnummer?`, cid, stateBefore);
        }

        if (this.config.delivery_enabled) {
          session.state = OrderState.DELIVERY_TYPE;
          return this.traced(session,
            `Ok ${session.name}, wil je het komen afhalen of moeten wij het leveren?`,
            cid, stateBefore);
        }

        session.delivery_type = 'afhalen';
        session.state = OrderState.DONE;

        console.log(JSON.stringify({
          _tag: 'ORDER_TRACE', conversation_id: cid, step: '5_DONE',
          final_order: session.order, final_json: this.buildOrderData(session),
        }));

        return this.traced(session,
          `Ok ${session.name}, jouw bestelling staat klaar binnen ${this.config.prep_time_pickup} minuten. Bedankt en eet smakelijk.`,
          cid, stateBefore);
      }

      // ── STAP 4: AFHALEN OF LEVEREN ────────────────────────
      case OrderState.DELIVERY_TYPE: {
        if (/\blever\w*|bezorg\w*|brengen|thuis\b/i.test(input)) {
          session.delivery_type = 'levering';
          session.state = OrderState.GET_ADDRESS;
          return this.traced(session, 'Mag ik je adres alstublieft?', cid, stateBefore);
        }
        if (/\bafhaal\w*|ophaal\w*|ophalen|halen|kom\w*\b/i.test(input)) {
          session.delivery_type = 'afhalen';
          session.state = OrderState.DONE;

          console.log(JSON.stringify({
            _tag: 'ORDER_TRACE', conversation_id: cid, step: '5_DONE',
            final_order: session.order, final_json: this.buildOrderData(session),
          }));

          return this.traced(session,
            `Ok, jouw bestelling staat klaar binnen ${this.config.prep_time_pickup} minuten. Bedankt en eet smakelijk.`,
            cid, stateBefore);
        }
        return this.traced(session, 'Wil je het komen afhalen of moeten wij het leveren?', cid, stateBefore);
      }

      // ── STAP 4B: ADRES BIJ LEVERING ──────────────────────
      case OrderState.GET_ADDRESS: {
        const address = transcript.trim().replace(/[.!?,]+$/g, '');
        if (address.length >= 3) {
          session.address = address;
          session.state = OrderState.DONE;

          console.log(JSON.stringify({
            _tag: 'ORDER_TRACE', conversation_id: cid, step: '5_DONE',
            final_order: session.order, final_json: this.buildOrderData(session),
          }));

          return this.traced(session,
            `Ok ${session.name}, onze chauffeur stopt bij u binnen ${this.config.prep_time_delivery} minuten. Bedankt voor je bestelling en eet smakelijk.`,
            cid, stateBefore);
        }
        return this.traced(session, 'Mag ik je adres alstublieft?', cid, stateBefore);
      }

      // ── KLAAR ─────────────────────────────────────────────
      case OrderState.DONE: {
        return this.traced(session, 'Uw bestelling is al geplaatst. Dank u wel en tot ziens.', cid, stateBefore);
      }

      default:
        return this.traced(session, 'Excuseer, kan u dat herhalen?', cid, stateBefore);
    }
  }

  getGreeting(): string {
    return this.config.welcome_message;
  }

  private containsMenuItem(text: string): boolean {
    return this.menuItems.some(item => text.includes(item));
  }

  private traced(session: SessionData, text: string, cid: string, stateBefore: string): { response: string; session: SessionData } {
    console.log(JSON.stringify({
      _tag: 'ORDER_TRACE', conversation_id: cid, step: '4_REPLY',
      state_before: stateBefore, state_after: session.state,
      response_text: text, order_snapshot: session.order,
    }));
    return { response: text, session };
  }

  buildOrderData(session: SessionData): OrderData {
    return {
      timestamp: new Date().toISOString(),
      name: session.name,
      delivery_type: session.delivery_type,
      address: session.address,
      phone: session.phone,
      items: session.order,
    };
  }

  buildReceiptNotes(session: SessionData): { notes: string; total: number } {
    let total = 0;
    const lines = session.order.map(item => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;
      const priceStr = lineTotal > 0 ? `€${lineTotal.toFixed(2)}` : '';
      const name = item.product.charAt(0).toUpperCase() + item.product.slice(1);
      return `${item.quantity}x ${name}  ${priceStr}`;
    });
    return { notes: lines.join('\n'), total };
  }
}

export function createEmptySession(): SessionData {
  return {
    state: OrderState.TAKING_ORDER,
    order: [],
    delivery_type: null,
    name: null,
    address: null,
    phone: null,
    created_at: new Date().toISOString(),
  };
}
