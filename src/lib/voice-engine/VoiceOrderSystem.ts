// ============================================================
// VOICE ORDER SYSTEM — Multi-tenant State Machine
// ============================================================

export enum OrderState {
  TAKING_ORDER = 'TAKING_ORDER',
  DELIVERY_TYPE = 'DELIVERY_TYPE',
  GET_NAME = 'GET_NAME',
  GET_ADDRESS = 'GET_ADDRESS',
  GET_PHONE = 'GET_PHONE',
  CONFIRM = 'CONFIRM',
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

// ============================================================
// TTS PHONETIC REWRITER — fixes pronunciation for ElevenLabs
// ============================================================

const TTS_REPLACEMENTS: [string, string][] = [
  ['gebakken boulet', 'gebakken boelett'],
  ['bicky burger', 'bikkie burger'],
  ['zoete mayonaise', 'zoete mayonéze'],
  ['andalouse', 'andaloeze'],
  ['cervela', 'servela'],
  ['americaine', 'amerikèn'],
  ['samurai', 'samourai'],
  ['frikandel speciaal', 'frikandel spessjaal'],
  ['tom ketchup', 'tomaten ketchup'],
];

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

function normalizeInput(text: string): string {
  let t = text.toLowerCase().trim();
  for (const [wrong, correct] of HARDCODED_REPLACEMENTS) {
    t = t.replace(new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), correct);
  }
  return t;
}

function normalizeForTts(text: string): string {
  let t = text;
  for (const [correct, phonetic] of TTS_REPLACEMENTS) {
    t = t.replace(new RegExp(correct, 'gi'), phonetic);
  }
  return t;
}

// ============================================================
// ITEM EXTRACTION — sector-agnostisch
// ============================================================
//
// Geen hardcoded productnamen. Alles komt uit tenant menu.
// modifiers (Set) komt uit is_modifier vlag in menu_items tabel.
//

const NUM_WORDS: Record<string, number> = {
  een: 1, één: 1, twee: 2, drie: 3, vier: 4, vijf: 5,
  zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10,
};

const QTY_PATTERN = /^(een|één|eén|twee|drie|vier|vijf|zes|zeven|acht|negen|tien)\s+/i;

// Split op punt, komma, of "en"/"eén"/"één" (altijd, ook zonder hoeveelheid erna)
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

    rest = rest.replace(/^(ik wil|ik zou graag|graag|nog|eh|euh|uh)\s+/i, '').trim();
    rest = rest.replace(/^(een|één|eén)\s+/i, '').trim();
    if (rest.length < 2) continue;

    // "zonder X" — exclude X from matching, don't charge for it
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

    // Geen menu-match → fragment overslaan (niet als "onbekend item" toevoegen)
    if (!baseProduct) continue;

    let displayName = baseProduct;
    if (lower.length > baseProduct.length + 3) {
      displayName = rest;
    }
    if (zonderNote) displayName += zonderNote;

    const existing = items.find(i => i.product === displayName);
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({ product: displayName, quantity: qty, price: totalPrice });
      modOnlyFlags.push(isModifierOnly);
    }
  }

  // Modifier-only fragmenten (bv. losse saus na "en" split) → terug mergen met vorig item
  for (let i = items.length - 1; i >= 1; i--) {
    if (modOnlyFlags[i] && items[i].quantity === 1) {
      items[i - 1].price += items[i].price;
      items[i - 1].product += ' en ' + items[i].product;
      items.splice(i, 1);
      modOnlyFlags.splice(i, 1);
    }
  }

  return items;
}

// ============================================================
// NAME VALIDATION
// ============================================================

const NAME_INTRO = /^(mijn naam is|het is|ik ben|dit is)\s+/i;
const NAME_REJECT = /^(ja|nee|neen|ok|oké|niet|klopt|wacht|even|denken|hmm|euh|eh|uh)$/i;
const NAME_REJECT_WORDS = new Set(['ja', 'nee', 'neen', 'ok', 'oké', 'niet', 'klopt', 'wacht', 'even', 'denken']);

function cleanName(transcript: string): string | null {
  let name = transcript.trim();
  name = name.replace(NAME_INTRO, '').trim();
  name = name.replace(/[.!?,]+$/g, '');
  name = name.trim();

  if (name.length < 3) return null;

  const words = name.split(/\s+/);
  if (words.length > 3) return null;
  if (words.some(w => NAME_REJECT_WORDS.has(w.toLowerCase()))) return null;
  if (NAME_REJECT.test(name)) return null;
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) return null;

  return name;
}

// ============================================================
// VOICE ORDER SYSTEM — STATE MACHINE (multi-tenant)
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

  handle(session: SessionData, transcript: string): { response: string; session: SessionData } {
    const input = normalizeInput(transcript);

    switch (session.state) {

      case OrderState.TAKING_ORDER: {
        if (/\b(nee|neen|dat was het|dat is het|dat is alles|meer niet|niks meer|dat was alles|klaar)\b/i.test(input)) {
          if (session.order.length === 0) {
            return this.reply(session, 'Ik heb nog geen bestelling genoteerd. Wat mag het zijn?');
          }
          if (this.config.delivery_enabled) {
            session.state = OrderState.DELIVERY_TYPE;
            return this.reply(session, 'Moet het geleverd worden of kom je het afhalen?');
          }
          session.delivery_type = 'afhalen';
          session.state = OrderState.GET_NAME;
          return this.reply(session, 'Op welke naam mag ik de bestelling zetten?');
        }

        if (/\b(bestellen|ik wil|mag ik|kan ik)\b/i.test(input) && !this.containsMenuItem(input)) {
          return this.reply(session, 'Ja, zeg het maar.');
        }

        const items = extractItems(input, this.menuItems, this.menuPrices, this.modifiers);
        if (items.length > 0) {
          session.order.push(...items);
          return this.reply(session, 'Ok, genoteerd. Nog iets anders?');
        }

        if (session.order.length === 0) {
          return this.reply(session, 'Dat heb ik niet goed begrepen, kan je het herhalen?');
        }
        return this.reply(session, 'Dat heb ik niet goed begrepen, kan je het herhalen?');
      }

      case OrderState.DELIVERY_TYPE: {
        if (/\b(lever|bezorg|brengen|thuis)\b/i.test(input)) {
          session.delivery_type = 'levering';
          session.state = OrderState.GET_NAME;
          return this.reply(session, 'Op welke naam mag ik de bestelling zetten?');
        }
        if (/\b(afhaal|afhalen|ophalen|halen|komen halen|kom het halen|kom halen)\b/i.test(input)) {
          session.delivery_type = 'afhalen';
          session.state = OrderState.GET_NAME;
          return this.reply(session, 'Op welke naam mag ik de bestelling zetten?');
        }
        return this.reply(session, 'Moet het geleverd worden of kom je het afhalen?');
      }

      case OrderState.GET_NAME: {
        const name = cleanName(transcript);
        if (name) {
          session.name = name;
          if (session.delivery_type === 'levering') {
            session.state = OrderState.GET_ADDRESS;
            return this.reply(session, 'Op welk adres mogen we leveren?');
          }
          session.state = OrderState.CONFIRM;
          return this.confirm(session);
        }
        return this.reply(session, 'Op welke naam mag ik de bestelling zetten?');
      }

      case OrderState.GET_ADDRESS: {
        const address = transcript.trim().replace(/[.!?,]+$/g, '');
        if (address.length >= 3) {
          session.address = address;
          session.state = OrderState.GET_PHONE;
          return this.reply(session, 'En welk telefoonnummer voor onze chauffeur?');
        }
        return this.reply(session, 'Op welk adres mogen we leveren?');
      }

      case OrderState.GET_PHONE: {
        const phone = transcript.replace(/[^\d+\s\-]/g, '').trim();
        if (phone.length >= 6) {
          session.phone = phone;
          session.state = OrderState.CONFIRM;
          return this.confirm(session);
        }
        return this.reply(session, 'En welk telefoonnummer voor onze chauffeur?');
      }

      case OrderState.CONFIRM: {
        if (/\b(ja|klopt|juist|correct|dat klopt|precies)\b/i.test(input)) {
          session.state = OrderState.DONE;
          if (session.delivery_type === 'levering') {
            return this.reply(session, `Je bestelling wordt binnen ${this.config.prep_time_delivery} minuten geleverd. Dank je wel en eet smakelijk.`);
          }
          return this.reply(session, `Je bestelling is klaar over ${this.config.prep_time_pickup} minuten. Dank je wel en eet smakelijk.`);
        }
        if (/\b(nee|neen|niet|fout)\b/i.test(input)) {
          session.order = [];
          session.state = OrderState.TAKING_ORDER;
          return this.reply(session, 'Ok, laten we opnieuw beginnen. Wat mag het zijn?');
        }
        return this.confirm(session);
      }

      case OrderState.DONE: {
        return this.reply(session, 'De bestelling is al geplaatst. Dank je wel en tot ziens.');
      }

      default:
        return this.reply(session, 'Excuseer, kan je dat herhalen?');
    }
  }

  getGreeting(): string {
    return normalizeForTts(this.config.welcome_message);
  }

  private containsMenuItem(text: string): boolean {
    return this.menuItems.some(item => text.includes(item));
  }

  private confirm(session: SessionData): { response: string; session: SessionData } {
    const summary = session.order
      .map(i => `${i.quantity}x ${i.product}`)
      .join(', ');
    const response = `Ok ${session.name}, even samenvatten: ${summary}. Klopt dat?`;
    return this.reply(session, response);
  }

  private reply(session: SessionData, text: string): { response: string; session: SessionData } {
    return { response: normalizeForTts(text), session };
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
