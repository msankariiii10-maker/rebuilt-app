'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import { createClient } from '@/lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) return setError('Could not send the email. Please try again in a minute.');
    setSent(true); // same message whether or not the email exists, on purpose
  }

  return (
    <AuthShell>
      <div className="au-eyebrow">Password help</div>
      <h1>Forgot your <em>password?</em></h1>
      <p className="au-sub">Enter your email and we’ll send you a link to choose a new one.</p>
      {sent ? (
        <div className="au-ok">If that email has an account, a reset link is on its way. Check your inbox (and spam).</div>
      ) : (
        <form onSubmit={submit}>
          <label className="au-label" htmlFor="fp-email">Email</label>
          <input id="fp-email" className="au-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {error && <div className="au-err">{error}</div>}
          <button className="au-btn" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
      <div className="au-links"><Link href="/login">Back to sign in</Link></div>
    </AuthShell>
  );
}
