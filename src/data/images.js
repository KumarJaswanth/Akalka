/* Central photography map.
   ------------------------------------------------------------------
   Local AKALKA product photography (public/Images/) is used for all
   door, fire-door and panel subjects. Remaining remote Unsplash/Pexels
   images cover only subjects with no local equivalent (partitions,
   glass, profiles, riser vent). Alt text describes the photograph
   itself, never an AKALKA product. Every <img> hides gracefully
   on error.
   ------------------------------------------------------------------ */

/* Responsive sources for the remote CDNs. Both Pexels and Unsplash
   resize on the fly via `w=`, so one URL fans out into a width ladder
   and the browser fetches only what the layout needs — a phone gets a
   ~480–800px file instead of the 2000px desktop original. Fixed-crop
   URLs (with `h=`) and local files are returned untouched. */
const LADDER = [480, 800, 1200, 1600, 2000];
const isCdn = (src) => /images\.(pexels|unsplash)\.com/.test(src) && !/[?&]h=/.test(src);
export function sized(src, w) {
  return isCdn(src) ? src.replace(/([?&]w=)\d+/, `$1${w}`) : src;
}
export function srcSetFor(src) {
  if (!src || !isCdn(src)) return undefined;
  const max = Number((src.match(/[?&]w=(\d+)/) || [])[1]) || 1600;
  const ws = LADDER.filter((w) => w < max);
  ws.push(max);
  return ws.map((w) => `${sized(src, w)} ${w}w`).join(', ');
}

/* Unsplash — photo-<id>, width only. */
const U = (id, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

/* Pexels — photo-<id>, width only. */
const P = (id, w = 1400) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&fit=crop`;

/* Pexels — reframed crop, for a second angle on the same subject. */
const PV = (id, w, h) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

/* Local AKALKA product photography (public/Images/).
   Filenames contain spaces — encoded once here so every consumer
   gets a valid URL under both bases (/Akalka/ for Pages, / for Vercel).
   Rejected per quality rules (never referenced):
   - "energence door 003.png" (dreamstime watermark)
   - "panel board 001.png" (WILLSON watermark)
   - "simple modular single door.png" (foreign wall plaque)
   - "simple modular single door 001.png" (large EXIT + PUSH labels) */
const L = (file) =>
  `${import.meta.env.BASE_URL}Images/${file.split(' ').join('%20')}`;

/* Hero photograph (Pexels 9574536, free licence), served locally as a
   WebP width ladder cut from the 5831px original — sharp on any screen,
   a fraction of the old PNG's weight. A small foreign-language exit sign
   above the door was retouched out of the master. `w`/`h` are the
   master's proportions: the hero lays the image out by hand so its door
   can be located exactly. */
const HERO_WIDTHS = [1280, 1920, 2560, 3200];
export const HERO = {
  src: L('hero-cleanroom-1920.webp'),
  srcSet: HERO_WIDTHS.map((w) => `${L(`hero-cleanroom-${w}.webp`)} ${w}w`).join(', '),
  alt: 'Technician wheeling a sample cart down a bright cleanroom corridor of white wall panels, a door at its end',
  w: 5831,
  h: 3887,
};

export const IMG = {

  /* ---- Doors: coated steel leaves in insulated panel construction ---- */
  doorSingle: {
    src: L('simple modular single door 003.webp'),
    alt: 'Dark blue coated steel cleanroom door with vision panel in a panel wall',
  },
  doorSingleAlt: {
    src: L('simple modular single door 002.webp'),
    alt: 'Blue, green and yellow coated steel doors showing colour options',
  },
  doorDouble: {
    src: L('simple modular double door 001.webp'),
    alt: 'Blue double cleanroom doors open along a clean corridor',
  },
  doorFire: {
    src: L('energence door 001.webp'),
    alt: 'Red fire rated door with push bar in a white finished room',
  },
  doorEmergency: {
    src: L('energence door 000.webp'),
    alt: 'Red emergency door with push bar and vision panel',
  },
  doorFireDouble: {
    src: L('energence door 002.webp'),
    alt: 'Red double fire doors with push bars, studio view',
  },

  /* ---- Panels ---- */
  panelJoint: {
    src: L('panel board.webp'),
    alt: 'Sandwich panel joint detail showing double skins and core',
  },
  cleanroomFinished: {
    src: L('panel board 002.webp'),
    alt: 'Finished cleanroom corridor with white panels and blue doors',
  },
  riserPanel: {
    src: PV(28766505, 1200, 900),
    alt: 'Louvred ventilation panel in a metal frame, set flush into a panel wall',
  },

  /* ---- Glass: view panels set into door leaves ---- */
  glass: {
    src: P(6446313, 1400),
    alt: 'Glazed door leaf with a clear view panel through to a lit room',
  },

  /* ---- Profiles: formed metal sections and tracks ---- */
  profiles: {
    alucoat: {
      src: U('1759310347407-b0dbfeb8745d', 900),
      alt: 'Profiled metal cladding sheets, close view',
    },
  },
};

/* ---- v2 photography: verified Pexels sources, chosen for scale and
   light. Each describes the photograph, never claims an AKALKA project. */
export const PHOTO = {
  cleanroomTech: {
    src: P(5118462, 1800),
    alt: 'Technician in a gown walking through a bright high-tech cleanroom',
  },
  cleanroomLab: {
    src: P(5953827, 1600),
    alt: 'Bright sterile production room with flush white walls and steel benches',
  },
  cleanroomWindow: {
    src: P(10514768, 1400),
    alt: 'Cleanroom with a flush vision window set into white wall panels',
  },
  cleanroomDoor: {
    src: P(33514502, 1400),
    alt: 'Gowned technician at a teal door in a sterile laboratory',
  },
  laser: {
    src: P(29988965, 2000),
    alt: 'Laser cutter working a steel sheet on a factory floor',
  },
  laserClose: {
    src: P(29988988, 1600),
    alt: 'Close view of a laser cutting slots into a metal sheet',
  },
  panelWall: {
    src: P(9685870, 1600),
    alt: 'Vertical coated metal wall panels with crisp joints',
  },
  steelDoorWall: {
    src: P(14029360, 1600),
    alt: 'Grey steel door set flush into a ribbed white panel wall',
  },
  glassHall: {
    src: P(8477485, 1600),
    alt: 'Corridor lined with glazed walls leading to a meeting room',
  },
  whiteHall: {
    src: P(19854741, 1600),
    alt: 'Long white corridor with dark-framed glazed doors',
  },
  measure: {
    src: P(9729566, 1600),
    alt: 'Hands measuring an aluminium profile with a tape on the workbench',
  },
  aluStock: {
    src: P(36397989, 1600),
    alt: 'Racks of aluminium and steel sections in a workshop',
  },
  angles: {
    src: P(36003962, 1400),
    alt: 'Drilled steel angle sections in low workshop light',
  },
};

/* Profile thumbnails for the catalogue spec sheet, keyed by group `fig`.
   Separate from IMG.profiles so the hero journey, which reads IMG, is
   untouched. */
export const PROFILE_PHOTO = {
  corner: PHOTO.angles,
  formed3d: PHOTO.aluStock,
  track: PHOTO.measure,
  alucoat: IMG.profiles.alucoat,
};

