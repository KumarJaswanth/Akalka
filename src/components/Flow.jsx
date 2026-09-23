import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products.js';
import { IMG } from '../data/images.js';
import { ArrowRight, ArrowUpRight } from './icons.jsx';

/* AKALKA flow: the site opens inside a sticky full-viewport
   (100svh × 100vw) stage — brand panel first, then all five product
   systems. Scroll scrubs a choreographed sequence: every screen ARRIVES
   from a different side (right, bottom, left, top, zoom) while the
   previous one leaves the opposite way, and every line of text staggers
   in on its own offset. Fully reversible — scroll back up and it rewinds.
   Mobile and reduced-motion fall back to a calm vertical stack. */

const CODE = { doors: 'DR', sandwich: 'SW', cleanroom: 'CR', partition: 'PT', profiles: 'PF' };
const PHOTO = {
  doors: IMG.doorDouble,
  sandwich: IMG.sandwich,
  cleanroom: IMG.cleanroom,
  partition: IMG.partition,
  profiles: IMG.profiles.track,
};

/* Entrance side per panel (panel 0 starts on stage). */
const ENTER = [null, 'right', 'bottom', 'left', 'top', 'zoom'];
const VEC = {
  right: { x: 100, y: 0 },
  left: { x: -100, y: 0 },
  bottom: { x: 0, y: 100 },
  top: { x: 0, y: -100 },
};

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);

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
    const panelEls = () => track.querySelectorAll('.flow-panel');
    const clearStage = () => {
      track.style.transform = '';
      panelEls().forEach((p) => {
        p.style.transform = '';
        p.style.opacity = '';
        p.style.visibility = '';
        ['--t', '--cdx', '--gdx'].forEach((v) => p.style.removeProperty(v));
      });
    };
    if (staticMode) {
      clearStage();
      return;
    }
    let raf = 0;
    const update = () => {
      const vh = window.innerHeight;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const span = root.offsetHeight - vh;
      const p = span > 0 ? clamp01((window.scrollY - top) / span) : 0;
      const seg = p * (total - 1);
      const idx = Math.min(total - 1, Math.round(seg));
      setActive((prev) => (prev === idx ? prev : idx));
      panelEls().forEach((panel, i) => {
        const enter = ENTER[i];
        const ev = enter ? VEC[enter] : null;
        const local = smooth(clamp01(seg - i + 1));
        let x = 0;
        let y = 0;
        let scale = 1;
        let op = 1;
        let vis = true;
        /* Entrance — panels 1..5 each arrive from their own side. */
        if (i > 0 && seg < i) {
          if (enter === 'zoom') {
            scale = 1 + (1 - local) * 0.14;
            op = local;
          } else {
            x = (1 - local) * ev.x;
            y = (1 - local) * ev.y;
          }
          if (local <= 0) vis = false;
        }
        /* Exit — leaves the opposite way the next panel arrives. */
        if (i < total - 1 && seg > i) {
          const next = ENTER[i + 1];
          const ex = smooth(clamp01(seg - i));
          if (next === 'zoom') {
            scale = 1 + ex * 0.1;
            op = 1 - ex;
          } else {
            const nv = VEC[next];
            x = -ex * nv.x;
            y = -ex * nv.y;
          }
          if (ex >= 1) vis = false;
        }
        panel.style.transform = `translate3d(${x.toFixed(2)}%, ${y.toFixed(2)}%, 0) scale(${scale.toFixed(4)})`;
        panel.style.opacity = op.toFixed(3);
        panel.style.visibility = vis ? 'visible' : 'hidden';
        panel.style.setProperty('--t', local.toFixed(3));
        panel.style.setProperty('--cdx', i % 2 === 0 ? '-70px' : '70px');
        panel.style.setProperty('--gdx', i % 2 === 0 ? '90px' : '-90px');
      });
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
