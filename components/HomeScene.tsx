'use client';

// Homepage background: two photo-real bodies (woman + man) fixed behind the page.
// They breathe, shift weight and do a slow mobility move; the cursor (or a gentle
// auto-drift on phones) tilts them a hair. Scrolling zooms in toward the lower back,
// then dims them behind the content. Also handles the fade-in of sections.

import { useEffect, useRef } from 'react';

export default function HomeScene() {
  const figsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // section fade-ins
    const els = Array.from(document.querySelectorAll('.hm-reveal'));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));

    const bg = figsRef.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!bg || reduced) return () => io.disconnect();

    const figs = Array.from(bg.querySelectorAll<HTMLElement>('.hm-fig'));
    const fine = window.matchMedia('(pointer:fine)').matches;
    const mobile = () => window.innerWidth <= 900;
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      figs.forEach((f) => {
        const r = f.getBoundingClientRect();
        f.classList.toggle('hov', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom);
      });
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      figs.forEach((f) => f.classList.remove('hov'));
    };
    if (fine) {
      window.addEventListener('pointermove', onMove);
      document.addEventListener('pointerleave', onLeave);
    }

    const t0 = performance.now();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      const sp = window.scrollY / window.innerHeight;
      const se = clamp(sp, 0, 1);
      const fade = sp <= 1 ? 1 : clamp(1 - ((sp - 1) / 0.6) * 0.8, 0.18, 1);
      bg.style.setProperty('--fade', String((mobile() ? lerp(0.34, 1, se) : 1) * fade));
      const ez = se * se * (3 - 2 * se);
      bg.style.setProperty('--zs', String(1 + ez * (mobile() ? 1.1 : 1.25)));
      bg.style.setProperty('--lg', String(ez));
      if (!fine) {
        const s = (t - t0) / 1000;
        tx = Math.sin(s * 0.45) * 0.8;
        ty = Math.cos(s * 0.33) * 0.5;
      }
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      figs.forEach((f, i) => {
        const k = i ? 1 : -1;
        f.style.setProperty('--ry', cx * 2.4 + k * 0.4 + 'deg');
        f.style.setProperty('--rx', -cy * 1.4 + 'deg');
        f.style.setProperty('--mx', String(cx));
      });
    };
    raf = requestAnimationFrame(loop);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const fig = (g: 'F' | 'M', ar: number, src: string) => (
    <div className="hm-fig" data-g={g} style={{ ['--ar' as string]: ar }}>
      <div className="hm-glow" />
      <div className="hm-lum" />
      <div className="hm-sway">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="L" src={src} alt="" decoding="async" />
        <div className="hm-tw">
          <div className="hm-tb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="T" src={src} alt="" decoding="async" />
          </div>
        </div>
      </div>
      <div className="hm-shadow" />
    </div>
  );

  return (
    <div ref={figsRef} className="hm-figs" aria-hidden="true">
      {fig('F', 0.329, '/home/fig-female.webp')}
      {fig('M', 0.4, '/home/fig-male.webp')}
    </div>
  );
}
