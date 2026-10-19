'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function CreatePasswordForm({ sessionId, email }: { sessionId: string; email: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySet, setAlreadySet] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError('Your password must be at least 8 characters.');
    if (password !== confirm) return setError('The two passwords do not match.');

    setLoading(true);
    try {
      const res = await fetch('/api/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === 'already_set') setAlreadySet(true);
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      // Password saved — sign them in right away and take them into the program.
      const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
      if (signInError) {
        router.replace('/login');
        return;
      }
      router.replace('/program');
      router.refresh();
    } catch {
      setError('Network problem. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label className="au-label" htmlFor="cp-email">Your email</label>
      <input id="cp-email" className="au-input" type="email" value={email} readOnly />

      <label className="au-label" htmlFor="cp-pw">Create a password</label>
      <div className="au-pw">
        <input
          id="cp-pw"
          className="au-input"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoFocus
        />
        <button type="button" className="au-show" onClick={() => setShow((s) => !s)}>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>

      <label className="au-label" htmlFor="cp-pw2">Confirm password</label>
      <input
        id="cp-pw2"
        className="au-input"
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Type it again"
      />
      <p className="au-hint">You will use this email and password to sign in next time.</p>

      {error && <div className="au-err">{error}</div>}

      <button className="au-btn" type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Create password & enter the program →'}
      </button>

      {alreadySet && (
        <div className="au-links">
          <Link href={`/login?email=${encodeURIComponent(email)}`}>Go to sign in</Link>
        </div>
      )}
    </form>
  );
}
