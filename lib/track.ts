// Tiny analytics helper for the /start (QR hoodie) page.
//
// PREVIEW: no analytics service is connected yet. Every event is collected in
// window.__mskEvents (and logged to the console while developing) so the page is
// ready to report as soon as a service is picked. To connect one later, add a single
// line in send() below (for example Vercel Web Analytics' track()).

type Props = Record<string, string | number | boolean | null | undefined>;

const SRC_KEY = 'msk_start_src';

declare global {
  interface Window {
    __mskEvents?: { name: string; props: Props; at: number }[];
  }
}

function send(name: string, props: Props) {
  window.__mskEvents = window.__mskEvents || [];
  window.__mskEvents.push({ name, props, at: Date.now() });
  if (process.env.NODE_ENV !== 'production') console.debug('[track]', name, props);
}

/** Works out where the visitor came from and remembers it for this visit. */
export function visitSource(): Props {
  try {
    const saved = sessionStorage.getItem(SRC_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  const q = new URLSearchParams(window.location.search);
  const qr = q.get('utm_medium') === 'qr' || q.has('qr');
  const src: Props = {
    source: qr ? 'qr' : q.get('utm_source') || (document.referrer ? 'referral' : 'direct'),
    campaign: q.get('utm_campaign') || q.get('utm_source') || null,
  };
  try {
    sessionStorage.setItem(SRC_KEY, JSON.stringify(src));
    // lets a later page (e.g. after sign-up) know this person arrived through the QR code
    if (qr) localStorage.setItem('msk_qr_visit', String(Date.now()));
  } catch {}
  return src;
}

export function track(name: string, props: Props = {}) {
  try {
    send(name, { ...visitSource(), ...props });
  } catch {}
}
