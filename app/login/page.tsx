'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import { createClient } from '@/lib/supabaseClient';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get('error') === 'link' ? 'That link has expired. Please request a new one.' : null
  );
  const [loading, setLoading] = useState(false);

  const rawNext = params.get('next') ?? '/program';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/program';

  // Already signed in? Skip straight to the program.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(next);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(
        error.message.toLowerCase().includes('invalid')
          ? 'Wrong email or password. Please try again.'
          : error.message
      );
      setLoading(false);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <AuthShell>
      <div className="au-eyebrow">Welcome back</div>
      <h1>Sign <em>in.</em></h1>
      <p className="au-sub">Use the email you paid with and the password you created.</p>
      <form onSubmit={handleLogin}>
        <label className="au-label" htmlFor="li-email">Email</label>
        <input id="li-email" className="au-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="au-label" htmlFor="li-pw">Password</label>
        <div className="au-pw">
          <input id="li-pw" className="au-input" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="button" className="au-show" onClick={() => setShow((s) => !s)}>{show ? 'Hide' : 'Show'}</button>
        </div>

        {error && <div className="au-err">{error}</div>}

        <button className="au-btn" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in →'}</button>
      </form>
      <div className="au-links">
        <Link href="/forgot-password">Forgot your password?</Link>
        <span>Not a member yet? <Link href="/checkout">Join the community</Link></span>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
