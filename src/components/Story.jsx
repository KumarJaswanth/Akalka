import { useMemo, useRef } from 'react';
import { Reveal, useScrollVar } from './Reveal.jsx';

/* Story layer for Home. The page reads as one story — the making of a
   room, from open ground to your own enquiry — told in numbered chapters.
   Each chapter carries:
     · a Chapter mark: number, title and one narrative line, added above
       the section's own copy (nothing it already says is replaced);
     · its own parallax illusion, a decorative depth layer behind the
       content. No two chapters use the same trick:
         I    The ground   — a survey grid you travel forward over
         II   The drawing  — blueprint sheets on three depth planes
         III  The making   — a spark field, near sparks outrunning far ones
         IV   The door     — giant type rows sliding against each other
         V    The walls    — a corridor of panel seams walked through
         VI   The clean air — falling motes in three focal planes
         VII  The world    — a skyline in three planes behind the run
         VIII Your room    — a tunnel of door frames passing the camera
   Every illusion is aria-hidden, takes no pointer, and moves by transform
   alone off one `--p` written into the shared scroll frame (useScrollVar)
   on the illusion's own small subtree. Reduced motion receives the
   finished, still composition. */

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* Progress for an illusion. Without a scope it is the illusion's own pass
   through the viewport (it fills its section). With a scope — a pinned
   section — it is that section's pinned progress, written onto the
   illusion only, so the pinned copy never restyles per frame. */
function useIllusion(scopeRef) {
  const ref = useRef(null);
  useScrollVar(scopeRef || ref, scopeRef ? { mode: 'pin', varRef: ref } : { mode: 'view' });
  return ref;
}

/* ---------------- Chapter mark ---------------- */
export function Chapter({ no, title, children, dark = false, className = '' }) {
  return (
    <Reveal className={`story${dark ? ' story-dark' : ''}${className ? ` ${className}` : ''}`}>
      <p className="meta story-mark">
        <span className="story-no">Chapter {no}</span>
        <i aria-hidden="true" />
        <span className="story-t">{title}</span>
      </p>
      {children && <p className="story-line">{children}</p>}
    </Reveal>
  );
}

/* ---------------- I · The ground: survey grid ---------------- */
/* A ground plane laid in true perspective; scrolling carries you forward
   over it, while survey stakes stand at three depths and pass at three
   speeds. */
const STAKES = [
  { x: 4, y: 22, k: 60, s: 0.7 },
  { x: 93, y: 16, k: 90, s: 0.8 },
  { x: 8, y: 58, k: 160, s: 1 },
  { x: 88, y: 50, k: 220, s: 1.15 },
  { x: 96, y: 74, k: 320, s: 1.35 },
  { x: 2, y: 84, k: 380, s: 1.45 },
];

export function SurveyGrid() {
  const ref = useIllusion();
  return (
    <div className="ill ill-survey" ref={ref} aria-hidden="true">
      <div className="sv-floor">
        <div className="sv-plane" />
      </div>
      {STAKES.map((s, i) => (
        <span key={i} className="sv-stake" style={{ left: `${s.x}%`, top: `${s.y}%`, '--k': s.k, '--s': s.s }}>
          <i />
        </span>
      ))}
    </div>
  );
}

/* ---------------- II · The drawing: blueprint sheets ---------------- */
/* Three line drawings of the system — a panel wall, a door, a corner
   profile — on three depth planes. Each draws itself as it arrives, and
   the nearer the sheet, the faster it passes. */
export function Blueprint() {
  const ref = useIllusion();
  return (
    <div className="ill ill-blue" ref={ref} aria-hidden="true">
      <svg className="bp-sheet bp-far" viewBox="0 0 260 180" style={{ '--k': 50 }}>
        <path pathLength="1" d="M10 170 H250 V20 H10 Z" />
        <path pathLength="1" d="M58 170 V20 M106 170 V20 M154 170 V20 M202 170 V20" />
        <path pathLength="1" d="M10 34 H250 M10 160 H250" />
      </svg>
      <svg className="bp-sheet bp-mid" viewBox="0 0 160 240" style={{ '--k': 130 }}>
        <path pathLength="1" d="M20 230 V12 H140 V230" />
        <path pathLength="1" d="M32 230 V24 H128 V230" />
        <path pathLength="1" d="M54 48 H106 V110 H54 Z" />
        <path pathLength="1" d="M112 132 H124 M112 128 V136" />
        <path pathLength="1" d="M6 12 V230 M2 12 H10 M2 230 H10" />
      </svg>
      <svg className="bp-sheet bp-near" viewBox="0 0 200 200" style={{ '--k': 260 }}>
        <path pathLength="1" d="M30 30 V170 H170 V150 H50 V30 Z" />
        <path pathLength="1" d="M30 186 H170 M30 182 V190 M170 182 V190" />
        <path pathLength="1" d="M186 150 V170 M182 150 H190 M182 170 H190" />
      </svg>
    </div>
  );
}

/* ---------------- III · The making: spark field ---------------- */
/* Rides the image-expand scene's own --p / --a (no extra scroll job):
   sparks on three planes, the near ones large, soft and fast. */
const SPARK_PLANES = [
  { n: 34, k: 260, r: [1.5, 2.5], cls: 'far' },
  { n: 22, k: 640, r: [2.5, 4], cls: 'mid' },
  { n: 10, k: 1250, r: [5, 8], cls: 'near' },
];

export function Sparks({ seed = 5 }) {
  const planes = useMemo(() => {
    const r = rng(seed * 131 + 9);
    return SPARK_PLANES.map((pl) =>
      Array.from({ length: pl.n }, () => ({
        left: `${(r() * 100).toFixed(2)}%`,
        top: `${(r() * 100).toFixed(2)}%`,
        '--d': `${(pl.r[0] + r() * (pl.r[1] - pl.r[0])).toFixed(1)}px`,
      }))
    );
  }, [seed]);
  return (
    <div className="ill ill-sparks" aria-hidden="true">
      {SPARK_PLANES.map((pl, i) => (
        <div key={pl.cls} className={`sp-plane sp-${pl.cls}`} style={{ '--k': pl.k }}>
          {planes[i].map((st, j) => <i key={j} style={st} />)}
        </div>
      ))}
    </div>
  );
}

/* ---------------- IV · The door: type drift ---------------- */
/* Two rows of outlined type — the confirmed door options — sliding in
   opposite directions behind the gallery. */
const DOOR_WORDS = [
  'Single · Double · Fire rated · Emergency · ',
  'Honeycomb · Rockwool · View glass · Powder coated · ',
];

export function TypeDrift() {
  const ref = useIllusion();
  return (
    <div className="ill ill-type" ref={ref} aria-hidden="true">
      {DOOR_WORDS.map((w, i) => (
        <p key={i} className={`td-row td-${i}`} style={{ '--k': i ? 36 : -36 }}>
          {w.repeat(4)}
        </p>
      ))}
    </div>
  );
}

/* ---------------- V · The walls: panel corridor ---------------- */
/* Two walls and a floor of panel seams in true perspective. Scrolling the
   pinned panel scene walks you along them, seam after seam. */
export function PanelCorridor({ scope }) {
  const ref = useIllusion(scope);
  return (
    <div className="ill ill-corr" ref={ref} aria-hidden="true">
      <div className="pc-wall pc-l"><span /></div>
      <div className="pc-wall pc-r"><span /></div>
      <div className="pc-wall pc-f"><span /></div>
    </div>
  );
}

/* ---------------- VI · The clean air: falling motes ---------------- */
/* Filtered air falls in a cleanroom; motes fall here on three focal
   planes, and the planes themselves part with the scroll. The fall is a
   CSS loop that rests whenever the dark section is off screen. */
const AIR_PLANES = [
  { n: 22, k: 60, cls: 'far' },
  { n: 14, k: 180, cls: 'mid' },
  { n: 7, k: 380, cls: 'near' },
];

export function CleanAir({ seed = 11 }) {
  const ref = useIllusion();
  const planes = useMemo(() => {
    const r = rng(seed * 71 + 3);
    return AIR_PLANES.map((pl) =>
      Array.from({ length: pl.n }, () => {
        const t = 7 + r() * 9;
        return {
          left: `${(r() * 100).toFixed(2)}%`,
          top: `${(r() * 80).toFixed(2)}%`,
          '--t': `${t.toFixed(2)}s`,
          '--dl': `${(-r() * t).toFixed(2)}s`,
        };
      })
    );
  }, [seed]);
  return (
    <div className="ill ill-air" ref={ref} aria-hidden="true">
      {AIR_PLANES.map((pl, i) => (
        <div key={pl.cls} className={`ca-plane ca-${pl.cls}`} style={{ '--k': pl.k }}>
          {planes[i].map((st, j) => <i key={j} style={st} />)}
        </div>
      ))}
    </div>
  );
}

/* ---------------- VII · The world: skyline ---------------- */
/* Three silhouettes — far towers, mid factory roofs, near low buildings —
   behind the horizontal run, each sliding at its own share of the run's
   distance (--dist, set by Applications). */
const SKY_W = 5200;
const SKY_H = 200;

function skylinePath(kind, seed) {
  const r = rng(seed);
  let d = `M0 ${SKY_H}`;
  let x = 0;
  while (x < SKY_W) {
    if (kind === 'far') {
      const w = 50 + r() * 110;
      const h = 70 + r() * 120;
      d += ` L${x.toFixed(0)} ${(SKY_H - h).toFixed(0)} L${(x + w).toFixed(0)} ${(SKY_H - h).toFixed(0)}`;
      x += w + r() * 30;
    } else if (kind === 'mid') {
      /* Sawtooth roof shed, sometimes with a stack. */
      const teeth = 2 + Math.floor(r() * 4);
      const tw = 34 + r() * 26;
      const base = SKY_H - (50 + r() * 40);
      d += ` L${x.toFixed(0)} ${base.toFixed(0)}`;
      for (let i = 0; i < teeth; i += 1) {
        d += ` L${(x + tw * 0.8).toFixed(0)} ${(base - 26).toFixed(0)} L${(x + tw * 0.8).toFixed(0)} ${base.toFixed(0)} L${(x + tw).toFixed(0)} ${base.toFixed(0)}`;
        x += tw;
      }
      if (r() < 0.45) {
        const sh = 50 + r() * 50;
        d += ` L${x.toFixed(0)} ${(base - sh).toFixed(0)} L${(x + 10).toFixed(0)} ${(base - sh).toFixed(0)} L${(x + 10).toFixed(0)} ${base.toFixed(0)}`;
        x += 10;
      }
      d += ` L${x.toFixed(0)} ${SKY_H}`;
      x += 20 + r() * 70;
    } else {
      const w = 90 + r() * 180;
      const h = 22 + r() * 42;
      d += ` L${x.toFixed(0)} ${(SKY_H - h).toFixed(0)} L${(x + w).toFixed(0)} ${(SKY_H - h).toFixed(0)} L${(x + w).toFixed(0)} ${SKY_H}`;
      x += w + 30 + r() * 120;
    }
  }
  return `${d} L${SKY_W} ${SKY_H} Z`;
}

const SKY_LAYERS = [
  { kind: 'far', k: 0.1, seed: 21 },
  { kind: 'mid', k: 0.24, seed: 34 },
  { kind: 'near', k: 0.42, seed: 55 },
];

export function Skyline({ scope }) {
  const ref = useIllusion(scope);
  const paths = useMemo(() => SKY_LAYERS.map((l) => skylinePath(l.kind, l.seed)), []);
  return (
    <div className="ill ill-sky" ref={ref} aria-hidden="true">
      {SKY_LAYERS.map((l, i) => (
        <svg key={l.kind} className={`sk-l sk-${l.kind}`} viewBox={`0 0 ${SKY_W} ${SKY_H}`} preserveAspectRatio="none" style={{ '--k': l.k }}>
          <path d={paths[i]} />
        </svg>
      ))}
    </div>
  );
}

/* ---------------- VIII · Your room: door-frame tunnel ---------------- */
/* The story ends where the hero began: at a door. Frames recede in a
   line and pass the camera one by one as the enquiry arrives. */
export function Portal() {
  const ref = useIllusion();
  return (
    <div className="ill ill-portal" ref={ref} aria-hidden="true">
      <div className="pt-space">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="pt-frame" style={{ '--i': i }} />
        ))}
      </div>
    </div>
  );
}
