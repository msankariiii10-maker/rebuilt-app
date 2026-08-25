import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

// This route mirrors Stripe's own "create-checkout-session" quickstart
// pattern, adapted to a Next.js Route Handler. It looks up your Price by
// its lookup_key (set when you create the Price in the Stripe Dashboard
// or via the API), then creates a subscription Checkout Session and
// redirects the browser straight to Stripe's hosted checkout page.
//
// The frontend never talks to Stripe directly with a secret key — it just
// POSTs a normal HTML form to this route, same as the vanilla-HTML
// example you'd get from Stripe's own docs.

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const lookupKey = formData.get('lookup_key') as string;

  if (!lookupKey) {
    return NextResponse.json({ error: 'Missing lookup_key' }, { status: 400 });
  }

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
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    // Redirect the browser directly to Stripe's hosted checkout page.
    return NextResponse.redirect(session.url!, 303);
  } catch (err: any) {
    console.error('Stripe checkout session error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
