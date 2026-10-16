/* Search and sharing metadata — one source for the running app (App.jsx
   keeps <head> in step on every in-app navigation) and for the build
   (scripts/postbuild.mjs writes a real HTML file per route carrying the
   same tags, structured data and a readable text snapshot).

   Canonical URLs always point at the production domain, whichever host
   served the page (Vercel, GitHub Pages mirror, a preview), so search
   engines index exactly one copy of each page.

   Logo: intentionally absent until the final artwork is supplied. When it
   arrives, set LOGO to its absolute URL (e.g. `${SITE_URL}/logo.png`,
   square, at least 112 × 112) — the build adds it to the Organization
   structured data automatically. */
export const SITE_URL = 'https://akalka.in';
export const SITE_NAME = 'AKALKA Doors & Panels';
export const LOGO = `${SITE_URL}/Akalka-logo.svg`;

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
    description: 'Vizag-made modular, fire rated and emergency doors; PUF and rockwool panels in 50 / 100 mm; cleanroom, partition and view glass panels; profiles and tracks.',
    type: 'CollectionPage',
    crumb: 'Products',
  },
  {
    path: '/about',
    title: 'About AKALKA | Door & Panel Manufacturer, Visakhapatnam',
    description: 'AKALKA, based in Visakhapatnam, makes the openings, the surfaces and the junctions as one system — doors, panels and profiles produced to meet in finish, colour and specification.',
    type: 'AboutPage',
    crumb: 'About',
  },
  {
    path: '/contact',
    title: 'Contact AKALKA | Doors & Panels Vizag, Enquiries',
    description: 'Visakhapatnam (Vizag) doors and panels manufacturer. Send drawings, dimensions or a bill of quantities and receive a confirmed specification for AKALKA doors, panels and profiles, manufactured to order.',
    type: 'ContactPage',
    crumb: 'Contact',
  },
];

export const NOT_FOUND = {
  title: 'Page not found | AKALKA Doors & Panels',
  description: 'This page isn’t here. Browse the AKALKA catalogue of doors, panels and profiles, or start an enquiry.',
};

/* "/products/" and "/products" are the same page. */
export const normalisePath = (p) => (p.replace(/\/+$/, '') || '/');
export const routeFor = (pathname) => ROUTES.find((r) => r.path === normalisePath(pathname)) || null;
export const canonical = (path) => `${SITE_URL}${path === '/' ? '/' : path}`;
