import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

// Remembers the answers a member gives the FIRST time they enter the program
// (gender + age), so they are never asked again when they sign back in.
// Stored on the member's own account (Supabase "user metadata") — no extra database setup.

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data } = await createClient().auth.getUser();
  if (!data.user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const m = (data.user.user_metadata ?? {}) as { gender?: string; age?: number };
  if (m.gender && m.age) return NextResponse.json({ gender: m.gender, age: m.age });
  return NextResponse.json({ gender: null, age: null });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  const gender = body?.gender;
  const age = Number(body?.age);
  if (!['Male', 'Female'].includes(gender) || !Number.isInteger(age) || age < 14 || age > 90) {
    return NextResponse.json({ error: 'Invalid profile' }, { status: 400 });
  }

  const { error } = await supabase.auth.updateUser({ data: { gender, age } });
  if (error) return NextResponse.json({ error: 'Could not save' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
