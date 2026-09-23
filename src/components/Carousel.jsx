import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from './icons.jsx';

/* Premium minimal carousel: native snap track (touch + wheel + keyboard),
   Framer-Motion caption crossfade, index counter, progress hairline.
   No autoplay — motion answers the visitor. */

export default function Carousel({ slides, label, hint, dark = false }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const n = slides.length;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const els = Array.from(track.querySelectorAll('.car-slide'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.i));
        });
      },
      { root: track, threshold: 0.55 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [n]);

  const go = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const next = (active + dir + n) % n;
    track
      .querySelector(`.car-slide[data-i="${next}"]`)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  };

  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };

  const s = slides[active];

  return (
    <div className={`car${dark ? ' dark' : ''}`}>
      <div className="car-top">
        <div className="car-label">
          {label && <span className="meta">{label}</span>}
          {hint && <span className="meta car-hint">{hint}</span>}
        </div>
        <div className="car-nav">
          <span className="meta car-count" aria-live="polite">
            {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
          <button type="button" className="car-btn" onClick={() => go(-1)} aria-label="Previous slide">
            <ArrowLeft />
          </button>
          <button type="button" className="car-btn" onClick={() => go(1)} aria-label="Next slide">
            <ArrowRight />
          </button>
        </div>
      </div>

      <div
        className="car-track"
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={label || 'Gallery'}
        onKeyDown={onKey}
      >
        {slides.map((sl, i) => (
          <figure
            key={`${sl.src}-${i}`}
            data-i={i}
            className={`car-slide${i === active ? ' active' : ''}`}
            aria-hidden={i !== active}
          >
            <div className="car-ph">
              <img
                src={sl.src}
                alt={i === active ? sl.alt : ''}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.closest('.car-slide').style.display = 'none';
                }}
              />
            </div>
          </figure>
        ))}
      </div>

      <div className="car-foot">
        <AnimatePresence mode="wait">
          <motion.figcaption
            key={active}
            className="car-cap"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="meta car-code">{s.code}</span>
            <span className="car-title">{s.title}</span>
            {s.note && <span className="car-note">{s.note}</span>}
          </motion.figcaption>
        </AnimatePresence>
        <div className="car-progress" aria-hidden="true">
          <motion.span
            animate={{ scaleX: (active + 1) / n }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
