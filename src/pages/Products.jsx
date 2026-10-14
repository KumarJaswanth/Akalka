import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES, CAT, TOTAL, TOTAL_LABEL, word } from '../data/products.js';
import { Reveal, Materialize, ClipReveal, Magnetic, ParallaxImg } from '../components/Reveal.jsx';
import { ArrowRight, ArrowUpRight } from '../components/icons.jsx';
import { IMG, PHOTO, PROFILE_PHOTO, srcSetFor } from '../data/images.js';
import NeedsChip from '../components/NeedsChip.jsx';
import Term from '../components/Term.jsx';
import Landscape from '../components/Landscape.jsx';

/* One photograph per category for the opening index. */
const CARD_IMG = {
  doors: IMG.doorSingle,
  sandwich: PHOTO.panelWall,
  cleanroom: PHOTO.cleanroomTech,
  partition: PHOTO.whiteHall,
  glass: PHOTO.cleanroomWindow,
  profiles: PHOTO.measure,
};

/* The door variant for a type and number of leaves, with its number. */
const doorV = (typeId, leaves) => CAT.doors.variants.find((v) => v.typeId === typeId && v.leaves === leaves);

/* Hide a figure whose photograph failed to load, rather than show a hole. */
const hideFigure = (sel) => (e) => {
  const el = sel ? e.currentTarget.closest(sel) : e.currentTarget;
  if (el) el.style.display = 'none';
};

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
            <b>{c.index}</b>
            <span>{c.name}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

const TOTAL_WORD = word(TOTAL);

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

/* Per-chapter enquiry strip — what to include, and the way into the form. */
function ChapterCTA({ interest, checklist }) {
  return (
    <div className="chap-cta">
      <div>
        <p className="meta" style={{ color: 'var(--muted-fg)', marginBottom: 'var(--s2)' }}>Include in your enquiry</p>
        <p className="body-sm" style={{ margin: 0 }}>{checklist.join('  ·  ')}</p>
      </div>
      <Link
        to={`/contact?interest=${encodeURIComponent(interest)}`}
        className="link-line"
        style={{ whiteSpace: 'nowrap' }}
      >
        Enquire <ArrowRight style={{ width: 14, height: 14 }} />
      </Link>
    </div>
  );
}

/* One chapter of the catalogue. Every chapter has the same frame: a column
   that stays put on the left — the catalogue number, the name, the heading,
   the description and the way to enquire — beside the evidence on the right
   (photographs, tables, options) as it scrolls past. The visitor always knows
   which chapter they are in and can always act on it. */
function Chapter({ data, hint, title, hand, interest, checklist, dark = false, children }) {
  return (
    <section className={`pc${dark ? ' dark-sec on-dark' : ''}`} id={data.id}>
      <div className="wrap pc-grid">
        <aside className="pc-side">
          <p className="pc-no" aria-hidden="true">{data.index}</p>
          <p className="meta pc-label"><span>{data.name}</span><span>{hint}</span></p>
          <Materialize>
            <h2 className="h2">
              {title} <span className="font-hand" style={{ color: dark ? 'var(--datum)' : 'var(--datum-ink)' }}>{hand}</span>
            </h2>
            <p className="lede">{data.description}</p>
          </Materialize>
          <Reveal>
            <ChapterCTA interest={interest} checklist={checklist} />
          </Reveal>
        </aside>
        <div className="pc-main">{children}</div>
      </div>
    </section>
  );
}

/* ---- 01 Doors ---- */
function DoorsBlock({ data }) {
  const fig = (img, no, text, delay) => (
    <figure>
      <ParallaxImg src={img.src} alt={img.alt} ratio="4/3" onError={hideFigure('figure')} />
      <figcaption><span className="meta">{no}</span><span>{text}</span></figcaption>
    </figure>
  );
  return (
    <Chapter
      data={data}
      hint={`${data.variants.length} variants`}
      title="Doors,"
      hand="configured to requirement."
      interest="Doors"
      checklist={['Opening sizes or a door schedule', 'Single or double, and which type', 'Core and finish', 'Quantities and site location']}
    >
      <ClipReveal>
        <div className="duo">
          {fig(IMG.doorSingle, doorV('regular', 'Single').no, 'Regular modular — single door')}
          {fig(IMG.doorDouble, doorV('regular', 'Double').no, 'Regular modular — double door')}
        </div>
      </ClipReveal>
      <Reveal>
        <p className="meta pc-cap">Fire rated &amp; emergency types</p>
        <div className="duo">
          {fig(IMG.doorFireDouble, `${doorV('fire', 'Single').no} / ${doorV('fire', 'Double').no}`, 'Fire rated — single and double')}
          {fig(IMG.doorEmergency, `${doorV('emergency', 'Single').no} / ${doorV('emergency', 'Double').no}`, 'Emergency — single and double')}
        </div>
      </Reveal>
      <div className="spec-tables">
        <div className="spec-table">
          <p className="meta">Variants — {data.variants.length}</p>
          {data.variants.map((v) => (
            <div className="spec-tr" key={v.id}>
              <span className="meta">{v.no}</span>
              <span><b>{v.name}</b></span>
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
            <span>Made to your opening size</span>
          </div>
        </div>
      </div>
      <Reveal>
        <div className="chips">
          <NeedsChip term={`fire rating duration for fire rated doors ${doorV('fire', 'Single').no} and ${doorV('fire', 'Double').no}`} interest="Doors">Fire rating duration: needs confirmation</NeedsChip>
          <NeedsChip term={`panic bar and push hardware for emergency doors ${doorV('emergency', 'Single').no} and ${doorV('emergency', 'Double').no}`} interest="Doors">Emergency exit hardware: needs confirmation</NeedsChip>
        </div>
      </Reveal>
    </Chapter>
  );
}

/* ---- 02 Sandwich: thickness ledger ---- */
function SandwichBlock({ data }) {
  return (
    <Chapter
      data={data}
      hint={`${data.panels.length} panel types`}
      title="Sandwich panels:"
      hand="the thickness ledger."
      interest="Sandwich Panels"
      checklist={['Areas and thicknesses (50 / 100 mm)', 'Panel types in the schedule', 'Finishes and colours', 'Quantities and site location']}
    >
      <ClipReveal>
        <figure className="band-ph">
          <ParallaxImg src={PHOTO.panelWall.src} alt={PHOTO.panelWall.alt} ratio="16/9" speed={0.12} onError={hideFigure('.band-ph')} />
          <figcaption><span className="meta">{data.index}</span><span>50 / 100 mm wall systems</span></figcaption>
        </figure>
      </ClipReveal>
      <div className="spec-matrix">
        <div className="spec-mrow head" aria-hidden="true">
          <span className="meta">Product</span>
          <span className="meta">50 mm</span>
          <span className="meta">100 mm</span>
        </div>
        {data.panels.map((p) => (
          <div className="spec-mrow" key={p.id}>
            <span><b>{p.name}</b><small>{p.no}</small></span>
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
        <p className="meta" style={{ color: 'var(--muted-fg)' }}>
          — thickness confirmed on enquiry.
        </p>
        <div style={{ marginTop: 'var(--s5)' }}>
          <p className="meta" style={{ marginBottom: 'var(--s3)', color: 'var(--muted-fg)' }}>Panel finishes &amp; colours</p>
          <Chips items={[...data.finishes, ...data.colours]} />
        </div>
      </Reveal>
    </Chapter>
  );
}

/* ---- 03 Cleanroom ---- */
function CleanroomBlock({ data }) {
  return (
    <Chapter
      data={data}
      hint={`${data.items.length} range items`}
      title="Cleanroom panels:"
      hand="stated as range."
      interest="Cleanroom Panels"
      checklist={['Room layouts and dimensions', 'Which surfaces: wall, ceiling, flush', 'Target classification, if known', 'Quantities and site location']}
      dark
    >
      <ClipReveal>
        <figure className="band-ph">
          <ParallaxImg src={PHOTO.cleanroomLab.src} alt={PHOTO.cleanroomLab.alt} ratio="16/9" speed={0.12} onError={hideFigure('.band-ph')} />
          <figcaption><span className="meta">{data.index}</span><span>Flush, washable surfaces for controlled rooms</span></figcaption>
        </figure>
      </ClipReveal>
      <div className="spec-list">
        {data.items.map((it, i) => (
          <Reveal key={it.id} delay={Math.min(i * 0.05, 0.15)}>
            <div className="spec-li">
              <span className="meta">{it.no}</span>
              <span className="h3">{it.name}</span>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div className="chips">
          <NeedsChip term="cleanroom ISO classification" interest="Cleanroom Panels">ISO class: needs confirmation</NeedsChip>
          <NeedsChip term="GMP compliance for cleanroom panels" interest="Cleanroom Panels">GMP: needs confirmation</NeedsChip>
          <NeedsChip term="pressure differential and hygiene ratings" interest="Cleanroom Panels">Pressure / hygiene ratings: needs confirmation</NeedsChip>
        </div>
      </Reveal>
    </Chapter>
  );
}

/* ---- 04 Partition ---- */
function PartitionBlock({ data }) {
  return (
    <Chapter
      data={data}
      hint={`${data.items.length} items`}
      title="Partition panels:"
      hand="kept distinct."
      interest="Partition / Wall Panels"
      checklist={['Layouts to divide', 'Partition, flush or riser panels', 'Quantities and site location']}
    >
      <div className="pc-cards">
        {data.items.map((it) => (
          <div key={it.id} className="pt-card">
            <p className="meta" style={{ color: 'var(--datum-ink)', marginBottom: 'var(--s3)' }}>{it.no}</p>
            <h3 className="h3">{it.name}</h3>
            <p className="body-sm" style={{ marginTop: 'var(--s2)' }}>{it.note}</p>
            {it.id === 'riser-panel' && (
              <p className="meta" style={{ marginTop: 'var(--s3)', color: 'var(--muted-fg)' }}>
                <Term def="Angled slats that ventilate a shaft while screening the opening">Grill</Term>
              </p>
            )}
          </div>
        ))}
      </div>
      <ClipReveal>
        <figure className="band-ph">
          <ParallaxImg src={PHOTO.whiteHall.src} alt={PHOTO.whiteHall.alt} ratio="16/9" speed={0.08} onError={hideFigure('.band-ph')} />
        </figure>
      </ClipReveal>
      <ClipReveal delay={0.04}>
        <figure className="band-ph">
          <ParallaxImg src={IMG.riserPanel.src} alt={IMG.riserPanel.alt} ratio="16/9" speed={0.12} onError={hideFigure('.band-ph')} />
          <figcaption><span className="meta">{data.items.find((i) => i.id === 'riser-panel').no}</span><span>Riser panel with grill for service shafts</span></figcaption>
        </figure>
      </ClipReveal>
    </Chapter>
  );
}

/* ---- 05 Glass ---- */
function GlassBlock({ data }) {
  return (
    <Chapter
      data={data}
      hint={`${data.items.length} ${data.items.length === 1 ? 'item' : 'items'}`}
      title="View glass:"
      hand="sightline, framed."
      interest="Glass Panels"
      checklist={['Opening sizes', 'Single or double glazing', 'Quantities and site location']}
    >
      <ClipReveal>
        <figure className="band-ph">
          <ParallaxImg src={PHOTO.cleanroomWindow.src} alt={PHOTO.cleanroomWindow.alt} ratio="16/10" speed={0.08} onError={hideFigure('.band-ph')} />
        </figure>
      </ClipReveal>
      <div className="pc-cards">
        {data.items.map((it) => (
          <div key={it.id} className="pt-card">
            <p className="meta" style={{ color: 'var(--datum-ink)', marginBottom: 'var(--s3)' }}>{it.no}</p>
            <h3 className="h3">{it.name}</h3>
            <p className="body-sm" style={{ marginTop: 'var(--s2)' }}>{it.note}</p>
          </div>
        ))}
      </div>
      <Reveal>
        <div className="chips">
          {data.options.map((o) => <span key={o} className="chip chip-accent">{o}</span>)}
          <NeedsChip term="view glass panel glazing thickness, make and fire rating" interest="Glass Panels">{data.note}</NeedsChip>
        </div>
      </Reveal>
    </Chapter>
  );
}

/* ---- 06 Profiles ---- */
function ProfilesBlock({ data }) {
  return (
    <Chapter
      data={data}
      hint={`${data.groups.length} groups`}
      title="Profiles & accessories:"
      hand="the spec sheet."
      interest="Profiles & Accessories"
      checklist={['Profile types and lengths', 'Coated, non-coated or aluminium-coated', 'Quantities and site location']}
    >
      <div className="pc-rows">
        {data.groups.map((g, i) => (
          <Reveal key={g.id} delay={Math.min(i * 0.05, 0.15)}>
            <div className="spec-row">
              <div className="spec-thumb" aria-hidden="true">
                <ParallaxImg src={PROFILE_PHOTO[g.id].src} alt="" speed={0.05} onError={hideFigure()} />
              </div>
              <div>
                <p className="meta" style={{ color: 'var(--ink)' }}>{g.no}</p>
                <h3 className="h3" style={{ marginTop: 'var(--s2)' }}>{g.name}</h3>
                <p className="body-sm" style={{ marginTop: 'var(--s2)' }}>{GROUP_NOTE[g.id]}</p>
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
      </div>
      <Reveal>
        <p className="meta" style={{ color: 'var(--muted-fg)' }}>Additional profile dimensions:{' '}
          <NeedsChip term="available profile dimensions beyond 50 mm and 100 mm" interest={'Profiles & Accessories'} style={{ marginLeft: 'var(--s2)' }}>Needs confirmation</NeedsChip>
        </p>
      </Reveal>
    </Chapter>
  );
}

export default function Products() {
  useHashJump();
  return (
    <div className="page">
      {/* ---- opening: the catalogue as a row of six doors ---- */}
      <section className="pr-hero">
        <div className="wrap pr-hero-in">
          <div className="pr-hero-head">
            <p className="meta" style={{ color: 'var(--datum)', marginBottom: 'var(--s5)' }}>AKALKA catalogue</p>
            <h1 className="display">
              <span className="mask"><span>{TOTAL_WORD} systems.</span></span>
              <span className="mask"><span style={{ animationDelay: '0.12s' }}><span className="font-hand" style={{ color: 'var(--datum)' }}>One language.</span></span></span>
            </h1>
            <p className="lede" style={{ color: 'var(--on-dark-muted)', marginTop: 'var(--s6)', maxWidth: '56ch' }}>
              Doors, panels and the profiles that join them. Pick a category to begin.
            </p>
          </div>
          <ol className="pr-doors" style={{ '--n': TOTAL }}>
            {CATEGORIES.map((c, i) => {
              const img = CARD_IMG[c.id];
              return (
                <li key={c.id} style={{ animationDelay: `${0.45 + 0.08 * i}s` }}>
                  <a href={`#${c.id}`} className="pr-door">
                    <img src={img.src} srcSet={srcSetFor(img.src)} sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 16vw" alt="" loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
                    <span className="pr-door-body">
                      <span className="meta">{c.index} / {TOTAL_LABEL}</span>
                      <span className="pr-door-name">{c.name}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <ChapterDock />
      <DoorsBlock data={CAT.doors} />
      <SandwichBlock data={CAT.sandwich} />
      <CleanroomBlock data={CAT.cleanroom} />
      <PartitionBlock data={CAT.partition} />
      <GlassBlock data={CAT.glass} />
      <ProfilesBlock data={CAT.profiles} />

      <section className="section has-ls">
        <Landscape seed={13} />
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
