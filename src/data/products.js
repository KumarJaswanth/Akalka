/* ------------------------------------------------------------------
   AKALKA product catalogue — single source of truth.
   ONLY confirmed client information lives here. Anything unknown
   is rendered with a "Needs confirmation" marker by the UI.

   Numbering. Every category carries its catalogue number (`index`,
   "01" … "06") and every entry inside it is numbered from it
   ("01.1", "01.2" …) — see the end of this file. The numbers are derived
   from the order below and are what the site shows; `id` is an internal
   key and is never displayed. Reordering this file renumbers the whole
   site, so a number can never drift from the catalogue.
------------------------------------------------------------------- */

export const CATEGORIES = [
  {
    id: 'doors',
    name: 'Doors',
    tagline: 'Configured openings, built like the walls around them.',
    description:
      'Regular modular, fire rated and emergency doors in single and double configurations, with honeycomb or rockwool cores and coated finishes matched to the panel system.',
    types: ['Regular / Modular', 'Fire Rated', 'Emergency'],
    variants: [
      { id: 'regular-single', name: 'Regular Modular — Single Door', typeId: 'regular', leaves: 'Single' },
      { id: 'regular-double', name: 'Regular Modular — Double Door', typeId: 'regular', leaves: 'Double' },
      { id: 'fire-single', name: 'Fire Rated — Single Door', typeId: 'fire', leaves: 'Single' },
      { id: 'fire-double', name: 'Fire Rated — Double Door', typeId: 'fire', leaves: 'Double' },
      { id: 'emergency-single', name: 'Emergency — Single Door', typeId: 'emergency', leaves: 'Single' },
      { id: 'emergency-double', name: 'Emergency — Double Door', typeId: 'emergency', leaves: 'Double' },
    ],
    cores: ['Honeycomb', 'Rockwool'],
    finishes: ['Pre-powder coated', 'Powder coated'],
    colours: ['White', 'Matt White', 'As per customer requirement'],
  },
  {
    id: 'sandwich',
    name: 'Sandwich Panels',
    tagline: 'Double-skin wall systems in two disciplined thicknesses.',
    description:
      'PUF and rockwool double-skin wall panels, plus rockwool and honeycomb sandwich panel types, finished to match doors and profiles.',
    panels: [
      { id: 'puf-wall', name: 'PUF Double-Skin Wall Panel', thicknesses: ['50 mm', '100 mm'] },
      { id: 'rockwool-wall', name: 'Rockwool Double-Skin Wall Panel', thicknesses: ['50 mm', '100 mm'] },
      { id: 'rockwool-sandwich', name: 'Rockwool Sandwich Panel', thicknesses: [] },
      { id: 'honeycomb-sandwich', name: 'Honeycomb Sandwich Panel', thicknesses: [] },
    ],
    finishes: ['Pre-powder coated', 'Powder coated'],
    colours: ['White', 'Matt White', 'As per customer requirement'],
  },
  {
    id: 'cleanroom',
    name: 'Cleanroom Panels',
    tagline: 'Flush, washable surfaces for controlled interiors.',
    description:
      'Wall, ceiling and flush panel options for clean, controlled environments. Presented as range only until specifications are confirmed.',
    items: [
      { id: 'cleanroom-wall', name: 'Cleanroom Wall Panels' },
      { id: 'cleanroom-ceiling', name: 'Cleanroom Ceiling Panels' },
      { id: 'washable', name: 'Washable Panels' },
      { id: 'flush-wall', name: 'Flush Wall Panels' },
    ],
  },
  {
    id: 'partition',
    name: 'Partition / Wall Panels',
    tagline: 'Interior division with an architectural finish.',
    description:
      'A distinct partition range for dividing and finishing interior space, separate from the structural sandwich panel system.',
    items: [
      { id: 'partition-panel', name: 'Partition Panels', note: 'Interior division with a clean architectural finish' },
      { id: 'flush-wall', name: 'Flush Wall Panels', note: 'Flat, continuous wall surfaces — also listed in the cleanroom range' },
      { id: 'riser-panel', name: 'Riser Panel with Grill', note: 'Access panel for riser and service shafts, with grill' },
    ],
  },
  {
    id: 'glass',
    name: 'Glass Panels',
    tagline: 'Vision openings that keep the room in view.',
    description:
      'View glass panels for doors and openings, letting sightlines pass through where solid leaves are specified.',
    items: [
      { id: 'view-glass', name: 'View Glass Panel', note: 'Vision panel for doors and glazed openings' },
    ],
    options: ['Single glazing', 'Double glazing'],
    note: 'Glazing thickness, make and fire rating: needs confirmation.',
  },
  {
    id: 'profiles',
    name: 'Profiles & Accessories',
    tagline: 'The junctions, edges and tracks that complete the system.',
    description:
      'Corner, 2D, 3D, C-channel, L-angle and box-type profiles with coated, non-coated and aluminium-coated options, plus C-type bottom tracks.',
    /* `id` doubles as the key of the group's photograph (PROFILE_PHOTO). */
    groups: [
      { id: 'corner', name: 'Corner Profiles', options: ['Powder coated', 'Non-coated'] },
      { id: 'formed3d', name: 'Formed Profiles', options: ['3D profiles', '2D profiles', 'C-channel', 'L-angle', 'Box-type profiles'] },
      { id: 'alucoat', name: 'Aluminium-Coated Profiles', options: ['R-70 coating', 'R-90 coating'] },
      { id: 'track', name: 'C-Type Bottom Tracks', options: ['50 mm', '100 mm', 'Powder coated', 'Non-coated'] },
    ],
  },
];

/* ---- numbering, derived once ---- */
export const pad = (n) => String(n).padStart(2, '0');
const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
/* 6 → "Six" (capitalised; callers lower-case it mid-sentence). */
export const word = (n) => WORDS[n] ?? String(n);

/* The lists a category can hold its numbered entries in. */
const LISTS = ['variants', 'panels', 'items', 'groups'];
CATEGORIES.forEach((c, ci) => {
  c.index = pad(ci + 1);
  LISTS.forEach((k) => {
    if (c[k]) c[k].forEach((entry, ei) => { entry.no = `${c.index}.${ei + 1}`; });
  });
});

/* Facts the Home page counts. Cores and thicknesses are the confirmed
   sandwich-panel options (the honeycomb and rockwool *sandwich* types have
   no confirmed thickness yet — see the Products page). */
export const PANEL_CORES = ['PUF', 'Rockwool', 'Honeycomb'];
export const WALL_THICKNESSES = ['50 mm', '100 mm'];

export const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
export const TOTAL = CATEGORIES.length;
export const TOTAL_LABEL = pad(TOTAL);

/* Caption tag for a photograph: "Doors · 01.3", or just "Doors". */
export function tag(catId, entryId) {
  const c = CAT[catId];
  if (!entryId) return c.name;
  const e = LISTS.map((k) => c[k]).flat().find((x) => x && x.id === entryId);
  return e ? `${c.name} · ${e.no}` : c.name;
}

/* "01.4" for the door a visitor has configured: type + number of leaves. */
export function doorNo(typeId, leaves) {
  const v = CAT.doors.variants.find((d) => d.typeId === typeId && d.leaves === leaves);
  return v ? v.no : CAT.doors.index;
}

export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];
