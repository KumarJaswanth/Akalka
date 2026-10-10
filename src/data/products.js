/* ------------------------------------------------------------------
   AKALKA product catalogue — single source of truth.
   ONLY confirmed client information lives here. Anything unknown
   is rendered with a "Needs confirmation" marker by the UI.
------------------------------------------------------------------- */

export const CATEGORIES = [
  {
    id: 'doors',
    index: '01',
    name: 'Doors',
    tagline: 'Configured openings, built like the walls around them.',
    description:
      'Regular modular, fire rated and emergency doors in single and double configurations, with honeycomb or rockwool cores and coated finishes matched to the panel system.',
    types: ['Regular / Modular', 'Fire Rated', 'Emergency'],
    variants: [
      { name: 'Regular Modular — Single Door', code: 'DR-S', type: 'Regular / Modular', note: 'Size as per requirement' },
      { name: 'Regular Modular — Double Door', code: 'DR-D', type: 'Regular / Modular', note: 'Size as per requirement' },
      { name: 'Fire Rated — Single Door', code: 'DR-FS', type: 'Fire Rated', note: 'Fire rating duration: needs confirmation' },
      { name: 'Fire Rated — Double Door', code: 'DR-FD', type: 'Fire Rated', note: 'Fire rating duration: needs confirmation' },
      { name: 'Emergency — Single Door', code: 'DR-ES', type: 'Emergency', note: 'Panic bar and push hardware: needs confirmation' },
      { name: 'Emergency — Double Door', code: 'DR-ED', type: 'Emergency', note: 'Panic bar and push hardware: needs confirmation' },
    ],
    cores: ['Honeycomb', 'Rockwool'],
    finishes: ['Pre-powder coated', 'Powder coated'],
    colours: ['White', 'Matt White', 'As per customer requirement'],
    sizingNote: 'Sizes vary according to requirement. Shown as a configurable concept, not fixed dimensions.',
  },
  {
    id: 'sandwich',
    index: '02',
    name: 'Sandwich Panels',
    tagline: 'Double-skin wall systems in two disciplined thicknesses.',
    description:
      'PUF and rockwool double-skin wall panels, plus rockwool and honeycomb sandwich panel types, finished to match doors and profiles.',
    panels: [
      { name: 'PUF Double-Skin Wall Panel', thicknesses: ['50 mm', '100 mm'], code: 'SW-PUF' },
      { name: 'Rockwool Double-Skin Wall Panel', thicknesses: ['50 mm', '100 mm'], code: 'SW-RW' },
      { name: 'Rockwool Sandwich Panel', thicknesses: [], code: 'SW-RWS' },
      { name: 'Honeycomb Sandwich Panel', thicknesses: [], code: 'SW-HC' },
    ],
    finishes: ['Pre-powder coated', 'Powder coated'],
    colours: ['White', 'Matt White', 'As per customer requirement'],
  },
  {
    id: 'cleanroom',
    index: '03',
    name: 'Cleanroom Panels',
    tagline: 'Flush, washable surfaces for controlled interiors.',
    description:
      'Wall, ceiling and flush panel options for clean, controlled environments. Presented as range only until specifications are confirmed.',
    items: [
      { name: 'Cleanroom Wall Panels', code: 'CR-W' },
      { name: 'Cleanroom Ceiling Panels', code: 'CR-C' },
      { name: 'Washable Panels', code: 'CR-WS' },
      { name: 'Flush Wall Panels', code: 'CR-F' },
    ],
    note: 'Classifications, ratings and performance data: needs confirmation.',
  },
  {
    id: 'partition',
    index: '04',
    name: 'Partition / Wall Panels',
    tagline: 'Interior division with an architectural finish.',
    description:
      'A distinct partition range for dividing and finishing interior space, separate from the structural sandwich panel system.',
    items: [
      { name: 'Partition Panels', code: 'PT-P', note: 'Interior division with a clean architectural finish' },
      { name: 'Flush Wall Panels', code: 'PT-F', note: 'Flat, continuous wall surfaces — also listed in the cleanroom range' },
      { name: 'Riser Panel with Grill', code: 'PT-RP', note: 'Access panel for riser and service shafts, with grill' },
    ],
  },
  {
    id: 'glass',
    index: '05',
    name: 'Glass Panels',
    tagline: 'Vision openings that keep the room in view.',
    description:
      'View glass panels for doors and openings, letting sightlines pass through where solid leaves are specified.',
    items: [
      { name: 'View Glass Panel', code: 'GL-VG', note: 'Vision panel for doors and glazed openings' },
    ],
    options: ['Single glazing', 'Double glazing'],
    note: 'Glazing thickness, make and fire rating: needs confirmation.',
  },
  {
    id: 'profiles',
    index: '06',
    name: 'Profiles & Accessories',
    tagline: 'The junctions, edges and tracks that complete the system.',
    description:
      'Corner, 2D, 3D, C-channel, L-angle and box-type profiles with coated, non-coated and aluminium-coated options, plus C-type bottom tracks.',
    groups: [
      {
        name: 'Corner Profiles',
        options: ['Powder coated', 'Non-coated'],
        code: 'PF-CN',
        fig: 'corner',
      },
      {
        name: 'Formed Profiles',
        options: ['3D profiles', '2D profiles', 'C-channel', 'L-angle', 'Box-type profiles'],
        code: 'PF-FM',
        fig: 'formed3d',
      },
      {
        name: 'Aluminium-Coated Profiles',
        options: ['R-70 coating', 'R-90 coating'],
        code: 'PF-AL',
        fig: 'alucoat',
      },
      {
        name: 'C-Type Bottom Tracks',
        options: ['50 mm', '100 mm', 'Powder coated', 'Non-coated'],
        code: 'PF-TR',
        fig: 'track',
      },
    ],
  },
];


export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];
