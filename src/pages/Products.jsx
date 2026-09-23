import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../data/products.js';
import { Reveal, Materialize, ClipReveal, SectionHead, Magnetic, ParallaxImg } from '../components/Reveal.jsx';
import { ArrowRight, ArrowUpRight } from '../components/icons.jsx';
import { IMG } from '../data/images.js';

const CARD_IMG = {
  doors: IMG.doorSingle,
  sandwich: IMG.sandwich,
  cleanroom: IMG.cleanroom,
  partition: IMG.partition,
  profiles: IMG.profiles.track,
};

/* Jump straight to a chapter when the URL carries a hash. */
function useHashJump() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(t);
  }, [hash]);
}

function Chips({ items, accent = false }) {
  return (
    <div className="chips">
      {items.map((t) => <span key={t} className={`chip${accent ? ' chip-accent' : ''}`}>{t}</span>)}
    </div>
  );
}

/* Per-chapter enquiry strip — carries the range into the contact form. */
function ChapterCTA({ interest, blurb }) {
  return (
    <Reveal>
      <div className="chap-cta">
        <p className="body-sm" style={{ margin: 0 }}>{blurb}</p>
        <Link
          to={`/contact?interest=${encodeURIComponent(interest)}`}
          className="link-line"
          style={{ whiteSpace: 'nowrap' }}
        >
          Enquire <ArrowRight style={{ width: 14, height: 14 }} />
        </Link>
      </div>
    </Reveal>
  );
}

/* ---- 01 Doors: configurator table ---- */
function DoorsBlock({ data }) {
  return (
    <section className="section prod-block" id="doors">
      <div className="wrap">
        <SectionHead index={data.index} label={data.name} hint="DR-S / DR-D" />
        <Materialize>
          <h2 className="h2" style={{ marginBottom: 12 }}>Doors, configured to requirement.</h2>
          <p className="lede">{data.description}</p>
        </Materialize>
        <ClipReveal>
          <div className="duo" style={{ marginTop: 32 }}>
            <figure>
              <ParallaxImg src={IMG.doorSingle.src} alt={IMG.doorSingle.alt} ratio="4/3" onError={(e) => { e.currentTarget.closest('figure').style.display = 'none'; }} />
              <figcaption><span className="meta">DR-S</span><span>Single door</span></figcaption>
            </figure>
            <figure>
              <ParallaxImg src={IMG.doorDouble.src} alt={IMG.doorDouble.alt} ratio="4/3" onError={(e) => { e.currentTarget.closest('figure').style.display = 'none'; }} />
              <figcaption><span className="meta">DR-D</span><span>Double door</span></figcaption>
            </figure>
          </div>
        </ClipReveal>
        <div style={{ height: 36 }} />
        <div className="spec-tables">
          <div className="spec-table">
            <p className="meta">Variants</p>
            {data.variants.map((v) => (
              <div className="spec-tr" key={v.code}>
                <span className="meta">{v.code}</span>
                <span><b>{v.name}</b><small>{v.note}</small></span>
              </div>
            ))}
          </div>
          <div className="spec-table">
            <p className="meta">Options</p>
            <div className="spec-tr">
              <span className="meta">Core</span>
              <span>{data.cores.join('  ·  ')}</span>
            </div>
            <div className="spec-tr">
              <span className="meta">Finish</span>
              <span>{data.finishes.join('  ·  ')}</span>
            </div>
            <div className="spec-tr">
              <span className="meta">Colour</span>
              <span>{data.colours.join('  ·  ')}</span>
            </div>
            <div className="spec-tr">
              <span className="meta">Size</span>
              <span>Sizes vary according to requirement — no fixed dimensions published</span>
            </div>
          </div>
        </div>
        <ChapterCTA interest="Doors" blurb="Openings scheduled? Send sizes, cores and finishes for a confirmed door specification." />
      </div>
    </section>
  );
}

/* ---- 02 Sandwich: thickness ledger ---- */
function SandwichBlock({ data }) {
  return (
    <section className="section prod-block" id="sandwich">
      <div className="wrap">
        <div className="panel">
          <SectionHead index={data.index} label={data.name} hint="SW series" />
        <Materialize>
          <h2 className="h2" style={{ marginBottom: 12 }}>Sandwich panels: the thickness ledger.</h2>
          <p className="lede">{data.description} Only the thicknesses below are confirmed. No insulation, fire, thermal or acoustic values are claimed.</p>
        </Materialize>
        <ClipReveal>
          <figure className="band-ph" style={{ marginTop: 32 }}>
            <ParallaxImg src={IMG.sandwich.src} alt={IMG.sandwich.alt} ratio="21/9" speed={0.12} onError={(e) => { e.currentTarget.closest('.band-ph').style.display = 'none'; }} />
            <figcaption><span className="meta">SW series</span><span>50 / 100 mm wall systems</span></figcaption>
          </figure>
        </ClipReveal>
        <div className="spec-matrix" style={{ marginTop: 32 }}>
          <div className="spec-mrow head" aria-hidden="true">
            <span className="meta">Product</span>
            <span className="meta">50 mm</span>
            <span className="meta">100 mm</span>
          </div>
          {data.panels.map((p) => (
            <div className="spec-mrow" key={p.code}>
              <span><b>{p.name}</b><small>{p.code}</small></span>
              {['50 mm', '100 mm'].map((t) => (
                <span key={t}>
                  {p.thicknesses.includes(t) ? (
                    <span className="chip chip-accent">{t}</span>
                  ) : (
                    <span className="meta" style={{ color: 'var(--muted-fg)' }} title="Not confirmed">—</span>
                  )}
                </span>
              ))}
            </div>
          ))}
        </div>
        <Reveal>
          <p className="meta" style={{ marginTop: 18, color: 'var(--muted-fg)' }}>
            — means not confirmed. Only the thicknesses above are confirmed client data.
          </p>
          <div style={{ marginTop: 20 }}>
            <p className="meta" style={{ marginBottom: 12, color: 'var(--muted-fg)' }}>Panel finishes &amp; colours</p>
            <Chips items={[...data.finishes, ...data.colours]} />
          </div>
        </Reveal>
        <ChapterCTA interest="Sandwich Panels" blurb="Panel layouts ready? Send areas, thicknesses and finishes for a confirmed panel schedule." />
        <ChapterCTA interest="Sandwich Panels" blurb="Panel layouts ready? Send areas, thicknesses and finishes for a confirmed panel schedule." />
        </div>
      </div>
    </section>
  );
}

/* ---- 03 Cleanroom: interactive showcase ---- */
function CleanroomBlock({ data }) {
  return (
    <section className="section prod-block dark-sec on-dark" id="cleanroom">
      <div className="wrap">
        <SectionHead index={data.index} label={data.name} hint="CR series" />
        <Materialize>
          <h2 className="h2" style={{ marginBottom: 12 }}>Cleanroom panels: stated as range.</h2>
          <p className="lede">{data.description}</p>
        </Materialize>
        <div style={{ height: 36 }} />
        <div className="spec-list">
          {data.items.map((it, i) => (
            <Reveal key={it.code} delay={Math.min(i * 0.05, 0.15)}>
              <div className="spec-li">
                <span className="meta">{it.code}</span>
                <span className="h3">{it.name}</span>
                <span className="chip">Range item</span>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="chips" style={{ marginTop: 30 }}>
            <span className="chip needs">ISO class: needs confirmation</span>
            <span className="chip needs">GMP: needs confirmation</span>
            <span className="chip needs">Pressure / hygiene ratings: needs confirmation</span>
          </div>
        </Reveal>
        <ChapterCTA interest="Cleanroom Panels" blurb="Controlled environment to fit out? Describe the rooms for a confirmed cleanroom range." />
      </div>
    </section>
  );
}

/* ---- 04 Partition: asymmetric editorial ---- */
function PartitionBlock({ data }) {
  return (
    <section className="section prod-block" id="partition">
      <div className="wrap">
        <SectionHead index={data.index} label={data.name} hint="PT series" />
        <div className="part-grid">
          <Materialize>
            <h2 className="h2" style={{ marginBottom: 12 }}>Partition panels: kept distinct.</h2>
            <p className="lede">{data.description}</p>
            <div style={{ display: 'flex', gap: 16, marginTop: 30, flexWrap: 'wrap' }}>
              {data.items.map((it) => (
                <div key={it.code} className="pt-card">
                  <p className="meta" style={{ color: 'var(--datum)', marginBottom: 10 }}>{it.code}</p>
                  <h3 className="h3">{it.name}</h3>
                </div>
              ))}
            </div>
          </Materialize>
          <ClipReveal delay={0.08}>
            <div className="part-photo" style={{ aspectRatio: '1/1' }}>
              <ParallaxImg src={IMG.partitionAlt.src} alt={IMG.partitionAlt.alt} speed={0.08} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="part-overlay">
                <p className="meta t-bright">Note</p>
                <p style={{ marginTop: 6, fontWeight: 300, fontSize: '0.92rem' }}>Flush wall panels also appear in the cleanroom range. Specify per application on enquiry.</p>
              </div>
            </div>
          </ClipReveal>
        </div>
        <ChapterCTA interest="Partition / Wall Panels" blurb="Interior division to plan? Send layouts for a confirmed partition specification." />
      </div>
    </section>
  );
}

/* ---- 05 Profiles: spec sheet ---- */
function ProfilesBlock({ data }) {
  return (
    <section className="section prod-block" id="profiles">
      <div className="wrap">
        <div className="panel">
          <SectionHead index={data.index} label={data.name} hint="PF series" />
        <Materialize>
          <h2 className="h2" style={{ marginBottom: 12 }}>Profiles &amp; accessories: the spec sheet.</h2>
          <p className="lede">{data.description}</p>
        </Materialize>
        <div style={{ height: 30 }} />
        {data.groups.map((g, i) => (
          <Reveal key={g.code} delay={Math.min(i * 0.05, 0.15)}>
            <div className="spec-row">
              <div className="spec-thumb" aria-hidden="true">
                <ParallaxImg src={IMG.profiles[g.fig].src} alt="" speed={0.05} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div>
                <p className="meta" style={{ color: 'var(--ink)' }}>{g.code}</p>
                <h3 className="h3" style={{ marginTop: 8 }}>{g.name}</h3>
              </div>
              <div className="chips" style={{ alignContent: 'center' }}>
                {g.options.map((o) => (
                  <span key={o} className={`chip${/R-70|R-90|50 mm|100 mm/.test(o) ? ' chip-accent' : ''}`}>{o}</span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
        <Reveal>
          <p className="meta" style={{ marginTop: 28, color: 'var(--muted-fg)' }}>Additional profile dimensions: <span className="chip needs" style={{ marginLeft: 8 }}>Needs confirmation</span></p>
        </Reveal>
        <ChapterCTA interest="Profiles & Accessories" blurb="Junctions, edges and tracks to close out? List the profiles for confirmed options." />
        </div>
      </div>
    </section>
  );
}

export default function Products() {
  useHashJump();
  return (
    <div className="page">
      <section className="prod-hero">
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <p className="meta" style={{ color: 'var(--datum)', marginBottom: 18 }}>AKALKA catalogue</p>
          <h1 className="display">
            <span className="mask"><span>Five systems.</span></span>
            <span className="mask"><span style={{ animationDelay: '0.12s' }}>One language.</span></span>
          </h1>
          <p className="lede" style={{ color: 'var(--on-dark-muted)', marginTop: 22, maxWidth: '56ch' }}>
            Everything AKALKA manufactures, organised so you can find your
            range in seconds. Pick a category — each chapter below shows
            exactly what is confirmed, and marks what is not.
          </p>
          <div className="cat-cards">
            {CATEGORIES.map((c, i) => {
              const img = CARD_IMG[c.id];
              return (
                <a key={c.id} href={`#${c.id}`} className="cat-card" style={{ animationDelay: `${0.08 * i + 0.2}s` }}>
                  <span className="cat-card-ph">
                    <img src={img.src} alt="" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
                  </span>
                  <span className="cat-card-body">
                    <span className="meta">{c.index} / 05</span>
                    <span className="cat-card-name">{c.name}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>
      <DoorsBlock data={CATEGORIES[0]} />
      <SandwichBlock data={CATEGORIES[1]} />
      <CleanroomBlock data={CATEGORIES[2]} />
      <PartitionBlock data={CATEGORIES[3]} />
      <ProfilesBlock data={CATEGORIES[4]} />
      <section className="section">
        <div className="wrap">
          <Reveal>
            <div className="cta-band">
              <h2 className="h2">Found your configuration?<br />Confirm it with us.</h2>
              <p className="body-sm" style={{ color: 'var(--on-dark-muted)', marginTop: 14 }}>Specifications on request.</p>
              <div className="cta-row">
                <Magnetic><Link to="/contact" className="btn btn-light">Start an enquiry <ArrowRight className="arr arr-r" /></Link></Magnetic>
                <Magnetic><Link to="/about" className="btn btn-accent">About AKALKA <ArrowUpRight className="arr arr-up" /></Link></Magnetic>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
