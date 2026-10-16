import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { addScrollJob, flushScrollJobs } from './components/Reveal.jsx';
import Lenis from 'lenis';
import Nav from './components/Nav.jsx';
import Boot from './components/Boot.jsx';
import Footer from './components/Footer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Cursor from './components/Cursor.jsx';
import { routeFor, canonical, NOT_FOUND, SITE_URL } from './data/seo.js';

/* Route-split: visitors download only the page they open. Shared UI
   (nav, motion, galleries) stays in one common chunk automatically. */
const Home = lazy(() => import('./pages/Home.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function RouteFallback() {
  return (
    <div className="route-loading" role="status" aria-label="Loading page">
      <span />
    </div>
  );
}

/* Inertial smooth scrolling (Lenis): a short lerp that follows the wheel
   closely and settles softly; native rAF loop; touch stays native (momentum on a phone is the
   platform's, and cannot be matched); skipped entirely under reduced
   motion. Stored on window for instant jumps.
   Three details that make it feel exact rather than merely smooth:
     · scenes are flushed from the smoother's OWN scroll event, in the frame
       that moved the page — the browser's scroll event arrives a frame
       later, which left every pinned scene one frame behind the content it
       is pinned against (a faint shimmer);
     · in-page anchors land clear of the fixed nav;
     · the page is re-measured when fonts and images settle, so a scene
       never works from a stale height. */
function SmoothScroll() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return undefined;
    const lenis = new Lenis({
      autoRaf: true,
      /* Frame-rate-independent lerp rather than a fixed 1.15 s tween: the
         page follows the wheel at once and settles in about half a second,
         so it reads as smooth, never as lag behind the hand. */
      lerp: 0.12,
      smoothWheel: true,
      anchors: { offset: -90, duration: 1.2 },
    });
    window.__lenis = lenis;
    /* Scroll velocity, normalised to −1…1, for velocity-reactive scenes
       (skewing cards). Written before the flush so the same frame uses it. */
    lenis.on('scroll', (e) => {
      window.__vel = Math.max(-1, Math.min(1, (e.velocity || 0) / 40));
      flushScrollJobs();
    });
    const resize = () => lenis.resize();
    window.addEventListener('load', resize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
    return () => {
      window.removeEventListener('load', resize);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [reduce]);
  return null;
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  /* Reloads must start cleanly at the top — never resume mid-journey.
     Browsers restore scroll asynchronously, so we claim manual control
     and re-assert top on full load as well. */
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const toTop = () => {
      if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    };
    toTop();
    window.addEventListener('load', toTop);
    return () => window.removeEventListener('load', toTop);
  }, []);
  useEffect(() => {
    if (hash) return;
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);
  return null;
}

/* Per-route <head>: title, description, canonical, sharing tags and the
   robots directive, kept in step on every in-app navigation. The build
   writes the same values into each route's own HTML file (postbuild.mjs),
   so crawlers and link previews read them without running any script. */
function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}
function Seo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const route = routeFor(pathname);
    const m = route || NOT_FOUND;
    const url = route ? canonical(route.path) : null;
    document.title = m.title;
    setMeta('name', 'description', m.description);
    setMeta('name', 'robots', route ? 'index, follow, max-image-preview:large' : 'noindex, follow');
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:url', url || SITE_URL);
    setMeta('name', 'twitter:title', m.title);
    setMeta('name', 'twitter:description', m.description);
    let link = document.head.querySelector('link[rel="canonical"]');
    if (url) {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = url;
    } else if (link) {
      link.remove();
    }
  }, [pathname]);
  return null;
}

/* Soft auto-refresh (the safe answer to "auto refresh"): a real reload
   throws away the visitor's place, their door configuration and any text
   typed into the enquiry form, and it is the one thing that can make a
   smooth page stutter. So instead the page re-syncs itself in place —
   re-measuring the smoother and every scroll-linked scene — in three
   situations where measurements drift:
     · coming back to the tab after a long absence,
     · being restored from the back/forward cache,
     · every few minutes while the visitor is idle (late images and fonts
       change heights, which would leave a pinned scene slightly off).
   Nothing is reset: no state, no scroll position, no animation. */
const FRESH_AFTER_MS = 5 * 60 * 1000;
const IDLE_MS = 45 * 1000;
function Freshness() {
  useEffect(() => {
    const resync = () => {
      if (window.__lenis) window.__lenis.resize();
      window.dispatchEvent(new Event('resize'));
    };
    let hiddenAt = 0;
    let lastInput = Date.now();
    let lastSync = Date.now();
    const onVis = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        return;
      }
      if (hiddenAt && Date.now() - hiddenAt > FRESH_AFTER_MS) {
        resync();
        lastSync = Date.now();
      }
      hiddenAt = 0;
    };
    const onShow = (e) => {
      if (e.persisted) resync();
    };
    const touch = () => {
      lastInput = Date.now();
    };
    /* Idle sweep: a cheap check once a minute; it only acts when the tab is
       visible, nothing has moved for a while, and the last sync is old. */
    const tick = setInterval(() => {
      if (document.hidden) return;
      const now = Date.now();
      if (now - lastInput > IDLE_MS && now - lastSync > FRESH_AFTER_MS) {
        resync();
        lastSync = now;
      }
    }, 60 * 1000);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pageshow', onShow);
    window.addEventListener('scroll', touch, { passive: true });
    window.addEventListener('pointermove', touch, { passive: true });
    window.addEventListener('keydown', touch);
    return () => {
      clearInterval(tick);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pageshow', onShow);
      window.removeEventListener('scroll', touch);
      window.removeEventListener('pointermove', touch);
      window.removeEventListener('keydown', touch);
    };
  }, []);
  return null;
}

/* Looping decoration (airflow, motes, cloud drift, the spec strip) only
   runs while it is on screen: every matching element gets `.is-live` while
   it intersects the viewport, and the CSS pauses it otherwise. Pages load
   lazily, so new elements are picked up as they mount. */
const LIVE = '.dark-sec, .page-hero, .pr-hero, .ls, .marquee, .hero-shade, .apps-hint';
function LiveRegions() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting)),
      { rootMargin: '100px 0px' }
    );
    /* Watched elements, so ones a route change removed can be released. */
    const seen = new Set();
    const scan = () => {
      seen.forEach((el) => {
        if (el.isConnected) return;
        io.unobserve(el);
        seen.delete(el);
      });
      document.querySelectorAll(LIVE).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };
    let t = 0;
    const mo = new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(scan, 60);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    scan();
    return () => {
      clearTimeout(t);
      mo.disconnect();
      io.disconnect();
    };
  }, []);
  return null;
}

/* Route curtain: on every in-app navigation (never the first load —
   Boot owns that), a worksurface sheet carrying the wordmark covers the
   swap and lifts away. Pure CSS animation, remounted by key. */
function RouteCurtain() {
  const { pathname } = useLocation();
  const first = useRef(true);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setN((v) => v + 1);
  }, [pathname]);
  if (!n) return null;
  return (
    <div key={n} className="curtain" aria-hidden="true">
      <span>akalka</span>
    </div>
  );
}

/* Page progress rule. Lenis already eases the scroll itself, so the bar
   simply follows it — written as a single transform inside the shared
   scroll frame (no spring loop, no layout read of its own). */
function ScrollProgress() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return undefined;
    let max = 1;
    const measure = () => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    let last = -1;
    const off = addScrollJob({
      read: () => window.scrollY / max,
      write: (p) => {
        const v = Math.min(1, Math.max(0, p));
        if (Math.abs(v - last) < 0.0002) return;
        last = v;
        el.style.transform = `scaleX(${v.toFixed(4)})`;
      },
    });
    return () => {
      ro.disconnect();
      off();
    };
  }, [reduce]);
  if (reduce) return null;
  return <div className="scroll-progress" ref={ref} style={{ transform: 'scaleX(0)' }} aria-hidden="true" />;
}

export default function App() {
  const { pathname } = useLocation();
  return (
    <>
      <SmoothScroll />
      <Boot />
      <ScrollToTop />
      <Seo />
      <Freshness />
      <LiveRegions />
      <ScrollProgress />
      <RouteCurtain />
      <Cursor />
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav />
      <main id="main" tabIndex={-1} key={pathname.split('#')[0]}>
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
