// The two plans people can buy. Prices here are only what the site SHOWS —
// what Stripe actually charges comes from the Stripe Price with the matching lookup key
// (see app/api/create-checkout-session/route.ts), so keep the two in sync.

export type Plan = 'monthly' | 'yearly';

export const MONTHLY_PRICE = 9.99;
export const YEARLY_PRICE = 79;

const money = (n: number) => `$${(Math.round(n * 100) / 100).toFixed(2)}`;

export const PRICES = {
  monthly: money(MONTHLY_PRICE), // "$9.99"
  yearly: `$${YEARLY_PRICE}`, // "$79"
  yearlyPerMonth: money(YEARLY_PRICE / 12), // "$6.58"
  yearlySavePct: Math.round((1 - YEARLY_PRICE / (MONTHLY_PRICE * 12)) * 100), // 34
};

export function parsePlan(value: unknown): Plan {
  return value === 'yearly' ? 'yearly' : 'monthly';
}
