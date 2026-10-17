/* Central photography map.
   ------------------------------------------------------------------
   Local AKALKA product photography (public/Images/) is used for all
   door, fire-door and panel subjects. Remaining remote Pexels
   (free licence) images cover only subjects with no local equivalent
   (cleanrooms, partitions, profiles, riser vent), each checked for
   watermarks, captions and stray text. Alt text describes the photograph
   itself, never an AKALKA product. Every <img> hides gracefully
   on error.
   ------------------------------------------------------------------ */

/* Responsive sources for the remote CDNs. Pexels
   resizes on the fly via `w=`, so one URL fans out into a width ladder
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

/* Hero photograph: the AKALKA showroom (akalka-bg.webp, cut from the
   supplied PNG). `w`/`h` are its proportions: the hero lays the image out
   by hand so the drawn door can be placed on the logo wall exactly. */
export const HERO = {
  src: L('akalka-bg.webp'),
  srcSet: `${L('akalka-bg.webp')} 1983w`,
  alt: 'AKALKA showroom: coated steel doors and sandwich panels either side of the AKALKA Doors & Panels wall',
  w: 1983,
  h: 793,
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

  /* ---- AKALKA's own photographs of finished work and product ---- */
  cleanroomHall: {
    src: L('cleanroom-hall.webp'),
    alt: 'A large white cleanroom with flush panel walls, double doors, view windows and a panel ceiling with lighting cassettes',
  },
  cleanroomCorridor: {
    src: L('cleanroom-corridor.webp'),
    alt: 'A blue-white cleanroom corridor with flush panel walls, a view window, doors and a panel ceiling with lights and air diffusers',
  },
  cornerProfile: {
    src: L('aluminium-corner-profile.webp'),
    alt: 'Aluminium corner profiles running up a wall corner and along the edge of a panel ceiling',
  },
  cleanroomWhite: {
    src: L('hero-cleanroom-1920.webp'),
    alt: 'A technician pushing a trolley down a bright white corridor with glossy flush walls and a clean panel ceiling',
  },
  panelPair: {
    src: L('sandwich-panel-pair.webp'),
    alt: 'Two sandwich panels laid edge to edge, showing the double skin with the core between',
  },
  riserGrilles: {
    src: L('riser-grilles.webp'),
    alt: 'Three grilles set flush into a white cleanroom wall',
  },

  /* ---- Profiles: formed metal sections and tracks ---- */
  profiles: {
    alucoat: {
      src: P(7078491, 1200),
      alt: 'Close view of coated aluminium cladding strips catching the light',
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
    src: P(9574454, 1600),
    alt: 'Bright sterile laboratory with flush white walls, a clean ceiling grid and tiled floor',
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
  cornerSection: {
    src: P(9729590, 1400),
    alt: 'Cross-section of a coated aluminium profile held in the hands',
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
    src: P(9729573, 1600),
    alt: 'Fitting hardware into a long aluminium frame profile with a power driver',
  },
  angles: {
    src: P(9729583, 1400),
    alt: 'Hands holding a cut section of a coated aluminium frame profile',
  },
};

/* Profile thumbnails for the catalogue spec sheet, keyed by group `fig`.
   Separate from IMG.profiles so the hero journey, which reads IMG, is
   untouched. */
export const PROFILE_PHOTO = {
  corner: IMG.cornerProfile,
  formed3d: PHOTO.aluStock,
  track: PHOTO.measure,
  alucoat: IMG.profiles.alucoat,
};

