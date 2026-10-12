import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollVar, useFit, usePointerTilt, Materialize } from './Reveal.jsx';
import { ArrowRight } from './icons.jsx';
import NeedsChip from './NeedsChip.jsx';
import Term from './Term.jsx';
import { srcSetFor } from '../data/images.js';

/* v2 scroll scenes. Every scene is one tall section whose sticky stage
   reads a single `--p` (0 → 1) written by useScrollVar. All motion is
   CSS transform / opacity off that number — no per-frame React work,
   no animation library in the loop. Reduced motion receives the final
   composed state (`.is-static`). */

function jumpTo(el, frac) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const span = el.offsetHeight - window.innerHeight;
  const y = top + Math.max(0, span) * frac;
  if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.1 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

/* =================================================================
   1. System anatomy — "what we make, and where it goes".
   A cutaway room in real CSS 3D, driven entirely by this section's own
   scroll. One progress value becomes everything on screen:
     · the first few percent build the room (floor, walls rise, ceiling)
     · each of the six chapters holds the camera on its product, plays
       that product's reveal forward, then rewinds it
     · between chapters the camera glides to the next product
   So scrolling down plays the tour and scrolling up rewinds it, exactly.
   Values are written straight to CSS custom properties in the shared
   scroll batch; React only re-renders on the six chapter changes.
   ================================================================= */
const ANAT = [
  { id: 'sandwich', code: 'SW', name: 'Sandwich panels', d: 'The walls themselves. Double-skin panels with a PUF or rockwool core, in 50 or 100 mm.' },
  { id: 'cleanroom', code: 'CR', name: 'Cleanroom panels', d: 'Flush, washable wall and ceiling surfaces for clean, controlled rooms.' },
  { id: 'doors', code: 'DR', name: 'Doors', d: 'Single and double leaves — regular modular, fire rated and emergency — sized to the opening.' },
  { id: 'glass', code: 'GL', name: 'View glass', d: 'Vision panels in doors and walls, single or double glazed, so the room stays in sight.' },
  { id: 'partition', code: 'PT', name: 'Partition & riser panels', d: 'Interior division, flush wall surfaces and riser panels with grill for service shafts.' },
  { id: 'profiles', code: 'PF', name: 'Profiles & tracks', d: 'Corners, channels, angles and C-type bottom tracks — the junctions that join it all.' },
];
/* Camera per chapter: [tilt, turn] in degrees. */
const CAM = [[-12, -54], [-26, -4], [-11, -16], [-14, 30], [-17, 42], [-28, -12]];
const INTRO_CAM = [-24, 64];
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

function Leaf({ side = 'l' }) {
  return (
    <span className={`r-leaf ${side}`}>
      <span className="r-win p-glass" />
      <span className="r-handle" />
    </span>
  );
}

function Room({ step, roomRef }) {
  return (
    <div className="room3d" data-step={step} ref={roomRef}>
      <div className="rf r-floor">
        <span className="r-track t-back" />
        <span className="r-track t-left" />
        <span className="r-track t-right" />
      </div>
      <div className="rf r-ceil" />
      <div className="rf r-back">
        <span className="r-cap" />
        <span className="r-cove" />
        <span className="r-post pl" />
        <span className="r-post pr" />
        <span className="r-door d2">
          <Leaf side="l" />
          <Leaf side="r" />
        </span>
      </div>
      <div className="rf r-left">
        <span className="r-cap" />
        <span className="sw-layer outer" />
        <span className="sw-layer core" />
        <span className="sw-layer inner" />
        <span className="r-door d1">
          <Leaf side="l" />
        </span>
      </div>
      <div className="rf r-right">
        <span className="r-cap" />
        <span className="r-pwin" />
        <span className="r-riser" />
      </div>
      {ANAT.map((a) => (
        <span className={`r-tag t-${a.id}`} key={a.id}>
          <i />
          <b>{a.code}</b>
          {a.name}
        </span>
      ))}
    </div>
  );
}

export function SystemAnatomy() {
  const ref = useRef(null);
  const stageRef = useRef(null);
  const roomRef = useRef(null);
  const pinRef = useRef(null);
  const [step, setStep] = useState(0);
  useFit(stageRef, 680, 470, '--u', 1.6);
  usePointerTilt(pinRef);
  useScrollVar(ref, {
    mode: 'pin',
    steps: ANAT.length,
    onStep: setStep,
    onProgress: (p) => {
      const el = roomRef.current;
      if (!el) return;
      const n = ANAT.length;
      const rise = ease(clamp01(p / 0.07));
      const s = Math.min(n - 0.0001, p * n);
      const i = Math.floor(s);
      const t = s - i;
      const last = i === n - 1;
      const glide = last ? 0 : ease(clamp01((t - 0.72) / 0.28));
      const a = CAM[i];
      const b = CAM[Math.min(n - 1, i + 1)];
      let rx = lerp(a[0], b[0], glide);
      let ry = lerp(a[1], b[1], glide);
      rx = lerp(INTRO_CAM[0], rx, rise);
      ry = lerp(INTRO_CAM[1], ry, rise) + (p - 0.5) * 8;
      const start = i === 0 ? 0.1 : 0.04;
      const k = ease(clamp01((t - start) / 0.3)) * (last ? 1 : 1 - ease(clamp01((t - 0.62) / 0.2)));
      el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      el.style.setProperty('--rise', rise.toFixed(3));
      el.style.setProperty('--k', k.toFixed(3));
    },
  });
  const active = ANAT[step];
  return (
    <section className="anat" ref={ref} aria-label="The AKALKA system, shown as one room">
      <div className="anat-pin" ref={pinRef}>
        {/* Full-bleed stage: the room owns the whole screen, the chapter
            list floats over its left side. */}
        <figure className="anat-fig" role="img" aria-label={`A cutaway room built from AKALKA products. Showing: ${active.name}.`}>
          <div className="room-stage" ref={stageRef} aria-hidden="true">
            <Room step={active.id} roomRef={roomRef} />
          </div>
          <ol className="anat-ticks" aria-hidden="true">
            {ANAT.map((a, i) => <li key={a.id} className={i === step ? 'on' : i < step ? 'past' : ''} />)}
          </ol>
          <figcaption className="anat-cap" aria-hidden="true">
            <span className="anat-cap-code" key={active.code}>{active.code}</span>
            <span className="anat-cap-name" key={active.name}>{active.name}</span>
          </figcaption>
        </figure>
        <div className="wrap anat-grid">
          <div className="anat-side">
            <p className="meta anat-count">
              <b>{String(step + 1).padStart(2, '0')}</b> / {String(ANAT.length).padStart(2, '0')} · Scroll the room
            </p>
            <ol className="anat-list">
              {ANAT.map((a, i) => (
                <li key={a.id} className={i === step ? 'on' : i < step ? 'past' : ''}>
                  <button type="button" onClick={() => jumpTo(ref.current, (i + 0.4) / ANAT.length)} aria-current={i === step ? 'step' : undefined}>
                    <span className="meta anat-code">{a.code}</span>
                    <span className="anat-name">{a.name}</span>
                  </button>
                  <div className="anat-more">
                    <div>
                      <p className="body-sm">{a.d}</p>
                      <Link to={`/products#${a.id}`} className="link-line">
                        See the range <ArrowRight style={{ width: 14, height: 14 }} />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="anat-rail" aria-hidden="true"><span /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   2. Image expand — a framed photograph grows to full bleed while the
   headline parts around it, then the statement lands on the image.
   Transform-only (composited); the frame never re-lays out.
   ================================================================= */
export function ImageExpand({ img, left, right, kicker, children }) {
  const ref = useRef(null);
  useScrollVar(ref, { mode: 'pin' });
  return (
    <section className="xp" ref={ref} aria-label={`${left} ${right}`}>
      <div className="xp-pin">
        <div className="xp-frame">
          <img src={img.src} srcSet={srcSetFor(img.src)} sizes="100vw" alt={img.alt} loading="lazy" decoding="async" />
          <div className="xp-shade" aria-hidden="true" />
        </div>
        <h2 className="xp-words" aria-hidden="true">
          <span className="xp-l">{left}</span>
          <span className="xp-r font-hand">{right}</span>
        </h2>
        <div className="xp-copy wrap on-dark">
          <p className="meta">{kicker}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   3. Exploded builds — the product taken apart, layer by layer.
   One stage for both scenes: true CSS 3D, orthographic so it reads as
   a technical drawing. Scrolling fans the layers out along their own
   depth axis (`--e`, derived from `--p`) and the labels arrive with
   them. The visitor configures the build; only confirmed options are
   offered, and anything unconfirmed is a NeedsChip.
   ================================================================= */
function OptRow({ label, items, value, onPick, render, wide = false }) {
  return (
    <div className={`opt-row${wide ? ' wide' : ''}`}>
      <span className="meta">{label}</span>
      <div className="chips" role="group" aria-label={label}>
        {items.map((it) => {
          const key = typeof it === 'string' ? it : it.id;
          const on = value === key;
          return (
            <button key={key} type="button" className={`chip${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => onPick(key)}>
              {render ? render(it) : it}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* A slab: one face plus the two edge faces the camera can see. */
function Slab({ className, face = '', hole = false }) {
  return (
    <div className={`slab ${className}`}>
      <span className={`f f-top ${face}${hole ? ' hole' : ''}`} />
      <span className={`f f-front ${face}`} />
      <span className={`f f-side ${face}`} />
    </div>
  );
}

/* ---------- shared finish & colour ---------- */
/* Confirmed colours are White, Matt White, or as per customer
   requirement. For the last, a handful of sample shades lets the
   visitor see the system in colour — labelled as examples, never as a
   fixed colour card. */
const SKIN_COLOURS = [
  { id: 'White', sw: '#F7F7F5' },
  { id: 'Matt White', sw: '#EFEDE9' },
  { id: 'Matched to order', any: true },
];
const SHADES = [
  { id: 'Cleanroom blue', sw: '#2F63B0' },
  { id: 'Mint green', sw: '#4FA585' },
  { id: 'Signal yellow', sw: '#E9B935' },
  { id: 'Fire red', sw: '#BE2F2F' },
  { id: 'Graphite', sw: '#4A4F55' },
  { id: 'Light grey', sw: '#C5C7C8' },
];
const swatch = (c) => (<><i className={`sw-dot${c.any ? ' any' : ''}`} style={{ background: c.sw }} />{c.id}</>);

function useSkin() {
  const [colour, setColour] = useState('White');
  const [shade, setShade] = useState(SHADES[0].id);
  const col = SKIN_COLOURS.find((c) => c.id === colour);
  const sh = SHADES.find((s) => s.id === shade);
  return {
    colour, setColour, shade, setShade,
    any: !!col.any,
    hex: col.any ? sh.sw : col.sw,
    label: col.any ? `colour matched to order (shown: ${shade.toLowerCase()})` : colour,
  };
}

function ColourRows({ skin, compact = false }) {
  return (
    <>
      <OptRow label="Colour" items={SKIN_COLOURS} value={skin.colour} onPick={skin.setColour} render={swatch} wide />
      {skin.any && (
        <div className={`opt-row wide shade-row${compact ? ' compact' : ''}`}>
          <span className="meta">Sample shade</span>
          <div className="chips shade-dots" role="group" aria-label="Sample shade">
            {SHADES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`shade${skin.shade === s.id ? ' is-on' : ''}`}
                style={{ background: s.sw }}
                aria-pressed={skin.shade === s.id}
                aria-label={s.id}
                title={s.id}
                onClick={() => skin.setShade(s.id)}
              />
            ))}
          </div>
          <small>Examples only — any colour is matched to order.</small>
        </div>
      )}
    </>
  );
}

/* ---------- 3a. Sandwich panel ---------- */
const CORES = [
  { id: 'puf', label: 'PUF', name: 'PUF core', def: 'Polyurethane foam — a rigid insulation core', thick: ['50 mm', '100 mm'] },
  { id: 'rw', label: 'Rockwool', name: 'Rockwool core', def: 'Stone-wool insulation core', thick: ['50 mm', '100 mm'] },
  { id: 'hc', label: 'Honeycomb', name: 'Honeycomb core', def: 'Cellular honeycomb structure', thick: [] },
];

export function PanelExploded() {
  const ref = useRef(null);
  const stageRef = useRef(null);
  const [coreId, setCoreId] = useState('puf');
  const [thick, setThick] = useState('100 mm');
  const [finish, setFinish] = useState('Powder coated');
  const pinRef = useRef(null);
  const skin = useSkin();
  useScrollVar(ref, { mode: 'pin' });
  useFit(stageRef, 560, 600, '--fit', 1.3);
  usePointerTilt(pinRef);
  const core = CORES.find((c) => c.id === coreId);
  const t = core.thick.length ? (thick === '50 mm' ? 38 : 72) : 56;
  return (
    <section className="xpl xpl-panel" ref={ref} id="sandwich" aria-label="Inside a sandwich panel">
      <div className="xpl-pin" ref={pinRef}>
        <div className="xpl-stage" aria-hidden="true">
          <span className="scene-ghost xpl-ghost">SW</span>
          <div className="xpl-model" ref={stageRef}>
            <div className="fit3d">
              <div className={`xpl-iso${finish === 'Powder coated' ? ' powder' : ''}`} style={{ '--t': `${t}px`, '--skin': skin.hex }}>
                {/* Neighbouring panels: once the layers close up, the panel
                    is joined edge to edge into a wall. */}
                <div className="s-mate m1">
                  <Slab className="s-bot" face="skin dskin" />
                  <Slab className="s-core" face={`core core-${core.id}`} />
                  <Slab className="s-top" face="skin dskin" />
                </div>
                <div className="s-mate m2">
                  <Slab className="s-bot" face="skin dskin" />
                  <Slab className="s-core" face={`core core-${core.id}`} />
                  <Slab className="s-top" face="skin dskin" />
                </div>
                <Slab className="s-bot" face="skin dskin" />
                <Slab className="s-core" face={`core core-${core.id}`} />
                <Slab className="s-top" face="skin dskin" />
              </div>
            </div>
            <span className="xpl-lab l1"><i />Coated skin</span>
            <span className="xpl-lab l2"><i /><Term def={core.def}>{core.name}</Term></span>
            <span className="xpl-lab l3"><i />Coated skin</span>
            <span className="xpl-lab l4"><i />Joined into a wall</span>
            {core.thick.length > 0 && <span className="xpl-dim">{thick}</span>}
            <ol className="dphase sphase">
              <li className="ph1">One panel</li>
              <li className="ph2">Layer by layer</li>
              <li className="ph3">The wall</li>
            </ol>
          </div>
        </div>
        <div className="wrap xpl-grid">
          <div className="xpl-copy">
            <p className="meta xpl-kick"><b>SW</b> Sandwich panels</p>
            <Materialize>
              <h2 className="h2">Two coated skins. <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>One insulating core.</span></h2>
            </Materialize>
            <p className="lede xpl-lede">
              Double-skin wall panels in PUF or rockwool, plus rockwool and honeycomb sandwich
              types. Scroll to open one — then build it.
            </p>
            <div className="opt-grid">
              <OptRow label="Core" items={CORES} value={coreId} onPick={setCoreId} render={(c) => c.label} />
              <div className="opt-row">
                <span className="meta">Thickness</span>
                {core.thick.length ? (
                  <div className="chips" role="group" aria-label="Thickness">
                    {core.thick.map((th) => (
                      <button key={th} type="button" className={`chip${thick === th ? ' is-on' : ''}`} aria-pressed={thick === th} onClick={() => setThick(th)}>{th}</button>
                    ))}
                  </div>
                ) : (
                  <div className="chips"><NeedsChip term="honeycomb sandwich panel thickness" interest="Sandwich Panels">Needs confirmation</NeedsChip></div>
                )}
              </div>
              <OptRow label="Finish" items={['Pre-powder coated', 'Powder coated']} value={finish} onPick={setFinish} />
              <ColourRows skin={skin} />
            </div>
            <Link to="/products#sandwich" className="link-line xpl-more">Full sandwich range <ArrowRight style={{ width: 14, height: 14 }} /></Link>
          </div>
          <div className="xpl-hold" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

/* ---------- 3b. Door ---------- */
/* The door tells a four-beat story on scroll: assembled in its panel
   wall → taken apart layer by layer → put back together → swung open.
   All four beats come from `--p` alone (see .xpl-door in v2.css). */
/* `code` matches the catalogue: DR-S / DR-D, DR-FS / DR-FD, DR-ES / DR-ED. */
const DOOR_TYPES = [
  { id: 'regular', label: 'Regular modular', code: 'DR-' },
  { id: 'fire', label: 'Fire rated', code: 'DR-F' },
  { id: 'emergency', label: 'Emergency', code: 'DR-E' },
];
const DOOR_CORES = [
  { id: 'Honeycomb', cls: 'hc', def: 'Cellular honeycomb core' },
  { id: 'Rockwool', cls: 'rw', def: 'Stone-wool insulation core' },
];
const GLAZING = ['Solid leaf', 'Single glazed', 'Double glazed'];

export function DoorExploded() {
  const ref = useRef(null);
  const stageRef = useRef(null);
  const [type, setType] = useState('regular');
  const [leaves, setLeaves] = useState('Single');
  const [core, setCore] = useState('Honeycomb');
  const [finish, setFinish] = useState('Powder coated');
  const [glass, setGlass] = useState('Single glazed');
  const pinRef = useRef(null);
  const skin = useSkin();
  useScrollVar(ref, { mode: 'pin' });
  useFit(stageRef, 800, 620, '--fit', 1.25);
  usePointerTilt(pinRef);
  const typ = DOOR_TYPES.find((d) => d.id === type);
  const coreDef = DOOR_CORES.find((c) => c.id === core);
  const n = leaves === 'Double' ? 2 : 1;
  const vision = glass !== 'Solid leaf';
  const panes = glass === 'Double glazed' ? 2 : vision ? 1 : 0;
  /* The enquiry form reads this back, so a configured door never has
     to be described twice. */
  useEffect(() => {
    try {
      window.localStorage.setItem('akalka-door-config', JSON.stringify({ type: typ.label, leaves, core, finish, colour: skin.label, glass }));
    } catch {
      /* private mode — the form simply arrives without a preset */
    }
  }, [typ, leaves, core, finish, skin.label, glass]);
  return (
    <section className="xpl xpl-door" ref={ref} id="doors" aria-label="Inside an AKALKA door">
      <div className="xpl-pin" ref={pinRef}>
        {/* Full-bleed stage: the panel wall runs off the edge of the screen
            and dissolves under the copy; the door sits in the open left. */}
        <div className="xpl-stage" aria-hidden="true">
          <div className="xpl-model" ref={stageRef}>
            <div className="fit3d">
              <div className={`dxl-iso n${n}${finish === 'Powder coated' ? ' powder' : ''}`} style={{ '--skin': skin.hex }}>
                <div className="dwall l"><Slab className="d-wall" face="skin dskin dpanel" /></div>
                <div className="dwall r"><Slab className="d-wall" face="skin dskin dpanel" /></div>
                <div className="dwall h"><Slab className="d-wall" face="skin dskin" /></div>
                <span className="dframe" />
                <span className="dvoid" />
                {Array.from({ length: n }, (_, i) => (
                  <div className={`dleaf ${i === 0 ? 'hl' : 'hr'}`} key={i} style={{ '--li': i }}>
                    <span className="d-hinge h1" /><span className="d-hinge h2" /><span className="d-hinge h3" />
                    <Slab className="d-back" face="skin dskin" hole={vision} />
                    <Slab className="d-core" face={`core core-${coreDef.cls}`} hole={vision} />
                    {panes > 0 && <span className={`d-glass ${panes === 2 ? 'g1' : 'g0'}`} />}
                    {panes === 2 && <span className="d-glass g2" />}
                    <Slab className="d-front" face="skin dskin" hole={vision} />
                    <span className={`d-hw ${type === 'regular' ? 'lever' : 'bar'}${n === 2 && i === 1 ? ' at-l' : ''}`} />
                  </div>
                ))}
              </div>
            </div>
            <span className="xpl-lab dl1"><i />Coated skin</span>
            {vision && <span className="xpl-lab dl2"><i />{panes === 2 ? 'Double glazing' : 'View glass'}</span>}
            <span className="xpl-lab dl3"><i /><Term def={coreDef.def}>{core} core</Term></span>
            <span className="xpl-lab dl4"><i />Coated skin</span>
            <span className="xpl-lab dl5"><i />Panel wall, same finish</span>
            <ol className="dphase">
              <li className="ph1">Assembled</li>
              <li className="ph2">Layer by layer</li>
              <li className="ph3">In use</li>
            </ol>
          </div>
        </div>
        <div className="wrap xpl-grid">
          <div className="xpl-hold" aria-hidden="true" />
          <div className="xpl-copy">
            <p className="meta xpl-kick"><b>DR</b> Doors</p>
            <Materialize>
              <h2 className="h2">Built like the walls <span className="font-hand" style={{ color: 'var(--datum-ink)' }}>around them.</span></h2>
            </Materialize>
            <p className="lede xpl-lede">Skin, core, glass, skin — set into a panel wall in the same finish. Scroll to take it apart and swing it open.</p>
            <div className="opt-grid">
              <OptRow label="Type" items={DOOR_TYPES} value={type} onPick={setType} render={(d) => d.label} wide />
              <OptRow label="Leaves" items={['Single', 'Double']} value={leaves} onPick={setLeaves} />
              <OptRow label="Core" items={DOOR_CORES} value={core} onPick={setCore} render={(c) => c.id} />
              <OptRow label="Vision" items={GLAZING} value={glass} onPick={setGlass} wide />
              <OptRow label="Finish" items={['Pre-powder coated', 'Powder coated']} value={finish} onPick={setFinish} wide />
              <ColourRows skin={skin} compact />
            </div>
            <div className="door-sum">
              <p>
                <span className="meta">{typ.code}{n === 2 ? 'D' : 'S'}</span>
                <span className="sum-text">
                  {typ.label} · {leaves} · {core} core · {glass} · {finish} · {skin.any ? 'colour matched to order' : skin.colour} · size as per requirement
                </span>
                <span className="sum-short">Size as per requirement</span>
              </p>
              {type === 'fire' && <NeedsChip term="fire rating duration for fire rated doors" interest="Doors">Fire rating: needs confirmation</NeedsChip>}
              {type === 'emergency' && <NeedsChip term="panic bar and push hardware for emergency doors" interest="Doors">Exit hardware: needs confirmation</NeedsChip>}
            </div>
            <Link to="/products#doors" className="link-line xpl-more">Full door range <ArrowRight style={{ width: 14, height: 14 }} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   4. Process — how an order moves, with a rule that fills as the
   section crosses the viewport and lights each step in turn.
   ================================================================= */
const PROCESS = [
  { n: '01', t: 'Choose the range', d: 'Doors, sandwich, cleanroom, partition, glass or profiles — start from the catalogue.' },
  { n: '02', t: 'Send the sizes', d: 'Drawings, opening schedules, panel layouts or a bill of quantities.' },
  { n: '03', t: 'Confirm the specification', d: 'Variant, core, thickness, finish and colour confirmed back to you. Nothing assumed.' },
  { n: '04', t: 'Manufactured to order', d: 'Produced to the confirmed specification, as one coordinated system.' },
];

export function Process() {
  const ref = useRef(null);
  useScrollVar(ref, { mode: 'view' });
  return (
    <div className="proc" ref={ref}>
      <div className="proc-rule" aria-hidden="true"><span /></div>
      <ol className="proc-steps">
        {PROCESS.map((s, i) => (
          <li key={s.n} style={{ '--i': i }}>
            <span className="proc-dot" aria-hidden="true" />
            <span className="meta proc-n">{s.n}</span>
            <h3 className="h3">{s.t}</h3>
            <p className="body-sm">{s.d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* =================================================================
   5. Applications — a pinned horizontal run. Vertical scroll drives
   the track sideways 1:1 (the section is exactly as tall as the track
   is wide), images drift against the motion for depth, and cards lean
   with scroll velocity. Each stop names a kind of space and the AKALKA
   products that build it — purpose, not claimed projects.
   ================================================================= */
export function Applications({ items, head }) {
  const ref = useRef(null);
  const trackRef = useRef(null);
  useScrollVar(ref, { mode: 'pin', vel: true });
  useEffect(() => {
    const root = ref.current;
    const track = trackRef.current;
    if (!root || !track) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const set = () => {
      const d = Math.max(0, track.scrollWidth - window.innerWidth);
      root.style.setProperty('--dist', `${d}px`);
      root.style.height = `${d + window.innerHeight}px`;
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(track);
    window.addEventListener('resize', set);
    /* Images sit far to the right of the viewport, where native lazy
       loading would wait until they slide in and pop. Start them all
       once the section is a screen away. */
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        track.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
        near.disconnect();
      },
      { rootMargin: '100% 0px' }
    );
    near.observe(root);
    /* Keyboard users tab into cards that are translated off-screen —
       scroll the page to the point where the focused card is in view. */
    const onFocus = (e) => {
      const card = e.target.closest('.apps-card, .apps-end');
      if (!card) return;
      const dist = Math.max(0, track.scrollWidth - window.innerWidth);
      if (!dist) return;
      const want = Math.min(1, Math.max(0, (card.offsetLeft - window.innerWidth * 0.2) / dist));
      const top = root.getBoundingClientRect().top + window.scrollY;
      const y = top + want * dist;
      if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    };
    track.addEventListener('focusin', onFocus);
    return () => {
      ro.disconnect();
      near.disconnect();
      track.removeEventListener('focusin', onFocus);
      window.removeEventListener('resize', set);
    };
  }, []);
  return (
    <section className="apps" ref={ref} aria-label="Where AKALKA products are used">
      <div className="apps-pin">
        <div className="apps-track" ref={trackRef}>
          <div className="apps-intro">{head}</div>
          {items.map((it, i) => (
            <article className="apps-card" key={it.t}>
              <Link to={it.to} className="apps-ph" aria-label={`${it.t} — see the products`}>
                <img src={it.img.src} srcSet={srcSetFor(it.img.src)} sizes="(max-width: 820px) 96vw, 500px" alt={it.img.alt} loading="lazy" decoding="async" />
                <span className="apps-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              </Link>
              <div className="apps-body">
                <h3 className="h3">{it.t}</h3>
                <p className="body-sm">{it.d}</p>
                <div className="chips">
                  {it.uses.map((u) => <span key={u} className="chip">{u}</span>)}
                </div>
              </div>
            </article>
          ))}
          <div className="apps-end">
            <p className="meta">Your space here</p>
            <p className="apps-end-t">Building something <span className="font-hand">we didn’t list?</span></p>
            <Link to="/contact" className="btn btn-solid">Describe it <ArrowRight className="arr arr-r" /></Link>
          </div>
        </div>
        <div className="apps-bar" aria-hidden="true"><span /></div>
      </div>
    </section>
  );
}
