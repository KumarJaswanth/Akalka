import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../data/products.js';
import { Reveal, Materialize, ClipReveal, SectionHead, Magnetic, ParallaxImg } from '../components/Reveal.jsx';
import { ArrowRight, ArrowUpRight, Plus } from '../components/icons.jsx';
import CleanroomShowcase from '../components/CleanroomShowcase.jsx';
import { IMG } from '../data/images.js';

const SUB = CATEGORIES.map((c) => ({ id: c.id, label: `${c.index} / ${c.name}` }));

function useHash() {
  const { hash } = useLocation();
  const [h, setH] = useState(hash);
  useEffect(() => {
    setH(hash);
    if (hash) {
      const t = setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0 });
  }, [hash]);
  return h;
}

function Chips({ items, accent = false }) {
  return (
    <div className="chips">
      {items.map((t) => <span key={t} className={`chip${accent ? ' chip-accent' : ''}`}>{t}</span>)}
    </div>
  );
}

function Spec({ title, children, open = false }) {
  return (
    <details className="spec" open={open}>
      <summary>{title}<span className="plus"><Plus /></span></summary>
      <div className="spec-body">{children}</div>
    </details>
  );
}

/* ---- 01 Doors: configurator table ---- */
function DoorsBlock({ data }) {
  return (
    <section className="section prod-block" id="doors">
      <div className="wrap">
        <SectionHead index={data.index} label={data.name} hint="DR-S / DR-D" />
        <div className="split">
          <div className="split-cell">
            <Materialize>
              <h2 className="h2" style={{ marginBottom: 12 }}>{data.name}: configured to requirement.</h2>
              <p className="lede">{data.description}</p>
            </Materialize>
            <div style={{ display: 'grid', gap: '4px', marginTop: 28 }}>
              {data.variants.map((v, i) => (
                <Reveal key={v.code} delay={i * 0.05}>
                  <div className="part-step plain" style={{ gridTemplateColumns: '90px 1fr' }}>
                    <b>{v.code}</b>
                    <div>
                      <h3 className="h3">{v.name}</h3>
                      <p className="body-sm" style={{ marginTop: 6 }}>{v.note}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <Spec title="Cores, finishes & colours" open>
                <p style={{ marginBottom: 12 }}><b>Core options</b></p>
                <Chips items={data.cores} accent />
                <p style={{ margin: '16px 0 12px' }}><b>Finishes</b></p>
                <Chips items={data.finishes} />
                <p style={{ margin: '16px 0 12px' }}><b>Colours</b></p>
                <Chips items={data.colours} />
              </Spec>
              <Spec title="Sizing">
                <p>{data.sizingNote} No fixed dimensions are published. Share drawings or opening sizes via the enquiry form.</p>
              </Spec>
            </Reveal>
          </div>
          <div className="split-cell dark on-dark" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
            <p className="meta t-bright">Configuration summary</p>
            <div className="h-card on-dark" style={{ background: 'transparent', color: 'var(--on-dark)' }}>
              <span className="meta t-bright">DR-S</span>
              <h3 className="h3">Single door</h3>
              <Chips items={['Honeycomb / Rockwool', 'Pre-powder / Powder', 'Size: requirement']} />
            </div>
            <div className="h-card on-dark" style={{ background: 'rgba(125,178,0,0.16)', color: 'var(--on-dark)' }}>
              <span className="meta t-bright">DR-D</span>
              <h3 className="h3">Double door</h3>
              <Chips items={['Honeycomb / Rockwool', 'White / Matt White / Custom']} />
            </div>
          </div>
        </div>
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
        <div className="h-scroll" style={{ marginTop: 32 }}>
          {data.panels.map((p, i) => (
            <Reveal key={p.code} delay={Math.min(i * 0.05, 0.15)}>
              <div className="h-card">
                <span className="meta" style={{ color: 'var(--ink)' }}>{p.code}</span>
                <h3 className="h3">{p.name}</h3>
                {p.thicknesses.length > 0 ? (
                  <div className="chips">{p.thicknesses.map((t) => <span key={t} className="chip chip-accent">{t}</span>)}</div>
                ) : (
                  <span className="chip needs" style={{ alignSelf: 'flex-start' }}>Thickness: needs confirmation</span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div style={{ marginTop: 20 }}>
            <p className="meta" style={{ marginBottom: 12, color: 'var(--muted-fg)' }}>Panel finishes &amp; colours</p>
            <Chips items={[...data.finishes, ...data.colours]} />
          </div>
        </Reveal>
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
        <Reveal>
          <CleanroomShowcase items={data.items} />
        </Reveal>
        <Reveal>
          <div className="chips" style={{ marginTop: 30 }}>
            <span className="chip needs">ISO class: needs confirmation</span>
            <span className="chip needs">GMP: needs confirmation</span>
            <span className="chip needs">Pressure / hygiene ratings: needs confirmation</span>
          </div>
        </Reveal>
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
            <div style={{ display: 'flex', gap: 18, marginTop: 30, flexWrap: 'wrap' }}>
              {data.items.map((it) => (
                <div key={it.code} style={{ flex: '1 1 200px', border: '1px solid var(--line-strong)', borderRadius: 0, padding: 26, background: 'var(--card)' }}>
                  <p className="meta" style={{ color: 'var(--ink)', marginBottom: 10 }}>{it.code}</p>
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
          <p className="meta" style={{ marginTop: 24, color: 'var(--muted-fg)' }}>Additional profile dimensions: <span className="chip needs" style={{ marginLeft: 8 }}>Needs confirmation</span></p>
        </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function Products() {
  const hash = useHash();
  return (
    <div className="page">
      <section className="prod-hero">
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="display">
            <span className="mask"><span>The product</span></span>
            <span className="mask"><span style={{ animationDelay: '0.12s' }}>catalogue.</span></span>
          </h1>
          <p className="lede" style={{ color: 'var(--on-dark-muted)', marginTop: 22 }}>
            Five distinct ranges, five distinct layouts. Everything below is confirmed
            client data. Gaps are marked, not filled.
          </p>
          <div className="cta-row">
            <Magnetic><Link to="/contact" className="btn btn-light">Enquire with drawings <ArrowUpRight className="arr arr-up" /></Link></Magnetic>
          </div>
        </div>
      </section>
      <div className="sticky-sub">
        <nav aria-label="Product categories">
          {SUB.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={hash === `#${s.id}` ? 'active' : ''}>{s.label}</a>
          ))}
        </nav>
      </div>
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
