import { useEffect, useRef, useState } from 'react';
import { HERO } from '../data/images.js';

/* Boot overture — "the doors open".
   The first thing a visitor sees is the brand, not a spinner. A door frame
   draws itself in datum lime, the wordmark writes in above a live counter,
   and when the page is genuinely ready the two halves of the screen part
   like double doors onto the site — which is itself a corridor ending in a
   door. Once per session; never under reduced motion.

   It is honest: the counter tracks real readiness (fonts, and the hero
   photograph on the home route), eased so it never jumps backwards or sits
   still. It never flashes past (MIN_MS) and never holds anyone hostage
   (MAX_MS; the stylesheet's dead-man switch clears it at 6 s regardless).
   The hero headline is held until the doors part, so its entrance is seen,
   not played out behind the cover. */

const MIN_MS = 1500;
const MAX_MS = 4800;
const HOLD_MS = 260; /* the full "100" is shown briefly */
const LEAVE_MS = 1300; /* panes part, then the overlay unmounts */
const WORD = 'akalka'.split('');
const pad2 = (n) => String(n).padStart(2, '0');

function shouldShow() {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return !window.sessionStorage.getItem('akalka-booted');
  } catch {
    return true;
  }
}

/* The hero photograph, decoded into the cache the same way the hero asks
   for it — only when the visitor lands on Home. */
function onHome() {
  const base = import.meta.env.BASE_URL;
  const p = window.location.pathname;
  return p === base || `${p}/` === base || p === `${base}index.html`;
}
function loadHero() {
  return new Promise((resolve) => {
    const im = new Image();
    im.sizes = '(max-aspect-ratio: 3/2) 156svh, 104vw';
    im.srcset = HERO.srcSet;
    im.src = HERO.src;
    (im.decode ? im.decode() : Promise.resolve()).then(resolve, resolve);
  });
}

/* The brand fonts, loaded for real. The stylesheet is non-blocking, so before
   it arrives document.fonts.ready resolves with nothing declared; wait for the
   link, then ask for the three faces by name. */
function brandFonts() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  const sheet = new Promise((resolve) => {
    const t0 = performance.now();
    (function poll() {
      if (document.querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com"]') || performance.now() - t0 > 1500) resolve();
      else setTimeout(poll, 40);
    })();
  });
  return sheet
    .then(() => Promise.all([
      document.fonts.load('700 48px Caveat'),
      document.fonts.load('800 24px Nunito'),
      document.fonts.load('400 16px "DM Sans"'),
    ]))
    .then(() => document.fonts.ready);
}

export default function Boot() {
  const [show, setShow] = useState(shouldShow);
  const [go, setGo] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const numRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    if (!show) return undefined;
    const root = document.documentElement;
    document.body.style.overflow = 'hidden';
    if (window.__lenis) window.__lenis.stop();

    let raf = 0;
    let timer = 0;
    let done = false;
    let ready = false;
    const start = performance.now();

    /* Letters and the door begin once the brand fonts can draw them. */
    const fonts = brandFonts();
    const begin = () => setGo(true);
    fonts.then(begin, begin);
    const fontGuard = setTimeout(begin, 1700);

    /* Real readiness: fonts, plus the hero photograph on Home. */
    Promise.all([fonts, onHome() ? loadHero() : Promise.resolve()]).then(
      () => { ready = true; },
      () => { ready = true; }
    );

    const finish = () => {
      if (done) return;
      done = true;
      try {
        window.sessionStorage.setItem('akalka-booted', '1');
      } catch {
        /* private mode — replays next visit, harmless */
      }
      setLeaving(true);
      /* The hero headline waits on this: its entrance plays as the doors part. */
      root.classList.remove('booting');
      window.dispatchEvent(new Event('akalka:booted'));
      timer = setTimeout(() => {
        setShow(false);
        document.body.style.overflow = '';
        if (window.__lenis) window.__lenis.start();
      }, LEAVE_MS);
    };

    let p = 0;
    let last = start;
    const tick = (now) => {
      const t = now - start;
      const dt = now - last;
      last = now;
      if (t > MAX_MS) ready = true;
      /* Time drives it to ~94 %; real readiness (and the minimum time) lets
         it through to 100. Exponential easing, so it glides at any frame rate. */
      const target = ready && t >= MIN_MS ? 1 : Math.min(0.94, (1 - Math.exp(-t / 900)) * 0.97);
      p += (target - p) * (1 - Math.exp(-dt / 170));
      const shown = p > 0.99 ? 100 : Math.min(99, Math.round(p * 100));
      if (numRef.current) numRef.current.textContent = shown === 100 ? '100' : pad2(shown);
      if (barRef.current) barRef.current.style.transform = `scaleX(${(shown / 100).toFixed(3)})`;
      if (shown === 100) {
        timer = setTimeout(finish, HOLD_MS);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      clearTimeout(fontGuard);
      root.classList.remove('booting');
      document.body.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
    };
  }, [show]);

  if (!show) return null;
  return (
    <div className={`boot${go ? ' go' : ''}${leaving ? ' is-leaving' : ''}`} role="status" aria-label="Loading AKALKA">
      <span className="boot-pane l" aria-hidden="true" />
      <span className="boot-pane r" aria-hidden="true" />
      <div className="boot-content" aria-hidden="true">
        {/* A door set in its frame, drawn in one stroke each. */}
        <svg className="boot-door" viewBox="0 0 60 100" fill="none" focusable="false">
          <path className="frame" pathLength="1" d="M6 98V6h48v92" />
          <path className="leaf" pathLength="1" d="M15 98V15h30v83" />
          <circle className="knob" cx="39" cy="58" r="2.6" />
        </svg>
        <p className="boot-word">
          {WORD.map((ch, i) => (
            <span key={i} style={{ '--i': i }}>{ch}</span>
          ))}
        </p>
        <p className="meta boot-sub">Doors · Panels</p>
      </div>
      <p className="boot-count" aria-hidden="true">
        <span ref={numRef}>00</span>
        <i>%</i>
      </p>
      <p className="meta boot-tag" aria-hidden="true">Crafted with care</p>
      <span className="boot-bar" aria-hidden="true">
        <i ref={barRef} />
      </span>
    </div>
  );
}
