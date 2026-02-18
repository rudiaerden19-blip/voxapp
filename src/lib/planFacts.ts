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
