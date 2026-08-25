'use client';

import { useEffect } from 'react';

// Ported from the original design's reveal animation script.
// Elements with class "reveal" or "reveal-stagger" fade/scale in as they
// enter the viewport, and reset when they leave — so scrolling up and
// down replays the animation each time, matching the original behavior.
export default function RevealAnimations() {
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('visible', entry.isIntersecting);
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
