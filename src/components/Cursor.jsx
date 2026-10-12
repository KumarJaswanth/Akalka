import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/* Contextual cursor — precise pointers only, never touch, never under
   reduced motion. A lime dot tracks the pointer exactly; a ring trails
   it with inertia, swells over anything clickable, and turns into a
   labelled disc over surfaces with a gesture of their own (drag a
   gallery, view a range, scroll a scene). It also feeds the card
   spotlight: the hovered card receives --mx / --my for its light.
   One rAF loop that sleeps whenever the ring has settled. */

const LABELS = [
  ['.gal-stage', 'Drag'],
  ['.ed-ph, .cat-card, .pillar-ph, .apps-ph', 'View'],
  ['.anat-fig, .xpl-stage', 'Scroll'],
];
const SPOT = '.intro-col, .pillar, .step-card, .pt-card, .enquiry-card, .door-cfg-body, .spec-table, .apps-card, .faq-item';
const HOT = 'a, button, summary, label, select, [role="button"], .chip';

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const lab = labRef.current;
    document.documentElement.classList.add('has-cur');
    dot.style.transform = 'translate3d(-100px, -100px, 0)';
    ring.style.transform = 'translate3d(-100px, -100px, 0)';
    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let lastSpot = null;
    const tick = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.4 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!raf) raf = requestAnimationFrame(tick);
      read(e.target instanceof Element ? e.target : null);
    };
    /* The page moves under a resting pointer while scrolling, so the
       state is re-read from whatever is now beneath it — once the scroll
       settles. elementFromPoint forces style and layout, so doing it on
       every scrolled frame doubled the cost of the frame. */
    let sTimer = 0;
    const onScroll = () => {
      if (x < 0) return;
      clearTimeout(sTimer);
      sTimer = setTimeout(() => read(document.elementFromPoint(x, y)), 120);
    };
    const read = (t) => {
      if (!t) return;
      let label = '';
      for (const [sel, l] of LABELS) {
        if (t.closest(sel)) {
          label = l;
          break;
        }
      }
      const field = t.closest('input, textarea, select');
      ring.classList.toggle('lab', !!label && !field);
      ring.classList.toggle('hot', !label && !!t.closest(HOT));
      document.documentElement.classList.toggle('cur-field', !!field);
      if (label && lab.textContent !== label) lab.textContent = label;
      const spot = t.closest(SPOT);
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', `${(x - r.left).toFixed(0)}px`);
        spot.style.setProperty('--my', `${(y - r.top).toFixed(0)}px`);
        spot.classList.add('spot-on');
      }
      if (lastSpot && lastSpot !== spot) lastSpot.classList.remove('spot-on');
      lastSpot = spot;
    };
    const down = () => ring.classList.add('press');
    const up = () => ring.classList.remove('press');
    const leave = () => {
      dot.classList.add('out');
      ring.classList.add('out');
    };
    const enter = () => {
      dot.classList.remove('out');
      ring.classList.remove('out');
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('pointerleave', leave);
    document.addEventListener('pointerenter', enter);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-cur', 'cur-field');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', onScroll);
      clearTimeout(sTimer);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('pointerleave', leave);
      document.removeEventListener('pointerenter', enter);
    };
  }, []);

  /* A route change swaps the DOM under a resting pointer — drop any
     label or hover state that belonged to the old page. */
  useEffect(() => {
    if (ringRef.current) ringRef.current.classList.remove('lab', 'hot');
  }, [pathname]);

  return (
    <>
      <div className="cur-ring" ref={ringRef} aria-hidden="true">
        <span className="cur-lab" ref={labRef} />
      </div>
      <div className="cur-dot" ref={dotRef} aria-hidden="true" />
    </>
  );
}
