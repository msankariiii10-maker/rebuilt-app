// The marketing homepage — dark "clinic" look to match the program pages, with the
// photo-real woman + man behind it. They zoom in on scroll (see components/HomeScene.tsx).

import './home.css';
import HomeScene from '@/components/HomeScene';
import HomeVideo from '@/components/HomeVideo';
import { createAdminClient } from '@/lib/supabaseAdmin';

// Real member stories only: notes that members wrote AND ticked "happy for Rebuilt to share anonymously".
// Nothing shows here until a real member has agreed to share one.
export const revalidate = 600;
async function getQuotes(): Promise<{ i: string; name: string; text: string }[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('checkins')
      .select('user_id, note, day')
      .eq('share_ok', true)
      .not('note', 'is', null)
      .order('day', { ascending: false })
      .limit(60);
    const seen = new Set<string>();
    const out: { i: string; name: string; text: string }[] = [];
    for (const r of data ?? []) {
      const t = (r.note ?? '').trim();
      if (t.length < 20 || seen.has(r.user_id)) continue;
      seen.add(r.user_id);
      out.push({ i: 'R', name: 'Rebuilt member', text: t });
      if (out.length >= 3) break;
    }
    return out;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const QUOTES = await getQuotes();
  return (
    <div className="hm-root">
      <HomeScene />

      <main className="hm-main">
        {/* HERO */}
        <div className="hm-wrap hm-hero">
          <div className="txt">
            <div className="hm-eyebrow">Welcome to the Rebuilt program</div>
            <h1 className="hm-h1">
              Not fixed.
              <br />
              <em>Rebuilt.</em>
            </h1>
            <p className="hm-lead">
              For three years, two herniated discs turned getting out of bed, tying my shoes, even sitting through dinner into something I had to brace for.
              If that sounds familiar, I built this for you — two months in, <b>90% of that pain was gone.</b>
            </p>
            <div className="hm-cta-row">
              <a className="hm-btn" href="/checkout">
                Join our community →
              </a>
              <a className="hm-btn ghost" href="#watch">
                Watch the story
              </a>
            </div>
            <div className="hm-price-note">
              <b>$9.99</b> / month · cancel anytime
            </div>
            <div className="hm-badge">
              <i />
              Built by a PT student who lived it.
            </div>
          </div>
          <div className="hm-scroll">
            <span />
            Scroll
          </div>
        </div>

        {/* VIDEO */}
        <section className="hm-section" id="watch">
          <div className="hm-wrap">
            <div className="hm-reveal">
              <div className="hm-sec-eyebrow">The story</div>
              <h2 className="hm-h2">
                Why Rebuilt is <em>different</em>
              </h2>
            </div>
            <div className="hm-reveal">
              <HomeVideo />
            </div>
            <div className="hm-vcap hm-reveal">2–3 min · Recorded by the PT student who built it</div>
          </div>
        </section>

        {/* JOIN */}
        <section className="hm-join" id="join">
          <div className="hm-wrap">
            <div className="hm-join-card hm-reveal">
              <div className="hm-sec-eyebrow">Start today</div>
              <h2 className="hm-h2">
                Build yourself from
                <br />
                the <em>ground up.</em>
              </h2>
              <div className="hm-price">
                $9.99<small>/ month</small>
              </div>
              <div className="hm-perks">
                <span>Progressive strength program</span>
                <span>Levels that grow with you</span>
                <span>Daily pain tracking</span>
                <span>Cancel anytime</span>
              </div>
              <a className="hm-btn" href="/checkout">
                Join our community →
              </a>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS: only real, consented member notes; hidden until there are some */}
        {QUOTES.length > 0 && (
        <section className="hm-section">
          <div className="hm-wrap">
            <div className="hm-reveal">
              <div className="hm-sec-eyebrow">Community</div>
              <h2 className="hm-h2">
                Real results within
                <br />
                the <em>community.</em>
              </h2>
            </div>
            <div className="hm-grid">
              {QUOTES.map((q) => (
                <div className="hm-quote hm-reveal" key={q.name}>
                  <div className="mark">“</div>
                  <p>{q.text}</p>
                  <div className="hm-who">
                    <div className="hm-av">{q.i}</div>
                    {q.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}
      </main>

      <footer className="hm-footer">
        <div className="hm-wrap">
          <div className="row">
            <div className="logo">
              Rebu<span className="vert" />lt
            </div>
            <div className="links">
              <a href="/legal/privacy">Privacy Policy</a>
              <a href="/legal/terms">Terms</a>
              <a href="/legal/medical">Medical Disclaimer</a>
            </div>
            <a className="mail" href="mailto:hello@rebuiltprogram.com">
              hello@rebuiltprogram.com
            </a>
          </div>
          <p style={{ marginTop: 22 }}>
            <small>Not a substitute for medical diagnosis. Built by a PT student.</small>
          </p>
        </div>
      </footer>
    </div>
  );
}
