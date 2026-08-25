import Stripe from 'stripe';

// Server-side only. Never import this file from a 'use client' component —
// it uses your secret key, which must never reach the browser.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});
