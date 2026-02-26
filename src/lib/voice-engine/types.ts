export type ConversationState =
  | 'GREETING'
  | 'TAKING_ORDER'
  | 'CONFIRM_MORE'
  | 'PICKUP_OR_DELIVERY'
  | 'GET_NAME'
  | 'GET_ADDRESS'
  | 'CONFIRM_ORDER'
  | 'DONE';

export type DeliveryType = 'pickup' | 'delivery' | null;

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  is_available: boolean;
}

export interface ParsedItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface OrderContext {
  items: ParsedItem[];
  deliveryType: DeliveryType;
  customerName: string | null;
  deliveryAddress: string | null;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StateMachineResult {
  state: ConversationState;
  response: string;
  endCall?: boolean;
}
