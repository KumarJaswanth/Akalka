import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CAT, word } from '../data/products.js';
import { Reveal, Materialize, ClipReveal, Magnetic, ParallaxImg, addScrollJob } from '../components/Reveal.jsx';
import { ArrowRight, ArrowUpRight } from '../components/icons.jsx';
import { IMG, PHOTO, PROFILE_PHOTO, srcSetFor } from '../data/images.js';
import NeedsChip from '../components/NeedsChip.jsx';
import Term from '../components/Term.jsx';
import Landscape from '../components/Landscape.jsx';
import Eyebrow from '../components/Eyebrow.jsx';

/* The catalogue is told in three chapters. The shared data file still lists
   the original six product families (the Home page counts them), so this page
   regroups them here: panels gathers sandwich, cleanroom, partition and glass;
   doors and profiles & tracks carry over as they are. */
const CHAPTERS = [
  { id: 'doors', index: '01', name: 'Doors', img: IMG.doorSingle, line: 'Regular modular, fire rated and emergency.' },
  { id: 'panels', index: '02', name: 'Panels', img: PHOTO.panelWall, line: 'Wall, ceiling and view glass.' },
  { id: 'profiles', index: '03', name: 'Profiles & Tracks', img: PHOTO.measure, line: 'The sections that join it all.' },
];
const TOTAL = CHAPTERS.length;
const TOTAL_WORD = word(TOTAL);

/* Links from the earlier six-family layout (menu, footer, shared links)
   land on the right part of the new story. */
const LEGACY = {
  sandwich: 'p-rail',
  partition: 'p-rail',
  cleanroom: 'p-rail',
  glass: 'p-rail',
  'p-walls': 'p-rail',
  'p-partition': 'p-rail',
  'p-cleanroom': 'p-rail',
  'p-ceiling': 'p-rail',
  'p-glass': 'p-rail',
};

/* The door variant for a type and number of leaves, with its number. */
const doorV = (typeId, leaves) => CAT.doors.variants.find((v) => v.typeId === typeId && v.leaves === leaves);

/* Hide a figure whose photograph failed to load, rather than show a hole. */
const hideFigure = (sel) => (e) => {
  const el = sel ? e.currentTarget.closest(sel) : e.currentTarget;
  if (el) el.style.display = 'none';
};

/* Glide to an element through Lenis, so every jump is as smooth as the site. */
const jumpTo = (e, id) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -90, duration: 1.2 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* Floating chapter dock. Three long chapters are easy to get lost in, so a
   quiet pill bar follows the visitor through the catalogue, names where
   they are, and jumps anywhere in one tap. It only appears while the
   chapters themselves are on screen. */
function ChapterDock() {
  const [active, setActive] = useState(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const els = CHAPTERS.map((c) => document.getElementById(c.id)).filter(Boolean);
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
    /* Measured in the shared scroll frame's read phase: a scroll listener
       calling getBoundingClientRect after that frame's writes forced a
       second layout. The dock re-renders only when it flips. */
    let was = null;
    const off = addScrollJob({
      read: () => {
        const mid = window.innerHeight * 0.5;
        return els[0].getBoundingClientRect().top < mid && els[els.length - 1].getBoundingClientRect().bottom > mid;
      },
      write: (v) => {
        if (v === was) return;
        was = v;
        setShow(v);
      },
    });
    return () => {
      io.disconnect();
      off();
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
  const jump = jumpTo;
  return (
    <nav className={`dock${show ? ' show' : ''}`} aria-label="Catalogue chapters" aria-hidden={!show}>
      <div className="dock-in">
        {CHAPTERS.map((c) => (
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

/* Coating option codes. Their exact specification is confirmed on enquiry —
   the catalogue states the choice, never the value. */
const COATING_DEF = 'Coating option code in this catalogue — its exact specification is confirmed on enquiry';

/* Jump straight to a chapter (or a part of one) when the URL carries a hash —
   routed through Lenis so the flight is as smooth as the site. */
function useHashJump() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => {
      const id = hash.slice(1);
      const el = document.getElementById(LEGACY[id] || id);
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

/* Per-chapter enquiry strip — what to include, and the way into the form.
   The button carries its arrow in its own round island, flush to its edge. */
function ChapterCTA({ interest, checklist, label = 'Enquire' }) {
  return (
    <div className="cta2">
      <div className="cta2-t">
        <p className="meta cta2-k">Include in your enquiry</p>
        <p className="body-sm cta2-l">{checklist.join('  ·  ')}</p>
      </div>
      <Link to={`/contact?interest=${encodeURIComponent(interest)}`} className="pill-btn">
        {label}
        <i aria-hidden="true"><ArrowUpRight style={{ width: 16, height: 16 }} /></i>
      </Link>
    </div>
  );
}

/* Each chapter is staged in its own way, because each tells a different kind
   of story:
     01 Doors      — acts that stack like cards as you scroll, one family each.
     02 Panels     — a bento of tiles on dark, with a panel you can open up.
     03 Profiles   — expanding strips, because a profile is a strip.
   They share only the chapter id (the dock and the links), the enquiry strip
   and the honest "needs confirmation" chips. */

/* ================= 01 Doors: acts that stack, then a specification ================= */

const ROMAN = ['I', 'II', 'III'];

/* One act. It is a card with a sticky top, so each act slides over the one
   before it and the edges of the earlier ones stay in view, like a hand of
   cards. Photographs sit in their own bezels; the words get the other side. */
function Act({ i, id, kicker, title, text, rows, figs, tone = 'paper', children }) {
  return (
    <article className={`act bz tone-${tone}${tone === 'dark' ? ' on-dark' : ''}`} id={id} style={{ '--i': i }}>
      <div className="act-in bz-in">
        <div className="act-text">
          <Reveal>
            <Eyebrow n={ROMAN[i]}>{kicker}</Eyebrow>
            <h3 className="h2 act-h">{title}</h3>
            <p className="lede act-p">{text}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className="act-rows">
              {rows.map(([no, label]) => (
                <li key={no}><span className="meta">{no}</span><b>{label}</b></li>
              ))}
            </ul>
            {children}
          </Reveal>
        </div>
        <div className={`act-ph k${figs.length}`}>
          <span className="act-ghost" aria-hidden="true">{ROMAN[i]}</span>
          {figs.map(({ img, no, cap, tall, crop }, j) => (
            <figure key={img.src} className={`af af${j}${tall ? ' tall' : ''}${crop ? ' crop' : ''}`}>
              <div className="af-in">
                <img src={img.src} alt={img.alt} loading="lazy" decoding="async" draggable={false} onError={hideFigure('figure')} />
              </div>
              <figcaption><span className="meta">{no}</span>{cap}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </article>
  );
}

function DoorsChapter({ data }) {
  const fireNo = `${doorV('fire', 'Single').no} / ${doorV('fire', 'Double').no}`;
  const emNo = `${doorV('emergency', 'Single').no} / ${doorV('emergency', 'Double').no}`;
  const build = [
    ['Type', data.types],
    ['Core', data.cores],
    ['Finish', data.finishes],
    ['Colour', data.colours],
  ];
  const jumps = [['d-regular', 'Regular modular'], ['d-fire', 'Fire rated'], ['d-emergency', 'Emergency']];
  return (
    <section className="pc dr" id="doors">
      <div className="wrap dr-head">
        <div className="dr-l">
          <Eyebrow n="01">Doors · {data.variants.length} variants</Eyebrow>
          <Materialize>
            <h2 className="h2 dr-h">
              Doors, <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>configured to requirement.</span>
            </h2>
          </Materialize>
        </div>
        <Reveal className="dr-r">
          <p className="lede">
            Every room begins with an opening. Here are three kinds of door, each in single or double leaf,
            made to the size of the opening and finished to match the walls beside it.
          </p>
          <div className="jumps">
            {jumps.map(([id, label], k) => (
              <a key={id} href={`#${id}`} className="jump" onClick={(e) => jumpTo(e, id)}>
                <b>{ROMAN[k]}</b>{label}
              </a>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="wrap acts">
        <Act
          i={0}
          id="d-regular"
          kicker="Regular modular"
          title="Start with the everyday door"
          text="The regular modular door is the one most rooms need: a coated steel leaf set into the panel wall, as a single door or a double. Nothing is off the shelf. Each is made to your opening size."
          rows={[[doorV('regular', 'Single').no, 'Single door'], [doorV('regular', 'Double').no, 'Double door']]}
          figs={[
            { img: IMG.doorSingle, no: doorV('regular', 'Single').no, cap: 'Single door' },
            { img: IMG.doorDouble, no: doorV('regular', 'Double').no, cap: 'Double door' },
          ]}
        />
        <Act
          i={1}
          id="d-fire"
          kicker="Fire rated"
          title="Then the room that must hold back fire"
          text="Where a doorway has to resist fire, the fire rated door takes its place, again in single and double leaf. These are the red doors in the photographs, fitted with push-bar hardware."
          rows={[[doorV('fire', 'Single').no, 'Single door'], [doorV('fire', 'Double').no, 'Double door']]}
          figs={[
            { img: IMG.doorFire, no: doorV('fire', 'Single').no, cap: 'Single door' },
            { img: IMG.doorFireDouble, no: doorV('fire', 'Double').no, cap: 'Double door', crop: true },
          ]}
          tone="dark"
        >
          <div className="chips" style={{ marginTop: 'var(--s5)' }}>
            <NeedsChip term={`fire rating duration for fire rated doors ${fireNo}`} interest="Fire-Rated Doors">Fire rating duration: needs confirmation</NeedsChip>
          </div>
        </Act>
        <Act
          i={2}
          id="d-emergency"
          kicker="Emergency"
          title="And the door people must reach in a hurry"
          text="The emergency door is the way out: a vision panel to see through and a push bar to open it, in single and double leaf."
          rows={[[doorV('emergency', 'Single').no, 'Single door'], [doorV('emergency', 'Double').no, 'Double door']]}
          figs={[{ img: IMG.doorEmergency, no: emNo, cap: 'Single and double', tall: true }]}
          tone="sage"
        >
          <div className="chips" style={{ marginTop: 'var(--s5)' }}>
            <NeedsChip term={`panic bar and push hardware for emergency doors ${emNo}`} interest="Emergency Exit Doors">Emergency exit hardware: needs confirmation</NeedsChip>
          </div>
        </Act>
      </div>

      <div className="wrap bd">
        <Reveal className="bd-head">
          <Eyebrow>Specification</Eyebrow>
          <h3 className="h2 bd-h">What goes into every door</h3>
          <p className="lede bd-p">
            Whichever door you choose, you choose the same four things, and the size is always yours.
          </p>
        </Reveal>
        <div className="bd-steps">
          {build.map(([k, list], i) => (
            <Reveal key={k} delay={Math.min(i * 0.06, 0.2)} className="bd-step bz">
              <div className="bz-in bd-core">
                <p className="meta bd-step-k"><b>{String(i + 1).padStart(2, '0')}</b>{k}</p>
                <div className="chips">
                  {list.map((o) => <span key={o} className="chip">{o}</span>)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="bd-size"><span className="meta">Size</span> Made to your opening size</p>
          <p className="meta bd-vk">The six variants, numbered</p>
          <ol className="bd-vars">
            {data.variants.map((v) => (
              <li key={v.id} className="bz"><div className="bz-in"><span className="meta">{v.no}</span><b>{v.name}</b></div></li>
            ))}
          </ol>
        </Reveal>
        <ChapterCTA
          interest="Doors"
          label="Enquire about doors"
          checklist={['Opening sizes or a door schedule', 'Single or double, and which type', 'Core and finish', 'Quantities and site location']}
        />
      </div>
    </section>
  );
}

/* ================= 02 Panels: a bento of tiles ================= */

/* Eases a number toward its target, so a change of thickness slides instead of jumping. */
function useTween(target, ms = 650) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      from.current = target;
      setV(target);
      return undefined;
    }
    const a = from.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / ms);
      const cur = a + (target - a) * (1 - (1 - p) ** 4);
      from.current = cur;
      setV(cur);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/* A double-skin wall panel, cut open. Only what the catalogue confirms is
   drawn: two skins around a core that is PUF or rockwool, at 50 or 100 mm.
   The thickness is to relative scale; nothing else is claimed. */
function Anatomy() {
  const [mm, setMm] = useState(50);
  const [core, setCore] = useState('PUF');
  const total = useTween(mm * 2.2);
  const skin = 9;
  const cx = 190;
  const top = 58;
  const h = 170;
  const x0 = cx - total / 2;
  const x1 = cx + total / 2;
  return (
    <div className="pn-anat">
      <div className="anat-ctl">
        <div className="seg" role="group" aria-label="Panel thickness">
          {[50, 100].map((t) => (
            <button key={t} type="button" aria-pressed={mm === t} className={mm === t ? 'on' : ''} onClick={() => setMm(t)}>{t} mm</button>
          ))}
        </div>
        <div className="seg" role="group" aria-label="Panel core">
          {['PUF', 'Rockwool'].map((c) => (
            <button key={c} type="button" aria-pressed={core === c} className={core === c ? 'on' : ''} onClick={() => setCore(c)}>{c}</button>
          ))}
        </div>
      </div>
      <svg className="anat-svg" viewBox="0 0 380 292" role="img" aria-label={`Cross-section of a ${mm} mm double-skin wall panel with a ${core} core between two skins`}>
        <defs>
          <pattern id="an-puf" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="3.5" cy="3.5" r="2.2" fill="none" stroke="rgba(87,122,0,0.75)" strokeWidth="1" />
            <circle cx="10.5" cy="10.5" r="2.2" fill="none" stroke="rgba(87,122,0,0.75)" strokeWidth="1" />
          </pattern>
          <pattern id="an-rock" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M0 8 L9 0 M3 12 L12 4" stroke="rgba(66,71,77,0.5)" strokeWidth="1" fill="none" />
          </pattern>
        </defs>
        {/* the panel runs on past the frame */}
        <path d={`M${x0 - skin - 18} ${top} H${x1 + skin + 18} M${x0 - skin - 18} ${top + h} H${x1 + skin + 18}`} stroke="rgba(66,71,77,0.3)" strokeWidth="1" strokeDasharray="3 5" />
        <rect x={x0} y={top} width={Math.max(total, 0)} height={h} fill={core === 'PUF' ? 'rgba(125,178,0,0.14)' : '#e6e8e2'} />
        <rect x={x0} y={top} width={Math.max(total, 0)} height={h} fill={core === 'PUF' ? 'url(#an-puf)' : 'url(#an-rock)'} />
        <rect x={x0 - skin} y={top} width={skin} height={h} rx="1.5" fill="#42474d" />
        <rect x={x1} y={top} width={skin} height={h} rx="1.5" fill="#42474d" />
        <g fill="#42474d" fontFamily="DM Sans, sans-serif" fontSize="11" fontWeight="600" letterSpacing="1.6">
          <text x={cx} y={top - 24} textAnchor="middle">CORE · {core.toUpperCase()}</text>
          <text x="10" y={top + 34}>SKIN</text>
          <text x="370" y={top + 34} textAnchor="end">SKIN</text>
        </g>
        <g stroke="rgba(66,71,77,0.45)" strokeWidth="1" fill="none">
          <path d={`M${cx} ${top - 16} V${top + 14}`} />
          <path d={`M44 ${top + 30} H${x0 - skin / 2}`} />
          <path d={`M${x1 + skin / 2} ${top + 30} H336`} />
        </g>
        <g stroke="#577a00" strokeWidth="1.5" fill="none">
          <path d={`M${x0 - skin} ${top + h + 28} H${x1 + skin}`} />
          <path d={`M${x0 - skin} ${top + h + 21} V${top + h + 35} M${x1 + skin} ${top + h + 21} V${top + h + 35}`} />
        </g>
        <text x={cx} y={top + h + 58} textAnchor="middle" fill="#2b3036" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="24">{mm} mm</text>
      </svg>
      <p className="meta anat-note">Schematic cross-section · thickness to relative scale</p>
    </div>
  );
}

/* ---- the panels rail: big photographs, read sideways ---- */

const BASE = import.meta.env.BASE_URL;
/* AKALKA's own photographs of panels. The stock ones fill only the gaps. */
const OWN = {
  samples: {
    src: `${BASE}Images/akalka-bg.webp`,
    alt: 'A display stand of wall panel samples, some cut open to show their cores',
  },
  corridor: {
    src: `${BASE}Images/hero-cleanroom-1920.webp`,
    srcSet: `${BASE}Images/hero-cleanroom-1280.webp 1280w, ${BASE}Images/hero-cleanroom-1920.webp 1920w, ${BASE}Images/hero-cleanroom-2560.webp 2560w`,
    alt: 'A technician pushing a trolley down a bright white corridor with glossy flush walls and a clean panel ceiling',
  },
};

/* hash fragments (including the old six-family ones) → the card they open */
const CARD_OF = {
  sandwich: 'wall', 'p-walls': 'wall', 'p-anatomy': 'wall',
  partition: 'partition', 'p-partition': 'partition',
  cleanroom: 'clean', 'p-cleanroom': 'clean',
  'p-ceiling': 'ceiling',
  glass: 'glass', 'p-glass': 'glass',
};

/* One card on the rail: the photograph carries it, the words sit beneath. */
function RailCard({ id, no, kicker, title, img, pos, zoom, origin, children }) {
  return (
    <article className="rc" id={`rc-${id}`} style={{ '--pos': pos, '--z': zoom, '--o': origin }}>
      <figure className="rc-ph">
        <img src={img.src} srcSet={img.srcSet || srcSetFor(img.src)} sizes="(max-width: 900px) 80vw, 40vw" alt={img.alt} loading="lazy" decoding="async" draggable={false} onError={hideFigure('.rc-ph')} />
        <figcaption className="rc-no meta">{no}</figcaption>
      </figure>
      <div className="rc-txt">
        <p className="meta rd-k">{kicker}</p>
        <h3 className="h3 rc-h">{title}</h3>
        {children}
      </div>
    </article>
  );
}

function PanelsChapter({ sandwich, partition, cleanroom, glass }) {
  const { hash } = useLocation();
  const rail = useRef(null);
  const bar = useRef(null);
  const drag = useRef(null);
  const anim = useRef(0);
  useEffect(() => () => cancelAnimationFrame(anim.current), []);
  const [end, setEnd] = useState({ start: true, last: false });
  const cleanItems = cleanroom.items.filter((i) => i.id !== 'cleanroom-ceiling');
  const riser = partition.items.find((i) => i.id === 'riser-panel');
  const others = partition.items.filter((i) => i.id !== 'riser-panel');

  /* progress line and arrow states follow the rail's own scroll */
  const onScroll = () => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? el.scrollLeft / max : 0;
    if (bar.current) bar.current.style.transform = `scaleX(${Math.max(0.04, p).toFixed(3)})`;
    const next = { start: el.scrollLeft < 8, last: el.scrollLeft > max - 8 };
    setEnd((e) => (e.start === next.start && e.last === next.last ? e : next));
  };
  useEffect(onScroll, []);
  /* Glide the rail to a position with our own easing. Snap is switched off
     for the glide, so nothing pulls it back, and it lands on a card edge. */
  const glide = (to) => {
    const el = rail.current;
    if (!el) return;
    cancelAnimationFrame(anim.current);
    const from = el.scrollLeft;
    if (Math.abs(to - from) < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.scrollLeft = to;
      return;
    }
    const t0 = performance.now();
    el.classList.add('dragging');
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 700);
      el.scrollLeft = from + (to - from) * (1 - (1 - p) ** 4);
      if (p < 1) anim.current = requestAnimationFrame(tick);
      else el.classList.remove('dragging');
    };
    anim.current = requestAnimationFrame(tick);
  };
  /* Move to the next (or previous) card's own edge. */
  const step = (dir) => {
    const el = rail.current;
    if (!el) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft);
    const max = el.scrollWidth - el.clientWidth;
    const stops = [...el.querySelectorAll('.rc')].map((c) => Math.min(max, Math.max(0, c.offsetLeft - pad)));
    const cur = el.scrollLeft;
    const to = dir > 0 ? stops.find((s) => s > cur + 4) : [...stops].reverse().find((s) => s < cur - 4);
    if (to !== undefined) glide(to);
  };
  /* drag with a mouse to scroll sideways, as on the Home gallery */
  const down = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag.current = { x: e.clientX, left: rail.current.scrollLeft, moved: false };
  };
  const move = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      rail.current.classList.add('dragging');
    }
    if (d.moved) rail.current.scrollLeft = d.left - dx;
  };
  const up = () => {
    drag.current = null;
    if (rail.current) rail.current.classList.remove('dragging');
  };
  /* a link that names a part (the menu, the footer, an old address) brings that card into view */
  useEffect(() => {
    const key = CARD_OF[hash.slice(1)];
    const el = rail.current;
    const card = key && document.getElementById(`rc-${key}`);
    if (el && card) glide(Math.max(0, card.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft)));
  }, [hash]);

  return (
    <section className="pc pn" id="panels">
      <div className="wrap">
        <div className="pn-head">
          <Eyebrow n="02">Panels</Eyebrow>
          <Materialize>
            <h2 className="h2 pn-h">
              Panels, <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>wall, ceiling and glass.</span>
            </h2>
          </Materialize>
          <Reveal>
            <p className="lede">
              Between the openings, panels make the room. Read it sideways: the wall first, then the way it
              divides, stays clean, closes overhead and lets the light through.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="rail-bar wrap">
        <p className="meta rail-hint">Drag, swipe or use the arrows</p>
        <div className="rail-ctl">
          <span className="rail-track" aria-hidden="true"><i ref={bar} /></span>
          <button type="button" className="rail-btn" onClick={() => step(-1)} disabled={end.start} aria-label="Previous photographs"><ArrowRight style={{ width: 16, height: 16, transform: 'scaleX(-1)' }} /></button>
          <button type="button" className="rail-btn" onClick={() => step(1)} disabled={end.last} aria-label="Next photographs"><ArrowRight style={{ width: 16, height: 16 }} /></button>
        </div>
      </div>

      <div
        id="p-rail"
        className="rail"
        ref={rail}
        tabIndex={0}
        role="region"
        aria-label="Panels, in photographs"
        onScroll={onScroll}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        onPointerCancel={up}
      >
        <RailCard id="wall" no="01" kicker="Wall panels · The system" title="Begin with the wall" img={OWN.samples} pos="95% 50%" zoom={1.6} origin="78% 56%">
          <p className="body-sm rc-p">
            A room is only as good as its walls. The double-skin wall panel comes with a PUF or a rockwool core in
            two disciplined thicknesses, 50 mm and 100 mm. Rockwool and honeycomb sandwich panels sit beside it,
            all finished to match the doors and profiles.
          </p>
          <div className="chips">
            <span className="chip chip-accent">PUF core</span>
            <span className="chip chip-accent">Rockwool core</span>
            <span className="chip chip-accent">50 mm</span>
            <span className="chip chip-accent">100 mm</span>
          </div>
          <a href="#p-anatomy" className="rd-more" onClick={(e) => jumpTo(e, 'p-anatomy')}>Compare thicknesses below <ArrowRight style={{ width: 14, height: 14 }} /></a>
        </RailCard>

        <RailCard id="joint" no="02" kicker="Wall panels · The joint" title="Where two panels meet" img={IMG.panelJoint} pos="50% 50%">
          <p className="body-sm rc-p">
            Every panel is a double skin around a core. Panels meet edge to edge along a joint, so the wall reads
            as one continuous surface.
          </p>
        </RailCard>

        <RailCard id="partition" no="03" kicker="Wall panels · Dividing space" title="Then divide the space" img={OWN.corridor} pos="0% 50%" zoom={1.45} origin="4% 52%">
          <p className="body-sm rc-p">
            Interior division is its own range, separate from the structural wall.
          </p>
          <ul className="rd-list">
            {others.map((it) => (
              <li key={it.id}><b>{it.name}</b><span>{it.note}</span></li>
            ))}
          </ul>
        </RailCard>

        <RailCard id="riser" no="04" kicker="Wall panels · Service shafts" title="An opening for the shafts" img={IMG.riserGrilles} pos="50% 50%">
          <p className="body-sm rc-p">
            {riser.name}: {riser.note.toLowerCase()}.{' '}
            <Term def="Angled slats that ventilate a shaft while screening the opening">Grill</Term>
          </p>
        </RailCard>

        <RailCard id="clean" no="05" kicker="Wall panels · Controlled rooms" title="Where the room has to stay clean" img={IMG.cleanroomHall} pos="50% 55%">
          <p className="body-sm rc-p">
            For clean, controlled interiors the range narrows to flush, washable surfaces:{' '}
            {cleanItems.map((i) => i.name.toLowerCase()).join(', ')}. Stated as range only until the
            specifications are confirmed.
          </p>
          <div className="chips">
            <NeedsChip term="cleanroom ISO classification" interest="Cleanroom Panels">ISO class: needs confirmation</NeedsChip>
            <NeedsChip term="GMP compliance for cleanroom panels" interest="Cleanroom Panels">GMP: needs confirmation</NeedsChip>
            <NeedsChip term="pressure differential and hygiene ratings" interest="Cleanroom Panels">Pressure / hygiene ratings: needs confirmation</NeedsChip>
          </div>
        </RailCard>

        <RailCard id="ceiling" no="06" kicker="Ceiling panels" title="Look up: the ceiling closes the room" img={OWN.corridor} pos="50% 0%" zoom={2.3} origin="50% 0%">
          <p className="body-sm rc-p">
            Cleanroom ceiling panels finish the room from above, in the same flush, washable language as the walls
            below.
          </p>
          <div className="chips">
            <NeedsChip term="cleanroom ceiling panel specification" interest="Cleanroom Panels">Ceiling panel specification: needs confirmation</NeedsChip>
          </div>
        </RailCard>

        <RailCard id="glass" no="07" kicker="View glass panels" title="Let the light and sightlines through" img={IMG.cleanroomCorridor} pos="88% 45%" zoom={1.55} origin="86% 42%">
          <p className="body-sm rc-p">
            A solid leaf does not have to mean a blind room. View glass panels set into doors and glazed openings
            keep the room in view, in single or double glazing.
          </p>
          <div className="chips">
            {glass.options.map((o) => <span key={o} className="chip chip-accent">{o}</span>)}
            <NeedsChip term="view glass panel glazing thickness, make and fire rating" interest="Glass Panels">{glass.note}</NeedsChip>
          </div>
        </RailCard>
      </div>

      <div className="wrap">
        <div className="pn-spec" id="p-anatomy">
          <Reveal className="pn-spec-head">
            <Eyebrow>Wall panels · In detail</Eyebrow>
            <h3 className="h2 pn-spec-h">Every wall panel, and what 50 and 100 mm look like</h3>
          </Reveal>
          <div className="pn-spec-grid">
            <Reveal className="bz">
              <div className="bz-in pn-ledger">
                <p className="meta tile-k">The thickness ledger</p>
                <div className="spec-matrix">
                  <div className="spec-mrow head" aria-hidden="true">
                    <span className="meta">Panel</span>
                    <span className="meta">50 mm</span>
                    <span className="meta">100 mm</span>
                  </div>
                  {sandwich.panels.map((p) => (
                    <div className="spec-mrow" key={p.id}>
                      <span><b>{p.name}</b></span>
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
                <p className="meta" style={{ color: 'var(--muted-fg)' }}>— thickness confirmed on enquiry.</p>
                <div>
                  <p className="meta" style={{ margin: '0 0 var(--s3)', color: 'var(--muted-fg)' }}>Panel finishes &amp; colours</p>
                  <Chips items={[...sandwich.finishes, ...sandwich.colours]} />
                </div>
              </div>
            </Reveal>
            <Reveal className="bz" delay={0.08}>
              <div className="bz-in pn-ledger">
                <p className="meta tile-k">Open one up</p>
                <p className="body-sm" style={{ margin: 0 }}>
                  Choose a thickness and a core to see the double-skin wall panel in section: a skin on each
                  face, the core between.
                </p>
                <Anatomy />
              </div>
            </Reveal>
          </div>
        </div>

        <ChapterCTA
          interest="Panels"
          label="Enquire about panels"
          checklist={['Areas, and which surfaces: wall, ceiling or glass', 'Panel type and thickness (50 / 100 mm)', 'Finishes and colours', 'Quantities and site location']}
        />
      </div>
    </section>
  );
}

/* ================= 03 Profiles & tracks: expanding strips ================= */

/* Section outlines, drawn only for the shapes the catalogue names. */
const GLYPH = {
  channel: { label: 'C-channel', d: 'M44 10 H14 V46 H44 V39 H21 V17 H44 Z' },
  angle: { label: 'L-angle', d: 'M14 10 H21 V39 H46 V46 H14 Z' },
  box: { label: 'Box-type', d: 'M14 14 H42 V42 H14 Z M20 20 V36 H36 V20 Z', rule: 'evenodd' },
  ctrack: { label: 'C-type track', d: 'M44 10 H14 V46 H44 V39 H21 V17 H44 Z' },
};
function Glyph({ kind }) {
  const g = GLYPH[kind];
  return (
    <span className="glyph">
      <svg viewBox="0 0 56 56" aria-hidden="true">
        <path d={g.d} fillRule={g.rule} fill="rgba(125,178,0,0.14)" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span className="meta">{g.label}</span>
    </span>
  );
}

const PROFILE_STORY = {
  corner: {
    kicker: 'Corners',
    title: 'Corners are where two panels meet',
    text: 'Edges and corners are finished with corner profiles, either powder coated or non-coated.',
    glyphs: [],
  },
  formed3d: {
    kicker: 'Formed sections',
    title: 'Shapes that hold a junction together',
    text: 'Two-dimensional and three-dimensional profiles, C-channels, L-angles and box sections cover the joints in between.',
    glyphs: ['channel', 'angle', 'box'],
  },
  alucoat: {
    kicker: 'Aluminium-coated',
    title: 'The same system, in coated aluminium',
    text: (
      <>Aluminium-coated profiles come in <Term def={COATING_DEF}>R-70</Term> and <Term def={COATING_DEF}>R-90</Term> options.</>
    ),
    glyphs: [],
  },
  track: {
    kicker: 'Bottom tracks',
    title: 'And the track the wall stands on',
    text: 'C-type bottom tracks run along the floor in 50 and 100 mm, coated or non-coated.',
    glyphs: ['ctrack'],
  },
};

function ProfilesChapter({ data }) {
  const [on, setOn] = useState(0);
  const hoverT = useRef(0);
  useEffect(() => () => clearTimeout(hoverT.current), []);
  const facts = [
    ['Profile groups', String(data.groups.length)],
    ['Bottom track widths', '50 · 100 mm'],
    ['Aluminium coatings', 'R-70 · R-90'],
  ];
  return (
    <section className="pc pf2" id="profiles">
      <div className="wrap">
        <div className="pf2-head">
          <div>
            <Eyebrow n="03">Profiles &amp; Tracks · {data.groups.length} groups</Eyebrow>
            <Materialize>
              <h2 className="h2 pf2-h">
                Profiles &amp; tracks, <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>where it all joins.</span>
              </h2>
            </Materialize>
          </div>
          <Reveal>
            <p className="lede">
              Doors and panels are only as good as the junctions between them. Corner, formed and
              aluminium-coated profiles finish the edges, and C-type bottom tracks hold the wall to the floor.
            </p>
          </Reveal>
        </div>

        <Reveal>
          <p className="meta pf2-hint">Open each strip to read the next part of the story</p>
        </Reveal>
        <div className="slats-bz bz">
          <div className="slats" role="list">
            {data.groups.map((g, i) => {
              const st = PROFILE_STORY[g.id];
              const open = on === i;
              const ph = PROFILE_PHOTO[g.id];
              return (
                <article
                  key={g.id}
                  role="listitem"
                  id={`pr-${g.id}`}
                  className={`slat${open ? ' on' : ''}`}
                  onMouseEnter={() => {
                    /* a short intent delay, so a strip does not flicker open as the page scrolls under a resting pointer */
                    clearTimeout(hoverT.current);
                    hoverT.current = setTimeout(() => setOn(i), 140);
                  }}
                  onMouseLeave={() => clearTimeout(hoverT.current)}
                >
                  <img src={ph.src} srcSet={srcSetFor(ph.src)} sizes="(max-width: 820px) 100vw, 60vw" alt={open ? ph.alt : ''} loading="lazy" decoding="async" onError={hideFigure()} />
                  <button
                    type="button"
                    className="slat-btn"
                    aria-expanded={open}
                    aria-controls={`slat-${g.id}`}
                    onClick={() => setOn(i)}
                    onFocus={() => setOn(i)}
                  >
                    <b>{String(i + 1).padStart(2, '0')}</b>
                    <span className="slat-lbl">{st.kicker}</span>
                    <i aria-hidden="true">+</i>
                  </button>
                  <div className="slat-body" id={`slat-${g.id}`}>
                    {st.glyphs.length > 0 && (
                      <div className="glyphs">{st.glyphs.map((k) => <Glyph key={k} kind={k} />)}</div>
                    )}
                    <h3 className="h3">{st.title}</h3>
                    <p className="body-sm">{st.text}</p>
                    <div className="chips">
                      {g.options.map((o) => (
                        /R-70|R-90/.test(o)
                          ? <span key={o} className="chip chip-accent"><Term def={COATING_DEF}>{o}</Term></span>
                          : <span key={o} className={`chip${/50 mm|100 mm/.test(o) ? ' chip-accent' : ''}`}>{o}</span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <Reveal>
          <dl className="pf2-facts">
            {facts.map(([k, v]) => (
              <div key={k} className="bz"><div className="bz-in"><dt className="meta">{k}</dt><dd>{v}</dd></div></div>
            ))}
          </dl>
          <p className="meta" style={{ color: 'var(--muted-fg)', marginTop: 'var(--s6)' }}>Additional profile dimensions:{' '}
            <NeedsChip term="available profile dimensions beyond 50 mm and 100 mm" interest="Profiles & Tracks" style={{ marginLeft: 'var(--s2)' }}>Needs confirmation</NeedsChip>
          </p>
        </Reveal>

        <ChapterCTA
          interest="Profiles & Tracks"
          label="Enquire about profiles"
          checklist={['Profile types and lengths', 'Coated, non-coated or aluminium-coated', 'Track width: 50 or 100 mm', 'Quantities and site location']}
        />
      </div>
    </section>
  );
}

export default function Products() {
  useHashJump();
  return (
    <div className="page">
      {/* ---- opening: the catalogue as a row of three doors ---- */}
      <section className="pr-hero">
        <div className="wrap pr-hero-in">
          <div className="pr-hero-head">
            <p className="meta" style={{ color: 'var(--datum)', marginBottom: 'var(--s5)' }}>AKALKA catalogue</p>
            <h1 className="display">
              <span className="mask"><span>{TOTAL_WORD} families.</span></span>
              <span className="mask"><span style={{ animationDelay: '0.12s' }}><span className="font-hand" style={{ color: 'var(--datum)' }}>One language.</span></span></span>
            </h1>
            <p className="lede" style={{ color: 'var(--on-dark-muted)', marginTop: 'var(--s6)', maxWidth: '56ch' }}>
              A room is built in three moves: the doors you pass through, the panels that make its walls, ceiling
              and glass, and the profiles and tracks that join it all. Choose where to begin.
            </p>
          </div>
          <ol className="pr-doors pr-doors-3" style={{ '--n': TOTAL }}>
            {CHAPTERS.map((c, i) => (
              <li key={c.id} style={{ animationDelay: `${0.45 + 0.1 * i}s` }}>
                <a href={`#${c.id}`} className="pr-door">
                  <img src={c.img.src} srcSet={srcSetFor(c.img.src)} sizes="(max-width: 700px) 100vw, 33vw" alt="" loading="eager" decoding="async" />
                  <span className="pr-door-go" aria-hidden="true"><ArrowUpRight style={{ width: 16, height: 16 }} /></span>
                  <span className="pr-door-body">
                    <span className="meta">{c.index} / {String(TOTAL).padStart(2, '0')}</span>
                    <span className="pr-door-name">{c.name}</span>
                    <span className="pr-door-line">{c.line}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ChapterDock />
      <DoorsChapter data={CAT.doors} />
      <PanelsChapter sandwich={CAT.sandwich} partition={CAT.partition} cleanroom={CAT.cleanroom} glass={CAT.glass} />
      <ProfilesChapter data={CAT.profiles} />

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
