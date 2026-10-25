import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabaseServerClient';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { isOwner } from '@/lib/owner';
import CopyButton from '@/components/CopyButton';
import './admin.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Owner', robots: { index: false, follow: false } };

type Row = { user_id: string; day: string; pain_score: number | null; note: string | null; share_ok: boolean; habits: any };

export default async function AdminPage() {
  const { data: u } = await createClient().auth.getUser();
  if (!u.user) redirect('/login?next=%2Fadmin');
  if (!isOwner(u.user.email)) redirect('/'); // anyone else is bounced home

  const admin = createAdminClient();
  const { data: rowsRaw } = await admin
    .from('checkins')
    .select('user_id, day, pain_score, note, share_ok, habits')
    .order('day', { ascending: false })
    .limit(2000);
  const rows = (rowsRaw ?? []) as Row[];

  // who is who (gender + age as the member entered them), never the email
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const who = new Map<string, string>();
  (list?.users ?? []).forEach((x) => {
    const m = (x.user_metadata ?? {}) as { gender?: string; age?: number };
    who.set(x.id, [m.gender, m.age ? m.age + '' : ''].filter(Boolean).join(', ') || 'Member');
  });

  // pain trend per member: first logged vs latest logged
  const byUser = new Map<string, Row[]>();
  rows.forEach((r) => {
    if (r.pain_score == null) return;
    byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r]);
  });
  let firstSum = 0, lastSum = 0, n = 0;
  const trend = new Map<string, string>();
  byUser.forEach((arr, id) => {
    const sorted = [...arr].sort((a, b) => (a.day < b.day ? -1 : 1));
    if (sorted.length >= 2) {
      const f = sorted[0].pain_score!, l = sorted[sorted.length - 1].pain_score!;
      firstSum += f; lastSum += l; n++;
      trend.set(id, `pain ${f} → ${l} over ${sorted.length} check-ins`);
    } else trend.set(id, 'pain ' + sorted[0].pain_score + ' (1 check-in)');
  });

  const notes = rows.filter((r) => (r.note ?? '').trim().length > 0);
  const shared = notes.filter((r) => r.share_ok);
  const members = new Set(rows.map((r) => r.user_id)).size;

  const card = (r: Row, i: number) => (
    <div key={r.user_id + r.day + i} className={'adm-note' + (r.share_ok ? ' share' : '')}>
      <p>{r.note}</p>
      <div className="adm-meta">
        <span>{who.get(r.user_id) ?? 'Member'}</span>
        <span>{r.day}</span>
        {trend.get(r.user_id) && <span>{trend.get(r.user_id)}</span>}
        {r.share_ok && <span className="adm-tag">OK to share</span>}
        {r.share_ok && <CopyButton text={r.note ?? ''} />}
      </div>
    </div>
  );

  return (
    <main className="adm">
      <div className="adm-in">
        <h1>Member notes</h1>
        <div className="sub">Only you can see this page. Signed in as {u.user.email}.</div>
        <div className="adm-nav">
          <a href="/program">Open the program →</a>
          <a href="/">Homepage</a>
          <a href="/api/sign-out">Sign out</a>
        </div>

        <div className="adm-stats">
          <div className="adm-stat"><b>{members}</b><span>Members with check-ins</span></div>
          <div className="adm-stat"><b>{notes.length}</b><span>Notes written</span></div>
          <div className="adm-stat"><b>{shared.length}</b><span>OK to share</span></div>
          <div className="adm-stat"><b>{n ? (firstSum / n).toFixed(1) + ' → ' + (lastSum / n).toFixed(1) : '–'}</b><span>Avg pain, first vs latest</span></div>
        </div>

        <h2>Ready to use as testimonials</h2>
        {shared.length ? shared.map(card) : <div className="adm-empty">Nothing yet. Notes appear here when a member ticks the sharing box.</div>}

        <h2>All notes</h2>
        {notes.length ? notes.map(card) : <div className="adm-empty">No notes yet.</div>}
      </div>
    </main>
  );
}
