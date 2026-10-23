import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { ensureAccount, paidSessionInfo, syncSubscription } from '@/lib/accounts';

// Stripe calls this URL by itself whenever something happens to a payment.
// Set it up once in Stripe: Developers > Webhooks > Add endpoint
//   URL:    https://YOUR-SITE/api/stripe-webhook
//   Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
// Then copy the "Signing secret" into the STRIPE_WEBHOOK_SECRET env var.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get('stripe-signature');
  if (!secret || !signature) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });
  }

  const body = await req.text(); // must be the raw text for the signature check
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Bad signature: ${err.message}` }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription') {
        const info = paidSessionInfo(session);
        if (info.paid && info.email) {
          await ensureAccount(admin, info.email, info.customerId, info.name);
          if (info.subscriptionId) {
            await syncSubscription(admin, await stripe.subscriptions.retrieve(info.subscriptionId));
          }
        }
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      await syncSubscription(admin, event.data.object as Stripe.Subscription);
    }
  } catch (err: any) {
    console.error('stripe-webhook error:', err?.message ?? err);
    // 500 makes Stripe retry later, which is what we want.
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
