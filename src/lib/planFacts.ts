/**
 * Canonieke VoxApp-plannen. Gebruik deze overal (pricing, ROI, support-AI docs).
 * NIET 150 afspraken — correct: 190 / 470 / 940.
 */
export const PLAN_FACTS = {
  starter: {
    name: 'Starter',
    priceEur: 99,
    minutesPerMonth: 375,
    appointmentsPerMonth: 190,
    extraMinuteEur: 0.4,
  },
  pro: {
    name: 'Pro',
    priceEur: 149,
    minutesPerMonth: 940,
    appointmentsPerMonth: 470,
    extraMinuteEur: 0.35,
  },
  business: {
    name: 'Business',
    priceEur: 249,
    minutesPerMonth: 1875,
    appointmentsPerMonth: 940,
    extraMinuteEur: 0.3,
  },
} as const;

/** Minuten per plan (voor usage/webhooks). professional/enterprise = alias. */
export const PLAN_MINUTES: Record<string, number> = {
  starter: PLAN_FACTS.starter.minutesPerMonth,
  pro: PLAN_FACTS.pro.minutesPerMonth,
  professional: PLAN_FACTS.pro.minutesPerMonth,
  business: PLAN_FACTS.business.minutesPerMonth,
  enterprise: PLAN_FACTS.business.minutesPerMonth,
};

/**
 * FAQ-database voor VoxApp Support-AI (en website).
 * Gebruik deze in ElevenLabs agent instructions/knowledge zodat de AI 190/470/940 zegt, niet 150.
 */
export const VOXAPP_SUPPORT_FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'Wat kosten de plannen en hoeveel afspraken en minuten zitten erin?',
    answer: `Starter: €99 per maand, 375 minuten, ongeveer 190 afspraken per maand, €0,40 per extra minuut. Pro: €149 per maand, 940 minuten, ongeveer 470 afspraken per maand, €0,35 per extra minuut. Business: €249 per maand, 1875 minuten, ongeveer 940 afspraken per maand, €0,30 per extra minuut. Het zijn dus ongeveer 190, 470 en 940 afspraken per maand, geen 150.`,
  },
  {
    question: 'Hoeveel afspraken kan ik per maand hebben?',
    answer: `Bij Starter ongeveer 190 afspraken per maand (375 minuten), bij Pro ongeveer 470 (940 minuten), bij Business ongeveer 940 (1875 minuten). Het exacte aantal hangt af van de gespreksduur.`,
  },
  {
    question: 'Hoeveel minuten zit er in elk plan?',
    answer: `Starter: 375 minuten per maand. Pro: 940 minuten per maand. Business: 1875 minuten per maand. Extra minuten: Starter €0,40, Pro €0,35, Business €0,30 per minuut.`,
  },
  {
    question: 'Wat is het verschil tussen de plannen?',
    answer: `Starter (€99): voor zelfstandigen, 375 min, ~190 afspraken. Pro (€149): voor groeiende teams, 940 min, ~470 afspraken, voice cloning, prioriteit support. Business (€249): voor grotere bedrijven, 1875 min, ~940 afspraken, onbeperkt medewerkers, API.`,
  },
  {
    question: 'Ik ben niet zo technisch. Kunnen jullie alles voor mij doen?',
    answer: `Ja. Als u niet zo technisch aangelegd bent, doen wij alles gratis voor u. Wij regelen de volledige setup en u hoeft alleen de informatie aan te leveren.`,
  },
];
