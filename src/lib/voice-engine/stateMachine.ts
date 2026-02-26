import {
  ConversationState,
  DeliveryType,
  Message,
  MenuItem,
  OrderContext,
  ParsedItem,
  StateMachineResult,
} from './types';
import { TEMPLATES, STATE_MARKERS } from './templates';
import { parseMenuItems, detectYesNo, detectDelivery, extractName } from './menuParser';

/**
 * Determines the current state by looking at the last assistant message.
 * Priority order matters — check most specific states first.
 * GREETING markers (goeiedag / wat mag het zijn) map to TAKING_ORDER
 * because the greeting has already been spoken; we're now collecting items.
 */
function deriveState(messages: Message[]): ConversationState {
  const assistantMsgs = messages.filter(m => m.role === 'assistant');
  if (assistantMsgs.length === 0) return 'GREETING';

  const last = assistantMsgs[assistantMsgs.length - 1].content.toLowerCase();

  if (STATE_MARKERS.DONE.some(m => last.includes(m))) return 'DONE';
  if (STATE_MARKERS.CONFIRM_ORDER.some(m => last.includes(m))) return 'CONFIRM_ORDER';
  if (STATE_MARKERS.GET_ADDRESS.some(m => last.includes(m))) return 'GET_ADDRESS';
  if (STATE_MARKERS.GET_NAME.some(m => last.includes(m))) return 'GET_NAME';
  if (STATE_MARKERS.PICKUP_OR_DELIVERY.some(m => last.includes(m))) return 'PICKUP_OR_DELIVERY';
  if (STATE_MARKERS.CONFIRM_MORE.some(m => last.includes(m))) return 'CONFIRM_MORE';
  // Greeting markers → we already greeted, now taking order
  if (STATE_MARKERS.GREETING.some(m => last.includes(m))) return 'TAKING_ORDER';

  return 'TAKING_ORDER';
}

/**
 * Rebuilds order items from conversation history.
 * Parses all user messages that came right after GREETING or CONFIRM_MORE states.
 */
function rebuildOrder(messages: Message[], menu: MenuItem[]): ParsedItem[] {
  const items: ParsedItem[] = [];

  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role !== 'user') continue;

    const prev = messages[i - 1];
    if (prev?.role !== 'assistant') continue;

    const prevLower = prev.content.toLowerCase();
    const isOrderPrompt =
      STATE_MARKERS.GREETING.some(m => prevLower.includes(m)) ||
      STATE_MARKERS.CONFIRM_MORE.some(m => prevLower.includes(m));

    if (!isOrderPrompt) continue;

    const parsed = parseMenuItems(msg.content, menu);
    items.push(...parsed);
  }

  return items;
}

/**
 * Extracts delivery type from conversation history.
 */
function rebuildDeliveryType(messages: Message[]): DeliveryType {
  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role !== 'user') continue;

    const prev = messages[i - 1];
    if (prev?.role !== 'assistant') continue;

    const prevLower = prev.content.toLowerCase();
    if (STATE_MARKERS.PICKUP_OR_DELIVERY.some(m => prevLower.includes(m))) {
      const result = detectDelivery(msg.content);
      if (result !== 'unknown') return result;
    }
  }
  return null;
}

/**
 * Extracts customer name from conversation history.
 */
function rebuildName(messages: Message[]): string | null {
  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role !== 'user') continue;

    const prev = messages[i - 1];
    if (prev?.role !== 'assistant') continue;

    const prevLower = prev.content.toLowerCase();
    if (STATE_MARKERS.GET_NAME.some(m => prevLower.includes(m))) {
      return extractName(msg.content);
    }
  }
  return null;
}

/**
 * Extracts delivery address from conversation history.
 */
function rebuildAddress(messages: Message[]): string | null {
  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role !== 'user') continue;

    const prev = messages[i - 1];
    if (prev?.role !== 'assistant') continue;

    const prevLower = prev.content.toLowerCase();
    if (STATE_MARKERS.GET_ADDRESS.some(m => prevLower.includes(m))) {
      return msg.content.trim();
    }
  }
  return null;
}

/**
 * Core state machine: takes messages + menu, returns next response.
 */
export function processConversation(
  messages: Message[],
  menu: MenuItem[],
  businessName: string
): StateMachineResult {
  const currentState = deriveState(messages);
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';

  const order = rebuildOrder(messages, menu);
  const deliveryType = rebuildDeliveryType(messages);
  const customerName = rebuildName(messages);
  const deliveryAddress = rebuildAddress(messages);

  switch (currentState) {
    case 'GREETING':
      return {
        state: 'TAKING_ORDER',
        response: TEMPLATES.greeting(businessName),
      };

    case 'TAKING_ORDER': {
      const newItems = parseMenuItems(lastUserMsg, menu);
      if (newItems.length === 0) {
        return {
          state: 'TAKING_ORDER',
          response: TEMPLATES.itemNotFound(),
        };
      }
      return {
        state: 'CONFIRM_MORE',
        response: TEMPLATES.confirmMore(),
      };
    }

    case 'CONFIRM_MORE': {
      const intent = detectYesNo(lastUserMsg);
      if (intent === 'yes' || intent === 'unknown') {
        // Check if they also added items inline (e.g. "ja, en ook een cola")
        return {
          state: 'TAKING_ORDER',
          response: TEMPLATES.confirmMore(),
        };
      }
      // No more items → ask pickup or delivery
      return {
        state: 'PICKUP_OR_DELIVERY',
        response: TEMPLATES.pickupOrDelivery(),
      };
    }

    case 'PICKUP_OR_DELIVERY': {
      const delivery = detectDelivery(lastUserMsg);
      if (delivery === 'unknown') {
        return {
          state: 'PICKUP_OR_DELIVERY',
          response: TEMPLATES.pickupOrDelivery(),
        };
      }
      return {
        state: 'GET_NAME',
        response: TEMPLATES.getName(),
      };
    }

    case 'GET_NAME': {
      const name = extractName(lastUserMsg);
      if (deliveryType === 'delivery') {
        return {
          state: 'GET_ADDRESS',
          response: TEMPLATES.getAddress(name),
        };
      }
      return {
        state: 'CONFIRM_ORDER',
        response: TEMPLATES.confirmOrder(order, deliveryType, name, null),
      };
    }

    case 'GET_ADDRESS': {
      const name = customerName ?? 'u';
      const address = lastUserMsg.trim();
      return {
        state: 'CONFIRM_ORDER',
        response: TEMPLATES.confirmOrder(order, deliveryType, name, address),
      };
    }

    case 'CONFIRM_ORDER': {
      const intent = detectYesNo(lastUserMsg);
      if (intent === 'no') {
        return {
          state: 'TAKING_ORDER',
          response: `Geen probleem, laten we opnieuw beginnen. ${TEMPLATES.greeting(businessName)}`,
        };
      }
      const name = customerName ?? 'u';
      const isDone = deliveryType === 'delivery'
        ? TEMPLATES.doneDelivery(name)
        : TEMPLATES.donePickup(name);
      return {
        state: 'DONE',
        response: isDone,
        endCall: true,
      };
    }

    case 'DONE':
      return {
        state: 'DONE',
        response: TEMPLATES.donePickup(customerName ?? 'u'),
        endCall: true,
      };

    default:
      return {
        state: 'GREETING',
        response: TEMPLATES.greeting(businessName),
      };
  }
}

/**
 * Builds the full order context for saving to the database.
 */
export function buildOrderContext(messages: Message[], menu: MenuItem[]): OrderContext {
  return {
    items: rebuildOrder(messages, menu),
    deliveryType: rebuildDeliveryType(messages),
    customerName: rebuildName(messages),
    deliveryAddress: rebuildAddress(messages),
  };
}
