import {
  AppointmentState,
  SessionState,
  ParsedIntent,
  TransitionResult,
  CollectedData,
} from './types';

const MAX_RETRIES = 2;

/**
 * Deterministische state machine voor afspraken.
 * Code beslist — niet AI.
 *
 * Elke transition ontvangt de huidige sessie + parsed intent
 * en retourneert de nieuwe state + response instructie.
 */
export function transition(
  session: SessionState,
  intent: ParsedIntent,
): TransitionResult {
  const { state, collected, retries } = session;

  // Absorbeer entiteiten ongeacht state
  const updated: CollectedData = { ...collected };
  if (intent.entities.service) updated.service = intent.entities.service;
  if (intent.entities.date) updated.date = intent.entities.date;
  if (intent.entities.time) updated.time = intent.entities.time;
  if (intent.entities.name) updated.name = intent.entities.name;
  if (intent.entities.phone) updated.phone = intent.entities.phone;

  // Werk de sessie bij met geabsorbeerde data
  session.collected = updated;

  // Cancel / reschedule → escalate (fase 2)
  if (intent.intent === 'cancel_appointment' || intent.intent === 'reschedule_appointment') {
    return {
      newState: AppointmentState.ESCALATE,
      response: 'ESCALATE_CANCEL_RESCHEDULE',
      shouldBook: false,
      shouldCheckAvailability: false,
    };
  }

  switch (state) {
    case AppointmentState.GREETING:
      return handleGreeting(updated, intent);

    case AppointmentState.COLLECT_SERVICE:
      return handleCollectService(updated, intent, retries);

    case AppointmentState.COLLECT_DATE:
      return handleCollectDate(updated, intent, retries);

    case AppointmentState.COLLECT_TIME:
      return handleCollectTime(updated, intent, retries);

    case AppointmentState.COLLECT_NAME:
      return handleCollectName(updated, intent, retries);

    case AppointmentState.CHECK_AVAILABILITY:
      // Wordt afgehandeld door de orchestrator, niet hier
      return {
        newState: AppointmentState.CONFIRM,
        response: 'CONFIRM_DETAILS',
        shouldBook: false,
        shouldCheckAvailability: true,
      };

    case AppointmentState.CONFIRM:
      return handleConfirm(updated, intent);

    case AppointmentState.BOOK:
      return {
        newState: AppointmentState.SUCCESS,
        response: 'BOOKING_SUCCESS',
        shouldBook: true,
        shouldCheckAvailability: false,
      };

    case AppointmentState.SUCCESS:
      return {
        newState: AppointmentState.SUCCESS,
        response: 'ALREADY_DONE',
        shouldBook: false,
        shouldCheckAvailability: false,
      };

    default:
      return {
        newState: AppointmentState.ERROR,
        response: 'UNEXPECTED_STATE',
        shouldBook: false,
        shouldCheckAvailability: false,
      };
  }
}

function handleGreeting(
  collected: CollectedData,
  intent: ParsedIntent,
): TransitionResult {
  // Als de klant meteen info geeft, absorbeer en ga door
  if (collected.service) {
    return advanceToNextMissing(collected);
  }

  return {
    newState: AppointmentState.COLLECT_SERVICE,
    response: 'ASK_SERVICE',
    shouldBook: false,
    shouldCheckAvailability: false,
  };
}

function handleCollectService(
  collected: CollectedData,
  intent: ParsedIntent,
  retries: Record<string, number>,
): TransitionResult {
  if (collected.service) {
    return advanceToNextMissing(collected);
  }

  // Als de klant iets zegt dat geen dienst is, sla het op als dienst-poging
  if (intent.intent === 'provide_info' || intent.intent === 'unclear') {
    // De orchestrator zal proberen de dienst te matchen tegen de services tabel
    // Als het niet lukt, vragen we opnieuw
    const retry = (retries['service'] || 0) + 1;
    retries['service'] = retry;

    if (retry > MAX_RETRIES) {
      return {
        newState: AppointmentState.ESCALATE,
        response: 'ESCALATE_MAX_RETRIES',
        shouldBook: false,
        shouldCheckAvailability: false,
      };
    }

    return {
      newState: AppointmentState.COLLECT_SERVICE,
      response: 'ASK_SERVICE_RETRY',
      shouldBook: false,
      shouldCheckAvailability: false,
    };
  }

  return {
    newState: AppointmentState.COLLECT_SERVICE,
    response: 'ASK_SERVICE',
    shouldBook: false,
    shouldCheckAvailability: false,
  };
}

function handleCollectDate(
  collected: CollectedData,
  intent: ParsedIntent,
  retries: Record<string, number>,
): TransitionResult {
  if (collected.date) {
    // Als datum EN tijd samen binnenkwamen, sla COLLECT_TIME over
    if (collected.time) {
      return advanceToNextMissing(collected);
    }
    return {
      newState: AppointmentState.COLLECT_TIME,
      response: 'ASK_TIME',
      shouldBook: false,
      shouldCheckAvailability: false,
    };
  }

  const retry = (retries['date'] || 0) + 1;
  retries['date'] = retry;

  if (retry > MAX_RETRIES) {
    return {
      newState: AppointmentState.ESCALATE,
      response: 'ESCALATE_MAX_RETRIES',
      shouldBook: false,
      shouldCheckAvailability: false,
    };
  }

  return {
    newState: AppointmentState.COLLECT_DATE,
    response: retry > 1 ? 'ASK_DATE_RETRY' : 'ASK_DATE',
    shouldBook: false,
    shouldCheckAvailability: false,
  };
}

function handleCollectTime(
  collected: CollectedData,
  intent: ParsedIntent,
  retries: Record<string, number>,
): TransitionResult {
  if (collected.time) {
    return advanceToNextMissing(collected);
  }

  const retry = (retries['time'] || 0) + 1;
  retries['time'] = retry;

  if (retry > MAX_RETRIES) {
    return {
      newState: AppointmentState.ESCALATE,
      response: 'ESCALATE_MAX_RETRIES',
      shouldBook: false,
      shouldCheckAvailability: false,
    };
  }

  return {
    newState: AppointmentState.COLLECT_TIME,
    response: retry > 1 ? 'ASK_TIME_RETRY' : 'ASK_TIME',
    shouldBook: false,
    shouldCheckAvailability: false,
  };
}

function handleCollectName(
  collected: CollectedData,
  intent: ParsedIntent,
  retries: Record<string, number>,
): TransitionResult {
  if (collected.name) {
    return {
      newState: AppointmentState.CHECK_AVAILABILITY,
      response: 'CHECK_AVAILABILITY',
      shouldBook: false,
      shouldCheckAvailability: true,
    };
  }

  const retry = (retries['name'] || 0) + 1;
  retries['name'] = retry;

  if (retry > MAX_RETRIES) {
    return {
      newState: AppointmentState.ESCALATE,
      response: 'ESCALATE_MAX_RETRIES',
      shouldBook: false,
      shouldCheckAvailability: false,
    };
  }

  return {
    newState: AppointmentState.COLLECT_NAME,
    response: retry > 1 ? 'ASK_NAME_RETRY' : 'ASK_NAME',
    shouldBook: false,
    shouldCheckAvailability: false,
  };
}

function handleConfirm(
  collected: CollectedData,
  intent: ParsedIntent,
): TransitionResult {
  if (intent.intent === 'confirm_yes') {
    return {
      newState: AppointmentState.BOOK,
      response: 'BOOKING',
      shouldBook: true,
      shouldCheckAvailability: false,
    };
  }

  if (intent.intent === 'confirm_no') {
    return {
      newState: AppointmentState.COLLECT_SERVICE,
      response: 'RESTART_AFTER_NO',
      shouldBook: false,
      shouldCheckAvailability: false,
    };
  }

  // Onduidelijk antwoord bij bevestiging
  return {
    newState: AppointmentState.CONFIRM,
    response: 'ASK_CONFIRM_RETRY',
    shouldBook: false,
    shouldCheckAvailability: false,
  };
}

/**
 * Ga naar het volgende ontbrekende veld.
 * Volgorde: service → date → time → name → check availability.
 */
function advanceToNextMissing(collected: CollectedData): TransitionResult {
  if (!collected.service) {
    return {
      newState: AppointmentState.COLLECT_SERVICE,
      response: 'ASK_SERVICE',
      shouldBook: false,
      shouldCheckAvailability: false,
    };
  }
  if (!collected.date) {
    return {
      newState: AppointmentState.COLLECT_DATE,
      response: 'ASK_DATE',
      shouldBook: false,
      shouldCheckAvailability: false,
    };
  }
  if (!collected.time) {
    return {
      newState: AppointmentState.COLLECT_TIME,
      response: 'ASK_TIME',
      shouldBook: false,
      shouldCheckAvailability: false,
    };
  }
  if (!collected.name) {
    return {
      newState: AppointmentState.COLLECT_NAME,
      response: 'ASK_NAME',
      shouldBook: false,
      shouldCheckAvailability: false,
    };
  }

  return {
    newState: AppointmentState.CHECK_AVAILABILITY,
    response: 'CHECK_AVAILABILITY',
    shouldBook: false,
    shouldCheckAvailability: true,
  };
}
