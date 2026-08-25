'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { redFlagQuestions } from '@/lib/redFlagQuestions';

type ProgramChoice = 'low-back' | 'low-back-knee';

export default function IntakePage() {
  const router = useRouter();
  const supabase = createClient();

  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [program, setProgram] = useState<ProgramChoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const allAnswered =
    Object.keys(answers).length === redFlagQuestions.length && program !== null;

  async function handleSubmit() {
    setSubmitting(true);

    const anyRedFlag = Object.values(answers).some((v) => v === true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Log the screening regardless of outcome — this is your audit trail.
    await supabase.from('intake_screenings').insert({
      user_id: user.id,
      answers,
      passed: !anyRedFlag,
    });

    if (anyRedFlag) {
      setBlocked(true);
      setSubmitting(false);
      return;
    }

    // Look up the chosen program's id by slug
    const { data: programRow } = await supabase
      .from('programs')
      .select('id')
      .eq('slug', program)
      .single();

    await supabase
      .from('profiles')
      .update({
        program_id: programRow?.id,
        intake_cleared: true,
        intake_completed_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    router.push('/dashboard');
  }

  if (blocked) {
    return (
      <main style={{ maxWidth: 560, margin: '80px auto', padding: '0 24px' }}>
        <h1>Please see a healthcare professional first</h1>
        <p>
          Based on your answers, this program isn&apos;t the right starting
          point for you right now. One or more of your answers suggests you
          should be evaluated in person before starting any self-guided
          exercise program.
        </p>
        <p>
          This isn&apos;t a diagnosis — it just means a real evaluation is the
          safer next step. Please contact a doctor or physical therapist.
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 560, margin: '60px auto', padding: '0 24px' }}>
      <h1>Before you start</h1>
      <p>
        A few quick questions to make sure a self-guided program is safe for
        you right now.
      </p>

      {redFlagQuestions.map((q) => (
        <div key={q.id} style={{ margin: '24px 0' }}>
          <p style={{ marginBottom: 8 }}>{q.question}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: true }))}
              style={{
                fontWeight: answers[q.id] === true ? 700 : 400,
                textDecoration: answers[q.id] === true ? 'underline' : 'none',
              }}
            >
              Yes
            </button>
            <button
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: false }))}
              style={{
                fontWeight: answers[q.id] === false ? 700 : 400,
                textDecoration: answers[q.id] === false ? 'underline' : 'none',
              }}
            >
              No
            </button>
          </div>
        </div>
      ))}

      <h2 style={{ marginTop: 40 }}>Which program?</h2>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button
          onClick={() => setProgram('low-back')}
          style={{ fontWeight: program === 'low-back' ? 700 : 400 }}
        >
          Low Back Only
        </button>
        <button
          onClick={() => setProgram('low-back-knee')}
          style={{ fontWeight: program === 'low-back-knee' ? 700 : 400 }}
        >
          Low Back + Knee
        </button>
      </div>

      <button
        disabled={!allAnswered || submitting}
        onClick={handleSubmit}
        style={{ marginTop: 40, padding: '12px 24px' }}
      >
        {submitting ? 'Submitting…' : 'Start my program'}
      </button>
    </main>
  );
}
