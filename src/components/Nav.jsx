import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { NAV_LINKS } from '../data/products.js';
import { useScrolled } from './Reveal.jsx';
import Logo from './Logo.jsx';

export default function Nav() {
  const scrolled = useScrolled(24);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { pathname } = useLocation();
  /* Transparent pill over dark heroes → light text; glass pill once
     scrolled → dark text. Every page opens on a dark hero. */
  const dark = open || !scrolled;
  /* Logo on the home page glides back to the very top instead of
     swallowing the click on an already-active route. */
  const goHome = (e) => {
    setOpen(false);
    if (pathname !== '/') return;
    e.preventDefault();
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Smooth auto-hide: nav glides away scrolling down, returns on the
     way up. Paused while the mobile menu is open. */
  useEffect(() => {
    if (open) {
      setHidden(false);
      return;
    }
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setHidden(y > 160 && y > last + 2);
        last = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [open ]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    if (window.__lenis) window.__lenis.stop();
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
      window.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  return (
    <>
      <header className={`nav${scrolled ? ' scrolled' : ''}${dark ? ' dark' : ''}${open ? ' open' : ''}${hidden ? ' hidden' : ''}`}>
        <div className="wrap nav-inner">
          <Link to="/" className="brand-link" aria-label="AKALKA home" onClick={goHome}>
            <Logo height={54} />
          </Link>
          <nav className="nav-links" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {l.label}
              </NavLink>
            ))}
            <NavLink to="/contact" className="nav-cta">Enquire</NavLink>
          </nav>
          <button
            className={`burger${open ? ' open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {NAV_LINKS.map((l, i) => (
              <motion.div
                key={l.to}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={l.to} onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              </motion.div>
            ))}
            <motion.p
              className="meta"
              style={{ marginTop: 28, color: 'var(--on-dark-muted)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            >
              Doors / Sandwich / Cleanroom / Partition / Profiles
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * NAV_LINKS.length, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to="/contact" onClick={() => setOpen(false)} className="mobile-cta">Enquire</Link>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
