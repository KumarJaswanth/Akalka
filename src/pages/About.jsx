import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products.js';
import { Reveal, Materialize, SectionHead, Magnetic } from '../components/Reveal.jsx';
import { ArrowRight, ArrowUpRight } from '../components/icons.jsx';
import Carousel from '../components/Carousel.jsx';
import { IMG, V } from '../data/images.js';

const CAT_CODES = { doors: 'DR', sandwich: 'SW', cleanroom: 'CR', partition: 'PT', profiles: 'PF' };

const FINISH_SLIDES = [
  { ...IMG.flushWalls, code: 'PT-F / CR-F', title: 'Flush wall surfaces', note: 'Flat, continuous finishes' },
  { ...IMG.partition, code: 'PT-P', title: 'Partitioned space', note: 'Divided, finished interiors' },
  { ...IMG.cleanroomAlt, code: 'CR', title: 'Controlled rooms', note: 'Clean technical environments' },
  {
    src: V('1762928289094-197055a5d5c3', 1000, 1250),
    alt: 'Close view of a minimal white wall with soft light',
    code: 'Detail',
    title: 'Surface discipline',
    note: 'White and matt white systems',
  },
];

export default function About() {
  return (
    <div className="page">
      <section className="page-hero">
        <div className="wrap">
          <h1 className="display">
            <span className="mask"><span>A manufacturer,</span></span>
            <span className="mask"><span style={{ animationDelay: '0.12s' }}>defined by product.</span></span>
          </h1>
          <p className="lede" style={{ color: 'var(--on-dark-muted)', marginTop: 22 }}>
            AKALKA manufactures doors, wall panels, cleanroom panels, partition
            panels and profiles: products for controlled, partitioned and
            professionally finished interior environments.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead index="Range" label="What AKALKA manufactures" hint="Confirmed range" />
          <Reveal>
            <div className="about-facts">
              <div>
                <p className="meta" style={{ color: 'var(--ink)', marginBottom: 12 }}>Openings</p>
                <h3 className="h3">Doors</h3>
                <p className="body-sm" style={{ marginTop: 10 }}>Single and double doors in honeycomb or rockwool cores, pre-powder or powder coated, sized to requirement.</p>
              </div>
              <div>
                <p className="meta" style={{ color: 'var(--ink)', marginBottom: 12 }}>Surfaces</p>
                <h3 className="h3">Panels</h3>
                <p className="body-sm" style={{ marginTop: 10 }}>PUF, rockwool and honeycomb sandwich systems, cleanroom wall and ceiling panels, partition and flush wall panels.</p>
              </div>
              <div>
                <p className="meta" style={{ color: 'var(--ink)', marginBottom: 12 }}>Junctions</p>
                <h3 className="h3">Profiles</h3>
                <p className="body-sm" style={{ marginTop: 10 }}>Corner, 2D, 3D, C-channel, L-angle and box-type profiles, R-70 / R-90 aluminium-coated options, 50 / 100 mm bottom tracks.</p>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div style={{ marginTop: 36 }}>
              <Carousel slides={FINISH_SLIDES} label="Finished work" hint="Drag / scroll" />
            </div>
          </Reveal>
        </div>
      </section>

<section className="section">
        <div className="wrap">
          <div className="panel manifesto">
            <SectionHead index="Sheet" label="Position" hint="Scope, stated plainly" />
          <Materialize>
            <p className="manifesto-big">
              AKALKA is a product company. The catalogue on this
              site is the company profile.
            </p>
          </Materialize>
          <div className="manifesto-cols">
            <div>
              <p className="meta" style={{ color: 'var(--ink)', marginBottom: 10 }}>We present</p>
              <p className="body-sm">Confirmed products, thicknesses, finishes, colours and coatings, organised so engineers and buyers can specify quickly.</p>
            </div>
            <div>
              <p className="meta" style={{ color: 'var(--ink)', marginBottom: 10 }}>We mark</p>
              <p className="body-sm">Anything unconfirmed (ratings, classifications, capacities, history) is labelled “needs confirmation” rather than invented.</p>
            </div>
            <div>
              <p className="meta" style={{ color: 'var(--ink)', marginBottom: 10 }}>We leave out</p>
              <p className="body-sm">Project galleries, client logos, testimonials, statistics. The product system carries the brand.</p>
            </div>
          </div>
        </div>
      </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead index="Index" label="The range at a glance" hint="5 systems" />
          <div>
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.id} delay={Math.min(i * 0.04, 0.16)}>
                <Link to={`/products#${c.id}`} className="cat-row">
                  <span className="cat-num">{CAT_CODES[c.id]}</span>
                  <span>
                    <span className="cat-name">{c.name}</span>
                    <span className="cat-desc" style={{ display: 'block' }}>{c.tagline}</span>
                  </span>
                  <span className="cat-code" aria-hidden="true">{c.index} / 05</span>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="cta-row" style={{ marginTop: 36 }}>
              <Magnetic><Link to="/products" className="btn btn-solid">Open the catalogue <ArrowRight className="arr arr-r" /></Link></Magnetic>
              <Magnetic><Link to="/contact" className="btn">Talk to us <ArrowUpRight className="arr arr-up" /></Link></Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
