import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Use this in Server Components, not the browser client in
// lib/supabaseClient.ts — this one reads the user's auth cookie so
// queries scoped by Row Level Security (like user_progress, pain_logs)
// know who's actually logged in.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component without a way to set cookies —
            // safe to ignore if you have middleware refreshing sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Same as above — safe to ignore in this context.
          }
        },
      },
    }
  );
}
