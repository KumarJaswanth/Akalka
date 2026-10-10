import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products.js';
import { Reveal, Materialize, SectionHead, Magnetic, ParallaxImg } from '../components/Reveal.jsx';
import { ArrowRight, ArrowUpRight } from '../components/icons.jsx';
import Carousel from '../components/Carousel.jsx';
import { ImageExpand, Process } from '../components/Scenes.jsx';
import { IMG, PHOTO, sized, srcSetFor } from '../data/images.js';

const CAT_CODES = { doors: 'DR', sandwich: 'SW', cleanroom: 'CR', partition: 'PT', glass: 'GL', profiles: 'PF' };
const CAT_IMG = {
  doors: IMG.doorDouble,
  sandwich: PHOTO.panelWall,
  cleanroom: PHOTO.cleanroomTech,
  partition: PHOTO.whiteHall,
  glass: PHOTO.cleanroomWindow,
  profiles: PHOTO.measure,
};
const TOTAL_LABEL = String(CATEGORIES.length).padStart(2, '0');

const FINISH_SLIDES = [
  { ...IMG.cleanroomFinished, code: 'CR / Finished', title: 'Completed cleanroom', note: 'Flush panels, blue doors, blue floor' },
  { ...PHOTO.cleanroomLab, code: 'CR / Controlled', title: 'Clean, controlled rooms', note: 'Flush, washable surfaces' },
  { ...IMG.doorDouble, code: 'DR-D', title: 'Double doors in situ', note: 'Configured openings' },
  { ...PHOTO.steelDoorWall, code: 'DR / In the wall', title: 'Door set into the panel wall', note: 'One system, one maker' },
  { ...IMG.panelJoint, code: 'SW / Detail', title: 'Panel joint engineering', note: 'Double-skin construction' },
];

const PRINCIPLES = [
  { t: 'One coordinated system', d: 'Doors, panels and profiles from one maker read as one continuous surface — no mismatched junctions.' },
  { t: 'Variation without invention', d: 'Sizes and colours adapt to requirement. Anything unconfirmed is marked plainly, never guessed.' },
  { t: 'Finish as discipline', d: 'White, Matt White or matched colour across every element, so the whole project stays coherent.' },
];

const PILLARS = [
  { k: 'Openings', h: 'Doors', img: IMG.doorDouble, p: 'Regular modular, fire rated and emergency doors — single and double, honeycomb or rockwool cores, sized to the opening.' },
  { k: 'Surfaces', h: 'Panels', img: PHOTO.panelWall, p: 'Sandwich, cleanroom, partition, riser, flush wall and view glass panels in confirmed types and thicknesses.' },
  { k: 'Junctions', h: 'Profiles', img: PHOTO.measure, p: 'Corners, 2D and 3D forms, channels, angles, box sections, aluminium-coated profiles and bottom tracks.' },
];

/* Range index with a pointer-following preview: the photograph trails
   the cursor through the list on precise pointers. One fixed element,
   transform-only, rAF-throttled; touch devices simply get the list. */
function RangeIndex() {
  const prevRef = useRef(null);
  const imgRef = useRef(null);
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const el = prevRef.current;
    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    const tick = () => {
      cx += (x - cx) * 0.16;
      cy += (y - cy) * 0.16;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      if (Math.abs(x - cx) > 0.3 || Math.abs(y - cy) > 0.3) raf = requestAnimationFrame(tick);
      else raf = 0;
    };
    const move = (e) => {
      x = e.clientX + 24;
      y = e.clientY - 120;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);
  const show = (id) => {
    const el = prevRef.current;
    if (!el || !imgRef.current) return;
    imgRef.current.src = sized(CAT_IMG[id].src, 600);
    el.classList.add('on');
  };
  const hide = () => prevRef.current && prevRef.current.classList.remove('on');
  return (
    <>
      <div onPointerLeave={hide}>
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.id} delay={Math.min(i * 0.04, 0.16)}>
            <Link to={`/products#${c.id}`} className="cat-row" onPointerEnter={() => show(c.id)}>
              <span className="cat-num">{CAT_CODES[c.id]}</span>
              <span>
                <span className="cat-name">{c.name}</span>
                <span className="cat-desc" style={{ display: 'block' }}>{c.tagline}</span>
              </span>
              <span className="cat-code" aria-hidden="true">{c.index} / {TOTAL_LABEL}</span>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="hover-prev" ref={prevRef} aria-hidden="true">
        <img ref={imgRef} alt="" decoding="async" />
      </div>
    </>
  );
}

export default function About() {
  return (
    <div className="page">
      <section className="page-hero about-hero">
        <div className="wrap about-hero-grid">
          <div>
            <p className="meta" style={{ color: 'var(--datum)', marginBottom: 'var(--s5)' }}>About AKALKA</p>
            <h1 className="display">
              <span className="mask"><span>A manufacturer,</span></span>
              <span className="mask"><span style={{ animationDelay: '0.12s' }}><span className="font-hand" style={{ color: 'var(--datum)' }}>defined by product.</span></span></span>
            </h1>
            <p className="lede" style={{ color: 'var(--on-dark-muted)', marginTop: 'var(--s6)' }}>
              AKALKA manufactures doors, sandwich panels, cleanroom panels, partition and
              view glass panels — and the profiles that join them — for clean, finished interiors.
            </p>
          </div>
          <div className="about-hero-ph" aria-hidden="true">
            <img src={PHOTO.laserClose.src} srcSet={srcSetFor(PHOTO.laserClose.src)} sizes="(max-width: 820px) 100vw, 40vw" alt="" decoding="async" fetchPriority="high" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead index="Range" label="What we do" hint="Openings · surfaces · junctions" />
          <div className="sys-grid">
            <Materialize>
              <h2 className="h2" style={{ maxWidth: '16ch' }}>Three things, <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>made to fit together.</span></h2>
            </Materialize>
            <Reveal delay={0.08}>
              <p className="lede">Most interiors are assembled from parts that were never meant to meet. AKALKA makes the openings, the surfaces and the junctions as one system.</p>
            </Reveal>
          </div>
          <div className="pillars">
            {PILLARS.map((p, i) => (
              <Reveal key={p.k} delay={i * 0.08}>
                <article className="pillar">
                  <div className="pillar-ph">
                    <ParallaxImg src={p.img.src} alt={p.img.alt} speed={0.06} />
                  </div>
                  <div className="pillar-body">
                    <p className="meta">{p.k}</p>
                    <h3 className="h3">{p.h}</h3>
                    <p className="body-sm">{p.p}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ImageExpand img={PHOTO.cleanroomTech} left="One" right="system." kicker="Our position">
        <h2 className="h2">Openings, walls and junctions <span className="font-hand" style={{ color: 'var(--datum)' }}>that read as one.</span></h2>
        <p className="lede">
          Doors, panels and profiles are produced to meet — the same coated finish, the same
          colours, the same confirmed specification — so a room reads as one continuous surface.
        </p>
      </ImageExpand>

      <section className="section">
        <div className="wrap">
          <div className="panel manifesto">
            <SectionHead index="Sheet" label="How we speak" hint="Scope, stated plainly" />
            <Materialize>
              <p className="manifesto-big">
                AKALKA is a product company. <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>The catalogue on this site is the company profile.</span>
              </p>
            </Materialize>
            <div className="manifesto-cols">
              {[
                { k: 'We present', p: 'Confirmed products and options, organised so you can specify quickly.' },
                { k: 'We mark', p: 'Anything unconfirmed is labelled “needs confirmation” — and one tap asks us.' },
                { k: 'We leave out', p: 'No invented ratings, project galleries or testimonials. The products carry the brand.' },
              ].map((c, i) => (
                <Reveal key={c.k} delay={i * 0.06}>
                  <div className="intro-col">
                    <p className="meta">{c.k}</p>
                    <p className="body-sm">{c.p}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section dark-sec on-dark" id="why">
        <div className="wrap">
          <SectionHead index="Workshop" label="Why AKALKA" hint="Three commitments" />
          <Materialize>
            <h2 className="h2" style={{ maxWidth: '18ch', marginBottom: 'var(--s9)' }}>Precision you can see <span className="font-hand" style={{ color: 'var(--datum)' }}>before you measure.</span></h2>
          </Materialize>
          <ol className="prin-rows">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.t} delay={i * 0.06}>
                <li className="prin-row">
                  <span className="prin-n">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="prin-t">{p.t}</h3>
                  <p className="body-sm">{p.d}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead index="Process" label="How we work" hint="Four steps" />
          <Materialize>
            <h2 className="h2" style={{ maxWidth: '18ch', marginBottom: 'var(--s12)' }}>From your drawing <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>to a made product.</span></h2>
          </Materialize>
          <Process />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead index="Work" label="Finished interiors" hint="Drag / scroll" />
          <Reveal>
            <Carousel slides={FINISH_SLIDES} label="Finished work" hint="Drag / scroll" />
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead index="Index" label="The range at a glance" hint={`${CATEGORIES.length} systems`} />
          <RangeIndex />
          <Reveal>
            <div className="cta-row" style={{ marginTop: 'var(--s9)' }}>
              <Magnetic><Link to="/products" className="btn btn-solid">Open the catalogue <ArrowRight className="arr arr-r" /></Link></Magnetic>
              <Magnetic><Link to="/contact" className="btn">Talk to us <ArrowUpRight className="arr arr-up" /></Link></Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
