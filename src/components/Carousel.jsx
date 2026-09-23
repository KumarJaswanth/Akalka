import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from './icons.jsx';

/* Immersive gallery: one full-bleed frame at a time, directional
   clip-wipe transitions, settling photography, staggered captions,
   story-style progress, drag / arrows / keyboard. */

const EASE = [0.16, 1, 0.3, 1];

const slideV = {
  enter: (d) => ({ clipPath: d >= 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0%)' }),
  center: { clipPath: 'inset(0 0 0 0%)' },
  exit: (d) => ({ clipPath: d >= 0 ? 'inset(0 100% 0 0%)' : 'inset(0 0 0 100%)' }),
};

export default function Carousel({ slides, label, hint, dark = false, play = true, interval = 6000 }) {
  const [[index, dir], setIndex] = useState([0, 1]);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = slides.length;
  const T = reduce ? 0 : 0.9;

  const paginate = useCallback(
    (d) => setIndex(([i]) => [(i + d + n) % n, d]),
    [n]
  );
  const goTo = useCallback(
    (i) => setIndex(([cur]) => (i === cur ? [cur, 1] : [i, i > cur ? 1 : -1])),
    []
  );

  useEffect(() => {
    if (!play || reduce || paused || n < 2) return;
    const t = setTimeout(() => paginate(1), interval);
    return () => clearTimeout(t);
  }, [play, reduce, paused, n, interval, index, paginate]);

  const onKey = (e) => {
    if (e.key === 'ArrowRight') paginate(1);
    if (e.key === 'ArrowLeft') paginate(-1);
  };

  const s = slides[index];

  return (
    <div
      className={`car${dark ? ' dark' : ''}`}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="car-top">
        <div className="car-label">
          {label && <span className="meta">{label}</span>}
          {hint && <span className="meta car-hint">{hint}</span>}
        </div>
        <div className="car-nav">
          <span className="meta car-count" aria-live="polite">
            {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
          <button type="button" className="car-btn" onClick={() => paginate(-1)} aria-label="Previous slide">
            <ArrowLeft />
          </button>
          <button type="button" className="car-btn" onClick={() => paginate(1)} aria-label="Next slide">
            <ArrowRight />
          </button>
        </div>
      </div>

      <motion.div
        className="gal-stage"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={label || 'Gallery'}
        onKeyDown={onKey}
        drag={reduce ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(e, { offset }) => {
          if (offset.x < -110) paginate(1);
          else if (offset.x > 110) paginate(-1);
        }}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.figure
            key={index}
            className="gal-slide"
            custom={dir}
            variants={slideV}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: T, ease: EASE }}
            aria-hidden={false}
          >
            <motion.img
              src={s.src}
              alt={s.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              initial={{ scale: 1.16 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: reduce ? 0 : 1.8, ease: EASE }}
              onError={(e) => {
                e.currentTarget.closest('.gal-slide').style.display = 'none';
              }}
            />
            <figcaption className="gal-cap">
              <motion.span
                className="meta car-code"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: T, ease: EASE, delay: reduce ? 0 : 0.35 }}
              >
                {s.code}
              </motion.span>
              <motion.span
                className="car-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: T, ease: EASE, delay: reduce ? 0 : 0.45 }}
              >
                {s.title}
              </motion.span>
              {s.note && (
                <motion.span
                  className="car-note"
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: T, ease: EASE, delay: reduce ? 0 : 0.55 }}
                >
                  {s.note}
                </motion.span>
              )}
            </figcaption>
            <motion.span
              className="gal-idx"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: T, delay: reduce ? 0 : 0.5 }}
            >
              {String(index + 1).padStart(2, '0')}
            </motion.span>
          </motion.figure>
        </AnimatePresence>
      </motion.div>

      <div className="car-foot">
        <div className="gal-segs" aria-hidden="true" style={{ '--t': `${interval}ms` }}>
          {slides.map((sl, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              title={`Go to slide ${i + 1}`}
              className={`gal-seg${i < index ? ' done' : ''}${i === index ? ' active' : ''}`}
              onClick={() => goTo(i)}
            >
              <i />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
