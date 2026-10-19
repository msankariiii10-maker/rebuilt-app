import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import CreatePasswordForm from '@/components/CreatePasswordForm';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { paidSessionInfo } from '@/lib/accounts';

export const metadata = { title: 'Create your password — Rebuilt' };
export const dynamic = 'force-dynamic';

// Stripe sends the customer here right after they pay:
//   /create-password?session_id=cs_...
export default async function CreatePasswordPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams.session_id ?? '';

  let email: string | null = null;
  let paid = false;
  let alreadySet = false;

  if (sessionId.startsWith('cs_')) {
    try {
      const info = paidSessionInfo(await stripe.checkout.sessions.retrieve(sessionId));
      paid = info.paid;
      email = info.email;
      if (paid && email) {
        const { data } = await createAdminClient()
          .from('subscriptions')
          .select('password_set')
          .eq('email', email.toLowerCase())
          .maybeSingle();
        alreadySet = !!data?.password_set;
      }
    } catch {
      paid = false;
    }
  }

  if (!paid || !email) {
    return (
      <AuthShell>
        <div className="au-eyebrow">Rebuilt</div>
        <h1>We couldn’t find <em>your payment.</em></h1>
        <p className="au-sub">
          This page is only for people who just paid. If you already have an account, sign in. If you were charged and
          can’t get in, email us and we’ll fix it right away.
        </p>
        <Link className="au-btn" href="/login">Sign in</Link>
        <div className="au-links"><Link href="/checkout">Join the community</Link></div>
      </AuthShell>
    );
  }

  if (alreadySet) {
    return (
      <AuthShell>
        <div className="au-eyebrow">Payment received</div>
        <h1>Your account is <em>ready.</em></h1>
        <p className="au-sub">You already chose a password for {email}. Sign in to continue.</p>
        <Link className="au-btn" href={`/login?email=${encodeURIComponent(email)}`}>Sign in</Link>
        <div className="au-links"><Link href="/forgot-password">Forgot your password?</Link></div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="au-check" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E0503F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </div>
      <div className="au-eyebrow">Payment received</div>
      <h1>Create your <em>password.</em></h1>
      <p className="au-sub">One last step. Choose a password so you can sign back in any time.</p>
      <CreatePasswordForm sessionId={sessionId} email={email} />
    </AuthShell>
  );
}
