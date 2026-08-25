'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create the matching profile row
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
      });
    }

    setLoading(false);
    router.push('/program');
  }

  return (
    <main style={{ maxWidth: 380, margin: '100px auto', padding: '0 24px' }}>
      <h1>Create your account</h1>
      <input
        type="text"
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        style={{ display: 'block', width: '100%', margin: '12px 0', padding: 10 }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', width: '100%', margin: '12px 0', padding: 10 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', margin: '12px 0', padding: 10 }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleSignup} disabled={loading} style={{ width: '100%', padding: 12 }}>
        {loading ? 'Creating account…' : 'Sign up'}
      </button>
      <p style={{ marginTop: 16 }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}
