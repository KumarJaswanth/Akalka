import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/* Boot overture: a crisp professional reveal — wordmark letters rise in
   sequence over a growing rule, progress completes, and the curtain
   lifts. Once per session, skipped entirely under reduced-motion. */

const EASE = [0.16, 1, 0.3, 1];
const WORD = 'akalka'.split('');

export default function Boot() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    try {
      return !window.sessionStorage.getItem('akalka-booted');
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = 'hidden';
    if (window.__lenis) window.__lenis.stop();
    const t = setTimeout(() => {
      try {
        window.sessionStorage.setItem('akalka-booted', '1');
      } catch {
        /* private mode — replay next visit, harmless */
      }
      setShow(false);
      document.body.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
    }, 1350);
    return () => clearTimeout(t);
  }, [show, reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="boot"
          role="status"
          aria-label="Loading AKALKA"
          exit={{ y: '-100%', transition: { duration: 0.7, ease: EASE } }}
        >
          <p className="meta boot-sub">Doors · Panels</p>
          <h1 className="boot-word" aria-label="akalka">
            {WORD.map((ch, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.08 + i * 0.055 }}
              >
                {ch}
              </motion.span>
            ))}
          </h1>
          <motion.span
            className="boot-rule"
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
          />
          <p className="meta boot-tag">Crafted with care</p>
          <span className="boot-bar" aria-hidden="true">
            <i />
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
