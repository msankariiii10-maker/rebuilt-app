/* eslint-disable @typescript-eslint/no-explicit-any */
// The 3D "lumbar spine" scene used behind the Days and Exercise pages.
// Plain TypeScript (no React) so it can be created once and stay alive while
// the person moves from the week page to a day page. Three.js is passed in so
// it only loads on the pages that need it.

export type ShotName = 'idle' | 'close' | 'session';

export type SpineScene = {
  setHover: (on: boolean) => void;
  burst: (v: number) => void;
  shot: (name: ShotName, ms: number) => Promise<void>;
  snapShot: (name: ShotName) => void;
  align: (v: number, ms: number) => Promise<void>;
  snapAlign: (v: number) => void;
  sweep: (ms: number) => Promise<void>;
  enableScroll: () => void;
  destroy: () => void;
};

export function createSpineScene(THREE: any, canvas: HTMLCanvasElement, reduced: boolean): SpineScene | null {
  let renderer: any;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  const T = (ms: number) => (reduced ? ms * 0.25 : ms);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const fig = new THREE.Group();
  scene.add(fig);

  function glassMat(color: number, op: number, pow: number) {
    return new THREE.ShaderMaterial({
      uniforms: { c: { value: new THREE.Color(color) }, op: { value: op }, p: { value: pow } },
      vertexShader:
        'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
      fragmentShader:
        'uniform vec3 c; uniform float op; uniform float p; varying vec3 vN; varying vec3 vV; void main(){ float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),p); gl_FragColor=vec4(c,(f*.85+.035)*op); }',
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }
  const bodyMat = glassMat(0xbfc3c6, 1.0, 2.4);
  const disposables: any[] = [bodyMat];

  // ----- body -----
  const prof = [
    [0.001, -3.05], [1.15, -2.95], [1.32, -2.2], [1.16, -1.2], [0.98, -0.3], [1.05, 0.7],
    [1.24, 1.7], [1.52, 2.6], [1.5, 3.05], [0.75, 3.4], [0.34, 3.55],
  ].map((p) => new THREE.Vector2(p[0], p[1]));
  const smooth = new THREE.SplineCurve(prof).getPoints(60);
  const torso = new THREE.Mesh(new THREE.LatheGeometry(smooth, 56), bodyMat);
  torso.scale.z = 0.5;
  fig.add(torso);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.3, 0.7, 24, 1, true), bodyMat);
  neck.position.y = 3.75;
  fig.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.56, 32, 24), bodyMat);
  head.position.y = 4.5;
  head.scale.set(0.9, 1.05, 0.95);
  fig.add(head);
  [-1, 1].forEach((s) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.22, 3.2, 24, 1, true), bodyMat);
    arm.position.set(s * 1.95, 1.2, 0);
    arm.rotation.z = s * 0.07;
    fig.add(arm);
    const sh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), bodyMat);
    sh.position.set(s * 1.8, 2.75, 0);
    fig.add(sh);
  });

  // ----- spine -----
  const spine = new THREE.Group();
  spine.position.z = 0.3;
  fig.add(spine);
  const count = 8; // T10 T11 T12 L1 L2 L3 L4 L5
  const baseCol = new THREE.Color(0xd9d6cf);
  const hotCol = new THREE.Color(0xe8574a);
  const verts: any[] = [];
  for (let i = 0; i < count; i++) {
    const lumbar = i >= 3;
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: baseCol.clone(), transparent: true, opacity: 0.92 });
    const r = lumbar ? 0.36 : 0.3;
    const h = 0.3;
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.88, r, h, 16), mat));
    const tp = new THREE.Mesh(new THREE.BoxGeometry(lumbar ? 1.15 : 0.95, 0.08, 0.1), mat);
    tp.position.z = 0.08;
    g.add(tp);
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.36), mat);
    sp.position.set(0, -0.02, 0.3);
    sp.rotation.x = 0.15;
    g.add(sp);
    g.position.y = 2.1 - i * 0.52;
    spine.add(g);
    if (i < count - 1) {
      const dm = new THREE.MeshBasicMaterial({ color: 0x8e8b84, transparent: true, opacity: 0.5 });
      const d = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r * 0.8, 0.12, 14), dm);
      d.position.y = g.position.y - 0.26;
      spine.add(d);
    }
    verts.push({ g, mat, lumbar, i, dx: (Math.random() - 0.5) * 0.2, rz: (Math.random() - 0.5) * 0.28, ry: (Math.random() - 0.5) * 0.2 });
  }
  const sacrum = new THREE.Mesh(
    new THREE.ConeGeometry(0.46, 0.85, 4),
    new THREE.MeshBasicMaterial({ color: 0xcfccc4, transparent: true, opacity: 0.8 })
  );
  sacrum.rotation.set(Math.PI, Math.PI / 4, 0);
  sacrum.position.y = -2.45;
  spine.add(sacrum);

  // ----- glow + energy line -----
  function radialTex(rgb: string) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d')!;
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(' + rgb + ',1)');
    g.addColorStop(0.35, 'rgba(' + rgb + ',.35)');
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  const haloTex = radialTex('232,87,74');
  const floorTex = radialTex('190,195,198');
  disposables.push(haloTex, floorTex);
  const spriteOpts = (map: any) => ({ map, transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
  const halo = new THREE.Sprite(new THREE.SpriteMaterial(spriteOpts(haloTex)));
  halo.position.set(0, -0.5, 1.0);
  halo.renderOrder = 5;
  fig.add(halo);
  const trail: any[] = [];
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial(spriteOpts(haloTex)));
    s.renderOrder = 6;
    fig.add(s);
    trail.push(s);
  }
  const floor = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: floorTex, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  floor.scale.set(7, 1.4, 1);
  floor.position.set(0, -3.3, 0);
  fig.add(floor);

  // ----- state, shots, tweens -----
  const isMobile = () => window.innerWidth < 860;
  const shots: Record<ShotName, () => Record<string, number>> = {
    idle: () => ({ px: 0, py: 1.4, pz: isMobile() ? 20 : 17.5, tx: 0, ty: 1.4, tz: 0, fx: isMobile() ? 0 : 3.0, op: isMobile() ? 0.55 : 1 }),
    close: () => ({ px: 0, py: -0.5, pz: 3.6, tx: 0, ty: -0.5, tz: 0, fx: 0, op: 1 }),
    session: () => ({ px: 0, py: 1.4, pz: isMobile() ? 21 : 18.5, tx: 0, ty: 1.4, tz: 0, fx: isMobile() ? 0 : 3.4, op: isMobile() ? 0.35 : 1 }),
  };
  const cur: Record<string, number> = Object.assign({}, shots.idle(), { align: 0.2, sweep: -1, burst: 0, hover: 0, base: 0.55 });
  let currentShot: ShotName = 'idle';
  let tweens: any[] = [];
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function tween(target: Record<string, number>, ms: number): Promise<void> {
    return new Promise((res) => {
      const from: Record<string, number> = {};
      Object.keys(target).forEach((k) => (from[k] = cur[k]));
      // a new tween on the same properties replaces the old one
      tweens = tweens.filter((tw) => !Object.keys(target).some((k) => k in tw.target));
      tweens.push({ from, target, t0: performance.now(), ms: Math.max(1, T(ms)), res });
    });
  }
  function stepTweens(now: number) {
    tweens = tweens.filter((tw) => {
      const p = Math.min(1, (now - tw.t0) / tw.ms);
      const e = ease(p);
      Object.keys(tw.target).forEach((k) => (cur[k] = tw.from[k] + (tw.target[k] - tw.from[k]) * e));
      if (p >= 1) {
        tw.res();
        return false;
      }
      return true;
    });
  }

  let hoverTarget = 0;
  // scroll mode (homepage): the page scroll position drives the camera
  let scrollMode = false;
  let sp = 0;
  let mx = 0;
  const onMouse = (e: MouseEvent) => {
    mx = e.clientX / window.innerWidth - 0.5;
  };
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  let last = performance.now();
  let raf = 0;
  let alive = true;

  function frame(now: number) {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    stepTweens(now);
    cur.hover += (hoverTarget - cur.hover) * Math.min(1, dt * 6);
    cur.burst *= Math.exp(-dt * 1.6);
    const t = now / 1000;

    let scrollE = 0;
    if (scrollMode) {
      const target = clamp(window.scrollY / (window.innerHeight * 0.95), 0, 1.6);
      sp += (target - sp) * Math.min(1, dt * 4);
      const h = clamp(sp, 0, 1);
      scrollE = h * h * (3 - 2 * h);
      const far = isMobile() ? 20 : 17.5;
      cur.px = 0;
      cur.py = lerp(1.4, -0.5, scrollE);
      cur.pz = lerp(far, 5.2, scrollE);
      cur.tx = 0;
      cur.ty = cur.py;
      cur.tz = 0;
      cur.fx = lerp(isMobile() ? 0 : 3.0, 0, scrollE);
      const fade = sp <= 1 ? 1 : clamp(1 - ((sp - 1) / 0.6) * 0.8, 0.18, 1);
      cur.op = (isMobile() ? lerp(0.26, 1, scrollE) : 1) * fade;
      cur.align = clamp(0.2 + scrollE * 0.8, 0, 1);
      cur.base = 0.55 + scrollE * 0.5;
    }
    camera.position.set(cur.px, cur.py, cur.pz);
    camera.lookAt(cur.tx, cur.ty, cur.tz);
    fig.position.x = cur.fx;
    fig.rotation.y = reduced ? 0 : Math.sin(t * 0.22) * 0.14 + (scrollMode ? mx * 0.35 * (1 - scrollE) : 0);
    canvas.style.opacity = String(cur.op);

    const pulse = 0.5 + 0.5 * Math.sin(t * (1.15 + cur.hover * 1.1));
    const glow = cur.base + pulse * 0.35 + cur.hover * 0.35 + cur.burst;

    verts.forEach((v) => {
      const k = 1 - cur.align;
      v.g.position.x = v.dx * k;
      v.g.rotation.z = v.rz * k;
      v.g.rotation.y = v.ry * k;
      let g = v.lumbar ? glow * 0.55 : 0.12 + cur.burst * 0.15;
      if (cur.sweep >= 0 && v.lumbar) {
        const pos = (v.i - 3) / 4;
        g += Math.exp(-Math.pow((pos - cur.sweep) * 3.2, 2)) * 1.4;
      }
      v.mat.color.copy(baseCol).lerp(hotCol, Math.min(1, g));
    });

    const hs = 3.2 + pulse * 0.9 + cur.burst * 2.2 + cur.hover * 0.8;
    halo.scale.set(hs, hs * 1.15, 1);
    halo.material.opacity = Math.min(1, 0.35 + glow * 0.35);

    const period = 4.2 - cur.hover * 1.8;
    const e = (t / period) % 1;
    trail.forEach((s, i) => {
      const w = (((e - i * 0.028) % 1) + 1) % 1;
      s.position.set(0, -2.4 + w * 4.7, 1.0);
      const sc = (0.55 - i * 0.05) * (1 + cur.hover * 0.4);
      s.scale.set(sc, sc, 1);
      s.material.opacity = Math.sin(Math.PI * w) * (0.5 - i * 0.06) * (0.45 + cur.hover * 0.55);
    });

    renderer.render(scene, camera);
  }

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    Object.assign(cur, shots[currentShot]());
  }
  window.addEventListener('resize', resize);
  resize();
  raf = requestAnimationFrame(frame);

  return {
    setHover: (on) => {
      hoverTarget = on ? 1 : 0;
    },
    burst: (v) => {
      cur.burst = Math.max(cur.burst, v);
    },
    shot: (name, ms) => {
      currentShot = name;
      return tween(shots[name](), ms);
    },
    snapShot: (name) => {
      currentShot = name;
      tweens = [];
      Object.assign(cur, shots[name]());
    },
    align: (v, ms) => tween({ align: v }, ms),
    snapAlign: (v) => {
      cur.align = v;
    },
    sweep: (ms) => {
      cur.sweep = -0.25;
      return tween({ sweep: 1.25 }, ms).then(() => {
        cur.sweep = -1;
      });
    },
    enableScroll: () => {
      scrollMode = true;
      window.addEventListener('mousemove', onMouse);
    },
    destroy: () => {
      alive = false;
      window.removeEventListener('mousemove', onMouse);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      disposables.forEach((d) => d.dispose && d.dispose());
      scene.traverse((o: any) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material && o.material.dispose) o.material.dispose();
      });
      renderer.dispose();
    },
  };
}
