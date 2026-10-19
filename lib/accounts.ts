// Everything that turns a successful Stripe payment into a Supabase account.
// Used by both the Stripe webhook and the "create your password" API, so it is
// safe if both run at the same time (the email is claimed once, in the database).

import crypto from 'crypto';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';

// Subscription states that are allowed into the program.
// (past_due = payment failed but Stripe is still retrying — we give a grace period.)
export const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];

export type Account = { userId: string; preexisting: boolean; passwordSet: boolean };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function findAuthUserIdByEmail(admin: SupabaseClient, email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data) return null;
    const hit = data.users.find((u) => (u.email ?? '').toLowerCase() === email);
    if (hit) return hit.id;
    if (data.users.length < 1000) return null;
  }
  return null;
}

/**
 * Makes sure this paying email has a Supabase account and a `subscriptions` row.
 * - New email  -> creates the account with a random password (the customer picks their real one on the next page).
 * - Email that already had an account -> links it, and does NOT let the payment page overwrite its password.
 */
export async function ensureAccount(
  admin: SupabaseClient,
  rawEmail: string,
  stripeCustomerId: string | null,
  fullName?: string | null
): Promise<Account> {
  const email = rawEmail.trim().toLowerCase();

  const read = async () => {
    const { data } = await admin
      .from('subscriptions')
      .select('user_id,password_set,preexisting,created_at')
      .eq('email', email)
      .maybeSingle();
    return data as null | { user_id: string | null; password_set: boolean; preexisting: boolean; created_at: string };
  };
  const done = (r: { user_id: string | null; password_set: boolean; preexisting: boolean }): Account => ({
    userId: r.user_id as string,
    preexisting: r.preexisting,
    passwordSet: r.password_set,
  });

  let row = await read();
  if (row?.user_id) return done(row);

  // Try to claim this email. Only one caller can win the insert (unique index on email).
  let iAmCreator = false;
  if (!row) {
    const { error } = await admin
      .from('subscriptions')
      .insert({ email, stripe_customer_id: stripeCustomerId });
    iAmCreator = !error;
  } else if (Date.now() - new Date(row.created_at).getTime() > 60_000) {
    // A previous attempt died half way (row exists, no account). Take it over.
    iAmCreator = true;
  }

  if (!iAmCreator) {
    // Somebody else is creating the account right now. Wait for them.
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      row = await read();
      if (row?.user_id) return done(row);
    }
    throw new Error('Account creation is taking too long, please try again');
  }

  // ----- I am the one creating the account -----
  let userId: string | null = null;
  let preexisting = false;
  const created = await admin.auth.admin.createUser({
    email,
    password: crypto.randomBytes(24).toString('base64url'),
    email_confirm: true,
    user_metadata: fullName ? { full_name: fullName } : undefined,
  });
  if (created.data?.user) {
    userId = created.data.user.id;
  } else {
    userId = await findAuthUserIdByEmail(admin, email);
    if (!userId) throw created.error ?? new Error('Could not create the account');
    preexisting = true; // this email signed up before paying — keep their existing password
  }

  await admin
    .from('subscriptions')
    .update({
      user_id: userId,
      preexisting,
      password_set: preexisting,
      stripe_customer_id: stripeCustomerId,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email);

  // The program pages expect a profile row too.
  await admin.from('profiles').upsert({ id: userId, full_name: fullName ?? null }, { onConflict: 'id', ignoreDuplicates: true });

  return { userId, preexisting, passwordSet: preexisting };
}

/** Copies the live Stripe subscription state (active / canceled / ...) into our table. */
export async function syncSubscription(admin: SupabaseClient, sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const periodEnd =
    (sub as any).current_period_end ?? (sub.items?.data?.[0] as any)?.current_period_end ?? null;
  await admin
    .from('subscriptions')
    .update({
      stripe_subscription_id: sub.id,
      status: sub.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);
}

/** Reads the paying customer's email/name/ids out of a completed Checkout Session. */
export function paidSessionInfo(session: Stripe.Checkout.Session) {
  const paid = session.status === 'complete' && ['paid', 'no_payment_required'].includes(session.payment_status);
  const email = session.customer_details?.email ?? session.customer_email ?? null;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null;
  return { paid, email, name: session.customer_details?.name ?? null, customerId, subscriptionId };
}
