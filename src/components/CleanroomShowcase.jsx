import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { V } from '../data/images.js';
import { Plus } from './icons.jsx';

/* Cleanroom showcase: a sticky cinematic visual crossfading with the
   selected range item, beside oversized expanding rows. No invented
   data — every line is confirmed range language. */

const EASE = [0.16, 1, 0.3, 1];

const SHOTS = {
  'CR-W': { src: V('1748000970909-845f4aa144d2', 900, 1150), alt: 'Operators working inside a production clean room' },
  'CR-C': { src: V('1584677123573-7446380b6d69', 900, 1150), alt: 'White technical room with controlled-environment equipment' },
  'CR-WS': { src: V('1762928289094-197055a5d5c3', 900, 1150), alt: 'Bright washable wall surfaces in a white interior' },
  'CR-F': { src: V('1746021375306-9dec0f637732', 900, 1150), alt: 'Flush glass walls along a bright hallway' },
};

export default function CleanroomShowcase({ items }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = items[Math.max(0, active)] || items[0];
  const shot = SHOTS[current.code] || SHOTS['CR-W'];
  /* Hover previews on precise pointers only — touch uses taps, where a
     synthesized mouseenter would otherwise open-then-instantly-close. */
  const canHover = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  return (
    <div className="cr-show">
      <div className="cr-visual" aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={current.code}
            src={shot.src}
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
          <span className="meta">{current.code}</span>
          <span>{current.name}</span>
        </div>
      </div>

      <div className="cr-rows" role="tablist" aria-label="Cleanroom range">
        {items.map((it, i) => {
          const open = i === active;
          return (
            <div key={it.code} className={`cr-item${open ? ' open' : ''}`}>
              <button
                type="button"
                role="tab"
                aria-selected={open}
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
                        <span className="chip">{it.code}</span>
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
