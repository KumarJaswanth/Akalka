import { useEffect, useRef, useState } from 'react';

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

export function Materialize({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView(delay);
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
export function Parallax({ children, className = '', speed = 0.12, style, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let visible = false;
    const update = () => {
      const r = el.getBoundingClientRect();
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      el.style.setProperty('--px', `${(-p * speed * 100).toFixed(2)}%`);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          visible = e.isIntersecting;
          if (visible) update();
        });
      },
      { threshold: 0 }
    );
    io.observe(el);
    const onScroll = () => {
      if (!visible) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);
  return (
    <div ref={ref} className={className} style={style} {...rest}>
      {children}
    </div>
  );
}

/* Image well with scroll drift built in. Sizing comes from context:
   pass `ratio` for flow layout ("21/9") or let the parent frame the
   absolutely-positioned well (see .pf-img .px, .part-photo .px). */
export function ParallaxImg({ src, alt = '', speed = 0.1, eager = false, ratio, onError }) {
  return (
    <Parallax className="px" speed={speed} style={ratio ? { aspectRatio: ratio } : undefined}>
      <img
        src={src}
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
