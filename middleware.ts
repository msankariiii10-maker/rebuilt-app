import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isOwner } from '@/lib/owner';

// The member area (/program, /member) is for paying, signed-in customers only.
//   not signed in            -> /login
//   signed in, not paying    -> /checkout
// Escape hatch while you are still testing: set the env var MEMBER_GATE=off in Vercel.

const ACTIVE = ['active', 'trialing', 'past_due'];

export async function middleware(req: NextRequest) {
  if (process.env.MEMBER_GATE === 'off') return NextResponse.next();

  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          req.cookies.set({ name, value, ...options });
          res = NextResponse.next({ request: req });
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          req.cookies.set({ name, value: '', ...options });
          res = NextResponse.next({ request: req });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  // the owner account can always look around the member area
  if (isOwner(data.user.email)) return res;

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (!sub || !ACTIVE.includes(sub.status)) {
    const url = req.nextUrl.clone();
    url.pathname = '/checkout';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/program', '/program/:path*', '/member', '/member.html'],
};
