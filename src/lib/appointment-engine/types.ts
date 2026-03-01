export enum AppointmentState {
  GREETING = 'GREETING',
  COLLECT_SERVICE = 'COLLECT_SERVICE',
  COLLECT_DATE = 'COLLECT_DATE',
  COLLECT_TIME = 'COLLECT_TIME',
  COLLECT_NAME = 'COLLECT_NAME',
  CHECK_AVAILABILITY = 'CHECK_AVAILABILITY',
  CONFIRM = 'CONFIRM',
  BOOK = 'BOOK',
  SUCCESS = 'SUCCESS',
  ESCALATE = 'ESCALATE',
  ERROR = 'ERROR',
}

export interface CollectedData {
  service: string | null;
  date: string | null;       // ISO-8601 (YYYY-MM-DD)
  time: string | null;       // HH:mm
  name: string | null;
  phone: string | null;
}

export interface SessionState {
  callId: string;
  businessId: string;
  state: AppointmentState;
  collected: CollectedData;
  retries: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export type IntentType =
  | 'book_appointment'
  | 'cancel_appointment'
  | 'reschedule_appointment'
  | 'question'
  | 'confirm_yes'
  | 'confirm_no'
  | 'provide_info'
  | 'greeting'
  | 'unclear';

export interface ParsedIntent {
  intent: IntentType;
  entities: {
    service?: string;
    date?: string;      // ISO-8601
    time?: string;      // HH:mm
    name?: string;
    phone?: string;
    rawDay?: string;    // "dinsdag", "morgen", etc.
  };
  confidence: number;
  raw: string;
}

export interface TransitionResult {
  newState: AppointmentState;
  response: string;
  shouldBook: boolean;
  shouldCheckAvailability: boolean;
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
  alternatives?: string[];  // HH:mm format
  openingHours?: { open: string; close: string };
}

export interface BusinessConfig {
  id: string;
  name: string;
  type: string;
  opening_hours: Record<string, { open: string; close: string; closed: boolean }> | null;
}

export interface ServiceInfo {
  id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
}
