import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, FINISHES } from '../data/products.js';
import { Reveal, Materialize, ClipReveal, SectionHead, Magnetic, ParallaxImg, ScrollWords, CountUp } from '../components/Reveal.jsx';
import { ArrowRight, ArrowUpRight } from '../components/icons.jsx';
import Carousel from '../components/Carousel.jsx';
import Flow from '../components/Flow.jsx';
import { IMG, V } from '../data/images.js';

/* ---------------- Static specification strip ---------------- */
function Strip() {
  const items = ['Single & Double Doors', 'PUF / Rockwool / Honeycomb', '50 / 100 mm', 'Cleanroom Wall & Ceiling', 'Partition Systems', 'R-70 / R-90 Profiles'];
  const row = (hidden) => (
    <span aria-hidden={hidden || undefined}>
      {items.map((t, i) => <span key={i}>{t}{i < items.length - 1 && <b>Â·</b>}</span>)}
    </span>
  );
  return (
    <div className="marquee" aria-label="Confirmed range summary">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/* ---------------- Doors feature ---------------- */
const DOOR_SLIDES = [
  { ...IMG.doorSingle, code: 'DR-S', title: 'Single Doors', note: 'Size as per requirement' },
  { ...IMG.doorDouble, code: 'DR-D', title: 'Double Doors', note: 'Size as per requirement' },
  {
    src: V('1652175628203-33139d1a598a', 900, 1100),
    alt: 'Close view of a coated grey metal door surface',
    code: 'DR / Detail',
    title: 'Coated surfaces',
    note: 'Pre-powder or powder coated',
  },
  {
    src: V('1572512605819-8f88baee16e5', 1100, 800),
    alt: 'Wide industrial metal entrance, angled view',
    code: 'DR / Detail',
    title: 'Configured openings',
    note: 'Honeycomb or rockwool cores',
  },
];
function DoorsFeature() {
  const doors = CATEGORIES[0];
  const [core, setCore] = useState('Honeycomb');
  const [finish, setFinish] = useState('Powder coated');
  return (
    <section className="section fit" id="doors">
      <div className="wrap">
        <SectionHead index="DR" label="Featured doors" hint="DR-S / DR-D" />
        <Materialize>
          <h2 className="h2" style={{ maxWidth: '18ch', marginBottom: 14 }}>
            One opening, two configurations.
          </h2>
          <p className="lede">Sizes vary according to requirement. Configure core, finish and colour around the opening you need.</p>
        </Materialize>
        <div style={{ height: 36 }} />
        <Reveal>
          <Carousel slides={DOOR_SLIDES} label="Door gallery" hint="Drag / scroll" />
        </Reveal>
        <div style={{ height: 36 }} />
        <div className="split">
          <div className="split-cell">
            <Reveal className="dir-l">
              <p className="meta" style={{ color: 'var(--ink)', marginBottom: 18 }}>DR-S: Single door</p>
              <div className="door-ph">
                <ParallaxImg src={IMG.doorSingle.src} alt={IMG.doorSingle.alt} ratio="4/3" onError={(e) => { e.currentTarget.closest('.door-ph').style.display = 'none'; }} />
              </div>
              <div className="opt-group">
                <span className="meta">Select core</span>
                <div className="chips">
                  {doors.cores.map((c) => (
                    <button key={c} className={`chip${core === c ? ' is-on' : ''}`} onClick={() => setCore(c)} aria-pressed={core === c}>{c}</button>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
          <div className="split-cell dark on-dark">
            <Reveal className="dir-r">
              <p className="meta t-bright" style={{ marginBottom: 18 }}>DR-D: Double door</p>
              <div className="door-ph">
                <ParallaxImg src={IMG.doorDouble.src} alt={IMG.doorDouble.alt} ratio="4/3" onError={(e) => { e.currentTarget.closest('.door-ph').style.display = 'none'; }} />
              </div>
              <div className="opt-group">
                <span className="meta">Select finish</span>
                <div className="chips">
                  {doors.finishes.map((f) => (
                    <button key={f} className={`chip${finish === f ? ' is-on' : ''}`} onClick={() => setFinish(f)} aria-pressed={finish === f}>{f}</button>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
        <Reveal>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginTop: 22 }}>
            <span className="meta" style={{ color: 'var(--muted-fg)' }}>Current configuration:</span>
            <span className="chip chip-accent">{core}</span>
            <span className="chip chip-accent">{finish}</span>
            <span className="chip">Size: as per requirement</span>
            <span style={{ flex: 1 }} />
            <Link to="/products#doors" className="link-line">Full door range</Link>
          </div>
          <div className="chips" style={{ marginTop: 16 }}>
            {doors.colours.map((c) => <span key={c} className="chip">{c}</span>)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Sandwich band ---------------- */
function SandwichBand() {
  const sw = CATEGORIES[1];
  return (
    <section className="section fit" id="sandwich">
      <div className="wrap">
        <div className="panel">
          <SectionHead index="SW" label="Sandwich panels" hint="SW series" />
        <Materialize>
          <h2 className="h2" style={{ maxWidth: '18ch', marginBottom: 14 }}>Two thicknesses. No ambiguity.</h2>
          <p className="lede">{sw.tagline} {sw.description}</p>
        </Materialize>
        <div style={{ height: 36 }} />
        <ClipReveal>
          <figure className="band-ph">
            <ParallaxImg src={IMG.sandwich.src} alt={IMG.sandwich.alt} ratio="21/9" speed={0.12} onError={(e) => { e.currentTarget.closest('.band-ph').style.display = 'none'; }} />
            <figcaption><span className="meta">SW series</span><span>Double-skin wall systems</span></figcaption>
          </figure>
        </ClipReveal>
        <div style={{ height: 18 }} />
        <Reveal>
          <div className="thick-band">
            <div className="thick-cell">
              <span className="meta">PUF double-skin wall panel</span>
              <div className="thick-num"><CountUp to={50} /><sup>MM</sup> / <CountUp to={100} /><sup>MM</sup></div>
              <p className="body-sm" style={{ marginTop: 14 }}>Double-skin wall panel in the two confirmed thicknesses.</p>
              <div className="chips" style={{ marginTop: 18 }}><span className="chip">SW-PUF</span><span className="chip">50 mm</span><span className="chip">100 mm</span></div>
            </div>
            <div className="thick-cell">
              <span className="meta">Rockwool double-skin wall panel</span>
              <div className="thick-num"><CountUp to={50} /><sup>MM</sup> / <CountUp to={100} /><sup>MM</sup></div>
              <p className="body-sm" style={{ marginTop: 14 }}>Double-skin wall panel in the two confirmed thicknesses.</p>
              <div className="chips" style={{ marginTop: 18 }}><span className="chip">SW-RW</span><span className="chip">50 mm</span><span className="chip">100 mm</span></div>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="h-scroll" style={{ marginTop: 18 }}>
            {sw.panels.slice(2).map((p) => (
              <div className="h-card" key={p.code}>
                <span className="meta" style={{ color: 'var(--ink)' }}>{p.code}</span>
                <h3 className="h3">{p.name}</h3>
                <p className="body-sm">Part of the confirmed sandwich range. Thickness to be confirmed.</p>
                <span className="chip needs" style={{ alignSelf: 'flex-start' }}>Thickness: needs confirmation</span>
              </div>
            ))}
            <div className="h-card on-dark" style={{ background: 'var(--dark)', color: 'var(--on-dark)', border: '1px solid var(--dark)' }}>
              <span className="meta t-bright">Finishes</span>
              <h3 className="h3">Matched to the system</h3>
              <div className="chips">{sw.finishes.map((f) => <span key={f} className="chip">{f}</span>)}</div>
              <div className="chips">{sw.colours.map((c) => <span key={c} className="chip">{c}</span>)}</div>
            </div>
          </div>
        </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Cleanroom dark list ---------------- */
const CR_PEEKS = [
  V('1748000970909-845f4aa144d2', 600, 760),
  V('1584677123573-7446380b6d69', 600, 760),
  V('1762928289094-197055a5d5c3', 600, 760),
  V('1746021375306-9dec0f637732', 600, 760),
];

function Cleanroom() {
  const cr = CATEGORIES[2];
  const [peek, setPeek] = useState(-1);
  const [canPeek, setCanPeek] = useState(false);
  const peekRef = useRef(null);
  useEffect(() => {
    setCanPeek(
      window.matchMedia('(hover: hover)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);
  const follow = (e) => {
    const el = peekRef.current;
    if (!el) return;
    const pad = 28;
    const w = 250;
    const h = 312;
    let x = e.clientX + pad;
    if (x + w > window.innerWidth - 12) x = e.clientX - w - pad;
    const y = Math.max(12, Math.min(window.innerHeight - h - 12, e.clientY - h / 2));
    el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  };
  return (
    <section className="section dark-sec on-dark" id="cleanroom" onMouseMove={canPeek ? follow : undefined}>
      <div className="wrap">
        <SectionHead index="CR" label="Cleanroom panels" hint="CR series" />
        <Materialize>
          <h2 className="h2" style={{ maxWidth: '18ch', marginBottom: 14 }}>Controlled interiors, flush surfaces.</h2>
          <p className="lede">{cr.description}</p>
        </Materialize>
        <div style={{ height: 32 }} />
        <ClipReveal>
          <figure className="band-ph band-ph-dark">
            <ParallaxImg src={IMG.cleanroom.src} alt={IMG.cleanroom.alt} ratio="21/9" speed={0.12} onError={(e) => { e.currentTarget.closest('.band-ph').style.display = 'none'; }} />
            <figcaption><span className="meta">CR series</span><span>Flush, washable surfaces</span></figcaption>
          </figure>
        </ClipReveal>
        <div style={{ height: 8 }} />
        <div onMouseLeave={() => setPeek(-1)}>
          {cr.items.map((it, i) => (
            <Reveal key={it.code}>
              <Link
                to="/products#cleanroom"
                className="cr-row"
                onMouseEnter={() => setPeek(i)}
                onFocus={() => setPeek(i)}
              >
                <span className="fill" aria-hidden="true" />
                <span className="cr-code">{it.code} / 0{i + 1}</span>
                <span className="cr-name">{it.name}</span>
                <span className="cr-tag chip">Range item</span>
              </Link>
            </Reveal>
          ))}
        </div>
        {canPeek && (
          <div ref={peekRef} className={`cr-peek${peek >= 0 ? ' on' : ''}`} aria-hidden="true">
            {CR_PEEKS.map((src, i) => (
              <img key={i} src={src} alt="" loading="lazy" decoding="async" className={i === peek ? 'on' : ''} />
            ))}
          </div>
        )}
        <Reveal>
          <p className="meta" style={{ marginTop: 26, color: 'var(--on-dark-muted)' }}>
            Classifications, ratings, performance: <span className="chip needs" style={{ marginLeft: 8 }}>Needs confirmation</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Partition composition ---------------- */
function Partition() {
  return (
    <section className="section fit" id="partition">
      <div className="wrap">
        <div className="panel">
          <SectionHead index="PT" label="Partition and wall panels" hint="PT series" />
          <div className="part-grid">
          <ClipReveal>
            <div className="part-photo">
              <ParallaxImg src={IMG.partition.src} alt={IMG.partition.alt} speed={0.08} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="part-overlay">
                <p className="meta t-bright">PT-P / PT-F</p>
                <p style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: '1.3rem', marginTop: 6 }}>Division as architecture</p>
              </div>
            </div>
          </ClipReveal>
          <div>
            <Materialize>
              <h2 className="h2" style={{ marginBottom: 14 }}>Divide space without visual noise.</h2>
              <p className="lede">A partition range, separate from the sandwich system, for finished interior division.</p>
            </Materialize>
            <div className="part-steps" style={{ marginTop: 28 }}>
              <div className="part-step">
                <b>PT-P</b>
                <div><h3 className="h3">Partition Panels</h3><p className="body-sm" style={{ marginTop: 8 }}>Interior division panels with a clean architectural finish.</p></div>
              </div>
              <div className="part-step">
                <b>PT-F</b>
                <div><h3 className="h3">Flush Wall Panels</h3><p className="body-sm" style={{ marginTop: 8 }}>Flat, continuous wall surfaces for professionally finished rooms.</p></div>
              </div>
            </div>
            <Reveal>
              <div style={{ marginTop: 26 }}><Link to="/products#partition" className="link-line">Partition range</Link></div>
            </Reveal>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Profiles image index ---------------- */
/* Verified Unsplash photography, honed to metal and section detail. */
const PROFILE_SHOTS = [
  { code: 'PF-CN', name: 'Corner Profiles', opts: ['Powder coated', 'Non-coated'], ...IMG.profiles.corner },
  { code: 'PF-FM / 3D', name: '3D Profiles', opts: ['Formed geometry'], ...IMG.profiles.formed3d },
  { code: 'PF-FM / 2D', name: '2D Profiles', opts: ['Flat systems'], ...IMG.profiles.formed2d },
  { code: 'PF-TR', name: 'C-Type Bottom Tracks', opts: ['50 mm', '100 mm'], ...IMG.profiles.track },
  { code: 'PF-FM / C', name: 'C-Channel', opts: ['Formed profile'], ...IMG.profiles.channel },
  { code: 'PF-FM / L', name: 'L-Angle', opts: ['Edge profile'], ...IMG.profiles.angle },
  { code: 'PF-FM / B', name: 'Box-Type Profiles', opts: ['Enclosed section'], ...IMG.profiles.box },
  { code: 'PF-AL', name: 'Aluminium-Coated', opts: ['R-70', 'R-90'], ...IMG.profiles.alucoat },
];

function Profiles() {
  const slides = PROFILE_SHOTS.map((c) => ({
    src: c.src,
    alt: c.alt,
    code: c.code,
    title: c.name,
    note: c.opts.join('  Â·  '),
  }));
  return (
    <section className="section fit" id="profiles">
      <div className="wrap">
        <SectionHead index="PF" label="Profiles and accessories" hint="PF series" />
        <Materialize>
          <h2 className="h2" style={{ maxWidth: '20ch', marginBottom: 14 }}>The details that hold the system together.</h2>
          <p className="lede">Corners, channels, angles, tracks and aluminium-coated profiles, specified alongside panels and doors.</p>
        </Materialize>
        <div style={{ height: 36 }} />
        <Reveal>
          <Carousel slides={slides} label="Profile gallery" hint="Drag / scroll" />
        </Reveal>
        <Reveal>
          <div style={{ marginTop: 26 }}><Link to="/products#profiles" className="link-line">Full profiles range</Link></div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Finish lab ---------------- */
function FinishLab() {
  const [active, setActive] = useState(FINISHES[0]);
  const bg = `linear-gradient(160deg, ${active.swatch} 0%, ${active.swatch} 70%, rgba(43,48,54,0.14) 100%)`;
  return (
    <section className="section fit" id="finishes">
      <div className="wrap">
        <SectionHead index="Material" label="Material and finish" hint="Coated surfaces" />
        <div className="lab">
          <ClipReveal>
            <div className="lab-surface" style={{ background: bg }}>
              <div className="sheen" aria-hidden="true" />
              <span className="lab-scale">Scale 1:1, coated steel</span>
              <div className="lab-tag">
                <p className="meta t-bright">Surface preview</p>
                <p style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: '1.7rem', marginTop: 6 }}>{active.name}</p>
                <p className="meta" style={{ marginTop: 6, color: 'var(--on-dark-muted)' }}>{active.note}</p>
              </div>
            </div>
          </ClipReveal>
          <div className="lab-opts">
            <Materialize className="lab-head">
              <h2 className="h2" style={{ marginBottom: 10 }}>Coated, controlled colour.</h2>
              <p className="lede" style={{ marginBottom: 18 }}>Pre-powder and powder-coated surfaces in White, Matt White, or matched to customer requirement.</p>
            </Materialize>
            {FINISHES.map((f) => (
              <button key={f.name} className={`lab-opt${active.name === f.name ? ' active' : ''}`} onClick={() => setActive(f)} aria-pressed={active.name === f.name}>
                <span className="sw" style={{ background: f.swatch }} aria-hidden="true" />
                <span><b>{f.name}</b><small>{f.note}</small></span>
                <span className="opt-state">
                  <span className="radio" aria-hidden="true" />
                  <span className="st">{active.name === f.name ? 'Active' : 'Select'}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Principles + CTA ---------------- */
function Principles() {
  const items = [
    { t: 'One coordinated system', d: 'Doors, panels and profiles are presented as a single family. Openings, walls and junctions read as one surface.' },
    { t: 'Variation without invention', d: 'Sizes, colours and configurations adapt to requirement. Anything unconfirmed is marked plainly.' },
    { t: 'Finish as discipline', d: 'A restrained palette of White, Matt White and matched colour keeps every project visually coherent.' },
  ];
  return (
    <section className="section fit" id="why">
      <div className="wrap">
        <SectionHead index="Workshop" label="Why the system matters" hint="Principles" />
        <Materialize>
          <h2 className="h2" style={{ maxWidth: '20ch', marginBottom: 32 }}>Precision you can see before you measure.</h2>
        </Materialize>
        <Reveal>
          <div className="prin-grid">
            {items.map((p) => (
              <div className="prin" key={p.t}>
                <h3 className="h3" style={{ marginBottom: 10 }}>{p.t}</h3>
                <p className="body-sm">{p.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <div className="cta-band" style={{ marginTop: 40 }}>
            <div
              className="cta-bg"
              style={{
                backgroundImage: `linear-gradient(rgba(43,48,54,0.84), rgba(43,48,54,0.88)), url("${V('1671022442106-c787685d9fed', 1600, 900)}")`,
              }}
              aria-hidden="true"
            />
            <h2 className="h2">Have a requirement?<br />Send the sizes.</h2>
            <p className="body-sm" style={{ color: 'var(--on-dark-muted)', marginTop: 14, maxWidth: '52ch' }}>
              Doors, panels and profiles are manufactured to order. Share your drawings or dimensions and receive a confirmed specification.
            </p>
            <div className="cta-row">
              <Magnetic><Link to="/products" className="btn btn-light">Browse catalogue <ArrowRight className="arr arr-r" /></Link></Magnetic>
              <Magnetic><Link to="/contact" className="btn btn-accent">Enquire now <ArrowUpRight className="arr arr-up" /></Link></Magnetic>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Page ---------------- */
export default function Home() {
  return (
    <div className="page">
      <Flow />
      <Strip />
      <section className="section fit" id="intro">
        <div className="wrap">
          <div className="panel manifesto">
            <SectionHead index="Sheet A" label="Brand introduction" hint="Manufacturing first" />
            <Materialize>
              <p className="manifesto-big">
                <ScrollWords text="AKALKA is a product-focused manufacturer. We make the doors, panels and profiles that shape controlled, finished interiors. That is the whole list." />
              </p>
            </Materialize>
            <div className="manifesto-cols">
              <p className="body-sm"><b style={{ color: 'var(--ink)' }}>Doors &amp; panels.</b> Single and double doors, PUF, rockwool and honeycomb sandwich systems, cleanroom and partition ranges.</p>
              <p className="body-sm"><b style={{ color: 'var(--ink)' }}>Profiles &amp; tracks.</b> Corners, 2D/3D forms, channels, angles, box sections and bottom tracks in 50 and 100 mm.</p>
              <p className="body-sm"><b style={{ color: 'var(--ink)' }}>Only confirmed data.</b> Every thickness, finish and coating on this site is confirmed client data. The rest is marked as needing confirmation.</p>
            </div>
          </div>
        </div>
      </section>
      <DoorsFeature />
      <SandwichBand />
      <Cleanroom />
      <Partition />
      <Profiles />
      <FinishLab />
      <Principles />
    </div>
  );
}
