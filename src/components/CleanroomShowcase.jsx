import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { IMG, srcSetFor } from '../data/images.js';
import { Plus } from './icons.jsx';

/* Cleanroom showcase: a sticky cinematic visual crossfading with the
   selected range item, beside oversized expanding rows. No invented
   data — every line is confirmed range language. */

const EASE = [0.16, 1, 0.3, 1];

const SHOTS = {
  wall: { img: IMG.cleanroomCorridor, pos: '50% 50%' },
  ceiling: { img: IMG.cleanroomWhite, pos: '50% 0%' },
  glass: { img: IMG.cleanroomHall, pos: '24% 58%' },
};

export default function CleanroomShowcase({ items }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = items[Math.max(0, active)] || items[0];
  const shot = SHOTS[current.id] || SHOTS.wall;
  /* Hover previews on precise pointers only — touch uses taps, where a
     synthesized mouseenter would otherwise open-then-instantly-close. */
  const canHover = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  return (
    <div className="cr-show">
      <div className="cr-visual" aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={current.id}
            src={shot.img.src}
            srcSet={srcSetFor(shot.img.src)}
            style={{ objectPosition: shot.pos }}
            sizes="(max-width: 900px) 100vw, 45vw"
            alt=""
            loading="lazy"
            decoding="async"
            initial={reduce ? false : { opacity: 0, scale: 1.08, clipPath: 'inset(9% 7% 9% 7% round 24px)' }}
            animate={{ opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 18px)' }}
            exit={reduce ? undefined : { opacity: 0, scale: 1.04 }}
            transition={{ duration: reduce ? 0 : 0.85, ease: EASE }}
          />
        </AnimatePresence>
        <div className="cr-vtag">
          <span className="meta">{current.no}</span>
          <span>{current.name}</span>
        </div>
      </div>

      {/* Disclosure buttons, not tabs: each row expands its own detail.
          tablist/tab roles would require tabpanels that do not exist;
          aria-expanded already carries the state honestly. */}
      <div className="cr-rows" role="group" aria-label="Cleanroom range">
        {items.map((it, i) => {
          const open = i === active;
          return (
            <div key={it.id} className={`cr-item${open ? ' open' : ''}`}>
              <button
                type="button"
                aria-expanded={open}
                className="cr-head"
                onClick={() => setActive(open ? -1 : i)}
                onMouseEnter={() => {
                  if (canHover()) setActive(i);
                }}
              >
                <span className="meta cr-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="cr-name">{it.name}</span>
                <span className="cr-plus" aria-hidden="true">
                  <Plus />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    key="more"
                    className="cr-more"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                  >
                    <div className="cr-more-in">
                      <div className="chips">
                        <span className="chip">{it.no}</span>
                        <span className="chip">Confirmed range</span>
                      </div>
                      <p className="body-sm">
                        Part of the confirmed cleanroom range. Classifications,
                        ratings and performance data are confirmed on enquiry —
                        nothing here is assumed.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
