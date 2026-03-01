import { ParsedIntent, IntentType } from './types';

const DAGEN: Record<string, number> = {
  zondag: 0, maandag: 1, dinsdag: 2, woensdag: 3,
  donderdag: 4, vrijdag: 5, zaterdag: 6,
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

const JA_WOORDEN = ['ja', 'yes', 'jep', 'joep', 'jaa', 'jawel', 'klopt', 'oké', 'oke', 'ok', 'goed', 'prima', 'akkoord', 'dat klopt', 'dat is goed', 'graag', 'doe maar', 'bevestig'];
const NEE_WOORDEN = ['nee', 'neen', 'no', 'niet', 'liever niet', 'toch niet', 'annuleer', 'stop', 'laat maar'];

/**
 * Parse een dag-naam naar eerstvolgende ISO-8601 datum.
 * Begrijpt: "maandag", "dinsdag", "morgen", "overmorgen", "vandaag", ISO dates.
 */
export function parseDag(input: string): string | null {
  const lower = input.toLowerCase().trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(lower)) return lower;

  const nu = new Date();

  if (lower === 'vandaag' || lower === 'today') {
    return nu.toISOString().split('T')[0];
  }
  if (lower === 'morgen' || lower === 'tomorrow') {
    const d = new Date(nu);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  if (lower === 'overmorgen') {
    const d = new Date(nu);
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }

  for (const [naam, nr] of Object.entries(DAGEN)) {
    if (lower.includes(naam) || (naam.length >= 4 && lower.includes(naam.slice(0, 4)))) {
      const vandaag = nu.getDay();
      let diff = nr - vandaag;
      if (diff <= 0) diff += 7;
      const d = new Date(nu);
      d.setDate(nu.getDate() + diff);
      return d.toISOString().split('T')[0];
    }
  }

  return null;
}

/**
 * Parse een tijdsaanduiding naar HH:mm.
 * Begrijpt: "10 uur", "half 3", "14:30", "3 uur 's middags", "kwart voor 5".
 */
export function parseTijd(input: string): string | null {
  const lower = input.toLowerCase().trim();

  // HH:mm of H:mm
  const exactMatch = lower.match(/(\d{1,2}):(\d{2})/);
  if (exactMatch) {
    const h = parseInt(exactMatch[1]);
    const m = parseInt(exactMatch[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  // "half 3" → 14:30 (in context van werkuren)
  const halfMatch = lower.match(/half\s+(\d{1,2})/);
  if (halfMatch) {
    let h = parseInt(halfMatch[1]) - 1; // half 3 = 2:30
    if (h < 7) h += 12; // werkuren aanname
    return `${String(h).padStart(2, '0')}:30`;
  }

  // "kwart voor 5" → 16:45
  const kwartVoorMatch = lower.match(/kwart\s+voor\s+(\d{1,2})/);
  if (kwartVoorMatch) {
    let h = parseInt(kwartVoorMatch[1]) - 1;
    if (h < 7) h += 12;
    return `${String(h).padStart(2, '0')}:45`;
  }

  // "kwart over 3" → 15:15
  const kwartOverMatch = lower.match(/kwart\s+over\s+(\d{1,2})/);
  if (kwartOverMatch) {
    let h = parseInt(kwartOverMatch[1]);
    if (h < 7) h += 12;
    return `${String(h).padStart(2, '0')}:15`;
  }

  // "10 uur", "om 10", "10u", "om 3 uur"
  const uurMatch = lower.match(/(?:om\s+)?(\d{1,2})\s*(?:uur|u\b|h\b)/);
  if (uurMatch) {
    let h = parseInt(uurMatch[1]);
    if (h < 7) h += 12; // werkuren aanname
    return `${String(h).padStart(2, '0')}:00`;
  }

  // Bare getal in context: "om 10", "om 3"
  const bareOm = lower.match(/om\s+(\d{1,2})(?:\s|$)/);
  if (bareOm) {
    let h = parseInt(bareOm[1]);
    if (h < 7) h += 12;
    return `${String(h).padStart(2, '0')}:00`;
  }

  // Standalone getal (alleen als het een redelijk uur is)
  const standalone = lower.match(/^(\d{1,2})$/);
  if (standalone) {
    let h = parseInt(standalone[1]);
    if (h >= 7 && h <= 20) {
      return `${String(h).padStart(2, '0')}:00`;
    }
  }

  return null;
}

/**
 * Detecteer of de input een ja of nee is.
 */
function detectJaNee(input: string): 'yes' | 'no' | null {
  const lower = input.toLowerCase().trim();
  for (const w of JA_WOORDEN) {
    if (lower === w || lower.startsWith(w + ' ') || lower.startsWith(w + ',')) return 'yes';
  }
  for (const w of NEE_WOORDEN) {
    if (lower === w || lower.startsWith(w + ' ') || lower.startsWith(w + ',')) return 'no';
  }
  return null;
}

/**
 * Probeer een naam te extraheren.
 * Simpele heuristiek: als de input 1-3 woorden is die met hoofdletter beginnen
 * of als er "mijn naam is" / "ik ben" in staat.
 */
function extractNaam(input: string): string | null {
  const lower = input.toLowerCase().trim();

  const naamPatterns = [
    /(?:mijn naam is|ik ben|ik heet|dit is|het is|naam is|met)\s+([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)/i,
    /^([A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+)?)$/,
  ];

  for (const pattern of naamPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      const naam = match[1].trim();
      if (naam.length >= 2 && naam.length <= 40) return naam;
    }
  }

  // Als het 1-2 woorden zijn die niet dag/tijd woorden zijn, neem aan dat het een naam is
  const words = input.trim().split(/\s+/);
  if (words.length >= 1 && words.length <= 3) {
    const combined = words.join(' ').toLowerCase();
    const isNietNaam = Object.keys(DAGEN).some(d => combined.includes(d))
      || parseTijd(combined) !== null
      || JA_WOORDEN.includes(combined)
      || NEE_WOORDEN.includes(combined)
      || /\d/.test(combined);
    if (!isNietNaam && combined.length >= 2) {
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  return null;
}

/**
 * Hoofdfunctie: parse transcript naar structured intent + entities.
 * Doet alles met regex — geen LLM call nodig voor de meeste gevallen.
 */
export function parseTranscript(transcript: string): ParsedIntent {
  const raw = transcript.trim();
  const lower = raw.toLowerCase();

  const entities: ParsedIntent['entities'] = {};
  let intent: IntentType = 'provide_info';
  let confidence = 0.7;

  // Ja/Nee detectie (hoogste prioriteit)
  const jaNee = detectJaNee(lower);
  if (jaNee === 'yes') {
    return { intent: 'confirm_yes', entities: {}, confidence: 0.95, raw };
  }
  if (jaNee === 'no') {
    return { intent: 'confirm_no', entities: {}, confidence: 0.95, raw };
  }

  // Greeting detectie
  if (/^(hallo|hey|goedemorgen|goedemiddag|goedenavond|hoi|dag)\b/i.test(lower)) {
    intent = 'greeting';
    confidence = 0.9;
  }

  // Cancel detectie
  if (/annul|cancel|afzeg|verwijder/i.test(lower)) {
    return { intent: 'cancel_appointment', entities: {}, confidence: 0.85, raw };
  }

  // Reschedule detectie
  if (/verzet|verplaats|reschedule|ander tijdstip|andere dag/i.test(lower)) {
    return { intent: 'reschedule_appointment', entities: {}, confidence: 0.85, raw };
  }

  // Booking intent detectie
  if (/afspraak|boek|reserv|inplan|appointment|book/i.test(lower)) {
    intent = 'book_appointment';
    confidence = 0.85;
  }

  // Dag extractie
  const dag = parseDag(lower);
  if (dag) {
    entities.date = dag;
    // Vind de originele dag-tekst voor context
    for (const naam of Object.keys(DAGEN)) {
      if (lower.includes(naam)) { entities.rawDay = naam; break; }
    }
    if (lower.includes('morgen')) entities.rawDay = 'morgen';
    if (lower.includes('vandaag')) entities.rawDay = 'vandaag';
    if (lower.includes('overmorgen')) entities.rawDay = 'overmorgen';
    if (intent === 'greeting' || intent === 'provide_info') intent = 'provide_info';
    confidence = Math.max(confidence, 0.8);
  }

  // Tijd extractie
  const tijd = parseTijd(lower);
  if (tijd) {
    entities.time = tijd;
    confidence = Math.max(confidence, 0.8);
  }

  // Naam extractie (alleen als er geen dag/tijd in zit)
  if (!dag && !tijd) {
    const naam = extractNaam(raw);
    if (naam) {
      entities.name = naam;
      confidence = Math.max(confidence, 0.75);
    }
  }

  // Als we niks herkennen
  if (intent === 'provide_info' && Object.keys(entities).length === 0 && !jaNee) {
    // Probeer naam als fallback
    const naam = extractNaam(raw);
    if (naam) {
      entities.name = naam;
    } else {
      intent = 'unclear';
      confidence = 0.3;
    }
  }

  return { intent, entities, confidence, raw };
}
