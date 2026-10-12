import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollVar, usePointerTilt } from './Reveal.jsx';
import { HERO } from '../data/images.js';
import { doorNo } from '../data/products.js';
import { ArrowRight, ArrowUpRight } from './icons.jsx';

/* Hero — "Through the door".
   One full-bleed cleanroom corridor with the brand line over it. The
   corridor ends in a door, and scroll walks you through it in four
   beats, named on screen as you go:
     01 Measure — the headline lifts away, the corridor dims, a datum-lime
                  line traces the opening and dimensions it
     02 Set     — a steel frame is fitted and an AKALKA leaf rises into it
                  behind a lime scan line
     03 Open    — the lever turns, the leaf swings away, light sweeps its
                  face and floods through the gap; the floor beam is cut
                  by the leaf, so the door casts its own shadow
     04 Enter   — the camera pushes through into the lit room beyond,
                  where the rest of the page begins.
   The drawn door is registered to the photograph's own door: the photo
   is laid out by hand (not object-fit) so the opening's position is
   known exactly at every viewport, and everything scales about its
   centre. Soft light lives on its own GPU layer; only the crisp door
   re-rasters as it grows. Every value follows the scroll, so scrolling
   up closes the door again. Reduced motion gets the rested hero with no
   pinned run. */

/* Door opening in the photograph, as fractions of the frame
   (measured on the 3200px master). */
const OPEN = { l: 0.489, r: 0.583, t: 0.432, b: 0.737 };
/* The photo is drawn slightly larger than the stage so the pointer
   parallax can pan it without ever showing an edge. */
const OVERSCAN = 1.04;
const PAN = 16;
/* Fully open angle of the leaf, in degrees. */
const SWING = 78;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => t * t * (3 - 2 * t);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const span = (p, a, b) => clamp01((p - a) / (b - a));

const STEPS = ['Measure', 'Set', 'Open', 'Enter'];

/* Per-character masked rise for the brand headline.
   Words are wrapped in an inline-block so a line can break BETWEEN words
   but never inside one — without this, the per-character inline-block
   spans gave the line-breaker a soft-wrap opportunity between every
   adjacent pair and "Engineered surfaces." rendered as
   "Engineere" / "d surfaces." at every width up to 414px.
   The word gap is an explicit em-width box: an inline-block strips a lone
   space to zero width, which previously jammed the words together. */
function Chars({ text, base = 0 }) {
  /* After the entrance plays, release the inline delay + entrance
     animation so later hover Craft runs on its own timing. */
  const [played, setPlayed] = useState(false);
  useEffect(() => {
    /* While the boot overture is up the headline holds (CSS pauses its
       entrance); the release clock starts when the doors part. */
    let t = 0;
    const begin = () => {
      t = setTimeout(() => setPlayed(true), (base + text.length * 0.028 + 0.95) * 1000);
    };
    if (document.documentElement.classList.contains('booting')) {
      window.addEventListener('akalka:booted', begin, { once: true });
      return () => {
        window.removeEventListener('akalka:booted', begin);
        clearTimeout(t);
      };
    }
    begin();
    return () => clearTimeout(t);
  }, [text, base]);
  /* Global character index so the rise order is strictly left to right
     across the whole line. */
  let gi = 0;
  const words = text.split(' ');
  return (
    <span className="mask" aria-label={text}>
      <span className="ch-line" aria-hidden="true">
        {words.map((word, w) => (
          <span className="ch-word" key={w}>
            {word.split('').map((ch) => {
              const i = gi++;
              return (
                <span
                  key={i}
                  className={`ch${played ? ' done' : ''}`}
                  style={
                    played
                      ? { '--ci': i }
                      : { animationDelay: `${(base + i * 0.028).toFixed(3)}s`, '--ci': i }
                  }
                >
                  {ch}
                </span>
              );
            })}
            {w < words.length - 1 && <span className="ch-space"> </span>}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function Hero() {
  const rootRef = useRef(null);
  const pinRef = useRef(null);
  const imgRef = useRef(null);
  const glowRef = useRef(null);
  const doorRef = useRef(null);
  const shadeRef = useRef(null);
  const dimRef = useRef(null);
  const grainRef = useRef(null);
  const lockRef = useRef(null);
  const stepsRef = useRef(null);
  const hintRef = useRef(null);
  const barRef = useRef(null);
  const copyRef = useRef(null);
  /* Geometry measured on resize, read every scroll frame. */
  const geo = useRef({ zmax: 4 });
  const stepRef = useRef(-1);
  const reduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  /* The pointer pan is written straight onto the three layers that move
     (photo, light, door) as a `translate` — no inherited variable, so a
     moving mouse never restyles the hero's subtree. */
  usePointerTilt(pinRef, (x, y) => {
    const t = `${(-x * 16).toFixed(2)}px ${(-y * 10).toFixed(2)}px`;
    if (imgRef.current) imgRef.current.style.translate = t;
    if (glowRef.current) glowRef.current.style.translate = t;
    if (doorRef.current) doorRef.current.style.translate = t;
  });

  /* Lay the photograph out to cover the stage with the door centred
     horizontally whenever the frame is cropped at the sides, then place
     the light layer and the drawn door exactly over the photographed one. */
  useEffect(() => {
    const pin = pinRef.current;
    const img = imgRef.current;
    const glow = glowRef.current;
    const door = doorRef.current;
    if (!pin || !img || !glow || !door) return undefined;
    const layout = () => {
      const vw = pin.clientWidth;
      const vh = pin.clientHeight;
      if (!vw || !vh) return;
      const s = Math.max(vw / HERO.w, vh / HERO.h) * OVERSCAN;
      const iw = HERO.w * s;
      const ih = HERO.h * s;
      const mid = (OPEN.l + OPEN.r) / 2;
      /* Centre the door, but keep PAN px of photo past every edge. */
      const ox = Math.min(-PAN, Math.max(vw - iw + PAN, vw / 2 - mid * iw));
      const oy = (vh - ih) / 2;
      const L = ox + OPEN.l * iw;
      const T = oy + OPEN.t * ih;
      const W = (OPEN.r - OPEN.l) * iw;
      const H = (OPEN.b - OPEN.t) * ih;
      const cx = L + W / 2;
      const cy = T + H / 2;
      Object.assign(img.style, {
        width: `${iw}px`,
        height: `${ih}px`,
        left: `${ox}px`,
        top: `${oy}px`,
        transformOrigin: `${cx - ox}px ${cy - oy}px`,
      });
      const box = { left: `${L}px`, top: `${T}px`, width: `${W}px`, height: `${H}px` };
      Object.assign(glow.style, box);
      Object.assign(door.style, box);
      door.style.setProperty('--persp', `${Math.round(W * 3.4)}px`);
      /* Light falls from the sill to the bottom of the screen. */
      glow.style.setProperty('--beam', `${Math.max(0, vh - (T + H))}px`);
      /* The corridor dims around the door, wherever the crop puts it. */
      if (dimRef.current) {
        dimRef.current.style.setProperty('--dcx', `${cx}px`);
        dimRef.current.style.setProperty('--dcy', `${cy}px`);
      }
      /* Scale at which the opening covers the whole stage. */
      geo.current.zmax = 1.06 * Math.max((2 * Math.max(cx, vw - cx)) / W, (2 * Math.max(cy, vh - cy)) / H);
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(pin);
    return () => ro.disconnect();
  }, []);

  /* Every per-frame value is written on the smallest element that reads
     it — direct opacity/transform where one node moves, a scoped custom
     property where a small group does. A custom property restyles its
     element's whole subtree, and the headline alone is ~50 nodes, so the
     old single set of variables on the pin restyled the entire hero on
     every scrolled frame. Unchanged values write nothing. */
  const put = useRef(new WeakMap());
  const setVar = (el, k, v) => {
    if (!el) return;
    const s = typeof v === 'number' ? v.toFixed(4) : v;
    let m = put.current.get(el);
    if (!m) put.current.set(el, (m = {}));
    if (m[k] === s) return;
    m[k] = s;
    el.style.setProperty(k, s);
  };
  const setStyle = (el, k, v) => {
    if (!el) return;
    let m = put.current.get(el);
    if (!m) put.current.set(el, (m = {}));
    if (m[k] === v) return;
    m[k] = v;
    el.style[k] = v;
  };
  useScrollVar(rootRef, {
    mode: 'pin',
    writeVar: false,
    onProgress: (p) => {
      const pin = pinRef.current;
      if (!pin || reduced.current) return;
      const { zmax } = geo.current;
      /* Log-space dolly: equal scroll reads as equal travel, slow while
         the door is measured and opened, accelerating through it. */
      const c = Math.pow(span(p, 0.02, 0.86), 1.7);
      const z = Math.pow(zmax, c);
      const zp = z <= 1.8 ? z : 1.8 + (z - 1.8) * 0.3;
      /* The beats. */
      const hc = ease(span(p, 0, 0.14));
      const tr = span(p, 0.03, 0.15);
      const dm = ease(span(p, 0.11, 0.19));
      const fr = ease(span(p, 0.13, 0.2));
      const li = ease(span(p, 0.16, 0.25));
      /* Lever: pressed down, held while the latch clears, released. */
      const hl = ease(span(p, 0.245, 0.27)) * (1 - ease(span(p, 0.33, 0.37)));
      const op = easeInOut(span(p, 0.265, 0.56));
      /* How much of the opening the leaf still blocks, as seen from the
         corridor — shapes the light that gets through. */
      const bf = Math.cos((op * SWING * Math.PI) / 180);
      const ps = ease(span(p, 0.68, 0.84));
      const lk = ease(span(p, 0.84, 0.97));
      const door = doorRef.current;
      const glow = glowRef.current;
      const steps = stepsRef.current;
      /* photo, shade, dim, grain, hint, bar, copy: one node each */
      setStyle(imgRef.current, 'transform', `scale(${zp.toFixed(4)})`);
      setStyle(shadeRef.current, 'opacity', (1 - hc * 0.5).toFixed(3));
      setStyle(dimRef.current, 'opacity', ease(span(p, 0, 0.3)).toFixed(3));
      setStyle(grainRef.current, 'opacity', (0.05 * (1 - ps)).toFixed(4));
      setStyle(hintRef.current, 'opacity', Math.max(0, 1 - hc * 1.5).toFixed(3));
      setStyle(barRef.current, 'transform', `scaleX(${p.toFixed(4)})`);
      const kids = copyRef.current ? copyRef.current.children : [];
      for (let i = 0; i < kids.length; i += 1) {
        setStyle(kids[i], 'opacity', Math.max(0, 1 - hc * 1.15).toFixed(3));
        setStyle(kids[i], 'transform', `translate3d(0, ${(hc * -(40 + i * 30)).toFixed(2)}px, 0)`);
      }
      /* the door, its light, the readout and the lockup: scoped variables */
      setVar(door, '--z', z);
      setVar(door, '--fr', fr);
      setVar(door, '--li', li);
      setVar(door, '--hl', hl);
      setVar(door, '--op', op);
      setVar(door, '--ps', ps);
      setVar(door, '--tr', tr);
      setVar(door, '--dm', dm);
      setVar(glow, '--z', z);
      setVar(glow, '--bf', bf);
      setVar(glow, '--ps', ps);
      setVar(steps, '--hc', hc);
      setVar(steps, '--tr', tr);
      setVar(steps, '--li', li);
      setVar(steps, '--op', op);
      setVar(steps, '--ps', ps);
      setVar(lockRef.current, '--lk', lk);
      /* Current beat, for the step readout. */
      const step = ps > 0.02 ? 3 : op > 0.01 || hl > 0.01 ? 2 : fr > 0.01 ? 1 : 0;
      if (step !== stepRef.current) {
        stepRef.current = step;
        pin.dataset.step = String(step);
      }
      /* Hidden copy and controls leave the tab order too. */
      pin.classList.toggle('copy-gone', p > 0.14);
      pin.classList.toggle('ui-gone', p > 0.7);
    },
  });

  const skip = () => {
    const el = document.getElementById('range-strip');
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 40;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <section className="hero" ref={rootRef} aria-label="AKALKA — Doors & Panels">
      <div className="hero-pin" ref={pinRef} data-step="0">
        <img
          ref={imgRef}
          className="hero-photo"
          src={HERO.src}
          srcSet={HERO.srcSet}
          sizes="(max-aspect-ratio: 3/2) 156svh, 104vw"
          alt={HERO.alt}
          fetchPriority="high"
          decoding="async"
          draggable={false}
        />
        <div className="hero-shade" ref={shadeRef} aria-hidden="true" />
        <div className="hero-dim" ref={dimRef} aria-hidden="true" />
        <i className="hero-grain" ref={grainRef} aria-hidden="true" />

        {/* Soft light: its own layer, scaled as a bitmap (it is all blur). */}
        <div className="hero-glow" ref={glowRef} aria-hidden="true">
          <span className="hg-rays" />
          <span className="hg-halo" />
          <span className="hg-beam" />
        </div>

        {/* The door itself: crisp line work, re-rastered as it grows. */}
        <div className="hero-door" ref={doorRef} aria-hidden="true">
          <span className="hd-frame">
            <i className="hf-j l" />
            <i className="hf-j r" />
            <i className="hf-h" />
          </span>
          <span className="hd-set">
            <span className="hd-beyond" />
            <span className="hd-floor" />
            <span className="hd-leaf">
              <span className="hd-glass" />
              <span className="hd-sheen" />
              <span className="hd-lever" />
              <span className="hd-rim" />
              <span className="hd-edge" />
            </span>
          </span>
          <span className="hd-hinge h1" />
          <span className="hd-hinge h2" />
          <span className="hd-hinge h3" />
          <span className="hd-scan" />
          <span className="hd-trace">
            <i className="l" />
            <i className="t" />
            <i className="r" />
            <i className="b" />
          </span>
          <span className="hd-dimw"><b>Size as per requirement</b></span>
          <span className="hd-dimh" />
          <span className="hd-tag">
            <b>{doorNo('regular', 'Single')}</b> Single door · view glass
          </span>
        </div>

        <div className="hero-lockup" ref={lockRef} aria-hidden="true">
          <p className="meta">AKALKA — Doors &amp; Panels</p>
          <p className="font-hand">Step inside.</p>
          <i />
        </div>

        <div className="hero-copy" ref={copyRef}>
          <p className="meta">AKALKA — Doors &amp; Panels</p>
          <h1 className="display">
            <Chars text="Engineered surfaces." base={0.15} />
            <span className="font-hand" style={{ color: 'var(--datum)' }}>
              <Chars text="Precise interiors." base={0.55} />
            </span>
          </h1>
          <p className="hero-tag">
            Doors, sandwich panels, cleanroom panels, partition systems, view
            glass and the profiles that join them — one coordinated
            manufacturing system.
          </p>
          <div className="hero-ctas">
            <Link to="/products" className="btn btn-solid">
              Explore the system <ArrowRight className="arr arr-r" />
            </Link>
            <Link to="/contact" className="btn btn-light">
              Start an enquiry <ArrowUpRight className="arr arr-up" />
            </Link>
          </div>
        </div>

        <ol className="hero-steps" ref={stepsRef} aria-hidden="true">
          {STEPS.map((s, i) => (
            <li key={s} className={`hs-${i}`}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              <span>{s}</span>
              <i />
            </li>
          ))}
        </ol>
        <p className="meta hero-hint scroll-cue" ref={hintRef} aria-hidden="true">
          <i /> Scroll to step inside
        </p>
        {/* A visible, keyboard-reachable way past the pinned run that does
            not depend on finding the nav. Routed through Lenis so it
            matches every other scroll on the site. */}
        <button type="button" className="hero-skip" onClick={skip}>
          Skip to catalogue <ArrowRight className="arr arr-r" />
        </button>
        <div className="hero-bar" aria-hidden="true"><span ref={barRef} /></div>
      </div>
    </section>
  );
}
