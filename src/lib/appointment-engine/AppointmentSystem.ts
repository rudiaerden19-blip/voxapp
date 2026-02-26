// ============================================================
// APPOINTMENT SYSTEM — Deterministische afspraken state machine
// Gebruikt door: Vapi Custom LLM endpoint
// Sectoren: kapper, dokter, tandarts, kinesist, etc.
// ============================================================

export enum AppointmentState {
  DIENST     = 'DIENST',
  DATUM      = 'DATUM',
  TIJDSTIP   = 'TIJDSTIP',
  NAAM       = 'NAAM',
  TELEFOON   = 'TELEFOON',
  BEVESTIGING = 'BEVESTIGING',
  DONE       = 'DONE',
}

export interface ServiceConfig {
  name: string;
  duration_minutes: number;
}

export interface BusinessConfig {
  name: string;
  ai_name: string;
  welcome_message: string;
  services: ServiceConfig[];
}

export interface AppointmentSession {
  state: AppointmentState;
  dienst: string | null;
  datum: string | null;
  tijdstip: string | null;
  naam: string | null;
  telefoon: string | null;
  created_at: string;
}

export interface AppointmentData {
  timestamp: string;
  business_name: string;
  dienst: string;
  datum: string;
  tijdstip: string;
  naam: string;
  telefoon: string;
}

// ============================================================
// SESSION FACTORY
// ============================================================

export function createEmptySession(): AppointmentSession {
  return {
    state: AppointmentState.DIENST,
    dienst: null,
    datum: null,
    tijdstip: null,
    naam: null,
    telefoon: null,
    created_at: new Date().toISOString(),
  };
}

// ============================================================
// STT NORMALIZER
// ============================================================

const STT_MAP: [string, string][] = [
  ['maandags', 'maandag'],
  ['dinsdags', 'dinsdag'],
  ['woensdags', 'woensdag'],
  ['donderdags', 'donderdag'],
  ['vrijdags', 'vrijdag'],
  ['zaterdags', 'zaterdag'],
  ['mijn naam is', ''],
  ['ik ben', ''],
  ['het is', ''],
  ['naam is', ''],
];

function normalize(text: string): string {
  let t = text.toLowerCase().trim();
  for (const [wrong, correct] of STT_MAP) {
    t = t.replace(new RegExp(wrong, 'gi'), correct);
  }
  return t.replace(/\s{2,}/g, ' ').trim();
}

// ============================================================
// DATUM PARSER
// ============================================================

const DAG_NAMEN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

function extractDatum(text: string): string | null {
  const t = normalize(text);

  if (/morgen/.test(t)) return 'morgen';
  if (/overmorgen/.test(t)) return 'overmorgen';
  if (/vandaag/.test(t)) return 'vandaag';

  for (const dag of DAG_NAMEN) {
    if (t.includes(dag)) return dag;
  }

  // DD/MM of DD-MM
  const datumMatch = t.match(/(\d{1,2})[\/\-](\d{1,2})/);
  if (datumMatch) return `${datumMatch[1]}/${datumMatch[2]}`;

  // "de vijftiende" / "15de"
  const ordinalMatch = t.match(/(\d{1,2})(ste|de|e)\b/);
  if (ordinalMatch) return `de ${ordinalMatch[1]}e`;

  return null;
}

// ============================================================
// TIJDSTIP PARSER
// ============================================================

const UUR_WOORDEN: Record<string, number> = {
  één: 1, een: 1, twee: 2, drie: 3, vier: 4, vijf: 5, zes: 6,
  zeven: 7, acht: 8, negen: 9, tien: 10, elf: 11, twaalf: 12,
};

function extractTijdstip(text: string): string | null {
  const t = normalize(text);

  // "14u" / "14:00" / "14 uur"
  const digitMatch = t.match(/\b(\d{1,2})[h:u\s]?(\d{2})?\b/);
  if (digitMatch) {
    const uur = parseInt(digitMatch[1]);
    if (uur >= 7 && uur <= 20) {
      const min = digitMatch[2] ? `:${digitMatch[2]}` : 'u';
      return `${uur}${min}`;
    }
  }

  // "om twee uur" / "om tien uur"
  for (const [woord, uur] of Object.entries(UUR_WOORDEN)) {
    if (t.includes(`${woord} uur`) || t.includes(`om ${woord}`)) {
      return `${uur}u`;
    }
  }

  return null;
}

// ============================================================
// NAAM PARSER
// ============================================================

const NAAM_AFWIJZEN = new Set([
  'ja', 'nee', 'neen', 'ok', 'oké', 'goed', 'prima', 'klopt',
  'correct', 'juist', 'precies', 'perfect', 'akkoord', 'euh', 'uh',
]);

function extractNaam(text: string): string | null {
  let naam = normalize(text)
    .replace(/^(mijn naam is|ik ben|het is|naam is|dit is)\s*/i, '')
    .replace(/[.!?,]+$/, '')
    .trim();

  if (naam.length < 2 || naam.length > 40) return null;

  const woorden = naam.split(/\s+/);
  if (woorden.length > 4) return null;
  if (woorden.some(w => NAAM_AFWIJZEN.has(w))) return null;
  if (!/^[a-zA-ZÀ-ÿ\s'\-]+$/.test(naam)) return null;

  return naam.charAt(0).toUpperCase() + naam.slice(1);
}

// ============================================================
// TELEFOON PARSER
// ============================================================

const CIJFER_WOORDEN: Record<string, string> = {
  nul: '0', één: '1', een: '1', twee: '2', drie: '3', vier: '4',
  vijf: '5', zes: '6', zeven: '7', acht: '8', negen: '9',
  tien: '10', elf: '11', twaalf: '12',
};

function extractTelefoon(text: string): string | null {
  // Cijfers direct
  const digits = text.replace(/[\s\-\.]/g, '').match(/[\d+]{9,}/);
  if (digits) return digits[0];

  // Gesproken cijfers
  let converted = text.toLowerCase();
  for (const [woord, cijfer] of Object.entries(CIJFER_WOORDEN)) {
    converted = converted.replace(new RegExp(`\\b${woord}\\b`, 'g'), cijfer);
  }
  const spoken = converted.replace(/[^0-9+]/g, '');
  if (spoken.length >= 9) return spoken;

  return null;
}

// ============================================================
// DIENST MATCHER
// ============================================================

function matchDienst(text: string, services: ServiceConfig[]): string | null {
  const t = normalize(text);

  // Exacte match
  for (const s of services) {
    if (t.includes(s.name.toLowerCase())) return s.name;
  }

  // Gedeeltelijke match (eerste woord)
  for (const s of services) {
    const firstWord = s.name.toLowerCase().split(' ')[0];
    if (t.includes(firstWord) && firstWord.length >= 4) return s.name;
  }

  return null;
}

// ============================================================
// BEVESTIGINGS PARSER
// ============================================================

function isJa(text: string): boolean {
  return /\b(ja|joh|juist|correct|klopt|goed|prima|ok|oké|akkoord|precies|perfect|dat klopt)\b/i.test(text);
}

function isNee(text: string): boolean {
  return /\b(nee|neen|niet|fout|verkeerd|klopt niet|dat is niet)\b/i.test(text);
}

// ============================================================
// STATE MACHINE
// ============================================================

export class AppointmentSystem {
  constructor(private config: BusinessConfig) {}

  getGreeting(): string {
    return this.config.welcome_message;
  }

  getServicesText(): string {
    if (this.config.services.length === 0) return 'een behandeling';
    if (this.config.services.length === 1) return this.config.services[0].name;
    const names = this.config.services.map(s => s.name);
    return names.slice(0, -1).join(', ') + ' of ' + names[names.length - 1];
  }

  handle(
    session: AppointmentSession,
    transcript: string,
  ): { response: string; session: AppointmentSession } {
    const t = transcript.trim();

    switch (session.state) {

      case AppointmentState.DIENST: {
        const dienst = matchDienst(t, this.config.services);
        if (dienst) {
          session.dienst = dienst;
          session.state = AppointmentState.DATUM;
          return { response: `${dienst}, goed. Wanneer schikt het? Welke dag?`, session };
        }
        return {
          response: `Waarvoor wil u een afspraak? Wij bieden aan: ${this.getServicesText()}.`,
          session,
        };
      }

      case AppointmentState.DATUM: {
        const datum = extractDatum(t);
        if (datum) {
          session.datum = datum;
          session.state = AppointmentState.TIJDSTIP;
          return { response: `${datum.charAt(0).toUpperCase() + datum.slice(1)}, en op welk tijdstip?`, session };
        }
        return { response: 'Welke dag schikt het?', session };
      }

      case AppointmentState.TIJDSTIP: {
        const tijdstip = extractTijdstip(t);
        if (tijdstip) {
          session.tijdstip = tijdstip;
          session.state = AppointmentState.NAAM;
          return { response: `${tijdstip}, goed. Op welke naam mag ik de afspraak zetten?`, session };
        }
        return { response: 'Op welk tijdstip wilt u langskomen?', session };
      }

      case AppointmentState.NAAM: {
        const naam = extractNaam(t);
        if (naam) {
          session.naam = naam;
          session.state = AppointmentState.TELEFOON;
          return { response: `${naam}, en uw telefoonnummer?`, session };
        }
        return { response: 'Op welke naam mag ik de afspraak noteren?', session };
      }

      case AppointmentState.TELEFOON: {
        const tel = extractTelefoon(t);
        if (tel) {
          session.telefoon = tel;
          session.state = AppointmentState.BEVESTIGING;
          return {
            response: `Ik noteer: ${session.dienst} op ${session.datum} om ${session.tijdstip}, voor ${session.naam}. Klopt dat?`,
            session,
          };
        }
        return { response: 'Wat is uw telefoonnummer?', session };
      }

      case AppointmentState.BEVESTIGING: {
        if (isJa(t)) {
          session.state = AppointmentState.DONE;
          return {
            response: `Perfect ${session.naam}, uw afspraak is bevestigd. Tot ${session.datum}!`,
            session,
          };
        }
        if (isNee(t)) {
          // Reset naar begin
          session.state = AppointmentState.DIENST;
          session.dienst = null;
          session.datum = null;
          session.tijdstip = null;
          return { response: 'Geen probleem, laten we opnieuw beginnen. Waarvoor wil u een afspraak?', session };
        }
        return {
          response: `Klopt de afspraak: ${session.dienst} op ${session.datum} om ${session.tijdstip} voor ${session.naam}?`,
          session,
        };
      }

      case AppointmentState.DONE: {
        return { response: 'Uw afspraak is al bevestigd. Tot ziens!', session };
      }

      default:
        return { response: 'Waarvoor wil u een afspraak?', session };
    }
  }

  buildAppointmentData(session: AppointmentSession): AppointmentData {
    return {
      timestamp: new Date().toISOString(),
      business_name: this.config.name,
      dienst: session.dienst ?? '',
      datum: session.datum ?? '',
      tijdstip: session.tijdstip ?? '',
      naam: session.naam ?? '',
      telefoon: session.telefoon ?? '',
    };
  }
}
