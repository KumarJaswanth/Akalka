import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products.js';
import { IMG } from '../data/images.js';
import { ArrowRight, ArrowUpRight } from './icons.jsx';

/* AKALKA flow: the site opens inside a sticky full-viewport
   (100svh × 100vw) journey — brand panel first, then all five product
   systems. Vertical scroll drives horizontal travel; native sticky
   positioning keeps it butter-smooth, JS writes only a translate.
   Mobile and reduced-motion fall back to a calm vertical stack. */

const CODE = { doors: 'DR', sandwich: 'SW', cleanroom: 'CR', partition: 'PT', profiles: 'PF' };
const PHOTO = {
  doors: IMG.doorDouble,
  sandwich: IMG.sandwich,
  cleanroom: IMG.cleanroom,
  partition: IMG.partition,
  profiles: IMG.profiles.track,
};

function isStaticEnv() {
  if (typeof window === 'undefined') return true;
  return (
    window.matchMedia('(max-width: 820px)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function Flow() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [staticMode, setStaticMode] = useState(isStaticEnv);
  const total = CATEGORIES.length + 1;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px), (prefers-reduced-motion: reduce)');
    const apply = () => setStaticMode(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;
    if (staticMode) {
      track.style.transform = '';
      return;
    }
    let raf = 0;
    const update = () => {
      const vh = window.innerHeight;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const span = root.offsetHeight - vh;
      const p = span > 0 ? Math.min(1, Math.max(0, (window.scrollY - top) / span)) : 0;
      const maxX = track.scrollWidth - window.innerWidth;
      track.style.transform = `translate3d(${(-p * maxX).toFixed(1)}px, 0, 0)`;
      const idx = Math.min(total - 1, Math.round(p * (total - 1)));
      setActive((prev) => (prev === idx ? prev : idx));
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
  }, [staticMode, total]);

  const names = ['AKALKA', ...CATEGORIES.map((c) => c.name)];

  return (
    <section
      className={`flow${staticMode ? ' flow-static' : ''}`}
      ref={rootRef}
      aria-label="AKALKA product universe"
    >
      <div className="flow-pin">
        <div className="flow-track" ref={trackRef}>
          {/* 00 — brand panel */}
          <article className={`flow-panel flow-brand${active === 0 ? ' active' : ''}`}>
            <div
              className="flow-bg"
              style={{ backgroundImage: `url("${IMG.heroBg.src}")` }}
              role="img"
              aria-label={IMG.heroBg.alt}
            />
            <div className="flow-shade" aria-hidden="true" />
            <span className="flow-ghost" aria-hidden="true">
              AK
            </span>
            <div className="flow-copy">
              <p className="meta">AKALKA — Doors &amp; Panels</p>
              <h1 className="display">
                <span className="mask">
                  <span>Engineered surfaces.</span>
                </span>
                <span className="mask">
                  <span style={{ animationDelay: '0.12s' }}>Precise interiors.</span>
                </span>
              </h1>
              <p className="flow-tag">
                Doors, sandwich panels, cleanroom panels, partition systems and
                the profiles that join them — one coordinated manufacturing system.
              </p>
              <div className="flow-ctas">
                <Link to="/products" className="btn btn-solid">
                  Explore the system <ArrowRight className="arr arr-r" />
                </Link>
                <Link to="/contact" className="btn btn-light">
                  Start an enquiry <ArrowUpRight className="arr arr-up" />
                </Link>
              </div>
            </div>
          </article>

          {/* 01–05 — product panels */}
          {CATEGORIES.map((c, i) => {
            const img = PHOTO[c.id];
            const n = i + 1;
            return (
              <article
                key={c.id}
                className={`flow-panel${n === active ? ' active' : ''}`}
                aria-label={`${c.name}, ${c.tagline}`}
              >
                <div
                  className="flow-bg"
                  style={{ backgroundImage: `url("${img.src}")` }}
                  role="img"
                  aria-label={img.alt}
                />
                <div className="flow-shade" aria-hidden="true" />
                <span className="flow-ghost" aria-hidden="true">
                  {String(n).padStart(2, '0')}
                </span>
                <div className="flow-copy">
                  <p className="meta">
                    {CODE[c.id]} — {c.index} / 05
                  </p>
                  <h2 className="display">{c.name}</h2>
                  <p className="flow-tag">{c.tagline}</p>
                  <Link to={`/products#${c.id}`} className="btn btn-light">
                    Explore <ArrowRight className="arr arr-r" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <div className="flow-ui" aria-hidden="true">
          <span className="meta">Product universe</span>
          <span className="meta">
            {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} — {names[active]}
          </span>
        </div>
        <p className="meta flow-hint scroll-cue" aria-hidden="true">
          <i /> Scroll to travel
        </p>
        <div className="flow-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${(active + 1) / total})` }} />
        </div>
      </div>
    </section>
  );
}
