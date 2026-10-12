import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { addScrollJob } from './components/Reveal.jsx';
import Lenis from 'lenis';
import Nav from './components/Nav.jsx';
import Boot from './components/Boot.jsx';
import Footer from './components/Footer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Cursor from './components/Cursor.jsx';

/* Route-split: visitors download only the page they open. Shared UI
   (nav, motion, galleries) stays in one common chunk automatically. */
const Home = lazy(() => import('./pages/Home.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));

function RouteFallback() {
  return (
    <div className="route-loading" role="status" aria-label="Loading page">
      <span />
    </div>
  );
}

/* Inertial smooth scrolling (Lenis, Jakub lens): expo-out easing for a
   weighted, settled stop; native rAF loop and anchor handling; skipped
   entirely under reduced-motion. Stored for instant jumps. */
function SmoothScroll() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: true,
    });
    window.__lenis = lenis;
    /* Scroll velocity, normalised to −1…1, for velocity-reactive scenes
       (skewing type, stretching marquees). Read inside the shared scene
       batch, so it costs no extra listener per element. */
    lenis.on('scroll', (e) => {
      window.__vel = Math.max(-1, Math.min(1, (e.velocity || 0) / 40));
    });
    return () => {
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

/* Per-route document titles — the tab always says where you are. */
const TITLES = {
  '/': 'AKALKA — Doors & Panels | Precision Manufacturing',
  '/products': 'Products catalogue | AKALKA Doors & Panels',
  '/about': 'About | AKALKA Doors & Panels',
  '/contact': 'Contact & enquiries | AKALKA Doors & Panels',
};
function PageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = TITLES[pathname] || TITLES['/'];
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
      <PageTitle />
      <Freshness />
      <ScrollProgress />
      <RouteCurtain />
      <Cursor />
      <Nav />
      <main key={pathname.split('#')[0]}>
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
