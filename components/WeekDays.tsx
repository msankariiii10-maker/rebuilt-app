'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScene } from '@/components/SceneShell';

type Day = { day_of_week: number; label: string; is_rest: boolean };

const SLUGS: Record<number, string> = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday', 7: 'sunday' };
const NAMES: Record<number, string> = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' };

export default function WeekDays({ days }: { days: Day[] }) {
  const scene = useScene();
  const router = useRouter();
  const [picked, setPicked] = useState<number | null>(null);
  const [hidden, setHidden] = useState(false);
  const [caption, setCaption] = useState<{ on: boolean; k: string }>({ on: false, k: '' });
  const busy = useRef(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // coming back from a day page: pull the camera back out and let the spine relax
    scene.shot('idle', 1500);
    scene.align(0.2, 1200);
    return () => scene.setHover(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wait = (ms: number) => new Promise((r) => setTimeout(r, reduced.current ? ms * 0.25 : ms));

  async function open(d: Day) {
    if (busy.current) return;
    busy.current = true;
    scene.setHover(false);
    setPicked(d.day_of_week);
    scene.burst(1.2); // spine glow brightens
    await wait(420);
    setHidden(true);
    setCaption({ on: false, k: `${NAMES[d.day_of_week]} · ${d.label}` });
    const zoom = scene.shot('close', 1700); // camera moves toward the lumbar area
    await wait(1000);
    setCaption((c) => ({ ...c, on: true }));
    scene.align(1, 1500); // vertebrae settle into neutral
    scene.sweep(1500); // light travels L1 → L5
    await zoom;
    await wait(900);
    setCaption((c) => ({ ...c, on: false }));
    await wait(350);
    router.push(`/program/day/${SLUGS[d.day_of_week]}`);
  }

  return (
    <>
      <div className={`rb-days${picked !== null ? ' go' : ''}`}>
        {days.map((d) =>
          d.is_rest ? (
            <div className="rb-day rest" key={d.day_of_week}>
              <div className="num">{String(d.day_of_week).padStart(2, '0')}</div>
              <div className="t">
                <div className="n">{NAMES[d.day_of_week]}</div>
                <div className="l">{d.label}</div>
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              className={`rb-day${picked === d.day_of_week ? ' picked' : ''}`}
              key={d.day_of_week}
              onMouseEnter={() => !busy.current && scene.setHover(true)}
              onMouseLeave={() => scene.setHover(false)}
              onClick={() => open(d)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open(d)}
            >
              <div className="num">{String(d.day_of_week).padStart(2, '0')}</div>
              <div className="t">
                <div className="n">{NAMES[d.day_of_week]}</div>
                <div className="l">{d.label}</div>
              </div>
              <span className="arr">→</span>
            </div>
          )
        )}
      </div>
      <div className={`rb-caption${caption.on ? ' on' : ''}`}>
        <div className="k">{caption.k}</div>
        <div className="v">Aligning L1 – L5</div>
      </div>
      {hidden && <style>{`.rb-layer{opacity:0;pointer-events:none}`}</style>}
    </>
  );
}
