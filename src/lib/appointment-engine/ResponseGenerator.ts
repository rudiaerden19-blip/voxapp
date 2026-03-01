import { CollectedData, AvailabilityResult, ServiceInfo } from './types';

const BLACKLIST = [
  'dit duurt maar een seconde',
  'geen probleem',
  'absoluut',
  'zeker weten',
  'super',
  'geweldig',
  'perfect',
  'fantastisch',
  'uitstekend',
  'wonderful',
];

const DAG_NAMEN: Record<number, string> = {
  0: 'zondag', 1: 'maandag', 2: 'dinsdag', 3: 'woensdag',
  4: 'donderdag', 5: 'vrijdag', 6: 'zaterdag',
};

function dagNaam(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  return DAG_NAMEN[d.getDay()] || isoDate;
}

function formatDatum(isoDate: string): string {
  const dag = dagNaam(isoDate);
  const parts = isoDate.split('-');
  return `${dag} ${parseInt(parts[2])} ${maandNaam(parseInt(parts[1]))}`;
}

function maandNaam(m: number): string {
  const namen = ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  return namen[m] || '';
}

/**
 * Genereer een deterministische response op basis van de response-code
 * uit de state machine. Geen LLM nodig.
 */
export function generateResponse(
  responseCode: string,
  collected: CollectedData,
  businessName: string,
  extra?: {
    availability?: AvailabilityResult;
    services?: ServiceInfo[];
  },
): string {
  let text = '';

  switch (responseCode) {
    case 'ASK_SERVICE':
      if (extra?.services && extra.services.length > 0) {
        const lijst = extra.services.slice(0, 5).map(s => s.name).join(', ');
        text = `Waarvoor wil je graag een afspraak maken? We bieden onder andere ${lijst} aan.`;
      } else {
        text = 'Waarvoor wil je graag een afspraak maken?';
      }
      break;

    case 'ASK_SERVICE_RETRY':
      text = 'Sorry, dat heb ik niet goed begrepen. Welke behandeling wil je graag?';
      break;

    case 'ASK_DATE':
      text = 'Op welke dag zou je graag langskomen?';
      break;

    case 'ASK_DATE_RETRY':
      text = 'Sorry, welke dag bedoel je precies?';
      break;

    case 'ASK_TIME':
      text = 'Om hoe laat zou je willen komen?';
      break;

    case 'ASK_TIME_RETRY':
      text = 'Sorry, ik heb het uur niet goed verstaan. Hoe laat wil je komen?';
      break;

    case 'ASK_NAME':
      text = 'Mag ik je naam weten?';
      break;

    case 'ASK_NAME_RETRY':
      text = 'Sorry, ik heb je naam niet goed verstaan. Kan je die nog eens herhalen?';
      break;

    case 'CHECK_AVAILABILITY':
      text = 'Even kijken of dat beschikbaar is.';
      break;

    case 'CONFIRM_DETAILS': {
      const datum = collected.date ? formatDatum(collected.date) : 'onbekend';
      const tijd = collected.time || 'onbekend';
      const dienst = collected.service || 'afspraak';
      text = `${collected.name}, ik kan je inplannen op ${datum} om ${tijd} voor ${dienst}. Klopt dat?`;
      break;
    }

    case 'SLOT_UNAVAILABLE': {
      if (extra?.availability?.alternatives && extra.availability.alternatives.length > 0) {
        const alts = extra.availability.alternatives.slice(0, 2).join(' of ');
        text = `Dat tijdstip is helaas bezet. Ik heb nog ${alts} vrij. Past een van die tijden?`;
      } else if (extra?.availability?.reason) {
        text = `${extra.availability.reason} Heb je een ander moment in gedachten?`;
      } else {
        text = 'Dat tijdstip is helaas niet beschikbaar. Heb je een ander uur in gedachten?';
      }
      break;
    }

    case 'CLOSED_ON_DAY': {
      const hours = extra?.availability?.openingHours;
      if (hours) {
        text = `We zijn dan gesloten. We zijn open van ${hours.open} tot ${hours.close}.`;
      } else {
        text = 'We zijn dan helaas gesloten. Kan het op een andere dag?';
      }
      break;
    }

    case 'BOOKING':
      text = 'Momentje, ik plan dat nu in.';
      break;

    case 'BOOKING_SUCCESS': {
      const datum = collected.date ? formatDatum(collected.date) : '';
      text = `Dat is genoteerd. ${collected.name}, je afspraak staat op ${datum} om ${collected.time}. Tot dan.`;
      break;
    }

    case 'BOOKING_FAILED':
      text = 'Er ging iets mis bij het opslaan. Probeer het later opnieuw of bel ons.';
      break;

    case 'ASK_CONFIRM_RETRY':
      text = 'Wil je deze afspraak bevestigen, ja of nee?';
      break;

    case 'RESTART_AFTER_NO':
      text = 'Geen probleem. Waarvoor wil je dan een afspraak maken?';
      break;

    case 'ESCALATE_CANCEL_RESCHEDULE':
      text = 'Daarvoor verbind ik je door met een medewerker. Eén momentje.';
      break;

    case 'ESCALATE_MAX_RETRIES':
      text = 'Ik begrijp het niet helemaal. Ik verbind je door met een medewerker.';
      break;

    case 'ALREADY_DONE':
      text = 'Je afspraak is al bevestigd. Kan ik nog iets anders voor je doen?';
      break;

    case 'UNEXPECTED_STATE':
      text = 'Er ging iets mis. Probeer het opnieuw of bel ons.';
      break;

    case 'GREETING':
      text = `Hallo, met ${businessName}. Waarmee kan ik je helpen?`;
      break;

    default:
      text = 'Waarmee kan ik je helpen?';
  }

  return sanitize(text);
}

function sanitize(text: string): string {
  let result = text;
  for (const banned of BLACKLIST) {
    const regex = new RegExp(banned, 'gi');
    result = result.replace(regex, '');
  }
  result = result.replace(/\s{2,}/g, ' ').trim();
  result = result.replace(/!+/g, '.');
  return result;
}
