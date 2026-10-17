/* Search and sharing metadata — one source for the running app (App.jsx
   keeps <head> in step on every in-app navigation) and for the build
   (scripts/postbuild.mjs writes a real HTML file per route carrying the
   same tags, structured data and a readable text snapshot).

   Canonical URLs always point at the production domain, whichever host
   served the page (Vercel, GitHub Pages mirror, a preview), so search
   engines index exactly one copy of each page.

   Logo: the square AKALKA "a" mark (the favicon artwork), 512 × 512. Search
   engines want a square mark for the Organization logo, so that — not the
   wide wordmark — is what the structured data names; the wordmark rides
   along as an extra image. */
export const SITE_URL = 'https://akalka.in';
export const SITE_NAME = 'AKALKA Doors & Panels';
export const LOGO = `${SITE_URL}/favicon-512.png`;
export const LOGO_SIZE = 512;
export const WORDMARK = { url: `${SITE_URL}/Akalka-logo.png`, w: 600, h: 182 };

/* Where AKALKA is based and who it serves — feeds the LocalBusiness
   structured data, the geo tags and the visible location lines. The street
   address stays out until the client supplies it (see data/company.js);
   locality alone is valid. Coordinates are the centre of Visakhapatnam. */
export const LOCATION = {
  city: 'Visakhapatnam',
  cityAlt: 'Vizag',
  region: 'Andhra Pradesh',
  country: 'IN',
  lat: 17.6868,
  lng: 83.2185,
  serves: ['Visakhapatnam', 'Anakapalle', 'Vizianagaram', 'Srikakulam', 'Rajahmundry', 'Kakinada', 'Andhra Pradesh', 'Odisha', 'Telangana'],
};
export const OG_IMAGE = { url: `${SITE_URL}/og-image.jpg`, w: 1200, h: 630, alt: 'The AKALKA showroom: coated steel doors and sandwich panels either side of the AKALKA Doors & Panels wall' };

/* Titles stay under ~60 characters and descriptions under ~160, so
   neither is cut off in results. Every claim is from the confirmed
   catalogue — nothing here says more than the site does. */
export const ROUTES = [
  {
    path: '/',
    title: 'AKALKA | Doors & Panels Manufacturers in Vizag',
    description: 'AKALKA, Visakhapatnam (Vizag): manufacturers of doors, sandwich panels, cleanroom panels, partition systems, view glass and profiles, made to your sizes.',
    type: 'WebPage',
    crumb: 'Home',
  },
  {
    path: '/products',
    title: 'Doors, Sandwich & Cleanroom Panels in Vizag | AKALKA',
    description: 'Vizag-made modular, fire rated and emergency doors; PUF and rockwool wall panels (50 / 100 mm); cleanroom, ceiling and view glass panels; profiles and tracks.',
    type: 'CollectionPage',
    crumb: 'Products',
  },
  {
    path: '/about',
    title: 'About AKALKA | Door & Panel Manufacturer, Visakhapatnam',
    description: 'AKALKA is a Visakhapatnam door and panel manufacturer. Doors, panels and profiles are made to meet in finish, colour and specification, as one system.',
    type: 'AboutPage',
    crumb: 'About',
  },
  {
    path: '/contact',
    title: 'Contact AKALKA | Doors & Panels Vizag, Enquiries',
    description: 'Visakhapatnam (Vizag) doors and panels manufacturer. Send drawings, dimensions or a bill of quantities and get a confirmed specification, made to order.',
    type: 'ContactPage',
    crumb: 'Contact',
  },
];

/* Photographs that belong to each page, for the image sitemap. Each is a
   file the site really ships; the caption says only what the picture shows. */
const img = (file, caption) => ({ loc: `${SITE_URL}/Images/${encodeURI(file)}`, caption });
export const PAGE_IMAGES = {
  '/': [
    { loc: OG_IMAGE.url, caption: OG_IMAGE.alt },
    img('akalka-bg.webp', 'Coated steel doors and wall panel samples on display either side of the AKALKA Doors & Panels wall'),
  ],
  '/products': [
    img('simple modular single door 003.webp', 'Dark blue coated steel cleanroom door with a vision panel in a panel wall'),
    img('simple modular double door 001.webp', 'Blue double cleanroom doors open along a clean corridor'),
    img('energence door 001.webp', 'Red fire rated door with push bar in a white finished room'),
    img('energence door 002.webp', 'Red double fire doors with push bars'),
    img('panel board.webp', 'Sandwich panel joint detail showing double skins and core'),
    img('panel board 002.webp', 'Finished cleanroom with flush white panels, blue doors and a blue floor'),
  ],
  '/about': [
    img('akalka-bg.webp', 'The AKALKA showroom: coated steel doors and sandwich panels either side of the logo wall'),
    img('hero-cleanroom-1920.webp', 'A bright white cleanroom corridor with glossy flush walls and a clean panel ceiling'),
    img('panel board 002.webp', 'Finished cleanroom with flush white panels, blue doors and a blue floor'),
  ],
};

export const NOT_FOUND = {
  title: 'Page not found | AKALKA Doors & Panels',
  description: 'This page isn’t here. Browse the AKALKA catalogue of doors, panels and profiles, or start an enquiry.',
};

/* "/products/" and "/products" are the same page. */
export const normalisePath = (p) => (p.replace(/\/+$/, '') || '/');
export const routeFor = (pathname) => ROUTES.find((r) => r.path === normalisePath(pathname)) || null;
export const canonical = (path) => `${SITE_URL}${path === '/' ? '/' : path}`;
