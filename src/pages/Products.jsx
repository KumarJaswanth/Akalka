import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../data/products.js';
import { Reveal, Materialize, ClipReveal, SectionHead, Magnetic, ParallaxImg } from '../components/Reveal.jsx';
import { ArrowRight, ArrowUpRight, Plus } from '../components/icons.jsx';
import { IMG, PHOTO, PROFILE_PHOTO, srcSetFor } from '../data/images.js';
import { Process } from '../components/Scenes.jsx';
import NeedsChip from '../components/NeedsChip.jsx';
import Term from '../components/Term.jsx';

const CARD_IMG = {
  doors: IMG.doorSingle,
  sandwich: PHOTO.panelWall,
  cleanroom: PHOTO.cleanroomTech,
  partition: PHOTO.whiteHall,
  glass: PHOTO.cleanroomWindow,
  profiles: PHOTO.measure,
};
const CODE = { doors: 'DR', sandwich: 'SW', cleanroom: 'CR', partition: 'PT', glass: 'GL', profiles: 'PF' };

/* Floating chapter dock. Six long chapters are easy to get lost in, so a
   quiet pill bar follows the visitor through the catalogue, names where
   they are, and jumps anywhere in one tap. It only appears while the
   chapters themselves are on screen. */
function ChapterDock() {
  const [active, setActive] = useState(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const els = CATEGORIES.map((c) => document.getElementById(c.id)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      const first = els[0].getBoundingClientRect().top;
      const last = els[els.length - 1].getBoundingClientRect().bottom;
      setShow(first < window.innerHeight * 0.5 && last > window.innerHeight * 0.5);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  useEffect(() => {
    if (!active) return;
    const btn = document.querySelector(`.dock a[data-id="${active}"]`);
    if (btn && btn.parentElement) {
      const bar = btn.parentElement;
      bar.scrollTo({ left: btn.offsetLeft - bar.clientWidth / 2 + btn.offsetWidth / 2, behavior: 'smooth' });
    }
  }, [active]);
  const jump = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -90, duration: 1.2 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <nav className={`dock${show ? ' show' : ''}`} aria-label="Catalogue chapters" aria-hidden={!show}>
      <div className="dock-in">
        {CATEGORIES.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            data-id={c.id}
            className={active === c.id ? 'on' : ''}
            aria-current={active === c.id ? 'true' : undefined}
            tabIndex={show ? 0 : -1}
            onClick={(e) => jump(e, c.id)}
          >
            <b>{CODE[c.id]}</b>
            <span>{c.name}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

/* The category index is the first categorical impression of the catalogue,
   so its grid may never strand a card. auto-fit alone is not enough — at
   1232px it fits five 210px columns and left the 6th alone. Pick the column
   count from the item count instead, preferring a divisor so the last row
   is always full. 3 columns for 6, 2 for 4 or 8, 4 for 5, and so on. */
const CAT_COLS = (() => {
  const n = CATEGORIES.length;
  return [4, 3, 2].find((c) => n % c === 0) ?? Math.min(3, n);
})();
const TOTAL = CATEGORIES.length;
const TOTAL_LABEL = String(TOTAL).padStart(2, '0');
const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const TOTAL_WORD = WORDS[TOTAL] ?? String(TOTAL);

/* The card meta carries position only — "01 / 06". An earlier version read
   "01 / 06 · 6 types": three numerals, two separators and a noun that
   changed per category (types/products/groups/product), which asked the
   visitor to decode the index instead of using it. The contents are one
   click away; the card's job is orientation, not inventory. */

/* Coating option codes. Their exact specification is confirmed on enquiry —
   the catalogue states the choice, never the value. */
const COATING_DEF = 'Coating option code in this catalogue — its exact specification is confirmed on enquiry';

/* Plain-function descriptors drawn only from confirmed option names. */
const GROUP_NOTE = {
  corner: 'Edges and corners — powder-coated or non-coated.',
  formed3d: '2D and 3D forms, channels, angles and box sections.',
  alucoat: (
    <>Aluminium-coated options in <Term def={COATING_DEF}>R-70</Term> and <Term def={COATING_DEF}>R-90</Term>.</>
  ),
  track: 'Floor tracks in 50 and 100 mm, coated or non-coated.',
};

/* Jump straight to a chapter when the URL carries a hash —
   routed through Lenis so the flight is as smooth as the site. */
function useHashJump() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => {
      const el = document.querySelector(hash);
      if (!el) return;
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -90, duration: 1.4 });
      else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
function ChapterCTA({ interest, blurb, checklist }) {
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
      {checklist && checklist.length > 0 && (
        <details className="spec">
          <summary>
            What to include in your enquiry
            <span className="plus" aria-hidden="true"><Plus /></span>
          </summary>
          <div className="spec-body">
            <ul style={{ margin: 0, paddingLeft: 'var(--s5)', display: 'grid', gap: 'var(--s2)' }}>
              {checklist.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </details>
      )}
    </Reveal>
  );
}

/* ---- 01 Doors: configurator table ---- */
function DoorsBlock({ data }) {
  return (
    <section className="section prod-block" id="doors">
      <div className="wrap">
        <SectionHead index={data.index} label={data.name} hint="DR series" />
        <Materialize>
          <h2 className="h2" style={{ marginBottom: 'var(--s3)' }}>Doors, <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>configured to requirement.</span></h2>
          <p className="lede">{data.description}</p>
        </Materialize>
        <ClipReveal>
          <div className="duo" style={{ marginTop: 'var(--s8)' }}>
            <figure>
              <ParallaxImg src={IMG.doorSingle.src} alt={IMG.doorSingle.alt} ratio="4/3" onError={(e) => { e.currentTarget.closest('figure').style.display = 'none'; }} />
              <figcaption><span className="meta">DR-S</span><span>Regular modular — single door</span></figcaption>
            </figure>
            <figure>
              <ParallaxImg src={IMG.doorDouble.src} alt={IMG.doorDouble.alt} ratio="4/3" onError={(e) => { e.currentTarget.closest('figure').style.display = 'none'; }} />
              <figcaption><span className="meta">DR-D</span><span>Regular modular — double door</span></figcaption>
            </figure>
          </div>
        </ClipReveal>
        <div aria-hidden="true" style={{ height: 'var(--s9)' }} />
        <Reveal>
          <p className="meta" style={{ color: 'var(--muted-fg)', marginBottom: 'var(--s5)' }}>Fire rated &amp; emergency types</p>
          <div className="duo">
            <figure>
              <ParallaxImg src={IMG.doorFireDouble.src} alt={IMG.doorFireDouble.alt} ratio="4/3" onError={(e) => { e.currentTarget.closest('figure').style.display = 'none'; }} />
              <figcaption><span className="meta">DR-FS / DR-FD</span><span>Fire rated — single and double</span></figcaption>
            </figure>
            <figure>
              <ParallaxImg src={IMG.doorEmergency.src} alt={IMG.doorEmergency.alt} ratio="4/3" onError={(e) => { e.currentTarget.closest('figure').style.display = 'none'; }} />
              <figcaption><span className="meta">DR-ES / DR-ED</span><span>Emergency — single and double</span></figcaption>
            </figure>
          </div>
        </Reveal>
        <div aria-hidden="true" style={{ height: 'var(--s9)' }} />
        <Reveal>
          <p className="meta" style={{ color: 'var(--muted-fg)', marginBottom: 'var(--s5)' }}>Specify a door in four steps</p>
          <div className="steps">
            {[
              { n: '01', t: 'Type', d: data.types.join('  ·  ') },
              { n: '02', t: 'Configuration', d: 'Single  ·  Double' },
              { n: '03', t: 'Core & finish', d: `${data.cores.join('  ·  ')} — ${data.finishes.join('  ·  ')}` },
              { n: '04', t: 'Colour & size', d: `${data.colours.join('  ·  ')} — sizes vary` },
            ].map((s) => (
              <div className="step-card" key={s.n}>
                <span className="meta">{s.n}</span>
                <h3 className="h3">{s.t}</h3>
                <p className="body-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <div aria-hidden="true" style={{ height: 'var(--s8)' }} />
        <div className="spec-tables">
          <div className="spec-table">
            <p className="meta">Variants — {data.variants.length}</p>
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
              <span className="meta">Type</span>
              <span>{data.types.join('  ·  ')}</span>
            </div>
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
        <Reveal>
          <div className="chips" style={{ marginTop: 'var(--s5)' }}>
            <NeedsChip term="fire rating duration for DR-FS and DR-FD" interest="Doors">Fire rating duration: needs confirmation</NeedsChip>
            <NeedsChip term="panic bar and push hardware for DR-ES and DR-ED" interest="Doors">Emergency exit hardware: needs confirmation</NeedsChip>
          </div>
        </Reveal>
        <ChapterCTA interest="Doors" blurb="Openings scheduled? Send type, sizes, cores and finishes for a confirmed door specification." checklist={['Opening sizes or a door schedule', 'Single or double, and which type', 'Core and finish', 'Quantities and site location']} />
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
          <h2 className="h2" style={{ marginBottom: 'var(--s3)' }}>Sandwich panels: <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>the thickness ledger.</span></h2>
          <p className="lede">{data.description} Only the thicknesses below are confirmed. No insulation, fire, thermal or acoustic values are claimed.</p>
        </Materialize>
        <Reveal>
                      <p className="meta" style={{ color: 'var(--muted-fg)', margin: 'var(--s8) 0 var(--s5)' }}>Three core families in the range</p>
          <div className="steps">
            {[
              { n: 'PUF', t: (<><Term def="Polyurethane foam — a rigid insulation core">PUF</Term> panels</>), d: 'Double-skin wall panels in 50 and 100 mm.' },
              { n: 'RW', t: 'Rockwool panels', d: 'Double-skin wall panels in 50 and 100 mm, plus sandwich types.' },
              { n: 'HC', t: 'Honeycomb panels', d: 'Honeycomb sandwich panels and honeycomb door cores.' },
            ].map((s) => (
              <div className="step-card" key={s.n}>
                <span className="meta">{s.n}</span>
                <h3 className="h3">{s.t}</h3>
                <p className="body-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <ClipReveal>
          <figure className="band-ph" style={{ marginTop: 'var(--s8)' }}>
            <ParallaxImg src={PHOTO.panelWall.src} alt={PHOTO.panelWall.alt} ratio="21/9" speed={0.12} onError={(e) => { e.currentTarget.closest('.band-ph').style.display = 'none'; }} />
            <figcaption><span className="meta">SW series</span><span>50 / 100 mm wall systems</span></figcaption>
          </figure>
        </ClipReveal>
        <div className="spec-matrix" style={{ marginTop: 'var(--s8)' }}>
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
          <p className="meta" style={{ marginTop: 'var(--s5)', color: 'var(--muted-fg)' }}>
            — means not confirmed. Only the thicknesses above are confirmed client data.
          </p>
          <div style={{ marginTop: 'var(--s5)' }}>
            <p className="meta" style={{ marginBottom: 'var(--s3)', color: 'var(--muted-fg)' }}>Panel finishes &amp; colours</p>
            <Chips items={[...data.finishes, ...data.colours]} />
          </div>
        </Reveal>
        <ChapterCTA interest="Sandwich Panels" blurb="Panel layouts ready? Send areas, thicknesses and finishes for a confirmed panel schedule." checklist={['Areas and thicknesses (50 / 100 mm)', 'Panel types in the schedule', 'Finishes and colours', 'Quantities and site location']} />
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
          <h2 className="h2" style={{ marginBottom: 'var(--s3)' }}>Cleanroom panels: <span className="font-hand" style={{ color: 'var(--datum)' }}>stated as range.</span></h2>
          <p className="lede">{data.description}</p>
        </Materialize>
        <ClipReveal>
          <figure className="band-ph" style={{ marginTop: 'var(--s8)' }}>
            <ParallaxImg src={PHOTO.cleanroomLab.src} alt={PHOTO.cleanroomLab.alt} ratio="21/9" speed={0.12} onError={(e) => { e.currentTarget.closest('.band-ph').style.display = 'none'; }} />
            <figcaption><span className="meta">CR series</span><span>Flush, washable surfaces for controlled rooms</span></figcaption>
          </figure>
        </ClipReveal>
        <div aria-hidden="true" style={{ height: 'var(--s9)' }} />
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
          <div className="chips" style={{ marginTop: 'var(--s8)' }}>
            <NeedsChip term="cleanroom ISO classification" interest="Cleanroom Panels">ISO class: needs confirmation</NeedsChip>
            <NeedsChip term="GMP compliance for cleanroom panels" interest="Cleanroom Panels">GMP: needs confirmation</NeedsChip>
            <NeedsChip term="pressure differential and hygiene ratings" interest="Cleanroom Panels">Pressure / hygiene ratings: needs confirmation</NeedsChip>
          </div>
          <p className="meta" style={{ marginTop: 'var(--s4)', color: 'var(--muted-fg)' }}>
            <Term def="ISO 14644 cleanroom classification — the airborne-particle standard your room must meet">ISO class</Term>
            {' · '}
            <Term def="Good Manufacturing Practice — the pharmaceutical production standard">GMP</Term>
          </p>
        </Reveal>
        <Reveal>
          <div className="note-card">
            <p className="meta" style={{ color: 'var(--datum-ink)', marginBottom: 'var(--s2)' }}>Shared product</p>
            <p className="body-sm" style={{ margin: 0 }}>
              Flush Wall Panels appear here and under Partition / Wall Panels — the same
              confirmed product, specified per application on enquiry.
            </p>
          </div>
        </Reveal>
        <ChapterCTA interest="Cleanroom Panels" blurb="Controlled environment to fit out? Describe the rooms for a confirmed cleanroom range." checklist={['Room layouts and dimensions', 'Which surfaces: wall, ceiling, flush', 'Target classification, if known', 'Quantities and site location']} />
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
            <h2 className="h2" style={{ marginBottom: 'var(--s3)' }}>Partition panels: <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>kept distinct.</span></h2>
            <p className="lede">{data.description}</p>
            <div style={{ display: 'flex', gap: 'var(--s4)', marginTop: 'var(--s8)', flexWrap: 'wrap' }}>
              {data.items.map((it) => (
                <div key={it.code} className="pt-card">
                  <p className="meta" style={{ color: 'var(--datum-ink)', marginBottom: 'var(--s3)' }}>{it.code}</p>
                  <h3 className="h3">{it.name}</h3>
                  <p className="body-sm" style={{ marginTop: 'var(--s2)' }}>{it.note}</p>
                  {it.code === 'PT-RP' && (
                    <p className="meta" style={{ marginTop: 'var(--s3)', color: 'var(--muted-fg)' }}>
                      <Term def="Angled slats that ventilate a shaft while screening the opening">Grill</Term>
                    </p>
                  )}
                  {it.code === 'PT-F' && (
                    <div className="chips" style={{ marginTop: 'var(--s3)' }}>
                      <span className="chip">Also in cleanroom range</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Materialize>
          <ClipReveal delay={0.08}>
            <div className="part-photo" style={{ aspectRatio: '1/1' }}>
              <ParallaxImg src={PHOTO.whiteHall.src} alt={PHOTO.whiteHall.alt} speed={0.08} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="part-overlay">
                <p className="meta t-bright">Note</p>
                <p style={{ marginTop: 'var(--s2)', fontWeight: 400, fontSize: '0.92rem' }}>Flush wall panels also appear in the cleanroom range. Specify per application on enquiry.</p>
              </div>
            </div>
          </ClipReveal>
        </div>
        <div aria-hidden="true" style={{ height: 'var(--s8)' }} />
        <ClipReveal delay={0.04}>
          <figure className="band-ph">
            <ParallaxImg src={IMG.riserPanel.src} alt={IMG.riserPanel.alt} ratio="16/9" speed={0.12} onError={(e) => { e.currentTarget.closest('.band-ph').style.display = 'none'; }} />
            <figcaption><span className="meta">PT-RP</span><span>Riser panel with grill for service shafts</span></figcaption>
          </figure>
        </ClipReveal>
        <ChapterCTA interest="Partition / Wall Panels" blurb="Interior division to plan? Send layouts for a confirmed partition specification." checklist={['Layouts to divide', 'Partition, flush or riser panels', 'Quantities and site location']} />
      </div>
    </section>
  );
}

/* ---- 05 Glass: view panel ---- */
function GlassBlock({ data }) {
  return (
    <section className="section prod-block" id="glass">
      <div className="wrap">
        <SectionHead index={data.index} label={data.name} hint="GL series" />
        <div className="part-grid">
          <Materialize>
            <h2 className="h2" style={{ marginBottom: 'var(--s3)' }}>View glass: <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>sightline, framed.</span></h2>
            <p className="lede">{data.description}</p>
            <div style={{ marginTop: 'var(--s8)' }}>
              {data.items.map((it) => (
                <div key={it.code} className="pt-card" style={{ maxWidth: 420 }}>
                  <p className="meta" style={{ color: 'var(--datum-ink)', marginBottom: 'var(--s3)' }}>{it.code}</p>
                  <h3 className="h3">{it.name}</h3>
                  <p className="body-sm" style={{ marginTop: 'var(--s2)' }}>{it.note}</p>
                </div>
              ))}
              <div className="chips" style={{ marginTop: 'var(--s6)' }}>
                {data.options.map((o) => <span key={o} className="chip chip-accent">{o}</span>)}
                <NeedsChip term="view glass panel glazing thickness, make and fire rating" interest="Glass Panels">{data.note}</NeedsChip>
              </div>
            </div>
          </Materialize>
          <ClipReveal delay={0.08}>
            <div className="part-photo" style={{ aspectRatio: '1/1' }}>
              <ParallaxImg src={PHOTO.cleanroomWindow.src} alt={PHOTO.cleanroomWindow.alt} speed={0.08} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="part-overlay">
                <p className="meta t-bright">GL-VG</p>
                <p style={{ marginTop: 'var(--s2)', fontWeight: 400, fontSize: '0.92rem' }}>View glass panels suit doors and glazed openings where a solid leaf would close the sightline.</p>
              </div>
            </div>
          </ClipReveal>
        </div>
        <ChapterCTA interest="Glass Panels" blurb="Vision openings to plan? Confirm opening sizes for a view glass specification." checklist={['Opening sizes', 'Single or double glazing', 'Quantities and site location']} />
      </div>
    </section>
  );
}

/* ---- 06 Profiles: spec sheet ---- */
function ProfilesBlock({ data }) {
  return (
    <section className="section prod-block" id="profiles">
      <div className="wrap">
        <div className="panel">
          <SectionHead index={data.index} label={data.name} hint="PF series" />
        <Materialize>
          <h2 className="h2" style={{ marginBottom: 'var(--s3)' }}>Profiles &amp; accessories: <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>the spec sheet.</span></h2>
          <p className="lede">{data.description}</p>
        </Materialize>
        <div aria-hidden="true" style={{ height: 'var(--s8)' }} />
        {data.groups.map((g, i) => (
          <Reveal key={g.code} delay={Math.min(i * 0.05, 0.15)}>
            <div className="spec-row">
              <div className="spec-thumb" aria-hidden="true">
                <ParallaxImg src={PROFILE_PHOTO[g.fig].src} alt="" speed={0.05} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div>
                <p className="meta" style={{ color: 'var(--ink)' }}>{g.code}</p>
                <h3 className="h3" style={{ marginTop: 'var(--s2)' }}>{g.name}</h3>
                <p className="body-sm" style={{ marginTop: 'var(--s2)' }}>{GROUP_NOTE[g.fig]}</p>
              </div>
              <div className="chips" style={{ alignContent: 'center' }}>
                {g.options.map((o) => (
                  /R-70|R-90/.test(o)
                    ? <span key={o} className="chip chip-accent"><Term def={COATING_DEF}>{o}</Term></span>
                    : <span key={o} className={`chip${/50 mm|100 mm/.test(o) ? ' chip-accent' : ''}`}>{o}</span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
        <Reveal>
          <p className="meta" style={{ marginTop: 'var(--s7)', color: 'var(--muted-fg)' }}>Additional profile dimensions:{' '}
            <NeedsChip term="available profile dimensions beyond 50 mm and 100 mm" interest={'Profiles & Accessories'} style={{ marginLeft: 'var(--s2)' }}>Needs confirmation</NeedsChip>
          </p>
        </Reveal>
        <ChapterCTA interest="Profiles & Accessories" blurb="Junctions, edges and tracks to close out? List the profiles for confirmed options." checklist={['Profile types and lengths', 'Coated, non-coated or aluminium-coated', 'Quantities and site location']} />
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
          <p className="meta" style={{ color: 'var(--datum)', marginBottom: 'var(--s5)' }}>AKALKA catalogue</p>
          <h1 className="display">
            <span className="mask"><span>{TOTAL_WORD} systems.</span></span>
            <span className="mask"><span style={{ animationDelay: '0.12s' }}><span className="font-hand" style={{ color: 'var(--datum)' }}>One language.</span></span></span>
          </h1>
          <p className="lede" style={{ color: 'var(--on-dark-muted)', marginTop: 'var(--s6)', maxWidth: '56ch' }}>
            {TOTAL_WORD} ranges, one catalogue. Pick a category — everything listed
            is confirmed data.
          </p>
          <div className="cat-cards" style={{ '--cat-cols': CAT_COLS }}>
            {CATEGORIES.map((c, i) => {
              const img = CARD_IMG[c.id];
              return (
                <a key={c.id} href={`#${c.id}`} className="cat-card" style={{ animationDelay: `${0.08 * i + 0.2}s` }}>
                  <span className="cat-card-ph">
                    <img src={img.src} srcSet={srcSetFor(img.src)} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw" alt="" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
                  </span>
                  <span className="cat-card-body">
                    <span className="meta">{c.index} / {TOTAL_LABEL}</span>
                    <span className="cat-card-name">{c.name}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>
      <ChapterDock />
      <DoorsBlock data={CATEGORIES.find((c) => c.id === 'doors')} />
      <SandwichBlock data={CATEGORIES.find((c) => c.id === 'sandwich')} />
      <CleanroomBlock data={CATEGORIES.find((c) => c.id === 'cleanroom')} />
      <PartitionBlock data={CATEGORIES.find((c) => c.id === 'partition')} />
      <GlassBlock data={CATEGORIES.find((c) => c.id === 'glass')} />
      <ProfilesBlock data={CATEGORIES.find((c) => c.id === 'profiles')} />
      <section className="section">
        <div className="wrap">
          <SectionHead index="How" label="How an order works" hint="4 steps" />
          <Materialize>
            <h2 className="h2" style={{ maxWidth: '20ch', marginBottom: 'var(--s9)' }}>From chapter to <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>confirmed specification.</span></h2>
          </Materialize>
          <Process />
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal>
            <div className="cta-band">
              <h2 className="h2">Found your configuration?<br /><span className="font-hand" style={{ color: 'var(--datum)' }}>Confirm it with us.</span></h2>
              <p className="body-sm" style={{ color: 'var(--on-dark-muted)', marginTop: 'var(--s4)' }}>Specifications on request.</p>
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
