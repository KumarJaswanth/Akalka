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
      'Single and double doors manufactured to requirement, with honeycomb or rockwool cores and coated finishes matched to the panel system.',
    variants: [
      { name: 'Single Door', code: 'DR-S', note: 'Size as per requirement' },
      { name: 'Double Door', code: 'DR-D', note: 'Size as per requirement' },
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
      { name: 'Partition Panels', code: 'PT-P' },
      { name: 'Flush Wall Panels', code: 'PT-F' },
    ],
  },
  {
    id: 'profiles',
    index: '05',
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

export const FINISHES = [
  { name: 'White', swatch: '#F7F7F5', border: true, note: 'Standard coated surface' },
  { name: 'Matt White', swatch: '#EFEDE9', border: true, note: 'Low-reflectance coated surface' },
  { name: 'Pre-powder coated', swatch: '#E3E0D9', border: true, note: 'Coil-coated base material' },
  { name: 'Customer requirement', swatch: '#DCD9D2', border: true, note: 'Colour matched to order' },
];

export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];
