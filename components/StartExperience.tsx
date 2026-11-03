'use client';

// The /start experience (QR code on MSK Rebuilt apparel).
//   1. Hero        -> "START YOUR REBUILD" scrolls to the body map
//   2. Body map    -> only the lower back is selectable (the one live program)
//   3. Program     -> slides open once the lower back is picked, links to the homepage
//   4. Conversion  -> "BEGIN YOUR JOURNEY" goes to the existing /checkout
// Everything is CSS + a little React state; no animation libraries.

import { useEffect, useRef, useState } from 'react';
import { PRICES } from '@/lib/plans';
import { track } from '@/lib/track';

type Region = {
  id: string;
  label: string;
  active: boolean;
  dots: [number, number][]; // hotspot positions in the 240 x 520 body viewBox
};

const REGIONS: Region[] = [
  { id: 'lower-back', label: 'Lower back', active: true, dots: [[120, 212]] },
  { id: 'neck', label: 'Neck', active: false, dots: [[120, 70]] },
  { id: 'shoulders', label: 'Shoulders', active: false, dots: [[78, 100], [162, 100]] },
  { id: 'upper-back', label: 'Upper back', active: false, dots: [[120, 132]] },
  { id: 'hips', label: 'Hips', active: false, dots: [[92, 250], [148, 250]] },
  { id: 'knees', label: 'Knees', active: false, dots: [[105, 372], [135, 372]] },
];

// Back-view silhouette (head drawn separately on top).
const BODY =
  'M110,46C104.3,53.2 105.6,59.8 111,70C116.4,80.2 116.3,75.2 128,80C139.7,84.8 138.9,81.5 150,86C161.1,90.5 157.8,87.2 165,95C172.2,102.8 170.4,99.7 174,112C177.6,124.3 175.5,120.4 177,136C178.5,151.6 177.8,147.2 179,164C180.2,180.8 178.9,174.6 181,192C183.1,209.4 183.6,204.6 186,222C188.4,239.4 186.9,236.8 189,250C191.1,263.2 192.4,255.2 193,266C193.6,276.8 194,278.8 191,286C188,293.2 186.9,293.6 183,290C179.1,286.4 180.7,285.4 178,274C175.3,262.6 177.3,267 174,252C170.7,237 170.9,240.8 167,224C163.1,207.2 164,212.8 161,196C158,179.2 159.1,184.2 157,168C154.9,151.8 155.8,154.6 154,142C152.2,129.4 152.2,124.2 151,126C149.8,127.8 150.9,133 150,148C149.1,163 150.7,159.2 148,176C145.3,192.8 142.8,189.6 141,204C139.2,218.4 139.3,211.4 142,224C144.7,236.6 146.4,231.6 150,246C153.6,260.4 153.4,255.2 154,272C154.6,288.8 153.8,282.8 152,302C150.2,321.2 150.7,315.6 148,336C145.3,356.4 143.9,352 143,370C142.1,388 144.7,379.8 145,396C145.3,412.2 146.1,406 144,424C141.9,442 141,439.2 138,456C135,472.8 133.7,468 134,480C134.3,492 139.6,488.2 139,496C138.4,503.8 137.1,503.6 132,506C126.9,508.4 124.4,510 122,504C119.6,498 122.8,499.2 124,486C125.2,472.8 125.1,476.8 126,460C126.9,443.2 127,448 127,430C127,412 126.6,416.8 126,400C125.4,383.2 125,390.8 125,374C125,357.2 126.3,363.2 126,344C125.7,324.8 125.5,326.8 124,310C122.5,293.2 122.2,295.2 121,288C119.8,280.8 120.6,286 120,286C119.4,286 120.2,280.8 119,288C117.8,295.2 117.5,293.2 116,310C114.5,326.8 114.3,324.8 114,344C113.7,363.2 115,357.2 115,374C115,390.8 114.6,383.2 114,400C113.4,416.8 113,412 113,430C113,448 113.1,443.2 114,460C114.9,476.8 114.8,472.8 116,486C117.2,499.2 120.4,498 118,504C115.6,510 113.1,508.4 108,506C102.9,503.6 101.6,503.8 101,496C100.4,488.2 105.7,492 106,480C106.3,468 105,472.8 102,456C99,439.2 98.1,442 96,424C93.9,406 94.7,412.2 95,396C95.3,379.8 97.9,388 97,370C96.1,352 94.7,356.4 92,336C89.3,315.6 89.8,321.2 88,302C86.2,282.8 85.4,288.8 86,272C86.6,255.2 86.4,260.4 90,246C93.6,231.6 95.3,236.6 98,224C100.7,211.4 100.8,218.4 99,204C97.2,189.6 94.7,192.8 92,176C89.3,159.2 90.9,163 90,148C89.1,133 90.2,127.8 89,126C87.8,124.2 87.8,129.4 86,142C84.2,154.6 85.1,151.8 83,168C80.9,184.2 82,179.2 79,196C76,212.8 76.9,207.2 73,224C69.1,240.8 69.3,237 66,252C62.7,267 64.7,262.6 62,274C59.3,285.4 60.9,286.4 57,290C53.1,293.6 52,293.2 49,286C46,278.8 46.4,276.8 47,266C47.6,255.2 48.9,263.2 51,250C53.1,236.8 51.6,239.4 54,222C56.4,204.6 56.9,209.4 59,192C61.1,174.6 59.8,180.8 61,164C62.2,147.2 61.5,151.6 63,136C64.5,120.4 62.4,124.3 66,112C69.6,99.7 67.8,102.8 75,95C82.2,87.2 78.9,90.5 90,86C101.1,81.5 100.3,84.8 112,80C123.7,75.2 123.6,80.2 129,70C134.4,59.8 135.7,53.2 130,46C124.3,38.8 115.7,38.8 110,46Z';

let viewed = false;

const VERTEBRAE = Array.from({ length: 17 }, (_, i) => 78 + i * 9.4);

export default function StartExperience() {
  const [picked, setPicked] = useState<string | null>(null);
  const [soon, setSoon] = useState<string | null>(null);
  const mapRef = useRef<HTMLElement>(null);
  const programRef = useRef<HTMLElement>(null);
  const soonTimer = useRef<number>();

  useEffect(() => {
    if (!viewed) {
      viewed = true;
      track('start_page_view');
    }

    // fade sections in as they scroll into view
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.18 }
    );
    document.querySelectorAll('.st-reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollTo = (el: HTMLElement | null) => {
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const startRebuild = () => {
    track('start_rebuild_click');
    mapRef.current?.classList.add('in');
    scrollTo(mapRef.current);
  };

  const choose = (r: Region) => {
    if (!r.active) {
      track('region_unavailable_tap', { region: r.id });
      setSoon(r.label);
      window.clearTimeout(soonTimer.current);
      soonTimer.current = window.setTimeout(() => setSoon(null), 2200);
      return;
    }
    track('region_select', { region: r.id });
    setSoon(null);
    setPicked(r.id);
    // let the program panel open first, then glide to it
    window.setTimeout(() => scrollTo(programRef.current), 380);
  };

  const lowerBack = picked === 'lower-back';

  return (
    <div className="st-root">
      {/* top bar: always a way back to the main site */}
      <header className="st-top">
        <a href="/" className="st-home" onClick={() => track('main_site_click', { where: 'top' })}>
          <span aria-hidden="true">←</span> Main website
        </a>
      </header>

      {/* 1 · HERO */}
      <section className="st-hero">
        <div className="st-grid" aria-hidden="true" />
        <div className="st-glow" aria-hidden="true" />
        <div className="st-line st-line-a" aria-hidden="true"><i /></div>
        <div className="st-line st-line-b" aria-hidden="true"><i /></div>

        <div className="st-hero-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="st-logo" src="/brand/msk-rebuilt.png" alt="MSK Rebuilt" width="417" height="136" />
          <div className="st-eyebrow">
            <span className="st-dot" />
            Scan complete
          </div>
          <h1 className="st-h1">
            <span className="metal">Your comeback</span>
            <span className="red">starts here.</span>
          </h1>
          <p className="st-sub">
            You didn&apos;t just scan a QR code. You took the first step toward <b>rebuilding.</b>
          </p>
          <button type="button" className="st-btn" onClick={startRebuild}>
            Start your rebuild <span className="arr">→</span>
          </button>
        </div>

        <div className="st-steps" aria-hidden="true">
          <span className="on">01 Scan</span>
          <span className={picked ? 'on' : ''}>02 Select</span>
          <span>03 Rebuild</span>
        </div>
      </section>

      {/* 2 · BODY MAP */}
      <section className="st-map st-reveal" id="select" ref={mapRef}>
        <div className="st-wrap">
          <div className="st-map-grid">
            <div className="st-map-head">
              <div className="st-kicker">Step 02</div>
              <h2 className="st-h2">
                What are we <span className="red">rebuilding</span> today?
              </h2>
              <p className="st-note">Tap the glowing area to begin. More programs are on the way.</p>
            </div>
            <div className={`st-body${lowerBack ? ' picked' : ''}`}>
              <svg viewBox="0 0 240 520" role="img" aria-label="Body map. Lower back is available.">
                <defs>
                  <linearGradient id="stMetal" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#3a3b3e" />
                    <stop offset=".45" stopColor="#202123" />
                    <stop offset="1" stopColor="#151516" />
                  </linearGradient>
                  <linearGradient id="stEdge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#d9d9d6" stopOpacity=".55" />
                    <stop offset="1" stopColor="#d9d9d6" stopOpacity=".12" />
                  </linearGradient>
                  <radialGradient id="stHot">
                    <stop offset="0" stopColor="#ff2a1f" stopOpacity=".95" />
                    <stop offset=".55" stopColor="#e1261c" stopOpacity=".35" />
                    <stop offset="1" stopColor="#e1261c" stopOpacity="0" />
                  </radialGradient>
                  <clipPath id="stClip">
                    <path d={BODY} />
                    <ellipse cx="120" cy="36" rx="17" ry="22" />
                  </clipPath>
                </defs>

                {/* floor ring */}
                <ellipse className="st-floor" cx="120" cy="510" rx="70" ry="8" />

                <path d={BODY} fill="url(#stMetal)" stroke="url(#stEdge)" strokeWidth="1" />
                <ellipse cx="120" cy="36" rx="17" ry="22" fill="url(#stMetal)" stroke="url(#stEdge)" strokeWidth="1" />

                <g clipPath="url(#stClip)">
                  {/* back muscle contours */}
                  <g className="st-contour">
                    <path d="M120 84 C104 100 92 116 90 140" />
                    <path d="M120 84 C136 100 148 116 150 140" />
                    <path d="M92 106 C100 124 108 134 116 140" />
                    <path d="M148 106 C140 124 132 134 124 140" />
                    <path d="M95 150 C104 182 110 200 116 220" />
                    <path d="M145 150 C136 182 130 200 124 220" />
                    <path d="M98 240 C108 252 132 252 142 240" />
                  </g>
                  {/* spine */}
                  {VERTEBRAE.map((y, i) => (
                    <rect
                      key={y}
                      className={`st-vert${i >= 11 && i <= 15 ? ' lumbar' : ''}`}
                      x={117.5 - (i >= 11 ? 0.6 : 0)}
                      y={y}
                      width={5 + (i >= 11 ? 1.2 : 0)}
                      height="5.6"
                      rx="1.6"
                    />
                  ))}
                  {/* scan beam */}
                  <rect className="st-scan" x="0" y="0" width="240" height="26" />
                </g>

                {/* lower back glow */}
                <ellipse className="st-hot" cx="120" cy="212" rx="40" ry="28" fill="url(#stHot)" />

                {/* hotspots */}
                {REGIONS.map((r) =>
                  r.dots.map(([x, y], i) => (
                    <g
                      key={r.id + i}
                      className={`st-spot${r.active ? ' live' : ''}${picked === r.id ? ' sel' : ''}`}
                      transform={`translate(${x} ${y})`}
                      onClick={() => choose(r)}
                    >
                      <circle className="hit" r="16" />
                      {r.active && <circle className="ring" r="9" />}
                      <circle className="core" r={r.active ? 4.2 : 2.6} />
                    </g>
                  ))
                )}
              </svg>
              <div className={`st-soon${soon ? ' show' : ''}`} role="status" aria-live="polite">
                {soon ? `${soon}: coming soon` : ''}
              </div>
            </div>

            <div className="st-regions" role="group" aria-label="Choose an area">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`st-region${r.active ? ' live' : ''}${picked === r.id ? ' sel' : ''}`}
                  aria-pressed={picked === r.id}
                  aria-disabled={!r.active}
                  onClick={() => choose(r)}
                >
                  <span className="nm">{r.label}</span>
                  <span className="st-tag">{r.active ? 'Program live' : 'Coming soon'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 · PROGRAM (opens after picking the lower back) */}
      <section className={`st-program${lowerBack ? ' open' : ''}`} ref={programRef} aria-hidden={!lowerBack}>
        <div className="st-program-in">
          <div className="st-wrap">
            <div className="st-panel">
              <div className="st-kicker">Program unlocked</div>
              <h2 className="st-h2 big">
                Rebuild your <span className="red">lower back.</span>
              </h2>
              <p className="st-lead">Build strength. Improve movement. Regain confidence.</p>
              <ul className="st-perks">
                <li>Progressive strength program</li>
                <li>Levels that grow with you</li>
                <li>Daily pain tracking</li>
                <li>Built by a PT student who lived it</li>
              </ul>
              <a
                className="st-btn ghost"
                href="/"
                tabIndex={lowerBack ? 0 : -1}
                onClick={() => track('explore_program_click')}
              >
                Explore the program <span className="arr">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4 · CONVERSION */}
      <section className="st-final st-reveal">
        <div className="st-line st-line-c" aria-hidden="true"><i /></div>
        <div className="st-wrap">
          <h2 className="st-h2 stack">
            <span>Your recovery.</span>
            <span>Your progress.</span>
            <span className="red">Your rebuild.</span>
          </h2>
          <a className="st-btn" href="/checkout" onClick={() => track('begin_journey_click')}>
            Begin your journey <span className="arr">→</span>
          </a>
          <p className="st-price">
            <b>{PRICES.monthly}</b> / month, or <b>{PRICES.yearlyPerMonth}</b> / month billed yearly · cancel anytime
          </p>
        </div>
      </section>

      <footer className="st-foot">
        <a href="/" className="st-home" onClick={() => track('main_site_click', { where: 'footer' })}>
          <span aria-hidden="true">←</span> Back to mskrebuilt.com
        </a>
        <div className="links">
          <a href="/legal/privacy">Privacy</a>
          <a href="/legal/terms">Terms</a>
          <a href="/legal/medical">Medical disclaimer</a>
        </div>
        <small>Not a substitute for medical diagnosis.</small>
      </footer>
    </div>
  );
}
