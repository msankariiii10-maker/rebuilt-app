'use client';

// Homepage background: Moe's real photo, fixed behind the page.
// On load it settles in with a slow zoom; the cursor nudges it a few pixels for depth.
// Scrolling zooms in a touch, then dims it so the sections below stay readable.
// Also handles the fade-in of sections.

import { useEffect, useRef } from 'react';

export default function HomeScene() {
  const bgRef = useRef<HTMLDivElement>(null);

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

    const bg = bgRef.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!bg || reduced) return () => io.disconnect();

    const fine = window.matchMedia('(pointer:fine)').matches;
    // start the photo just under the nav bar so it never crops the top of the head
    const hero = document.querySelector<HTMLElement>('.hm-hero');
    const heroTop = hero ? hero.getBoundingClientRect().top + window.scrollY : 0;
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };
    if (fine) {
      window.addEventListener('pointermove', onMove);
      document.addEventListener('pointerleave', onLeave);
    }

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      const sp = window.scrollY / window.innerHeight;
      const se = clamp(sp, 0, 1);
      const ez = se * se * (3 - 2 * se);
      // full strength in the hero, easing down to a faint backdrop behind later sections
      bg.style.setProperty('--fade', String(clamp(1 - ez * 0.72, 0.22, 1)));
      bg.style.setProperty('--top', Math.max(0, heroTop - window.scrollY) + 'px');
      bg.style.setProperty('--zs', String(1 + ez * 0.06));
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      bg.style.setProperty('--px', (-cx * 10).toFixed(2) + 'px');
      bg.style.setProperty('--py', (-cy * 6).toFixed(2) + 'px');
    };
    raf = requestAnimationFrame(loop);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={bgRef} className="hm-photo" aria-hidden="true">
      <div className="hm-photo-in">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/home/moe-hero.webp"
          srcSet="/home/moe-hero-sm.webp 1024w, /home/moe-hero.webp 1536w"
          sizes="(max-width: 900px) 200vw, 75vw"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="hm-photo-shade" />
    </div>
  );
}
