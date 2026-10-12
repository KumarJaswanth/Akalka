import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { srcSetFor } from '../data/images.js';

/* Motion system for v1.2: restrained, scroll-linked, GPU-only.
   - Reveal / Materialize / ClipReveal: one IntersectionObserver each,
     CSS-driven easing (see --ease-soft), capped cascade delays.
   - Parallax / ParallaxImg: rAF-throttled scroll link that writes only
     `--px` (a translate); hover zoom uses the separate `scale` property
     so the two never fight. All disabled under reduced-motion. */

function useInView(delay = 0) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => setInView(true), Math.min(delay * 1000, 380));
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return [ref, inView];
}

export function Reveal({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView(delay);
  return (
    <div ref={ref} className={`rv${inView ? ' is-in' : ''}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}

/* Word-mask headings. Every display heading inside a Materialize is
   split once into masked words that rise in a staggered cascade — the
   type itself becomes the reveal. Text nodes are wrapped in place
   (nested accents such as .font-hand keep their element), so no heading
   in the codebase has to change. Headings are static, so React never
   needs to touch those text nodes again. */
function splitWords(root) {
  if (!root || root.dataset.split) return;
  root.dataset.split = '1';
  let wi = 0;
  const walk = (node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/);
        if (!parts.some((t) => t.trim())) return;
        const frag = document.createDocumentFragment();
        parts.forEach((t) => {
          if (!t) return;
          if (!t.trim()) {
            frag.appendChild(document.createTextNode(t));
            return;
          }
          const w = document.createElement('span');
          w.className = 'w';
          const inner = document.createElement('span');
          inner.className = 'wi';
          inner.style.setProperty('--wi', wi++);
          inner.textContent = t;
          w.appendChild(inner);
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('term')) {
        walk(n);
      }
    });
  };
  walk(root);
}

export function Materialize({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView(delay);
  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    ref.current.querySelectorAll('.h2').forEach(splitWords);
  }, [ref]);
  return (
    <div ref={ref} className={`mz${inView ? ' is-in' : ''}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}

export function ClipReveal({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView(delay);
  return (
    <div ref={ref} className={`cp${inView ? ' is-in' : ''}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}

/* Generic scroll-linked wrapper: writes --px (translate %) from the
   element's position relative to the viewport centre. */
const pxJobs = new Set();
let pxRaf = 0;
let pxListening = false;
function pxFlush() {
  pxRaf = 0;
  /* Batched phases: every read completes before the first write, so
     stacked parallax instances can never force layout thrash. */
  const jobs = [...pxJobs];
  const vals = jobs.map((j) => {
    try {
      return j.read();
    } catch {
      return null;
    }
  });
  jobs.forEach((j, i) => {
    try {
      j.write(vals[i]);
    } catch {
      /* element gone mid-frame — dropped on cleanup */
    }
  });
}
function pxRequestFlush() {
  if (!pxRaf) pxRaf = requestAnimationFrame(pxFlush);
}
function pxEnsureListening() {
  if (pxListening || typeof window === 'undefined') return;
  pxListening = true;
  const onScroll = () => pxRequestFlush();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}
function Parallax({ children, className = '', speed = 0.12, style, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let visible = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          visible = e.isIntersecting;
          if (visible) pxRequestFlush();
        });
      },
      { threshold: 0 }
    );
    io.observe(el);
    pxEnsureListening();
    const job = {
      read: () => {
        if (!visible || !ref.current) return null;
        const r = ref.current.getBoundingClientRect();
        return (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      },
      write: (p) => {
        if (p === null || !ref.current) return;
        ref.current.style.setProperty('--px', `${(-p * speed * 100).toFixed(2)}%`);
      },
    };
    pxJobs.add(job);
    pxRequestFlush();
    return () => {
      io.disconnect();
      pxJobs.delete(job);
    };
  }, [speed]);
  return (
    <div ref={ref} className={className} style={style} {...rest}>
      {children}
    </div>
  );
}

/* Scroll progress as a CSS variable — the v2 scene engine.
   One shared rAF batch (the same scheduler as Parallax) writes `--p`
   (0 → 1) onto the element; CSS turns that single number into every
   effect, so scenes cost one style write per frame and zero re-renders.
   mode 'pin'  — progress across a tall section's own scroll span (for
                 sticky scenes: 0 when its top meets the viewport top,
                 1 when its bottom meets the viewport bottom).
   mode 'view' — progress while crossing the viewport (0 entering at the
                 bottom, 1 leaving at the top).
   onProgress(p) — optional: called inside the same batched write with
                 the raw progress, for scenes that drive several values
                 (camera angles, reveal amounts) without React renders.
   onStep(i)   — optional: called only when floor(p * steps) changes, so
                 React state updates a handful of times, not every frame.
   Reduced motion pins every scene to its finished state. */
export function useScrollVar(ref, { mode = 'pin', steps = 0, onStep, onProgress, vel = false } = {}) {
  const stepRef = useRef(-1);
  const cbRef = useRef(onStep);
  cbRef.current = onStep;
  const progRef = useRef(onProgress);
  progRef.current = onProgress;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--p', '1');
      el.classList.add('is-static');
      if (progRef.current) progRef.current(1);
      return;
    }
    let visible = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          visible = e.isIntersecting;
          if (visible) pxRequestFlush();
        });
      },
      { threshold: 0, rootMargin: '200px 0px' }
    );
    io.observe(el);
    pxEnsureListening();
    const job = {
      read: () => {
        if (!visible || !ref.current) return null;
        const r = ref.current.getBoundingClientRect();
        const vh = window.innerHeight;
        if (mode === 'pin') {
          const span = r.height - vh;
          return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : r.top < 0 ? 1 : 0;
        }
        if (mode === 'enter') {
          /* 0 as the element's top meets the viewport bottom, 1 once its
             whole height plus a short run-out is on screen — for things
             at the very end of a page, which can never cross the view. */
          return Math.min(1, Math.max(0, (vh - r.top) / (r.height + 120)));
        }
        return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      },
      write: (p) => {
        if (p === null || !ref.current) return;
        ref.current.style.setProperty('--p', p.toFixed(4));
        if (progRef.current) progRef.current(p);
        if (vel) ref.current.style.setProperty('--v', (window.__vel || 0).toFixed(3));
        if (steps > 0) {
          const s = Math.min(steps - 1, Math.floor(p * steps));
          if (s !== stepRef.current) {
            stepRef.current = s;
            if (cbRef.current) cbRef.current(s);
          }
        }
      },
    };
    pxJobs.add(job);
    pxRequestFlush();
    return () => {
      io.disconnect();
      pxJobs.delete(job);
    };
  }, [ref, mode, steps, vel]);
}

/* Fit a fixed-size model (a 3D stage drawn at design size) into its
   container: writes `prop` = min(max, width / w, height / h) on the
   element whenever it resizes. The model is drawn once at one size and
   scaled as a whole, so it can never spill onto neighbouring text.
   `max` above 1 lets a full-bleed stage grow the model on big screens. */
export function useFit(ref, w, h, prop = '--fit', max = 1) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const set = () => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      const s = Math.min(max, r.width / w, h ? r.height / h : max);
      el.style.setProperty(prop, s.toFixed(3));
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, w, h, prop, max]);
}

/* Pointer parallax for the 3D stages: writes --tlx / --tly (−1 … 1,
   eased toward the pointer) on the element while it is on screen, so
   a model can lean a few degrees toward the cursor on top of whatever
   the scroll is doing. Fine pointers only; still under reduced motion. */
export function usePointerTilt(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let on = false;
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty('--tlx', x.toFixed(4));
      el.style.setProperty('--tly', y.toFixed(4));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e) => {
      if (!on) return;
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (!on) {
        tx = 0;
        ty = 0;
        if (!raf) raf = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

/* Image well with scroll drift built in. Sizing comes from context:
   pass `ratio` for flow layout ("21/9") or let the parent frame the
   absolutely-positioned well (see .pf-img .px, .part-photo .px). */
export function ParallaxImg({ src, alt = '', speed = 0.1, eager = false, ratio, onError, sizes = '(max-width: 820px) 100vw, 70vw' }) {
  return (
    <Parallax className="px" speed={speed} style={ratio ? { aspectRatio: ratio } : undefined}>
      <img
        src={src}
        srcSet={srcSetFor(src)}
        sizes={srcSetFor(src) ? sizes : undefined}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
        draggable={false}
        onError={onError}
      />
    </Parallax>
  );
}

/* Scroll-filled statement: each word ignites as it travels through
   the viewport — the luxury-editorial signature moment. */
function Word({ progress, range, children, accent, accentColor }) {
  const opacity = useTransform(progress, range, [0.13, 1]);
  return (
    <motion.span
      style={accent ? { opacity, color: accentColor } : { opacity }}
      className={accent ? 'font-hand' : undefined}
    >
      {children}{' '}
    </motion.span>
  );
}

export function ScrollWords({ text, className = '', accents = [], accentColor = 'var(--datum-ink)' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = text.split(' ');
  if (reduce) return <span className={className}>{text}</span>;
  return (
    <span ref={ref} className={className} style={{ display: 'block' }}>
      {words.map((w, i) => (
        <Word
          key={i}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          accent={accents.includes(w)}
          accentColor={accentColor}
        >
          {w}
        </Word>
      ))}
    </span>
  );
}

/* Count-up numeral: eases from zero when scrolled into view. */
export function CountUp({ to, duration = 1.6 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      setVal(to);
      return;
    }
    let raf = 0;
    let started = false;
    const tick = (t0) => (now) => {
      const t = Math.min(1, (now - t0) / (duration * 1000));
      setVal(Math.round(to * (1 - Math.pow(2, -10 * t))));
      if (t < 1) raf = requestAnimationFrame(tick(t0));
      else setVal(to);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            raf = requestAnimationFrame(tick(performance.now()));
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration, reduce]);
  return <span ref={ref}>{val}</span>;
}

export function SectionHead({ index, label, hint }) {
  return (
    <div className="sec-head">
      <div className="sec-index">
        <span className="meta idx">{index}</span>
        <span className="meta lbl">{label}</span>
      </div>
      <span aria-hidden="true" />
      {hint && <span className="meta hint">{hint}</span>}
    </div>
  );
}

/* Magnetic CTA — subtle pointer response, desktop only */
export function Magnetic({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const move = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * 0.08}px, ${y * 0.1}px)`;
      });
    };
    const reset = () => { cancelAnimationFrame(raf); el.style.transform = ''; };
    el.style.transition = 'transform 0.35s cubic-bezier(0.22,1,0.36,1)';
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', reset); };
  }, []);
  return <span ref={ref} style={{ display: 'inline-flex' }}>{children}</span>;
}

export function useScrolled(threshold = 24) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const fn = () => setS(window.scrollY > threshold);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [threshold]);
  return s;
}
