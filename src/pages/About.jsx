import { Link } from 'react-router-dom';
import { CAT, PANEL_CORES, WALL_THICKNESSES, tag } from '../data/products.js';
import { Reveal, Materialize, ParallaxImg, ScrollWords, CountUp, Magnetic } from '../components/Reveal.jsx';
import Carousel from '../components/Carousel.jsx';
import { PROCESS, PRINCIPLES, PILLARS as PILLAR_COPY } from '../data/story.js';
import { HERO, IMG, PHOTO, srcSetFor } from '../data/images.js';
import { ArrowRight, ArrowUpRight } from '../components/icons.jsx';
import Eyebrow from '../components/Eyebrow.jsx';

const BASE = import.meta.env.BASE_URL;

/* AKALKA's own photographs lead this page. The showroom image is wide, so
   each card below crops a different part of it. */
const SHOWROOM = { src: HERO.src, srcSet: HERO.srcSet, alt: HERO.alt };
const CORRIDOR = {
  src: `${BASE}Images/hero-cleanroom-1920.webp`,
  srcSet: `${BASE}Images/hero-cleanroom-1280.webp 1280w, ${BASE}Images/hero-cleanroom-1920.webp 1920w, ${BASE}Images/hero-cleanroom-2560.webp 2560w`,
  alt: 'A technician pushing a trolley down a bright white corridor with glossy flush walls and a clean panel ceiling',
};

const FACTS = [
  { n: CAT.doors.types.length, t: 'Door types', d: 'Modular, fire rated, emergency' },
  { n: PANEL_CORES.length, t: 'Panel cores', d: 'PUF, rockwool, honeycomb' },
  { n: WALL_THICKNESSES.length, t: 'Wall thicknesses', d: '50 mm and 100 mm' },
  { n: CAT.profiles.groups.length, t: 'Profile groups', d: 'Corners to bottom tracks' },
];

/* Three things AKALKA makes. Each opens its own chapter of the catalogue. */
const PILLARS = [
  {
    k: 'Openings', h: 'Doors', to: '/products#doors', cta: 'Explore doors',
    img: { src: SHOWROOM.src, srcSet: SHOWROOM.srcSet, alt: 'A row of doors on display: white, steel, blue and red leaves, each with a vision panel' },
    pos: '0% 50%', zoom: 1, origin: '0% 50%',
    p: PILLAR_COPY[0].p,
  },
  {
    k: 'Surfaces', h: 'Panels', to: '/products#panels', cta: 'Explore panels',
    img: { src: SHOWROOM.src, srcSet: SHOWROOM.srcSet, alt: 'A display stand of wall panel samples, some cut open to show their cores' },
    pos: '95% 50%', zoom: 1.25, origin: '50% 56%',
    p: PILLAR_COPY[1].p,
  },
  {
    k: 'Junctions', h: 'Profiles', to: '/products#profiles', cta: 'Explore profiles',
    img: PHOTO.measure, pos: '50% 50%', zoom: 1, origin: '50% 50%',
    p: PILLAR_COPY[2].p,
  },
];

const FINISH_SLIDES = [
  { ...IMG.cleanroomFinished, tag: tag('cleanroom'), title: 'Completed cleanroom', note: 'Flush panels, blue doors, blue floor' },
  { ...CORRIDOR, tag: tag('cleanroom'), title: 'Clean, controlled rooms', note: 'Flush, washable surfaces' },
  { ...SHOWROOM, tag: tag('sandwich'), title: 'Panels and doors, side by side', note: 'One system, one maker' },
  { ...IMG.doorDouble, tag: tag('doors', 'regular-double'), title: 'Double doors in situ', note: 'Configured openings' },
  { ...IMG.panelJoint, tag: tag('sandwich'), title: 'Panel joint engineering', note: 'Double-skin construction' },
];

const SAME = [
  ['A', 'The same coated finish'],
  ['B', 'The same colours'],
  ['C', 'The same confirmed specification'],
];

function Pillar({ p, i }) {
  return (
    <Reveal delay={i * 0.08}>
      <article className="ab2-pc">
        <Link to={p.to} className="ab2-pc-ph" aria-label={`${p.cta}: ${p.h}`}>
          <img
            src={p.img.src}
            srcSet={p.img.srcSet || srcSetFor(p.img.src)}
            sizes="(max-width: 900px) 90vw, 33vw"
            alt={p.img.alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            style={{ '--pos': p.pos, '--z': p.zoom, '--o': p.origin }}
          />
          <span className="ab2-pc-no meta">{String(i + 1).padStart(2, '0')} · {p.k}</span>
          <span className="ab2-pc-go" aria-hidden="true"><ArrowUpRight style={{ width: 18, height: 18 }} /></span>
        </Link>
        <div className="ab2-pc-txt">
          <h3 className="h3">{p.h}</h3>
          <p className="body-sm">{p.p}</p>
          <Link to={p.to} className="rd-more">{p.cta} <ArrowRight style={{ width: 14, height: 14 }} /></Link>
        </div>
      </article>
    </Reveal>
  );
}

export default function About() {
  return (
    <div className="page ab2">
      {/* ---- opening: the headline, then the showroom as a wide band ---- */}
      <section className="ab2-hero on-dark">
        <div className="wrap ab2-hero-in">
          <Eyebrow>About AKALKA · Visakhapatnam</Eyebrow>
          <h1 className="display ab2-h1">
            <span className="mask"><span>A manufacturer,</span></span>
            <span className="mask"><span style={{ animationDelay: '0.12s' }}><span className="font-hand" style={{ color: 'var(--datum)' }}>defined by product.</span></span></span>
          </h1>
          <div className="ab2-hero-row">
            <p className="lede">
              AKALKA manufactures doors, sandwich panels, cleanroom panels, partition and view glass
              panels — and the profiles that join them — for clean, finished interiors.
            </p>
            <div className="ab2-hero-cta">
              <Magnetic><Link to="/products" className="pill-btn">See the range <i aria-hidden="true"><ArrowUpRight style={{ width: 16, height: 16 }} /></i></Link></Magnetic>
              <Link to="/contact" className="rd-more">Send an enquiry <ArrowRight style={{ width: 14, height: 14 }} /></Link>
            </div>
          </div>
        </div>
        <Reveal className="ab2-band-wrap">
          <figure className="ab2-band">
            <ParallaxImg src={SHOWROOM.src} alt={SHOWROOM.alt} speed={0.06} eager sizes="100vw" />
            <figcaption className="meta">Doors and panels, one maker</figcaption>
          </figure>
        </Reveal>
      </section>

      <section className="ab2-facts-sec">
        <div className="wrap">
          <Reveal>
            <dl className="ab2-facts">
              {FACTS.map((f) => (
                <div key={f.t}>
                  <dt className="ab2-fn"><CountUp to={f.n} pad /></dt>
                  <dd><b>{f.t}</b><span>{f.d}</span></dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ---- the idea, read as it scrolls ---- */}
      <section className="ab2-say">
        <div className="wrap">
          <Eyebrow>The idea</Eyebrow>
          <Materialize>
            <p className="manifesto-big ab2-big">
              <ScrollWords
                text="Most interiors are assembled from parts that were never meant to meet. AKALKA makes the openings, the surfaces and the junctions as one system."
                accents={['one', 'system.']}
              />
            </p>
          </Materialize>
        </div>
      </section>

      {/* ---- what we make: three equal photographs ---- */}
      <section className="ab2-make">
        <div className="wrap">
          <div className="ab2-head">
            <Eyebrow n="01">What we do</Eyebrow>
            <Materialize>
              <h2 className="h2 ab2-h2">Three things, <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>made to fit together.</span></h2>
            </Materialize>
          </div>
          <div className="ab2-tri">
            {PILLARS.map((p, i) => <Pillar key={p.h} p={p} i={i} />)}
          </div>
        </div>
      </section>

      {/* ---- our position: a photograph beside the statement ---- */}
      <section className="ab2-pos">
        <div className="wrap ab2-pos-grid">
          <Reveal className="ab2-pos-ph">
            <figure className="bz">
              <div className="bz-in">
                <img src={CORRIDOR.src} srcSet={CORRIDOR.srcSet} sizes="(max-width: 900px) 90vw, 44vw" alt={CORRIDOR.alt} loading="lazy" decoding="async" />
              </div>
            </figure>
          </Reveal>
          <div className="ab2-pos-txt">
            <Eyebrow n="02">Our position</Eyebrow>
            <Materialize>
              <h2 className="h2 ab2-h2">Openings, walls and junctions <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>that read as one.</span></h2>
            </Materialize>
            <Reveal>
              <p className="lede">
                Doors, panels and profiles are produced to meet, so a room reads as one continuous surface.
              </p>
              <ul className="ab2-same">
                {SAME.map(([k, t]) => (
                  <li key={k}><b>{k}</b><span>{t}</span></li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- why AKALKA: three commitments on dark ---- */}
      <section className="ab2-why on-dark" id="why">
        <div className="wrap">
          <div className="ab2-head">
            <Eyebrow n="03">Why AKALKA</Eyebrow>
            <Materialize>
              <h2 className="h2 ab2-h2">Precision you can see <span className="font-hand" style={{ color: 'var(--datum)' }}>before you measure.</span></h2>
            </Materialize>
          </div>
          <ol className="ab2-cols">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.t} delay={i * 0.08}>
                <li>
                  <span className="ab2-cn" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="ab2-ct">{p.t}</h3>
                  <p className="body-sm">{p.d}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- how we work: four steps in a row ---- */}
      <section className="ab2-proc">
        <div className="wrap">
          <div className="ab2-head">
            <Eyebrow n="04">How we work</Eyebrow>
            <Materialize>
              <h2 className="h2 ab2-h2">From your drawing <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>to a made product.</span></h2>
            </Materialize>
          </div>
          <ol className="ab2-steps">
            {PROCESS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.07}>
                <li className="bz">
                  <div className="bz-in">
                    <span className="ab2-sn">{s.n}</span>
                    <h3 className="h3">{s.t}</h3>
                    <p className="body-sm">{s.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- finished interiors ---- */}
      <section className="ab2-work">
        <div className="wrap">
          <div className="ab2-head">
            <Eyebrow n="05">Finished interiors</Eyebrow>
            <Materialize>
              <h2 className="h2 ab2-h2">The finish, <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>in the room.</span></h2>
            </Materialize>
          </div>
          <Reveal>
            <Carousel slides={FINISH_SLIDES} label="Finished work" hint="Drag / scroll" />
          </Reveal>
        </div>
      </section>

    </div>
  );
}
