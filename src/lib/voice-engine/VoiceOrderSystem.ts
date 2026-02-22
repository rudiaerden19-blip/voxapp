// ============================================================
// FRITUUR NOLIM – VOICE ORDER SYSTEM (State Machine)
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

// ============================================================
// MENU + NORMALIZER
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

const TTS_REPLACEMENTS: [string, string][] = [
  ['gebakken boulet', 'gebakken boelett'],
  ['bicky burger', 'bikkie burger'],
  ['zoete mayonaise', 'zoete mayonéze'],
  ['andalouse', 'andaloeze'],
  ['cervela', 'servela'],
  ['americaine', 'amerikèn'],
  ['samurai', 'samourai'],
  ['frikandel speciaal', 'frikandel spessjaal'],
  ['tomatenketchup', 'tomaten ketchup'],
];

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
  // Longest replacements first
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
// ITEM EXTRACTION
// ============================================================

const NUM_WORDS: Record<string, number> = {
  een: 1, één: 1, twee: 2, drie: 3, vier: 4, vijf: 5,
  zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10,
};

const SAUCE_ITEMS = new Set([
  'mayonaise', 'zoete mayonaise', 'tom ketchup', 'curry ketchup',
  'cocktail saus', 'andalouse saus', 'amerikaanse saus', 'curry saus',
  'looksaus', 'joppie saus', 'samurai saus', 'mezzomix', 'bbq saus',
  'mosterd', 'tartaar',
]);

function extractItems(
  text: string,
  menuItems: string[],
  menuPrices: Record<string, number>
): OrderItem[] {
  const normalized = normalizeInput(text);
  const items: OrderItem[] = [];

  const parts = normalized
    .split(/[.]\s*|,\s*|\b(?:en|eén|één)\s+(?=een\b|één\b|eén\b|twee\b|drie\b|vier\b|vijf\b|\d|\bfriet|\bbicky|\bfrikandel|\bkroket|\bcola|\bfanta|\bwater|\bcurry|\bice|\bbrood|\bcervela|\bboulet|\bcurryworst|\bbitterballen|\bblikje|\bcheeseburger|\bhamburger|\bservela)/i)
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
      const wordMatch = rest.match(/^(een|één|eén|twee|drie|vier|vijf|zes|zeven|acht|negen|tien)\s+/i);
      if (wordMatch) {
        qty = NUM_WORDS[wordMatch[1].toLowerCase()] || NUM_WORDS[wordMatch[1].toLowerCase().replace('eé', 'éé')] || 1;
        rest = rest.substring(wordMatch[0].length).trim();
      }
    }

    rest = rest.replace(/^(ik wil|ik zou graag|graag|nog|eh|euh|uh)\s+/i, '').trim();
    rest = rest.replace(/^(een|één|eén)\s+/i, '').trim();
    rest = rest.replace(/\b(blikje|bakje)\s+/gi, '').trim();
    if (rest.length < 2) continue;

    const lower = rest.toLowerCase();

    // Find ALL menu items that appear in this part (base product + sauces)
    const allMatches: { item: string; pos: number }[] = [];
    for (const menuItem of menuItems) {
      const pos = lower.indexOf(menuItem);
      if (pos >= 0) {
        // Skip if this match is a substring of an already-found longer match
        const dominated = allMatches.some(
          m => pos >= m.pos && pos + menuItem.length <= m.pos + m.item.length
        );
        if (!dominated) {
          // Remove any existing shorter matches that this one contains
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

    // Sort by position → first match is the base product
    allMatches.sort((a, b) => a.pos - b.pos);

    let baseProduct: string | null = null;
    let totalPrice = 0;

    if (allMatches.length > 0) {
      // First non-sauce match is the base, or first match if all are sauces
      const baseMatch = allMatches.find(m => !SAUCE_ITEMS.has(m.item)) || allMatches[0];
      baseProduct = baseMatch.item;

      // Sum prices of all matched items
      for (const m of allMatches) {
        totalPrice += menuPrices[m.item] || 0;
      }
    }

    // Fuzzy fallback if no direct match found
    if (!baseProduct) {
      const words = rest.split(/\s+/);
      if (words.length >= 3) baseProduct = fuzzyMatch(`${words[0]} ${words[1]} ${words[2]}`, menuItems);
      if (!baseProduct && words.length >= 2) baseProduct = fuzzyMatch(`${words[0]} ${words[1]}`, menuItems);
      if (!baseProduct) baseProduct = fuzzyMatch(words[0], menuItems);
      if (baseProduct) {
        totalPrice = menuPrices[baseProduct] || 0;
      }
    }

    // Display name: use full text if it has modifiers, otherwise just the product
    let displayName = baseProduct || rest;
    if (baseProduct && lower.length > baseProduct.length + 3) {
      displayName = rest;
    }

    const existing = items.find(i => i.product === displayName);
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({ product: displayName, quantity: qty, price: totalPrice });
    }
  }

  return items;
}

// ============================================================
// VOICE ORDER SYSTEM — STATE MACHINE
// ============================================================

export class VoiceOrderSystem {
  private menuItems: string[];
  private menuPrices: Record<string, number>;

  constructor(menuItems: string[], menuPrices: Record<string, number>) {
    this.menuItems = menuItems;
    this.menuPrices = menuPrices;
  }

  handle(session: SessionData, transcript: string): { response: string; session: SessionData } {
    const input = normalizeInput(transcript);

    switch (session.state) {

      case OrderState.TAKING_ORDER: {
        // Check if customer is done ordering
        if (/\b(nee|neen|dat was het|dat is het|dat is alles|meer niet|niks meer|dat was alles|klaar)\b/i.test(input)) {
          if (session.order.length === 0) {
            return this.reply(session, 'Ik heb nog geen bestelling genoteerd. Wat mag het zijn?');
          }
          session.state = OrderState.DELIVERY_TYPE;
          return this.reply(session, 'Moet het geleverd worden of kom je het afhalen?');
        }

        // Check if customer just says they want to order (no items yet)
        if (/\b(bestellen|ik wil|mag ik|kan ik)\b/i.test(input) && !this.containsMenuItem(input)) {
          return this.reply(session, 'Ja, zeg het maar.');
        }

        // Extract items
        const items = extractItems(input, this.menuItems, this.menuPrices);
        if (items.length > 0) {
          session.order.push(...items);
          return this.reply(session, 'Ok, genoteerd. Nog iets anders?');
        }

        // Couldn't parse anything useful
        if (session.order.length === 0) {
          return this.reply(session, 'Ja, zeg het maar.');
        }
        return this.reply(session, 'Ok, genoteerd. Nog iets anders?');
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
        const name = transcript.trim().replace(/[.!?,]+$/g, '');
        if (name.length >= 2 && name.length <= 50) {
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
            return this.reply(session, 'Je bestelling wordt binnen 30 minuten geleverd. Dank je wel en eet smakelijk.');
          }
          return this.reply(session, 'Je bestelling is klaar over 20 minuten. Dank je wel en eet smakelijk.');
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
