import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

// Saves / loads a member's daily check-in: back feeling, note, consent flag, habits.
// Row-level security means a member can only touch their own rows.

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data, error } = await supabase
    .from('checkins')
    .select('day, pain_score, note, share_ok, habits')
    .order('day', { ascending: false })
    .limit(120);
  if (error) return NextResponse.json({ error: 'Could not load' }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

const num = (v: any, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.round(n))) : 0;
};

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const day = String(b?.day ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return NextResponse.json({ error: 'Bad day' }, { status: 400 });
  const diff = Math.abs(new Date(day + 'T12:00:00Z').getTime() - Date.now()) / 86400000;
  if (!(diff <= 2)) return NextResponse.json({ error: 'Bad day' }, { status: 400 });

  const ps = b?.pain_score;
  const pain_score = ps === null || ps === undefined ? null : num(ps, 10);
  const note = typeof b?.note === 'string' ? b.note.trim().slice(0, 400) : '';
  const h = b?.habits ?? {};
  const habits = {
    steps: num(h.steps, 40000),
    water: num(h.water, 20),
    sleep: h.sleep === null || h.sleep === undefined ? null : num(h.sleep, 14),
    stretch: !!h.stretch,
    workout: num(h.workout, 20),
  };

  const { error } = await supabase.from('checkins').upsert(
    { user_id: u.user.id, day, pain_score, note, share_ok: !!b?.share_ok, habits, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,day' }
  );
  if (error) return NextResponse.json({ error: 'Could not save' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
