import Stripe from 'stripe';

// Server-side only. Never import this file from a 'use client' component —
// it uses your secret key, which must never reach the browser.
// Stripe now requires API version 2025-03-31.basil or newer for accounts
// with Managed Payments. The installed stripe package types only list its
// own pinned version, so the value is cast to keep the build type-safe.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil' as any,
});
