// Stripe price IDs — safe to import from both app and server
// These are public price identifiers, not secret keys
export const STRIPE_PRICES = {
  freshMonthly: "price_1TCTBTITaRoCxlNpwOBydYBn",
  freshAnnual: "price_1TCTBTITaRoCxlNpGe0PwxVw",
  familyMonthly: "price_1TCTBUITaRoCxlNpVV2I1Iha",
  familyAnnual: "price_1TCTBUITaRoCxlNpKGZhvNj1",
} as const;

export type StripePriceId = (typeof STRIPE_PRICES)[keyof typeof STRIPE_PRICES];
