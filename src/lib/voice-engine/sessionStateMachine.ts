/**
 * State machine op basis van directe sessie-state.
 * Geen history replay — leest en schrijft state direct.
 * Robuuster dan de history-based aanpak (geen VAPI afhankelijkheid).
 */

import { ConversationState, DeliveryType, MenuItem, ParsedItem } from './types';
import { TEMPLATES } from './templates';
import { parseMenuItems, detectYesNo, detectDelivery, extractName } from './menuParser';

export interface SessionState {
  state: ConversationState;
  orderItems: ParsedItem[];
  deliveryType: DeliveryType;
  customerName: string | null;
  deliveryAddress: string | null;
}

export interface TurnResult {
  nextState: ConversationState;
  response: string;
  updatedSession: SessionState;
  endCall: boolean;
}

/**
 * Verwerkt één gebruikersturn op basis van huidige sessie-state.
 */
export function processInput(
  session: SessionState,
  userInput: string,
  menu: MenuItem[],
  businessName: string
): TurnResult {
  const { state, orderItems, deliveryType, customerName, deliveryAddress } = session;

  switch (state) {
    case 'GREETING':
    case 'TAKING_ORDER': {
      const newItems = parseMenuItems(userInput, menu);
      if (newItems.length === 0) {
        return {
          nextState: 'TAKING_ORDER',
          response: TEMPLATES.itemNotFound(),
          updatedSession: session,
          endCall: false,
        };
      }
      const merged = mergeItems([...orderItems, ...newItems]);
      return {
        nextState: 'CONFIRM_MORE',
        response: TEMPLATES.confirmMore(),
        updatedSession: { ...session, state: 'CONFIRM_MORE', orderItems: merged },
        endCall: false,
      };
    }

    case 'CONFIRM_MORE': {
      const intent = detectYesNo(userInput);
      // Klant zegt "ja en ook een cola" → eerst ja detecteren, maar ook items parsen
      const extraItems = parseMenuItems(userInput, menu);
      if (extraItems.length > 0) {
        const merged = mergeItems([...orderItems, ...extraItems]);
        return {
          nextState: 'CONFIRM_MORE',
          response: TEMPLATES.confirmMore(),
          updatedSession: { ...session, state: 'CONFIRM_MORE', orderItems: merged },
          endCall: false,
        };
      }
      if (intent === 'no') {
        return {
          nextState: 'PICKUP_OR_DELIVERY',
          response: TEMPLATES.pickupOrDelivery(),
          updatedSession: { ...session, state: 'PICKUP_OR_DELIVERY' },
          endCall: false,
        };
      }
      // "ja" zonder extra items → vraag opnieuw wat ze willen
      return {
        nextState: 'TAKING_ORDER',
        response: TEMPLATES.confirmMore(),
        updatedSession: { ...session, state: 'TAKING_ORDER' },
        endCall: false,
      };
    }

    case 'PICKUP_OR_DELIVERY': {
      const delivery = detectDelivery(userInput);
      if (delivery === 'unknown') {
        return {
          nextState: 'PICKUP_OR_DELIVERY',
          response: TEMPLATES.pickupOrDelivery(),
          updatedSession: session,
          endCall: false,
        };
      }
      return {
        nextState: 'GET_NAME',
        response: TEMPLATES.getName(),
        updatedSession: { ...session, state: 'GET_NAME', deliveryType: delivery },
        endCall: false,
      };
    }

    case 'GET_NAME': {
      const name = extractName(userInput);
      if (deliveryType === 'delivery') {
        return {
          nextState: 'GET_ADDRESS',
          response: TEMPLATES.getAddress(name),
          updatedSession: { ...session, state: 'GET_ADDRESS', customerName: name },
          endCall: false,
        };
      }
      const confirmText = TEMPLATES.confirmOrder(orderItems, deliveryType, name, null);
      return {
        nextState: 'CONFIRM_ORDER',
        response: confirmText,
        updatedSession: { ...session, state: 'CONFIRM_ORDER', customerName: name },
        endCall: false,
      };
    }

    case 'GET_ADDRESS': {
      const address = userInput.trim();
      const name = customerName ?? 'u';
      const confirmText = TEMPLATES.confirmOrder(orderItems, deliveryType, name, address);
      return {
        nextState: 'CONFIRM_ORDER',
        response: confirmText,
        updatedSession: { ...session, state: 'CONFIRM_ORDER', deliveryAddress: address },
        endCall: false,
      };
    }

    case 'CONFIRM_ORDER': {
      const intent = detectYesNo(userInput);
      if (intent === 'no') {
        return {
          nextState: 'GREETING',
          response: `Geen probleem, laten we opnieuw beginnen. ${TEMPLATES.greeting(businessName)}`,
          updatedSession: {
            state: 'GREETING',
            orderItems: [],
            deliveryType: null,
            customerName: null,
            deliveryAddress: null,
          },
          endCall: false,
        };
      }
      const name = customerName ?? 'u';
      const doneText = deliveryType === 'delivery'
        ? TEMPLATES.doneDelivery(name)
        : TEMPLATES.donePickup(name);
      return {
        nextState: 'DONE',
        response: doneText,
        updatedSession: { ...session, state: 'DONE' },
        endCall: true,
      };
    }

    default:
      return {
        nextState: 'GREETING',
        response: TEMPLATES.greeting(businessName),
        updatedSession: { ...session, state: 'GREETING' },
        endCall: false,
      };
  }
}

/**
 * Genereert de openingszin (vóór de eerste user input).
 */
export function getGreeting(businessName: string): string {
  return TEMPLATES.greeting(businessName);
}

/**
 * Combineert dubbele items (zelfde id → qty optellen).
 */
function mergeItems(items: ParsedItem[]): ParsedItem[] {
  const map = new Map<string, ParsedItem>();
  for (const item of items) {
    if (map.has(item.id)) {
      map.get(item.id)!.qty += item.qty;
    } else {
      map.set(item.id, { ...item });
    }
  }
  return [...map.values()];
}
