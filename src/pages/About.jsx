import { useState } from 'react';
import { word, tag } from '../data/products.js';
import { Reveal, Materialize, SectionHead } from '../components/Reveal.jsx';
import Carousel from '../components/Carousel.jsx';
import { ImageExpand, Process, PROCESS_STEPS } from '../components/Blocks.jsx';
import { IMG, PHOTO, srcSetFor } from '../data/images.js';

const FINISH_SLIDES = [
  { ...IMG.cleanroomFinished, tag: tag('cleanroom'), title: 'Completed cleanroom', note: 'Flush panels, blue doors, blue floor' },
  { ...PHOTO.cleanroomLab, tag: tag('cleanroom'), title: 'Clean, controlled rooms', note: 'Flush, washable surfaces' },
  { ...IMG.doorDouble, tag: tag('doors', 'regular-double'), title: 'Double doors in situ', note: 'Configured openings' },
  { ...PHOTO.steelDoorWall, tag: tag('doors'), title: 'Door set into the panel wall', note: 'One system, one maker' },
  { ...IMG.panelJoint, tag: tag('sandwich'), title: 'Panel joint engineering', note: 'Double-skin construction' },
];

const PRINCIPLES = [
  { t: 'Made to meet', d: 'Doors, panels and profiles come from one maker, so junctions line up in the factory instead of being improvised on site.' },
  { t: 'Variation without invention', d: 'Sizes and colours adapt to requirement. Anything unconfirmed is marked plainly — and one tap asks us, never guessed.' },
  { t: 'Finish as discipline', d: 'White, Matt White or matched colour across every element, so the whole project stays coherent.' },
];

/* Full-resolution photographs: these panels run wide, so a small source
   would show. */
const PILLARS = [
  { k: 'Openings', h: 'Doors', img: PHOTO.steelDoorWall, p: 'Regular modular, fire rated and emergency doors — single and double, honeycomb or rockwool cores, sized to the opening.' },
  { k: 'Surfaces', h: 'Panels', img: PHOTO.panelWall, p: 'Sandwich, cleanroom, partition, riser, flush wall and view glass panels in confirmed types and thicknesses.' },
  { k: 'Junctions', h: 'Profiles', img: PHOTO.measure, p: 'Corners, 2D and 3D forms, channels, angles, box sections, aluminium-coated profiles and bottom tracks.' },
];

/* Three door-like panels side by side. Pointing at one (or tabbing to it)
   opens it wider and brings its copy up; on a phone they stack and every
   panel shows its copy. */
function Panels() {
  const [on, setOn] = useState(0);
  return (
    <div className="ab-panels">
      {PILLARS.map((p, i) => (
        <article
          key={p.k}
          className={`ab-panel${i === on ? ' on' : ''}`}
          tabIndex={0}
          onPointerEnter={() => setOn(i)}
          onFocus={() => setOn(i)}
          onClick={() => setOn(i)}
        >
          <img src={p.img.src} srcSet={srcSetFor(p.img.src)} sizes="(max-width: 820px) 100vw, 56vw" alt={p.img.alt} loading="lazy" decoding="async" />
          <div className="ab-panel-body">
            <p className="meta">{p.k}</p>
            <h3 className="h3">{p.h}</h3>
            <p className="body-sm">{p.p}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function About() {
  return (
    <div className="page">
      {/* ---- opening: one full-bleed photograph, the headline resting on it ---- */}
      <section className="ab-hero">
        <img
          className="ab-hero-img"
          src={PHOTO.laserClose.src}
          srcSet={srcSetFor(PHOTO.laserClose.src)}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority="high"
        />
        <div className="ab-hero-shade" aria-hidden="true" />
        <div className="wrap ab-hero-copy">
          <p className="meta">About AKALKA</p>
          <h1 className="display">
            <span className="mask"><span>A manufacturer,</span></span>
            <span className="mask"><span style={{ animationDelay: '0.12s' }}><span className="font-hand" style={{ color: 'var(--datum)' }}>defined by product.</span></span></span>
          </h1>
          <p className="lede">
            AKALKA manufactures doors, sandwich panels, cleanroom panels, partition and
            view glass panels — and the profiles that join them — for clean, finished interiors.
          </p>
        </div>
      </section>

      {/* ---- what we do ---- */}
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
          <Reveal>
            <Panels />
          </Reveal>
        </div>
      </section>

      {/* ---- our position ---- */}
      <ImageExpand img={PHOTO.cleanroomTech} left="One" right="system." kicker="Our position">
        <h2 className="h2">Openings, walls and junctions <span className="font-hand" style={{ color: 'var(--datum)' }}>that read as one.</span></h2>
        <p className="lede">
          Doors, panels and profiles are produced to meet — the same coated finish, the same
          colours, the same confirmed specification — so a room reads as one continuous surface.
        </p>
      </ImageExpand>

      {/* ---- why AKALKA: heading pinned, commitments scroll past it ---- */}
      <section className="section dark-sec on-dark ab-why" id="why">
        <div className="wrap ab-split">
          <div className="ab-side">
            <SectionHead index="Workshop" label="Why AKALKA" hint={`${word(PRINCIPLES.length)} commitments`} />
            <Materialize>
              <h2 className="h2">Precision you can see <span className="font-hand" style={{ color: 'var(--datum)' }}>before you measure.</span></h2>
            </Materialize>
          </div>
          <ol className="ab-list">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.t} delay={i * 0.06}>
                <li className="ab-item">
                  <span className="ab-n">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="ab-t">{p.t}</h3>
                    <p className="body-sm">{p.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- how we work: heading pinned, the four steps run down beside it ---- */}
      <section className="section">
        <div className="wrap ab-split">
          <div className="ab-side">
            <SectionHead index="Process" label="How we work" hint={`${word(PROCESS_STEPS)} steps`} />
            <Materialize>
              <h2 className="h2">From your drawing <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>to a made product.</span></h2>
            </Materialize>
          </div>
          <Process vertical />
        </div>
      </section>

      {/* ---- finished interiors ---- */}
      <section className="section">
        <div className="wrap">
          <SectionHead index="Work" label="Finished interiors" hint="Drag / scroll" />
          <Reveal>
            <Carousel slides={FINISH_SLIDES} label="Finished work" hint="Drag / scroll" />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
