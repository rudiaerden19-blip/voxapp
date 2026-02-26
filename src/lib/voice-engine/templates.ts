import { ParsedItem, DeliveryType } from './types';

export const TEMPLATES = {
  greeting: (businessName: string) =>
    `Goeiedag, ${businessName}! Wat mag het zijn?`,

  confirmMore: () =>
    `En verder nog iets?`,

  pickupOrDelivery: () =>
    `Wordt dat afhalen of thuis leveren?`,

  getName: () =>
    `Op welke naam is dat?`,

  getAddress: (name: string) =>
    `En op welk adres mogen we leveren, ${name}?`,

  confirmOrder: (items: ParsedItem[], deliveryType: DeliveryType, name: string, address: string | null) => {
    const itemList = items
      .map(i => `${i.qty === 1 ? 'een' : i.qty} ${i.name.toLowerCase()}`)
      .join(', ');
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2);
    const suffix = deliveryType === 'delivery'
      ? ` en dat leveren we bij ${address}.`
      : ` en dat is afhalen op naam van ${name}.`;
    return `Goed, ${name}, dat wordt dan: ${itemList}. Totaal: €${total}.${suffix} Klopt dat?`;
  },

  donePickup: (name: string) =>
    `Super, ${name}! Uw bestelling is geplaatst. Tot zo!`,

  doneDelivery: (name: string) =>
    `Super, ${name}! We leveren zo snel mogelijk bij u. Bedankt!`,

  notUnderstood: () =>
    `Sorry, ik heb u niet goed verstaan. Kunt u dat herhalen?`,

  itemNotFound: () =>
    `Sorry, ik ken dat artikel niet. Kunt u het anders zeggen?`,

  noItems: () =>
    `Ik heb nog geen bestelling genoteerd. Wat mag het zijn?`,
};

// State markers embedded in each template — used to detect current state from conversation history
export const STATE_MARKERS = {
  GREETING: ['wat mag het zijn', 'goeiedag'],
  CONFIRM_MORE: ['verder nog iets', 'iets anders', 'nog iets'],
  PICKUP_OR_DELIVERY: ['afhalen of', 'thuis leveren'],
  GET_NAME: ['welke naam is dat', 'op naam'],
  GET_ADDRESS: ['op welk adres', 'welk adres'],
  CONFIRM_ORDER: ['klopt dat', 'is dat juist'],
  DONE: ['tot zo', 'bedankt', 'bij u af', 'zo snel mogelijk'],
};
