'use client';

// Keeps ONE 3D spine scene alive behind the Days page and the Exercise page.
// Because this lives in app/program/layout.tsx, it is not torn down when the
// person goes from /program/week to /program/day/..., which is what makes the
// camera move feel like one continuous shot instead of two page loads.

import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { ShotName, SpineScene } from '@/lib/spineScene';

export type SceneApi = {
  setHover: (on: boolean) => void;
  burst: (v: number) => void;
  shot: (name: ShotName, ms?: number) => Promise<void>;
  align: (v: number, ms?: number) => Promise<void>;
  sweep: (ms?: number) => Promise<void>;
};

const noop: SceneApi = {
  setHover: () => {},
  burst: () => {},
  shot: () => Promise.resolve(),
  align: () => Promise.resolve(),
  sweep: () => Promise.resolve(),
};

const Ctx = createContext<SceneApi>(noop);
export const useScene = () => useContext(Ctx);

export default function SceneShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const active = /^\/program\/(week|day)/.test(pathname);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<SpineScene | null>(null);
  // Calls made before three.js has finished loading are remembered and applied
  // instantly (no animation) as soon as the scene exists.
  const pending = useRef<{ shot?: ShotName; align?: number }>({});

  const api = useMemo<SceneApi>(
    () => ({
      setHover: (on) => engine.current?.setHover(on),
      burst: (v) => engine.current?.burst(v),
      shot: (name, ms = 1500) => {
        if (engine.current) return engine.current.shot(name, ms);
        pending.current.shot = name;
        return Promise.resolve();
      },
      align: (v, ms = 1200) => {
        if (engine.current) return engine.current.align(v, ms);
        pending.current.align = v;
        return Promise.resolve();
      },
      sweep: (ms = 1500) => (engine.current ? engine.current.sweep(ms) : Promise.resolve()),
    }),
    []
  );

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let created: SpineScene | null = null;
    (async () => {
      const [THREE, { createSpineScene }] = await Promise.all([import('three'), import('@/lib/spineScene')]);
      if (cancelled || !canvasRef.current) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      created = createSpineScene(THREE, canvasRef.current, reduced);
      engine.current = created;
      if (created) {
        if (pending.current.shot) created.snapShot(pending.current.shot);
        if (pending.current.align !== undefined) created.snapAlign(pending.current.align);
      }
      pending.current = {};
    })();
    return () => {
      cancelled = true;
      created?.destroy();
      engine.current = null;
      pending.current = {};
    };
  }, [active]);

  return (
    <Ctx.Provider value={api}>
      <div className={active ? 'rb-root on' : undefined}>
        {active && <canvas ref={canvasRef} className="rb-canvas" aria-hidden="true" />}
        <div className={active ? 'rb-content' : undefined}>{children}</div>
      </div>
    </Ctx.Provider>
  );
}
