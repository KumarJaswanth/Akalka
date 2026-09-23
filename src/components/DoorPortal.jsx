import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IMG } from '../data/images.js';
import { ArrowRight } from './icons.jsx';

/* The Opening: a scrubbed, reversible double-door portal. Scrolling parts
   two photographic door slabs (hinged at the outer edges) and walks you
   from the light sandwich chapter into the dark cleanroom range. One rAF
   loop writes only transforms and opacity. Static parted state for mobile
   and reduced-motion. */

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);

function isStaticEnv() {
  if (typeof window === 'undefined') return true;
  return (
    window.matchMedia('(max-width: 820px)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function DoorPortal() {
  const rootRef = useRef(null);
  const slabL = useRef(null);
  const slabR = useRef(null);
  const bloomRef = useRef(null);
  const contentRef = useRef(null);
  const [staticMode, setStaticMode] = useState(isStaticEnv);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px), (prefers-reduced-motion: reduce)');
    const apply = () => setStaticMode(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || staticMode) return;
    let raf = 0;
    const update = () => {
      const vh = window.innerHeight;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const span = root.offsetHeight - vh;
      const p = span > 0 ? clamp01((window.scrollY - top) / span) : 0;
      /* Dwell closed, open through the middle, dwell open. */
      const open = smooth(clamp01((p - 0.12) / 0.62));
      const ang = (open * 68).toFixed(2);
      const out = (open * 12).toFixed(2);
      if (slabL.current) {
        slabL.current.style.transform = `translateX(-${out}%) rotateY(-${ang}deg)`;
      }
      if (slabR.current) {
        slabR.current.style.transform = `translateX(${out}%) rotateY(${ang}deg)`;
      }
      if (bloomRef.current) bloomRef.current.style.opacity = (open * 0.9).toFixed(3);
      if (contentRef.current) {
        contentRef.current.style.opacity = open.toFixed(3);
        contentRef.current.style.transform = `translateY(${((1 - open) * 56).toFixed(1)}px)`;
        contentRef.current.style.visibility = open > 0.02 ? 'visible' : 'hidden';
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [staticMode]);

  const slab = IMG.doorSingle.src;

  return (
    <section
      className={`portal${staticMode ? ' portal-static' : ''}`}
      ref={rootRef}
      aria-label="Passage to the cleanroom range"
    >
      <div className="portal-pin">
        <div
          ref={slabL}
          className="slab slab-l"
          aria-hidden="true"
          style={{
            backgroundImage: `url("${slab}")`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% center',
          }}
        />
        <div
          ref={slabR}
          className="slab slab-r"
          aria-hidden="true"
          style={{
            backgroundImage: `url("${slab}")`,
            backgroundSize: '200% 100%',
            backgroundPosition: '100% center',
          }}
        />
        <div ref={bloomRef} className="portal-bloom" aria-hidden="true" />
        <div ref={contentRef} className="portal-copy">
          <p className="meta">CR — Cleanroom panels</p>
          <h2 className="display">Step inside controlled interiors.</h2>
          <Link to="/products#cleanroom" className="btn btn-light">
            Enter the range <ArrowRight className="arr arr-r" />
          </Link>
        </div>
        <div className="portal-ui" aria-hidden="true">
          <span className="meta">DR-D — Double doors</span>
          <span className="meta">Scroll</span>
        </div>
      </div>
    </section>
  );
}
