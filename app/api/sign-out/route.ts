import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await createClient().auth.signOut();
  return NextResponse.redirect(new URL('/', req.url), 303);
}
