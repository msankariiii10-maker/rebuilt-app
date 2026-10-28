import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { parsePlan, type Plan } from '@/lib/plans';

// This route mirrors Stripe's own "create-checkout-session" quickstart
// pattern, adapted to a Next.js Route Handler. It looks up your Price by
// its lookup_key (set when you create the Price in the Stripe Dashboard
// or via the API), then creates a subscription Checkout Session and
// redirects the browser straight to Stripe's hosted checkout page.
//
// The frontend never talks to Stripe directly with a secret key — it just
// POSTs a normal HTML form to this route, same as the vanilla-HTML
// example you'd get from Stripe's own docs.

// The only Prices that can be bought. The form sends "monthly" or "yearly",
// never a Stripe lookup key, so nobody can swap in some other Price.
const LOOKUP_KEYS: Record<Plan, string> = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_LOOKUP_KEY ?? 'rebuilt_monthly',
  yearly: process.env.STRIPE_YEARLY_PRICE_LOOKUP_KEY ?? 'rebuilt_yearly',
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const lookupKey = LOOKUP_KEYS[parsePlan(formData.get('plan'))];

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL!;

  try {
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      expand: ['data.product'],
    });

    if (prices.data.length === 0) {
      return NextResponse.json(
        { error: `No active Stripe price found for lookup_key "${lookupKey}". Create it in the Stripe Dashboard first.` },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      // After paying, Stripe sends the customer to "create your password"
      // ({CHECKOUT_SESSION_ID} is filled in by Stripe).
      success_url: `${origin}/create-password?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    // Redirect the browser directly to Stripe's hosted checkout page.
    return NextResponse.redirect(session.url!, 303);
  } catch (err: any) {
    console.error('Stripe checkout session error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
