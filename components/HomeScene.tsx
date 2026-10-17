'use client';

// Homepage background: the same 3D lumbar spine as the program pages, but here
// the page scroll drives the camera (full figure → close on the lumbar spine →
// dims behind the content). Also handles the fade-in of sections.

import { useEffect, useRef } from 'react';

export default function HomeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // 3D scene
    let cancelled = false;
    let created: { destroy: () => void } | null = null;
    (async () => {
      const [THREE, { createSpineScene }] = await Promise.all([import('three'), import('@/lib/spineScene')]);
      if (cancelled || !canvasRef.current) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const eng = createSpineScene(THREE, canvasRef.current, reduced);
      if (eng) {
        eng.enableScroll();
        created = eng;
      }
    })();

    return () => {
      cancelled = true;
      io.disconnect();
      created?.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="hm-canvas" aria-hidden="true" />;
}
