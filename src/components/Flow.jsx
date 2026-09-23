import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products.js';
import { IMG } from '../data/images.js';
import { ArrowRight } from './icons.jsx';

/* Product-universe flow: a sticky full-viewport (100svh × 100vw) journey.
   Vertical scroll drives a horizontal tour of all five systems — native
   sticky positioning keeps it butter-smooth; JS writes only a translate.
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
  const panels = CATEGORIES;

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
      const total = root.offsetHeight - vh;
      const p = total > 0 ? Math.min(1, Math.max(0, (window.scrollY - top) / total)) : 0;
      const maxX = track.scrollWidth - window.innerWidth;
      track.style.transform = `translate3d(${(-p * maxX).toFixed(1)}px, 0, 0)`;
      const idx = Math.min(panels.length - 1, Math.round(p * (panels.length - 1)));
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
  }, [staticMode, panels.length]);

  return (
    <section
      className={`flow${staticMode ? ' flow-static' : ''}`}
      ref={rootRef}
      aria-label="Product universe"
    >
      <div className="flow-pin">
        <div className="flow-track" ref={trackRef}>
          {panels.map((c, i) => {
            const img = PHOTO[c.id];
            return (
              <article
                key={c.id}
                className={`flow-panel${i === active ? ' active' : ''}`}
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
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flow-copy">
                  <p className="meta">
                    {CODE[c.id]} — {c.index} / 05
                  </p>
                  <h3 className="display">{c.name}</h3>
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
            {String(active + 1).padStart(2, '0')} / 05 — {panels[active].name}
          </span>
        </div>
        <p className="meta flow-hint" aria-hidden="true">
          Scroll to travel
        </p>
        <div className="flow-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${(active + 1) / panels.length})` }} />
        </div>
      </div>
    </section>
  );
}
