import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from './icons.jsx';

/* Cinematic carousel: full-bleed tall slides, overlay captions, drag,
   arrows, keyboard, counter, progress — plus gentle autoplay, slow
   Ken Burns drift on the active frame, and an optional thumbnail rail. */

export default function Carousel({ slides, label, hint, dark = false, thumbs = false, play = true }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const drag = useRef(null);
  const reduce = useReducedMotion();
  const n = slides.length;
  const activeRef = useRef(0);
  activeRef.current = active;

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

  const goTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    const next = ((i % n) + n) % n;
    track
      .querySelector(`.car-slide[data-i="${next}"]`)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  };
  const go = (dir) => goTo(activeRef.current + dir);

  /* Gentle autoplay: advances until the visitor takes over. */
  useEffect(() => {
    if (!play || reduce || paused || n < 2) return;
    const t = setInterval(() => goTo(activeRef.current + 1), 5200);
    return () => clearInterval(t);
  }, [play, reduce, paused, n, active]);

  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };

  /* Desktop drag-to-scroll (touch uses native panning). */
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') return;
    const track = trackRef.current;
    drag.current = { x: e.clientX, left: track.scrollLeft };
    track.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const track = trackRef.current;
    track.scrollLeft = d.left - (e.clientX - d.x);
  };
  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div
      className={`car${dark ? ' dark' : ''}`}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => {
        setPaused(false);
        endDrag();
      }}
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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
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
            <figcaption className="car-cap">
              <span className="meta car-code">{sl.code}</span>
              <span className="car-title">{sl.title}</span>
              {sl.note && <span className="car-note">{sl.note}</span>}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="car-foot">
        <div className="car-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${(active + 1) / n})` }} />
        </div>
        {thumbs && (
          <div className="car-thumbs" role="tablist" aria-label="Slides">
            {slides.map((sl, i) => (
              <button
                key={`t-${i}`}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to slide ${i + 1}: ${sl.title}`}
                className={`car-thumb${i === active ? ' active' : ''}`}
                onClick={() => goTo(i)}
              >
                <img src={sl.src} alt="" loading="lazy" decoding="async" draggable={false} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
