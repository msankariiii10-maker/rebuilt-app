'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import { createClient } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setReady(!!data.user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError('Your password must be at least 8 characters.');
    if (password !== confirm) return setError('The two passwords do not match.');
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.replace('/program');
    router.refresh();
  }

  if (ready === false) {
    return (
      <AuthShell>
        <div className="au-eyebrow">Password help</div>
        <h1>This link <em>expired.</em></h1>
        <p className="au-sub">Request a new reset link and try again.</p>
        <Link className="au-btn" href="/forgot-password">Send a new link</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="au-eyebrow">Password help</div>
      <h1>Choose a new <em>password.</em></h1>
      <p className="au-sub">Pick something you’ll remember.</p>
      <form onSubmit={submit}>
        <label className="au-label" htmlFor="rp-pw">New password</label>
        <div className="au-pw">
          <input id="rp-pw" className="au-input" type={show ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          <button type="button" className="au-show" onClick={() => setShow((s) => !s)}>{show ? 'Hide' : 'Show'}</button>
        </div>
        <label className="au-label" htmlFor="rp-pw2">Confirm password</label>
        <input id="rp-pw2" className="au-input" type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error && <div className="au-err">{error}</div>}
        <button className="au-btn" type="submit" disabled={loading || ready === null}>{loading ? 'Saving…' : 'Save password →'}</button>
      </form>
    </AuthShell>
  );
}
