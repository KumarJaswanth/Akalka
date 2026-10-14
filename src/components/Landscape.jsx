import { Fragment, useEffect, useMemo, useRef } from 'react';
import { useScrollVar } from './Reveal.jsx';

/* Landscape — a painted, layered horizon that closes a section.
   Rolling grass hills under a soft sky, painted once onto canvases (one per
   depth) and moved at different rates as the page scrolls: the far ridge
   barely moves, the near mound tracks the page, the soft-focus foreground
   grass slides past faster than the page itself. That speed difference is
   the depth illusion. Nothing is an image file: every ridge, blade and
   cloud is drawn from a seed, so each placement is its own view and stays
   sharp at any width.
     day  — light sections: hazy blue-green ridges, sunlit lime grass,
            drifting clouds, fading into the page at the bottom.
     dusk — the graphite footer: dark ridges with a lime rim light.
   Painting happens once, shortly before the horizon scrolls into view, and
   again only when the width changes. Per scrolled frame each layer gets a
   single transform. Reduced motion gets the painted view, unmoving. */

/* Deterministic random, so a placement looks the same on every visit. */
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* Layer specs, far → near. Geometry is in fractions of the band height H:
   y ridge baseline, amp ridge height. k is the depth: the share of the
   scroll a layer resists (0 moves with the page, negative overtakes it). */
const SCENES = {
  day: {
    clouds: true,
    rays: true,
    /* Haze lying in the valleys, keyed to the layer it rests on. */
    mists: { 0: { y: 0.3, k: 0.38 }, 1: { y: 0.45, k: 0.25 } },
    layers: [
      { y: 0.3, amp: 0.1, n: 6, w: [0.1, 0.22], top: '#d3e5da', bot: '#c1d8ca', k: 0.42, blur: 1.6 },
      {
        y: 0.42, amp: 0.12, n: 5, w: [0.1, 0.2], top: '#b2d596', bot: '#93c182', k: 0.3, blur: 0.8,
        light: 'rgba(255,252,222,0.32)', shade: 'rgba(58,104,72,0.22)',
        edge: { len: 0.014, step: 3, col: ['#c6dfaa', '#a5ca8d'] },
        body: { n: 1.4, len: 0.012, col: ['rgba(206,232,174,0.5)', 'rgba(130,180,112,0.45)'] },
      },
      {
        y: 0.56, amp: 0.14, n: 4, w: [0.12, 0.24], top: '#9ccd52', bot: '#5f9a26', k: 0.18,
        light: 'rgba(255,250,196,0.34)', shade: 'rgba(28,70,10,0.32)',
        edge: { len: 0.032, step: 1.5, col: ['#b4dc6a', '#8cc240', '#6ea72a'] },
        body: { n: 3.2, len: 0.018, col: ['rgba(196,230,116,0.5)', 'rgba(140,196,64,0.45)', 'rgba(84,140,28,0.45)', 'rgba(60,110,20,0.4)'] },
      },
      {
        y: 0.72, amp: 0.2, n: 3, w: [0.16, 0.3], hero: true, top: '#8cc535', bot: '#3a7616', k: 0.08,
        light: 'rgba(255,246,176,0.4)', shade: 'rgba(18,52,4,0.42)',
        edge: { len: 0.055, step: 1, col: ['#b2de58', '#8ac436', '#64a024', '#4a861a'] },
        body: { n: 6.5, len: 0.03, col: ['rgba(190,230,100,0.5)', 'rgba(150,204,62,0.45)', 'rgba(100,158,36,0.5)', 'rgba(62,116,20,0.5)', 'rgba(40,86,12,0.45)'] },
      },
      {
        fore: true, k: -0.12, blur: 4,
        col: ['rgba(46,104,14,0.95)', 'rgba(74,140,24,0.93)', 'rgba(112,178,44,0.9)', 'rgba(158,210,80,0.88)'],
        base: '#3f7d17',
      },
    ],
  },
  dusk: {
    clouds: false,
    mists: { 0: { y: 0.42, k: 0.36 }, 1: { y: 0.6, k: 0.22 } },
    layers: [
      {
        y: 0.42, amp: 0.14, n: 6, w: [0.1, 0.2], top: '#37443c', bot: '#2f3a33', k: 0.42, blur: 1.2,
        rim: 'rgba(150,200,40,0.4)', light: 'rgba(125,178,0,0.1)',
      },
      {
        y: 0.58, amp: 0.15, n: 5, w: [0.1, 0.2], top: '#2c3a2c', bot: '#242f25', k: 0.28, blur: 0.5,
        rim: 'rgba(150,200,40,0.45)', light: 'rgba(125,178,0,0.1)', shade: 'rgba(10,14,10,0.35)',
        edge: { len: 0.02, step: 2.2, col: ['#34452f', '#2a3727'] },
        body: { n: 1.5, len: 0.016, col: ['rgba(60,80,48,0.5)', 'rgba(26,34,24,0.5)'] },
      },
      {
        y: 0.74, amp: 0.17, n: 4, w: [0.14, 0.26], top: '#223020', bot: '#1a2318', k: 0.14,
        rim: 'rgba(160,210,40,0.55)', light: 'rgba(125,178,0,0.12)', shade: 'rgba(8,12,8,0.4)',
        edge: { len: 0.05, step: 1.2, col: ['#2e3f26', '#25331f', '#1c2619'] },
        body: { n: 3, len: 0.03, col: ['rgba(52,72,38,0.55)', 'rgba(36,50,28,0.55)', 'rgba(18,24,16,0.55)'] },
      },
      {
        fore: true, k: -0.1, blur: 4,
        col: ['rgba(18,24,16,0.96)', 'rgba(26,36,22,0.94)', 'rgba(36,50,30,0.92)', 'rgba(96,140,24,0.45)'],
        base: '#151b13',
      },
    ],
  },
};

/* Canvases extend below the band so a layer never shows its base edge. */
const OVER = 1.4;

function ridgeFn(L, W, H, rand) {
  const bumps = [];
  for (let i = 0; i < L.n; i += 1) {
    bumps.push({
      cx: ((i + 0.15 + rand() * 0.7) / L.n) * W * 1.2 - W * 0.1,
      w: W * (L.w[0] + rand() * (L.w[1] - L.w[0])),
      h: L.amp * H * (0.45 + rand() * 0.55),
    });
  }
  /* The near layer gets one broad mound set just off centre — the
     composition's subject, as in a landscape photograph. */
  if (L.hero) bumps.push({ cx: W * (0.44 + rand() * 0.12), w: W * 0.2, h: L.amp * H * 1.25 });
  const ph = rand() * Math.PI * 2;
  const base = L.y * H;
  const f = (x) => {
    let r = 0;
    for (let i = 0; i < bumps.length; i += 1) {
      const d = (x - bumps[i].cx) / bumps[i].w;
      r += bumps[i].h * Math.exp(-d * d);
    }
    return base - r * 0.8 + Math.sin(x / (W * 0.045) + ph) * H * 0.004;
  };
  return { f, bumps };
}

/* Tapered blade: a filled sliver from a base of width w to a point.
   Added to the current path so a whole colour batch fills once. */
function blade(ctx, x, y, len, lean, w) {
  ctx.moveTo(x - w / 2, y);
  ctx.quadraticCurveTo(x - w / 4 + lean * 0.35, y - len * 0.55, x + lean, y - len);
  ctx.quadraticCurveTo(x + w / 4 + lean * 0.35, y - len * 0.55, x + w / 2, y);
}

function paintHill(ctx, L, W, H, rand) {
  const { f: ridge, bumps } = ridgeFn(L, W, H, rand);
  const top = (L.y - L.amp * 1.3) * H;
  const g = ctx.createLinearGradient(0, top, 0, L.y * H + H * 0.45);
  g.addColorStop(0, L.top);
  g.addColorStop(1, L.bot);
  ctx.beginPath();
  ctx.moveTo(0, H * OVER);
  for (let x = 0; x <= W; x += 4) ctx.lineTo(x, ridge(x));
  ctx.lineTo(W, ridge(W));
  ctx.lineTo(W, H * OVER);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();

  /* Modelling, painted only onto the hill itself: the sun sits up and to
     the right, so each mound's right shoulder catches light, its left
     flank turns away, and the ground darkens as it falls toward us. */
  if (L.light || L.shade) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    bumps.forEach((b) => {
      const ty = ridge(b.cx);
      if (L.light) {
        const gl = ctx.createRadialGradient(b.cx + b.w * 0.3, ty + b.h * 0.15, 0, b.cx + b.w * 0.3, ty + b.h * 0.15, b.w * 0.95);
        gl.addColorStop(0, L.light);
        gl.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gl;
        ctx.fillRect(b.cx - b.w * 1.2, ty - b.h, b.w * 2.6, H);
      }
      if (L.shade) {
        const gs = ctx.createRadialGradient(b.cx - b.w * 0.75, ty + b.h * 0.7, 0, b.cx - b.w * 0.75, ty + b.h * 0.7, b.w * 0.8);
        gs.addColorStop(0, L.shade);
        gs.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gs;
        ctx.fillRect(b.cx - b.w * 2, ty - b.h, b.w * 2.6, H);
      }
    });
    if (L.shade) {
      const gd = ctx.createLinearGradient(0, L.y * H, 0, L.y * H + H * 0.6);
      gd.addColorStop(0, 'rgba(0,0,0,0)');
      gd.addColorStop(1, L.shade);
      ctx.fillStyle = gd;
      ctx.fillRect(0, L.y * H, W, H);
    }
    ctx.restore();
  }

  if (L.rim) {
    ctx.save();
    ctx.beginPath();
    for (let x = 0; x <= W; x += 4) (x ? ctx.lineTo : ctx.moveTo).call(ctx, x, ridge(x) + 0.5);
    ctx.strokeStyle = L.rim;
    ctx.lineWidth = 1.4;
    ctx.shadowColor = L.rim;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
  }

  /* Grass through the body of the hill, thicker toward the crest. */
  if (L.body) {
    const count = Math.round((L.body.n * W * H) / 400);
    const paths = L.body.col.map(() => new Path2D());
    for (let i = 0; i < count; i += 1) {
      const x = rand() * W;
      const y = ridge(x) + Math.pow(rand(), 1.8) * H * 0.55 + 2;
      const len = L.body.len * H * (0.5 + rand() * 0.8);
      const p = paths[Math.floor(rand() * paths.length)];
      blade(p, x, y, len, (rand() - 0.45) * len * 0.5, 1 + rand() * 1.2);
    }
    paths.forEach((p, i) => {
      ctx.fillStyle = L.body.col[i];
      ctx.fill(p);
    });
  }

  /* The crest: blades rooted just below the ridge, so the silhouette is
     grass, not a cut line. */
  if (L.edge) {
    const paths = L.edge.col.map(() => new Path2D());
    for (let x = 0; x < W; x += L.edge.step * (0.6 + rand() * 0.8)) {
      const len = L.edge.len * H * (0.45 + rand() * 0.9);
      const y = ridge(x) + len * (0.15 + rand() * 0.35);
      const p = paths[Math.floor(rand() * paths.length)];
      blade(p, x, y, len, (rand() - 0.42) * len * 0.6, 0.9 + rand() * (L.edge.len * H * 0.12));
    }
    paths.forEach((p, i) => {
      ctx.fillStyle = L.edge.col[i];
      ctx.fill(p);
    });
  }
}

/* Out-of-focus foreground grass: long, broad blades rising from the
   bottom edge, denser at the sides so the view reads as framed. */
function paintFore(ctx, L, W, H, rand) {
  ctx.fillStyle = L.base;
  ctx.fillRect(0, H * 0.97, W, H * (OVER - 0.97));
  const count = Math.round(W / 3.4);
  const paths = L.col.map(() => new Path2D());
  for (let i = 0; i < count; i += 1) {
    const u = rand();
    /* Skew toward both edges. */
    const x = (u < 0.5 ? Math.pow(u * 2, 1.6) / 2 : 1 - Math.pow((1 - u) * 2, 1.6) / 2) * W;
    const edge = Math.abs(x / W - 0.5) * 2;
    const len = H * (0.08 + rand() * 0.18 + edge * edge * 0.3);
    const p = paths[Math.floor(rand() * paths.length)];
    blade(p, x, H * (1 + rand() * 0.04), len, (rand() - 0.5) * len * 0.7, 4 + rand() * 7);
  }
  paths.forEach((p, i) => {
    ctx.fillStyle = L.col[i];
    ctx.fill(p);
  });
}

/* Soft cumulus: overlapping radial puffs, each with a cool shadowed
   underside, laid along a flattened base. */
function paintClouds(ctx, W, H, rand) {
  const n = Math.max(3, Math.round(W / 420));
  for (let c = 0; c < n; c += 1) {
    const cx = ((c + 0.2 + rand() * 0.6) / n) * W;
    const cy = H * (0.35 + rand() * 0.4);
    const size = Math.min(W, 1600) * (0.05 + rand() * 0.05);
    const puffs = 10 + Math.floor(rand() * 10);
    for (let pass = 0; pass < 2; pass += 1) {
      const r2 = rng(Math.floor(cx * 7 + c));
      for (let i = 0; i < puffs; i += 1) {
        const px = cx + (r2() - 0.5) * size * 3.2;
        const py = cy - Math.pow(r2(), 0.7) * size * 0.9 + (pass ? 0 : size * 0.22);
        const r = size * (0.45 + r2() * 0.55);
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        if (pass) {
          g.addColorStop(0, 'rgba(255,255,255,0.9)');
          g.addColorStop(0.6, 'rgba(255,255,255,0.55)');
        } else {
          g.addColorStop(0, 'rgba(176,196,214,0.42)');
          g.addColorStop(0.6, 'rgba(190,208,224,0.22)');
        }
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function setup(canvas, W, h, dpr, blur) {
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, h);
  if (blur) {
    ctx.filter = `blur(${blur}px)`;
    /* Browsers without canvas filters blur the element instead. */
    if (ctx.filter !== `blur(${blur}px)`) canvas.style.filter = `blur(${blur}px)`;
  }
  return ctx;
}

/* mode 'view': 0 as the horizon enters at the bottom, 1 as it leaves at the
   top; `neutral` is the progress at which every layer sits as painted.
   neutral 'end' (with mode 'enter') is for the foot of the page: the
   layers come to rest exactly when the page can scroll no further. */
/* Motes: pollen drifting up through the sun by day, fireflies over the
   dusk hills. Plain spans animated by CSS (magic.css); positions and
   timings come from the seed. Negative delays start each one mid-flight,
   so the scene is already alive when it scrolls in. */
function makeMotes(variant, seed) {
  const r = rng(seed * 31 + 7);
  const dusk = variant === 'dusk';
  return Array.from({ length: 16 }, () => {
    const t = dusk ? 6 + r() * 5 : 9 + r() * 7;
    return {
      '--mx': `${(3 + r() * 94).toFixed(1)}%`,
      '--my': `${((dusk ? 35 : 30) + r() * 52).toFixed(1)}%`,
      '--ms': `${(dusk ? 3 : 2) + Math.round(r() * 1.5)}px`,
      '--mt': `${t.toFixed(2)}s`,
      '--md': `${(-r() * t).toFixed(2)}s`,
      '--mdx': `${Math.round((r() - 0.4) * (dusk ? 120 : 90))}px`,
    };
  });
}

export default function Landscape({ variant = 'day', seed = 1, mode = 'view', neutral = 0.5 }) {
  const scene = SCENES[variant];
  const motes = useMemo(() => makeMotes(variant, seed), [variant, seed]);
  const bandRef = useRef(null);
  const cloudRef = useRef(null);
  const layerRefs = useRef([]);
  const mistRefs = useRef({});
  const size = useRef({ H: 0, painted: 0 });
  const reduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return undefined;
    let near = false;
    let t = 0;
    const paint = () => {
      const W = band.clientWidth;
      const H = band.clientHeight;
      size.current.H = H;
      if (!W || !H || !near || size.current.painted === W) return;
      size.current.painted = W;
      const hi = Math.min(1.5, window.devicePixelRatio || 1);
      const rand = rng(seed * 9973 + 17);
      scene.layers.forEach((L, i) => {
        const cv = layerRefs.current[i];
        if (!cv) return;
        const ctx = setup(cv, W, H * OVER, L.blur ? 1 : hi, L.blur);
        if (L.fore) paintFore(ctx, L, W, H, rand);
        else paintHill(ctx, L, W, H, rand);
      });
      if (scene.clouds && cloudRef.current) {
        const ch = H * 0.9;
        paintClouds(setup(cloudRef.current, W, ch, 1, 1.5), W, ch, rand);
      }
    };
    const schedule = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if ('requestIdleCallback' in window) window.requestIdleCallback(paint, { timeout: 400 });
        else paint();
      }, 120);
    };
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          near = true;
          schedule();
          io.disconnect();
        }
      },
      { rootMargin: '900px 0px' }
    );
    io.observe(band);
    const ro = new ResizeObserver(() => {
      size.current.H = band.clientHeight;
      schedule();
    });
    ro.observe(band);
    return () => {
      clearTimeout(t);
      io.disconnect();
      ro.disconnect();
    };
  }, [scene, seed]);

  useScrollVar(bandRef, {
    mode,
    writeVar: false,
    onProgress: (p) => {
      if (reduced.current) return;
      const H = size.current.H || bandRef.current?.clientHeight || 0;
      const rest = neutral === 'end' ? H / (H + 120) : neutral;
      const travel = (p - rest) * (window.innerHeight + H);
      /* Arrival: while the horizon is still approaching, the near ground
         sits a touch closer (scaled up from its foot) and settles as the
         view arrives — a short dolly on top of the parallax slide. */
      const approach = Math.min(1, Math.max(0, (rest - p) / Math.max(rest, 0.001)));
      scene.layers.forEach((L, i) => {
        const cv = layerRefs.current[i];
        if (!cv) return;
        const zoom = L.k < 0.15 ? 1 + approach * (L.fore ? 0.08 : 0.04) : 1;
        cv.style.transform = `translate3d(0, ${(travel * L.k).toFixed(1)}px, 0)${zoom > 1.0005 ? ` scale(${zoom.toFixed(4)})` : ''}`;
        const mist = mistRefs.current[i];
        if (mist) mist.style.transform = `translate3d(0, ${(travel * scene.mists[i].k).toFixed(1)}px, 0)`;
      });
      if (cloudRef.current) cloudRef.current.style.transform = `translate3d(0, ${(travel * 0.55).toFixed(1)}px, 0)`;
    },
  });

  return (
    <div className={`ls ls-${variant}`} aria-hidden="true">
      <div className="ls-band" ref={bandRef}>
        <span className="ls-sky" />
        {scene.rays && <span className="ls-rays" />}
        {scene.clouds && (
          <span className="ls-drift">
            <canvas className="ls-clouds" ref={cloudRef} />
          </span>
        )}
        {scene.layers.map((L, i) => (
          <Fragment key={i}>
            <canvas
              className={`ls-l${L.fore ? ' ls-fore' : ''}`}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
            />
            {scene.mists && scene.mists[i] && (
              <span
                className="ls-mist"
                style={{ top: `${(scene.mists[i].y * 100).toFixed(1)}%` }}
                ref={(el) => {
                  mistRefs.current[i] = el;
                }}
              />
            )}
          </Fragment>
        ))}
        <span className="ls-motes">
          {motes.map((st, i) => (
            <i key={i} style={st} />
          ))}
        </span>
        <span className="ls-fade" />
      </div>
    </div>
  );
}
