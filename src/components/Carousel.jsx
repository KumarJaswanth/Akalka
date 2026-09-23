import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from './icons.jsx';

/* Immersive gallery: one full-bleed frame at a time, directional
   clip-wipe transitions, staggered captions, story-style progress driven
   by the same clock as the autoplay. The clock runs always — hovering
   changes nothing; only real input (arrows, segments, keys, drag)
   restarts the beat. */

const EASE = [0.16, 1, 0.3, 1];
const IDLE_MS = 3000;

const slideV = {
  enter: (d) => ({ clipPath: d >= 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0%)' }),
  center: { clipPath: 'inset(0 0 0 0%)' },
  exit: (d) => ({ clipPath: d >= 0 ? 'inset(0 100% 0 0%)' : 'inset(0 0 0 100%)' }),
};

export default function Carousel({ slides, label, hint, dark = false, play = true, interval = 5500 }) {
  const [[index, dir], setIndex] = useState([0, 1]);
  const reduce = useReducedMotion();
  const n = slides.length;
  const T = reduce ? 0 : 0.9;

  const indexRef = useRef(0);
  indexRef.current = index;
  const segRef = useRef(null);
  const elapsedRef = useRef(0);
  const lastTRef = useRef(0);
  const pausedRef = useRef(false);
  const idleRef = useRef(0);
  const dragStart = useRef(null);
  const draggedRef = useRef(false);

  const goTo = useCallback(
    (i) => {
      elapsedRef.current = 0;
      idleRef.current = Date.now();
      setIndex(([cur]) => {
        const next = ((i % n) + n) % n;
        return next === cur ? [cur, 1] : [next, next > cur ? 1 : -1];
      });
    },
    [n]
  );
  const paginate = useCallback((d) => goTo(indexRef.current + d), [goTo]);

  const setPaused = (v) => {
    pausedRef.current = v;
  };

  /* One rAF clock drives both the advance and the progress bar, so the
     timer you see is the timer you get. Hover, focus or a fresh touch
     freezes the beat; it resumes exactly where it left off. */
  useEffect(() => {
    if (!play || reduce || n < 2) return;
    lastTRef.current = 0;
    let raf = 0;
    const step = (now) => {
      const last = lastTRef.current || now;
      lastTRef.current = now;
      const dt = Math.min(now - last, 100);
      const busy = pausedRef.current || Date.now() - idleRef.current < IDLE_MS;
      if (!busy) {
        elapsedRef.current += now - last;
        if (elapsedRef.current >= interval) {
          elapsedRef.current = 0;
          const next = (indexRef.current + 1) % n;
          setIndex(([cur]) => (next === cur ? [cur, 1] : [next, 1]));
        }
      }
      if (segRef.current) {
        segRef.current.style.transform = `scaleX(${Math.min(1, elapsedRef.current / interval).toFixed(3)})`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [play, reduce, n, interval]);

  const onKey = (e) => {
    if (e.key === 'ArrowRight') paginate(1);
    if (e.key === 'ArrowLeft') paginate(-1);
  };

  const s = slides[index];

  return (
    <div className={`car${dark ? ' dark' : ''}`}>
      <div className="car-top">
        <div className="car-label">
          {label && <span className="meta">{label}</span>}
          {hint && <span className="meta car-hint">{hint}</span>}
        </div>
        <span className="meta car-count" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </span>
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
        onDragStart={() => setPaused(true)}
        onDragEnd={(e, { offset }) => {
          setPaused(false);
          idleRef.current = Date.now();
          if (offset.x < -110) paginate(1);
          else if (offset.x > 110) paginate(-1);
        }}
        onPointerDown={(e) => {
          idleRef.current = Date.now();
          if (e.buttons === 1) {
            dragStart.current = { x: e.clientX };
            draggedRef.current = false;
          }
        }}
        onPointerMove={(e) => {
          const s0 = dragStart.current;
          if (e.buttons !== 1 || !s0) return;
          if (Math.abs(e.clientX - s0.x) > 8) draggedRef.current = true;
        }}
        onPointerUp={() => {
          dragStart.current = null;
        }}
        onPointerCancel={() => {
          dragStart.current = null;
          draggedRef.current = false;
        }}
        onClickCapture={(e) => {
          if (draggedRef.current) {
            e.stopPropagation();
            e.preventDefault();
            draggedRef.current = false;
          }
          dragStart.current = null;
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
        <button
          type="button"
          className="gal-arrow left"
          onClick={() => paginate(-1)}
          aria-label="Previous slide"
        >
          <ArrowLeft />
        </button>
        <button
          type="button"
          className="gal-arrow right"
          onClick={() => paginate(1)}
          aria-label="Next slide"
        >
          <ArrowRight />
        </button>
      </motion.div>

      <div className="car-foot">
        <div className="gal-segs" aria-hidden="true">
          {slides.map((sl, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              title={`Go to slide ${i + 1}`}
              className={`gal-seg${i < index ? ' done' : ''}${i === index ? ' active' : ''}`}
              onClick={() => goTo(i)}
            >
              <i ref={i === index ? segRef : undefined} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
