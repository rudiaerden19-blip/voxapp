// State machine. LLM determines NOTHING about flow. States are fixed.

const OrderState = {
  TAKING_ORDER: 'TAKING_ORDER',
  GET_NAME_PHONE: 'GET_NAME_PHONE',
  GET_NAME: 'GET_NAME',
  GET_PHONE: 'GET_PHONE',
  DELIVERY_TYPE: 'DELIVERY_TYPE',
  GET_ADDRESS: 'GET_ADDRESS',
  DONE: 'DONE',
};

function createSession() {
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

class VoiceOrderSystem {
  constructor(menu, config) {
    this.menuItems = menu.items;
    this.menuPrices = menu.prices;
    this.modifiers = menu.modifiers;
    this.config = config;
  }

  getGreeting() {
    return this.config.welcome_message;
  }

  handle(session, transcript, conversationId, mappedItems, namePhone) {
    const cid = conversationId || 'unknown';
    const stateBefore = session.state;

    console.log(JSON.stringify({
      _tag: 'STATE', step: 'input', cid, state: stateBefore,
      transcript: transcript.slice(0, 100),
    }));

    switch (session.state) {

      case OrderState.TAKING_ORDER: {
        const items = (mappedItems && mappedItems.length > 0)
          ? mappedItems
          : this._regexExtract(transcript);

        const source = (mappedItems && mappedItems.length > 0) ? 'gemini' : 'regex';

        console.log(JSON.stringify({
          _tag: 'STATE', step: 'extract', cid, source,
          items_count: items.length, items,
        }));

        if (items.length > 0) {
          session.order.push(...items);
          session.state = OrderState.GET_NAME_PHONE;
          return this._reply(session,
            'Ok, dat heb ik genoteerd. Mag ik uw naam en telefoonnummer alstublieft?',
            cid, stateBefore);
        }

        return this._reply(session,
          'Excuseer, dat heb ik niet goed verstaan. Kan u uw bestelling herhalen?',
          cid, stateBefore);
      }

      case OrderState.GET_NAME_PHONE:
      case OrderState.GET_NAME: {
        const nameResult = namePhone?.name || null;
        if (nameResult) session.name = nameResult;

        if (!session.name) {
          session.state = OrderState.GET_NAME;
          return this._reply(session, 'Mag ik uw naam alstublieft?', cid, stateBefore);
        }

        session.state = OrderState.GET_PHONE;
        return this._reply(session, `Ok ${session.name}, en uw telefoonnummer?`, cid, stateBefore);
      }

      case OrderState.GET_PHONE: {
        const phoneResult = namePhone?.phone || null;
        if (phoneResult) session.phone = phoneResult;

        if (!session.phone) {
          return this._reply(session, 'Kan u uw telefoonnummer herhalen alstublieft?', cid, stateBefore);
        }

        if (this.config.delivery_enabled) {
          session.state = OrderState.DELIVERY_TYPE;
          return this._reply(session,
            `Ok ${session.name}, wil je het komen afhalen of moeten wij het leveren?`,
            cid, stateBefore);
        }

        session.delivery_type = 'afhalen';
        session.state = OrderState.DONE;
        return this._reply(session,
          `Ok ${session.name}, jouw bestelling staat klaar binnen ${this.config.prep_time_pickup} minuten. Bedankt en eet smakelijk.`,
          cid, stateBefore);
      }

      case OrderState.DELIVERY_TYPE: {
        const input = transcript.toLowerCase();
        if (/\blever|bezorg|brengen|thuis\b/.test(input)) {
          session.delivery_type = 'levering';
          session.state = OrderState.GET_ADDRESS;
          return this._reply(session, 'Mag ik je adres alstublieft?', cid, stateBefore);
        }
        if (/\bafhal|ophal|halen|ophalen|afhalen|komen|kom\b/.test(input)) {
          session.delivery_type = 'afhalen';
          session.state = OrderState.DONE;
          return this._reply(session,
            `Ok, jouw bestelling staat klaar binnen ${this.config.prep_time_pickup} minuten. Bedankt en eet smakelijk.`,
            cid, stateBefore);
        }
        return this._reply(session,
          'Wil je het komen afhalen of moeten wij het leveren?',
          cid, stateBefore);
      }

      case OrderState.GET_ADDRESS: {
        const address = transcript.trim().replace(/[.!?,]+$/g, '');
        if (address.length >= 3) {
          session.address = address;
          session.state = OrderState.DONE;
          return this._reply(session,
            `Ok ${session.name}, onze chauffeur stopt bij u binnen ${this.config.prep_time_delivery} minuten. Bedankt voor je bestelling en eet smakelijk.`,
            cid, stateBefore);
        }
        return this._reply(session, 'Mag ik je adres alstublieft?', cid, stateBefore);
      }

      case OrderState.DONE:
        return this._reply(session,
          'Uw bestelling is al geplaatst. Dank u wel en tot ziens.',
          cid, stateBefore);

      default:
        return this._reply(session, 'Excuseer, kan u dat herhalen?', cid, stateBefore);
    }
  }

  buildOrderData(session) {
    return {
      timestamp: new Date().toISOString(),
      name: session.name,
      delivery_type: session.delivery_type,
      address: session.address,
      phone: session.phone,
      items: session.order,
    };
  }

  buildReceiptNotes(session) {
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

  // Regex fallback — no AI
  _regexExtract(text) {
    const NUM_WORDS = {
      een: 1, één: 1, twee: 2, drie: 3, vier: 4, vijf: 5,
      zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10,
    };
    const items = [];
    const parts = text
      .split(/[.]\s*|,\s*|\s+(?:en|eén|één)\s+/i)
      .map(p => p.trim())
      .filter(p => p.length > 2);

    for (let part of parts) {
      let qty = 1;
      part = part.replace(/^(doe daar|doe er|zet er|en|ook|in|dan|ik wil\w*|ik wou|graag|nog|geef mij|mag ik)\s+/i, '').trim();

      const numMatch = part.match(/^(\d+)\s*[x×]?\s*/);
      if (numMatch) {
        qty = parseInt(numMatch[1]) || 1;
        part = part.substring(numMatch[0].length).trim();
      } else {
        const wordMatch = part.match(/^(een|één|eén|twee|drie|vier|vijf|zes|zeven|acht|negen|tien)\s+/i);
        if (wordMatch) {
          qty = NUM_WORDS[wordMatch[1].toLowerCase()] || 1;
          part = part.substring(wordMatch[0].length).trim();
        }
      }

      part = part.replace(/^(een|één|eén|ene|blikje|bakje|potje|portie|stuk)\s+/i, '').trim();
      part = part.replace(/\s+(bij|erbij|alsjeblieft|aub)$/i, '').trim();
      if (part.length < 2) continue;

      const lower = part.toLowerCase();
      let matched = null;

      for (const menuItem of this.menuItems) {
        if (lower.includes(menuItem)) {
          if (!matched || menuItem.length > matched.length) {
            matched = menuItem;
          }
        }
      }

      if (!matched) continue;

      const price = this.menuPrices[matched] || 0;
      const existing = items.find(i => i.product === matched);
      if (existing) {
        existing.quantity += qty;
      } else {
        items.push({ product: matched, quantity: qty, price });
      }
    }

    return items;
  }

  _reply(session, text, cid, stateBefore) {
    console.log(JSON.stringify({
      _tag: 'STATE', step: 'reply', cid,
      from: stateBefore, to: session.state,
      response: text.slice(0, 80),
    }));
    return { response: text, session };
  }
}

module.exports = { OrderState, VoiceOrderSystem, createSession };
