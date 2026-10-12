import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
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
/* Any scroll-linked work joins the one shared frame: every read first,
   then every write, so nothing on the page can force a second style
   recalculation inside a frame. Returns its own remover. */
export function addScrollJob(job) {
  pxJobs.add(job);
  pxEnsureListening();
  pxRequestFlush();
  return () => pxJobs.delete(job);
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
   varRef      — optional: write the vars onto a narrower element than the
                 tall section (a custom property inherits, so every
                 write restyles that element's whole subtree — scope it
                 to the part that reads it). writeVar={false} skips the
                 var entirely for scenes that drive everything in
                 onProgress.
   mode 'words' — progress for text that reads as it crosses the middle of
                 the screen: 0 as its top reaches 85% of the viewport
                 height, 1 as its bottom reaches 45%.
   A frame whose progress has not changed writes nothing at all.
   Reduced motion pins every scene to its finished state. */
export function useScrollVar(ref, { mode = 'pin', steps = 0, onStep, onProgress, vel = false, varRef, writeVar = true } = {}) {
  const stepRef = useRef(-1);
  const cbRef = useRef(onStep);
  cbRef.current = onStep;
  const progRef = useRef(onProgress);
  progRef.current = onProgress;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (writeVar) (varRef?.current || el).style.setProperty('--p', '1');
      el.classList.add('is-static');
      if (progRef.current) progRef.current(1);
      return;
    }
    let visible = false;
    let lastKey = '';
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
        if (mode === 'words') {
          return Math.min(1, Math.max(0, (0.85 * vh - r.top) / (0.4 * vh + r.height)));
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
        const v = vel ? (window.__vel || 0).toFixed(3) : '';
        const key = p.toFixed(4) + v;
        if (key === lastKey) return;
        lastKey = key;
        const tgt = varRef?.current || ref.current;
        if (writeVar) tgt.style.setProperty('--p', p.toFixed(4));
        if (progRef.current) progRef.current(p);
        if (vel) tgt.style.setProperty('--v', v);
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
    /* A resize can change what a scene derives from the same progress
       (its geometry), so the next frame must write even if p is equal. */
    const onResize = () => { lastKey = ''; };
    window.addEventListener('resize', onResize);
    return () => {
      io.disconnect();
      pxJobs.delete(job);
      window.removeEventListener('resize', onResize);
    };
  }, [ref, mode, steps, vel, varRef, writeVar]);
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

/* Pointer parallax for the 3D stages: eases (x, y) in −1 … 1 toward the
   pointer while the element is on screen, so a model can lean a few
   degrees toward the cursor on top of whatever the scroll is doing.
   By default it writes --tlx / --tly onto the element; pass apply(x, y)
   to write straight to the few nodes that move instead — a custom
   property restyles its whole subtree on every pointer frame, a direct
   transform touches only its own node. The loop sleeps once settled.
   Fine pointers only; never under reduced motion. */
export function usePointerTilt(ref, apply) {
  const applyRef = useRef(apply);
  applyRef.current = apply;
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
      if (applyRef.current) applyRef.current(x, y);
      else {
        el.style.setProperty('--tlx', x.toFixed(4));
        el.style.setProperty('--tly', y.toFixed(4));
      }
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
   the viewport — the luxury-editorial signature moment. One number
   (--p, from the shared scroll frame) drives every word through CSS:
   no per-word motion values, no layout reads of its own. */
export function ScrollWords({ text, className = '', accents = [], accentColor = 'var(--datum-ink)' }) {
  const ref = useRef(null);
  useScrollVar(ref, { mode: 'words' });
  const words = text.split(' ');
  return (
    <span ref={ref} className={`sw-words${className ? ` ${className}` : ''}`} style={{ '--n': words.length }}>
      {words.map((w, i) => (
        <span
          key={i}
          className={accents.includes(w) ? 'sw-w font-hand' : 'sw-w'}
          style={accents.includes(w) ? { '--i': i, color: accentColor } : { '--i': i }}
        >
          {w}{' '}
        </span>
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
