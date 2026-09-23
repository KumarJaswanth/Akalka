import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import Nav from './components/Nav.jsx';
import Boot from './components/Boot.jsx';
import Footer from './components/Footer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

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

function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  if (reduce) return null;
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

export default function App() {
  const { pathname } = useLocation();
  return (
    <>
      <SmoothScroll />
      <Boot />
      <ScrollToTop />
      <PageTitle />
      <ScrollProgress />
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
