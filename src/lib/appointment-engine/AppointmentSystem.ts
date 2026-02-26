// ============================================================
// APPOINTMENT SYSTEM — Deterministische afspraken state machine
// Flow: DIENST → DATUM_TIJD → [agendacheck] → NAAM → DONE
// Telefoonnummer komt automatisch via Vapi caller ID.
// ============================================================

export enum AppointmentState {
  DIENST      = 'DIENST',
  DATUM_TIJD  = 'DATUM_TIJD',
  NAAM        = 'NAAM',
  DONE        = 'DONE',
}

export interface ServiceConfig {
  name: string;
  duration_minutes: number;
}

export interface BusinessConfig {
  name: string;
  ai_name: string;
  services: ServiceConfig[];
}

export interface AppointmentSession {
  state: AppointmentState;
  dienst: string | null;
  datum: string | null;       // leesbaar: "morgen", "maandag", "15/03"
  datum_iso: string | null;   // YYYY-MM-DD voor DB
  tijdstip: string | null;    // leesbaar: "16u", "14:30"
  tijdstip_h: number | null;  // uur als getal voor DB check
  naam: string | null;
  telefoon: string | null;    // ingevuld door endpoint via caller ID
  created_at: string;
}

export interface AppointmentData {
  dienst: string;
  datum: string;
  datum_iso: string;
  tijdstip: string;
  naam: string;
  telefoon: string;
}

// ============================================================
// SESSION
// ============================================================

export function createEmptySession(): AppointmentSession {
  return {
    state: AppointmentState.DIENST,
    dienst: null,
    datum: null,
    datum_iso: null,
    tijdstip: null,
    tijdstip_h: null,
    naam: null,
    telefoon: null,
    created_at: new Date().toISOString(),
  };
}

// ============================================================
// DATUM PARSER — zet spraak om naar leesbaar + ISO datum
// ============================================================

const DAG_OFFSET: Record<string, number> = {
  maandag: 1, dinsdag: 2, woensdag: 3,
  donderdag: 4, vrijdag: 5, zaterdag: 6,
};

// Deepgram schrijft dagnamen soms fout — correcties
const DAG_CORRECTIES: Record<string, string> = {
  dinddag: 'dinsdag', dinkdag: 'dinsdag', dindag: 'dinsdag', dinsag: 'dinsdag',
  woendag: 'woensdag', winsdag: 'woensdag', wendag: 'woensdag',
  maanda: 'maandag', maadag: 'maandag',
  donddag: 'donderdag', donderda: 'donderdag',
  vrijda: 'vrijdag', vrida: 'vrijdag',
  zaterddag: 'zaterdag', zaterda: 'zaterdag',
  zonda: 'zondag', zonddag: 'zondag',
};

function normaliseerDagen(text: string): string {
  return text.replace(/\b\w+\b/g, w => DAG_CORRECTIES[w.toLowerCase()] || w);
}

function dagNaarISO(dagNaam: string): string {
  const today = new Date();
  const todayDay = today.getDay(); // 0=zo, 1=ma, ...
  const target = DAG_OFFSET[dagNaam];
  let diff = target - todayDay;
  if (diff <= 0) diff += 7;
  const date = new Date(today);
  date.setDate(today.getDate() + diff);
  return date.toISOString().split('T')[0];
}

export function parseDatum(text: string): { leesbaar: string; iso: string } | null {
  const t = normaliseerDagen(text.toLowerCase());

  if (/morgen/.test(t)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return { leesbaar: 'morgen', iso: d.toISOString().split('T')[0] };
  }
  if (/overmorgen/.test(t)) {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return { leesbaar: 'overmorgen', iso: d.toISOString().split('T')[0] };
  }
  if (/vandaag/.test(t)) {
    return { leesbaar: 'vandaag', iso: new Date().toISOString().split('T')[0] };
  }

  for (const dag of Object.keys(DAG_OFFSET)) {
    if (t.includes(dag)) {
      return { leesbaar: dag, iso: dagNaarISO(dag) };
    }
  }

  // DD/MM of DD-MM
  const dmMatch = t.match(/(\d{1,2})[\/\-](\d{1,2})/);
  if (dmMatch) {
    const d = parseInt(dmMatch[1]);
    const m = parseInt(dmMatch[2]);
    const year = new Date().getFullYear();
    const iso = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return { leesbaar: `${d}/${m}`, iso };
  }

  return null;
}

// ============================================================
// TIJDSTIP PARSER
// ============================================================

const UUR_WOORDEN: Record<string, number> = {
  één: 1, een: 1, twee: 2, drie: 3, vier: 4, vijf: 5, zes: 6,
  zeven: 7, acht: 8, negen: 9, tien: 10, elf: 11, twaalf: 12,
};

export function parseTijdstip(text: string): { leesbaar: string; uur: number } | null {
  const t = text.toLowerCase();

  // "16u", "16:00", "16 uur", "om 16" — uren 7-20
  const digitMatch = t.match(/\b(1[0-9]|[7-9])(?::(\d{2})|h|u| uur)?\b/);
  if (digitMatch) {
    const uur = parseInt(digitMatch[1]);
    if (uur >= 7 && uur <= 20) {
      const min = digitMatch[2] ? `:${digitMatch[2]}` : 'u';
      return { leesbaar: `${uur}${min}`, uur };
    }
  }

  // "om 2", "2 uur", "om 3" → interpreteer als PM (afspraken zijn overdag)
  const pmMatch = t.match(/\b(?:om\s+)?([1-6])(?:\s+uur|u|h)?\b/);
  if (pmMatch) {
    const uur = parseInt(pmMatch[1]) + 12; // 2 → 14, 3 → 15, etc.
    return { leesbaar: `${uur}u`, uur };
  }

  // Woorden: "om twee uur", "om tien"
  for (const [woord, uur] of Object.entries(UUR_WOORDEN)) {
    if (new RegExp(`\\b(om\\s+)?${woord}(\\s+uur)?\\b`).test(t)) {
      const h = uur >= 7 ? uur : uur + 12; // "twee" → 14u
      return { leesbaar: `${h}u`, uur: h };
    }
  }

  return null;
}

// ============================================================
// DIENST MATCHER
// ============================================================

function matchDienst(text: string, services: ServiceConfig[]): string | null {
  const t = text.toLowerCase();
  for (const s of services) {
    if (t.includes(s.name.toLowerCase())) return s.name;
  }
  // Eerste woord match (min 4 tekens)
  for (const s of services) {
    const first = s.name.toLowerCase().split(' ')[0];
    if (first.length >= 4 && t.includes(first)) return s.name;
  }
  // Als klant gewoon "ja" zegt → accepteer als algemene afspraak
  if (/\b(ja|graag|ok|oké|goed)\b/i.test(text)) return 'Afspraak';
  return null;
}

// ============================================================
// NAAM PARSER
// ============================================================

const NAAM_AFWIJZEN = new Set([
  'ja', 'nee', 'neen', 'ok', 'oké', 'goed', 'prima', 'klopt',
  'correct', 'juist', 'perfect', 'akkoord', 'euh', 'uh', 'graag',
]);

export function parseNaam(text: string): string | null {
  let naam = text
    .replace(/^(mijn naam is|ik ben|het is|naam is|dit is|ik heet)\s*/i, '')
    .replace(/[.!?,]+$/, '')
    .trim();

  if (naam.length < 2 || naam.length > 30) return null;
  const woorden = naam.split(/\s+/);
  if (woorden.length > 3) return null;
  if (woorden.some(w => NAAM_AFWIJZEN.has(w.toLowerCase()))) return null;
  if (!/^[a-zA-ZÀ-ÿ\s'\-]+$/.test(naam)) return null;

  return naam.charAt(0).toUpperCase() + naam.slice(1);
}

// ============================================================
// STATE MACHINE
// ============================================================

export interface HandleResult {
  response: string;
  session: AppointmentSession;
  shouldCheckAvailability: boolean; // true = endpoint moet DB checken
}

export class AppointmentSystem {
  constructor(private config: BusinessConfig) {}

  getGreeting(): string {
    return `Hallo met kapsalon ${this.config.name}, met ${this.config.ai_name}. Wil je graag een afspraak maken?`;
  }

  getServicesText(): string {
    if (this.config.services.length === 0) return 'een behandeling';
    const names = this.config.services
      .filter(s => s.name !== 'Afspraak')
      .map(s => s.name);
    if (names.length === 0) return 'een behandeling';
    if (names.length === 1) return names[0];
    return names.slice(0, -1).join(', ') + ' of ' + names[names.length - 1];
  }

  handle(
    session: AppointmentSession,
    transcript: string,
  ): HandleResult {
    const t = transcript.trim();

    switch (session.state) {

      // ── STAP 1: WELKE DIENST ─────────────────────────────
      case AppointmentState.DIENST: {
        const dienst = matchDienst(t, this.config.services);
        if (dienst) {
          session.dienst = dienst;
          session.state = AppointmentState.DATUM_TIJD;
          return {
            response: `Dat kan. Welke dag en hoe laat?`,
            session,
            shouldCheckAvailability: false,
          };
        }
        return {
          response: `Waarvoor wil je een afspraak? Wij doen ${this.getServicesText()}.`,
          session,
          shouldCheckAvailability: false,
        };
      }

      // ── STAP 2: DATUM + TIJDSTIP ─────────────────────────
      case AppointmentState.DATUM_TIJD: {
        const datum = parseDatum(t);
        const tijdstip = parseTijdstip(t);

        // Sla op wat we nieuw gevonden hebben
        if (datum) {
          session.datum = datum.leesbaar;
          session.datum_iso = datum.iso;
        }
        if (tijdstip) {
          session.tijdstip = tijdstip.leesbaar;
          session.tijdstip_h = tijdstip.uur;
        }

        // Beide bekend (uit huidig bericht OF eerder in de sessie)
        if (session.datum_iso && session.tijdstip_h !== null) {
          return {
            response: '',
            session,
            shouldCheckAvailability: true,
          };
        }

        // Alleen datum bekend
        if (session.datum_iso && session.tijdstip_h === null) {
          return {
            response: `En hoe laat?`,
            session,
            shouldCheckAvailability: false,
          };
        }

        // Alleen tijdstip bekend
        if (!session.datum_iso && session.tijdstip_h !== null) {
          return {
            response: `En welke dag?`,
            session,
            shouldCheckAvailability: false,
          };
        }

        return {
          response: `Welke dag en hoe laat?`,
          session,
          shouldCheckAvailability: false,
        };
      }

      // ── STAP 3: NAAM ─────────────────────────────────────
      case AppointmentState.NAAM: {
        const naam = parseNaam(t);
        if (naam) {
          session.naam = naam;
          session.state = AppointmentState.DONE;
          return {
            response: `Ok ${naam}, ${session.datum} om ${session.tijdstip} is genoteerd. Tot dan!`,
            session,
            shouldCheckAvailability: false,
          };
        }
        return {
          response: `Mag ik je voornaam?`,
          session,
          shouldCheckAvailability: false,
        };
      }

      case AppointmentState.DONE: {
        return {
          response: `Je afspraak is al ingeboekt. Tot ziens!`,
          session,
          shouldCheckAvailability: false,
        };
      }

      default:
        return {
          response: `Waarvoor wil je een afspraak?`,
          session,
          shouldCheckAvailability: false,
        };
    }
  }

  // Beschikbaar → vraag naam
  availableResponse(session: AppointmentSession): { response: string; session: AppointmentSession } {
    session.state = AppointmentState.NAAM;
    return {
      response: `Ja hoor, dat kan! Mag ik je voornaam? Dan boek ik dat in. Je nummer heb ik al.`,
      session,
    };
  }

  // Niet beschikbaar → vraag andere datum
  unavailableResponse(session: AppointmentSession): { response: string; session: AppointmentSession } {
    const dag = session.datum || 'Die dag';
    const uur = session.tijdstip || 'dat uur';
    session.datum = null;
    session.datum_iso = null;
    session.tijdstip = null;
    session.tijdstip_h = null;
    session.state = AppointmentState.DATUM_TIJD;
    return {
      response: `${dag} om ${uur} lukt helaas niet. Welke andere dag en uur past u?`,
      session,
    };
  }

  buildAppointmentData(session: AppointmentSession): AppointmentData {
    return {
      dienst: session.dienst ?? 'Afspraak',
      datum: session.datum ?? '',
      datum_iso: session.datum_iso ?? '',
      tijdstip: session.tijdstip ?? '',
      naam: session.naam ?? '',
      telefoon: session.telefoon ?? '',
    };
  }
}
