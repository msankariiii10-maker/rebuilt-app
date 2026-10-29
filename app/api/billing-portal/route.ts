import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabaseServerClient';

// "Manage billing" in the member menu. Sends the signed-in member to Stripe's own
// billing page, where they can cancel, switch card and download receipts.
// Cancelling there stops the next renewal; access runs to the end of the paid period
// (the webhook keeps our subscriptions table in sync).
// No Stripe dashboard setup needed: if the portal was never saved there, we create
// our own portal settings once (tagged metadata.rebuilt) and reuse them after that.

export const dynamic = 'force-dynamic';

async function portalConfigurationId(): Promise<string> {
  const { data } = await stripe.billingPortal.configurations.list({ active: true, limit: 100 });
  const found = data.find((c) => c.is_default) ?? data.find((c) => c.metadata?.rebuilt === 'portal');
  if (found) return found.id;

  const created = await stripe.billingPortal.configurations.create({
    business_profile: {
      privacy_policy_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mskrebuilt.com'}/legal/privacy`,
      terms_of_service_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mskrebuilt.com'}/legal/terms`,
    },
    features: {
      subscription_cancel: { enabled: true, mode: 'at_period_end' },
      payment_method_update: { enabled: true },
      invoice_history: { enabled: true },
      customer_update: { enabled: true, allowed_updates: ['email', 'name'] },
    },
    metadata: { rebuilt: 'portal' },
  });
  return created.id;
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.redirect(new URL('/login', req.url), 303);

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', data.user.id)
    .maybeSingle();
  if (!sub?.stripe_customer_id) return NextResponse.redirect(new URL('/checkout', req.url), 303);

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      configuration: await portalConfigurationId(),
      return_url: new URL('/program', req.url).toString(),
    });
    return NextResponse.redirect(session.url, 303);
  } catch (err: any) {
    console.error('billing-portal error:', err?.message ?? err);
    return NextResponse.json(
      { error: 'Billing page is not available right now. Please email us and we will sort it out.' },
      { status: 500 }
    );
  }
}
