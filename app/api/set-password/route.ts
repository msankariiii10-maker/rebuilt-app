import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { ensureAccount, paidSessionInfo, syncSubscription } from '@/lib/accounts';

// Called by the "Create your password" page right after payment.
// It trusts nothing from the browser except the Stripe session id: it asks Stripe
// itself whether that session was really paid, and for which email.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  const sessionId = String(body?.session_id ?? '');
  const password = String(body?.password ?? '');

  if (!sessionId.startsWith('cs_')) return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'Your password must be at least 8 characters.' }, { status: 400 });
  if (password.length > 72) return NextResponse.json({ error: 'Your password is too long (72 characters max).' }, { status: 400 });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const info = paidSessionInfo(session);
    if (!info.paid || !info.email) {
      return NextResponse.json({ error: 'We could not confirm this payment.' }, { status: 403 });
    }

    const admin = createAdminClient();
    const account = await ensureAccount(admin, info.email, info.customerId, info.name);

    // Claim the "first password" slot. Only the first request can win it,
    // so an old payment link can never be used to change a password later.
    const { data: claimed } = await admin
      .from('subscriptions')
      .update({ password_set: true, updated_at: new Date().toISOString() })
      .eq('user_id', account.userId)
      .eq('password_set', false)
      .select('user_id');
    if (!claimed || claimed.length === 0) {
      return NextResponse.json(
        { error: 'This account already has a password. Please sign in (or use "Forgot password").', code: 'already_set', email: info.email },
        { status: 409 }
      );
    }

    const { error: pwError } = await admin.auth.admin.updateUserById(account.userId, { password });
    if (pwError) {
      await admin.from('subscriptions').update({ password_set: false }).eq('user_id', account.userId);
      return NextResponse.json({ error: 'Could not save your password. Please try again.' }, { status: 500 });
    }

    if (info.subscriptionId) {
      await syncSubscription(admin, await stripe.subscriptions.retrieve(info.subscriptionId));
    }

    return NextResponse.json({ ok: true, email: info.email });
  } catch (err: any) {
    console.error('set-password error:', err?.message ?? err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
