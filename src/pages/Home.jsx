import { Link } from 'react-router-dom';
import { CATEGORIES, CAT, PANEL_CORES, WALL_THICKNESSES, word, tag } from '../data/products.js';
import { Reveal, Materialize, SectionHead, Magnetic, ScrollWords, CountUp } from '../components/Reveal.jsx';
import { ArrowUpRight } from '../components/icons.jsx';
import Carousel from '../components/Carousel.jsx';
import CleanroomShowcase from '../components/CleanroomShowcase.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import Hero from '../components/Hero.jsx';
import NeedsChip from '../components/NeedsChip.jsx';
import { SystemAnatomy, PanelExploded, DoorExploded, Applications } from '../components/Scenes.jsx';
import { ImageExpand } from '../components/Blocks.jsx';
import { IMG, PHOTO } from '../data/images.js';

/* Home is one argument, told in order: who AKALKA is, what it makes
   (the drawn room), how it makes it (to order), the two products taken
   apart layer by layer, the controlled rooms, where it all goes, and
   the enquiry. Range detail lives on Products; position on About. */

/* ---------------- Static specification strip ---------------- */
function Strip() {
  const items = ['Regular / Fire / Emergency Doors', 'Single & Double', 'PUF / Rockwool / Honeycomb', '50 / 100 mm', 'Cleanroom Wall & Ceiling', 'Riser Panels with Grill', 'View Glass', 'R-70 / R-90 Profiles'];
  const row = (hidden) => (
    <span aria-hidden={hidden || undefined}>
      {items.map((t, i) => <span key={i}>{t}{i < items.length - 1 && <b>·</b>}</span>)}
    </span>
  );
  return (
    <div className="marquee" id="range-strip" aria-label="Confirmed range summary">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/* ---------------- Who we are ---------------- */
/* The first thing after the hero must answer three questions a stranger
   has: who is this, what do they make, how do I buy it. Every figure in
   the facts row is a count of confirmed catalogue data — nothing claimed. */
function Intro() {
  const facts = [
    { n: CATEGORIES.length, t: 'Product families', d: 'Doors to profiles, one maker' },
    { n: CAT.doors.types.length, t: 'Door types', d: 'Modular, fire rated, emergency' },
    { n: PANEL_CORES.length, t: 'Panel cores', d: 'PUF, rockwool, honeycomb' },
    { n: WALL_THICKNESSES.length, t: 'Wall thicknesses', d: '50 mm and 100 mm' },
  ];
  return (
    <section className="section" id="intro">
      <div className="wrap">
        <SectionHead index="Hello" label="Who we are" hint="Manufacturing first" />
        <Materialize>
          <p className="manifesto-big intro-big">
            <ScrollWords
              text="AKALKA manufactures doors, panels and profiles for clean, finished interiors — designed as one system, made to your sizes."
              accents={['one', 'system,']}
            />
          </p>
        </Materialize>
        <div className="intro-cols">
          {[
            { k: 'What we make', h: 'The whole room.', p: 'Doors, sandwich, cleanroom, partition and view glass panels — plus the profiles and tracks that join them.' },
            { k: 'Who it is for', h: 'Anyone specifying.', p: 'Contractors, architects, fit-out and facility teams building controlled or finished interiors.' },
            { k: 'How we work', h: 'Made to order.', p: 'Sent sizes become a confirmed specification. Anything unconfirmed is marked plainly — never invented.' },
          ].map((c, i) => (
            <Reveal key={c.k} delay={i * 0.08}>
              <div className="intro-col">
                <p className="meta">{c.k}</p>
                <h3 className="h3">{c.h}</h3>
                <p className="body-sm">{c.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <dl className="facts">
            {facts.map((f) => (
              <div key={f.t}>
                <dt className="facts-n"><CountUp to={f.n} pad /></dt>
                <dd>
                  <b>{f.t}</b>
                  <span>{f.d}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- What we make: the drawn room ---------------- */
function SystemIntro() {
  return (
    <>
      <section className="section sys-head" id="system">
        <div className="wrap">
          <SectionHead index="System" label="What we make" hint={`${word(CATEGORIES.length)} families · one room`} />
          <div className="sys-grid">
            <Materialize>
              <h2 className="h2" style={{ maxWidth: '16ch' }}>
                Every surface of the room, <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>from one maker.</span>
              </h2>
            </Materialize>
            <Reveal delay={0.08}>
              <p className="lede">
                Walls, ceilings, doors, glass, partitions and the profiles between them.
                Scroll the drawing — each AKALKA product lights up where it goes.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
      <SystemAnatomy />
    </>
  );
}

/* ---------------- Doors in situ ---------------- */
/* Real product photography straight after the exploded door — the
   drawing explains the build, the gallery proves the finish. */
const DOOR_SLIDES = [
  { ...IMG.doorSingle, tag: tag('doors', 'regular-single'), title: 'Regular Modular Single', note: 'Size as per requirement' },
  { ...IMG.doorDouble, tag: tag('doors', 'regular-double'), title: 'Regular Modular Double', note: 'Size as per requirement' },
  { ...IMG.doorFire, tag: tag('doors', 'fire-single'), title: 'Fire Rated Single', note: 'Push-bar hardware — rating: needs confirmation' },
  { ...IMG.doorFireDouble, tag: tag('doors', 'fire-double'), title: 'Fire Rated Double', note: 'Double-leaf push-bar — rating: needs confirmation' },
  { ...IMG.doorEmergency, tag: `${tag('doors', 'emergency-single')} / ${CAT.doors.variants[5].no}`, title: 'Emergency', note: 'Single and double — hardware: needs confirmation' },
  { ...PHOTO.steelDoorWall, tag: tag('doors'), title: 'Set into the panel system', note: 'Doors and panels from one maker' },
  { ...IMG.doorSingleAlt, tag: tag('doors'), title: 'Coated colour options', note: 'White, matt white, as per requirement' },
];

function DoorGallery() {
  return (
    <section className="section door-gal" aria-label="Doors in situ">
      <div className="wrap">
        <Reveal>
          <Carousel slides={DOOR_SLIDES} label="Doors in situ" hint="Drag / scroll" />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Cleanroom showcase chapter ---------------- */
function Cleanroom() {
  const cr = CATEGORIES.find((c) => c.id === 'cleanroom');
  return (
    <section className="section dark-sec on-dark" id="cleanroom">
      <div className="wrap">
        <SectionHead index={cr.index} label="Cleanroom panels" hint="Wall · ceiling · washable · flush" />
        <div className="sys-grid">
          <Materialize>
            <h2 className="h2" style={{ maxWidth: '16ch' }}>Controlled interiors, <span className="font-hand" style={{ color: 'var(--datum)' }}>flush surfaces.</span></h2>
          </Materialize>
          <Reveal delay={0.08}>
            <p className="lede">{cr.description}</p>
          </Reveal>
        </div>
        <div aria-hidden="true" style={{ height: 'var(--s9)' }} />
        <Reveal>
          <CleanroomShowcase items={cr.items} />
        </Reveal>
        <Reveal>
          <div style={{ marginTop: 'var(--s8)', display: 'flex', flexWrap: 'wrap', gap: 'var(--s4)', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="meta" style={{ color: 'var(--on-dark-muted)' }}>
              Classifications, ratings, performance:{' '}
              <NeedsChip term="cleanroom ISO class, GMP compliance and pressure/hygiene ratings" interest="Cleanroom Panels">Needs confirmation</NeedsChip>
            </p>
            <Link to="/products#cleanroom" className="link-line">Full cleanroom range</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Where it's used ---------------- */
/* Kinds of space, each mapped to the confirmed products that build it.
   This describes what the products are for — never a claimed project. */
const APPS = [
  { t: 'Cleanrooms & controlled rooms', img: PHOTO.cleanroomTech, to: '/products#cleanroom', d: 'Flush, washable wall and ceiling surfaces, with doors and vision panels set into the same line.', uses: ['Cleanroom panels', 'Doors', 'View glass'] },
  { t: 'Insulated walls & enclosures', img: PHOTO.panelWall, to: '/products#sandwich', d: 'Double-skin walls with a PUF or rockwool core, in 50 or 100 mm, closed out with matching profiles.', uses: ['Sandwich panels', 'Corner profiles', 'Bottom tracks'] },
  { t: 'Interior division', img: PHOTO.glassHall, to: '/products#partition', d: 'Partition and flush wall panels that divide space with an architectural finish — glazed where a sightline matters.', uses: ['Partition panels', 'Flush wall', 'View glass'] },
  { t: 'Exit & fire routes', img: IMG.doorFire, to: '/products#doors', d: 'Fire rated and emergency doors, single or double, with push-bar hardware. Ratings confirmed on enquiry.', uses: ['Fire rated doors', 'Emergency doors'] },
  { t: 'Service risers & shafts', img: IMG.riserPanel, to: '/products#partition', d: 'Riser panels with grill that ventilate and screen service shafts within the finished wall.', uses: ['Riser panel with grill', 'Profiles'] },
  { t: 'Junctions & finishing', img: PHOTO.angles, to: '/products#profiles', d: 'Corners, channels, angles, box sections and bottom tracks — the details that make it all one surface.', uses: ['Profiles', 'C-type tracks', 'R-70 / R-90'] },
];

function WhereUsed() {
  return (
    <Applications
      items={APPS}
      head={
        <>
          <SectionHead index="Use" label="Where it's used" hint={`${word(APPS.length)} kinds of space`} />
          <Materialize>
            <h2 className="h2">Built for rooms <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>that have to work.</span></h2>
            <p className="lede" style={{ marginTop: 'var(--s4)' }}>From sealed cleanrooms to everyday partitions — the same coordinated system, specified per space.</p>
          </Materialize>
          <p className="meta apps-hint"><i /> Keep scrolling</p>
        </>
      }
    />
  );
}

/* ---------------- Enquiry ---------------- */
function Enquiry() {
  /* Pick up the door configuration built above, if any — the visitor
     configured it once and should never have to retype it. */
  let doorMeta = '';
  try {
    const cfg = JSON.parse(window.localStorage.getItem('akalka-door-config') || 'null');
    if (cfg) {
      doorMeta = [cfg.type, cfg.leaves, cfg.core && `${cfg.core} core`, cfg.finish, cfg.colour, cfg.glass]
        .filter(Boolean)
        .join(' · ');
    }
  } catch {
    doorMeta = '';
  }
  return (
    <section className="section" id="enquiry">
      <div className="wrap">
        <SectionHead index="Contact" label="Start an enquiry" />
        <div className="enquiry-grid">
          <div>
            <Materialize>
              <h2 className="h2" style={{ marginBottom: 'var(--s4)' }}>Have a requirement?<br /><span className="font-hand" style={{ color: 'var(--datum-ink)' }}>Send the sizes.</span></h2>
              <p className="lede">
                Doors, panels and profiles are manufactured to order. Share drawings,
                dimensions or a bill of quantities and receive a confirmed specification.
              </p>
            </Materialize>
            <Reveal>
              <ul className="enq-points">
                <li><b>Drawings or a schedule</b><span>Openings, layouts, areas — whatever you have.</span></li>
                <li><b>Ranges you need</b><span>Doors, panels, profiles, or the full system.</span></li>
                <li><b>Site and quantities</b><span>So the specification comes back complete.</span></li>
              </ul>
              <div style={{ marginTop: 'var(--s7)' }}>
                <Link to="/products" className="link-line">Browse the catalogue instead</Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.08}>
            <div className="enquiry-card">
              <EnquiryForm defaultInterest="Multiple / full system" defaultMeta={doorMeta} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Page ---------------- */
export default function Home() {
  return (
    <div className="page">
      <Hero />
      <Strip />
      <Intro />
      <SystemIntro />
      <ImageExpand img={PHOTO.laser} left="Made" right="to order." kicker="How AKALKA works">
        <h2 className="h2">Cut, formed and finished <span className="font-hand" style={{ color: 'var(--datum)' }}>to your drawings.</span></h2>
        <p className="lede">
          Every door, panel and profile is produced against a confirmed specification —
          sizes, cores, thicknesses, finishes and colours agreed before anything is made.
        </p>
        <Magnetic>
          <Link to="/contact" className="btn btn-light">Send your sizes <ArrowUpRight className="arr arr-up" /></Link>
        </Magnetic>
      </ImageExpand>
      <DoorExploded />
      <DoorGallery />
      <PanelExploded />
      <Cleanroom />
      <WhereUsed />
      <Enquiry />
    </div>
  );
}
