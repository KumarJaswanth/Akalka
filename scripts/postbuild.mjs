// Post-build, written into whichever directory the build targeted
// (docs/ for Pages, dist/ for Vercel).
//
// Search:
// - One real HTML file per route (/, /products/, /about/, /contact/), each
//   with its own <title>, description, canonical, sharing tags, JSON-LD
//   structured data and a readable text snapshot of the page inside #root.
//   Crawlers and link previews get the page without running any script;
//   the app replaces the snapshot the moment it starts. Visitors without
//   JavaScript are shown the snapshot instead of an empty screen.
// - sitemap.xml and robots.txt for the production domain.
// - 404.html: the app shell for unknown addresses, marked noindex.
//
// Hosting:
// - .nojekyll: serve every file exactly as built (GitHub Pages).
// - Images/: the site ships WebP only. Anything still PNG in public/Images
//   is source art or a photograph rejected on quality — never referenced,
//   so it is dropped from the deploy rather than shipped as dead weight.
import { mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { ROUTES, NOT_FOUND, SITE_URL, SITE_NAME, LOGO, LOGO_SIZE, WORDMARK, OG_IMAGE, PAGE_IMAGES, LOCATION, canonical } from '../src/data/seo.js';
import { CATEGORIES, PANEL_CORES, WALL_THICKNESSES } from '../src/data/products.js';
import { FAQ } from '../src/data/faq.js';
import { CONTACT, telHref, waHref } from '../src/data/company.js';
import { PROCESS, PRINCIPLES, PILLARS } from '../src/data/story.js';

const outDir = process.env.VERCEL ? 'dist' : 'docs';
const shell = readFileSync(`${outDir}/index.html`, 'utf8');
const today = new Date().toISOString().slice(0, 10);
/* The base the app was built for ("/" or "/Akalka/"), read from the shell's
   own asset URLs, so snapshot links work on whichever host serves them. */
const BASE = (shell.match(/src="([^"]*?)assets\//) || [, '/'])[1];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* The Products page tells the catalogue in three chapters. The data file
   still lists six families (the Home page counts them), so the chapters are
   gathered from it here, the same way the page does. */
const byId = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const names = (list) => list.map((i) => i.name);
const CHAPTERS = [
  { id: 'doors', name: 'Doors', summary: byId.doors.description },
  {
    id: 'panels',
    name: 'Panels',
    summary: `Wall, ceiling and view glass panels: ${[...names(byId.sandwich.panels), ...names(byId.cleanroom.items), ...names(byId.partition.items), ...names(byId.glass.items)].filter((n, i, a) => a.indexOf(n) === i).join(', ')}.`,
  },
  { id: 'profiles', name: 'Profiles & Tracks', summary: byId.profiles.description },
];

/* ---------- structured data ---------- */
const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

function organization() {
  const org = {
    '@type': ['Organization', 'LocalBusiness'],
    '@id': ORG_ID,
    name: SITE_NAME,
    alternateName: ['AKALKA', 'Akalka Doors and Panels Vizag'],
    url: `${SITE_URL}/`,
    slogan: 'Crafted with care',
    description: 'Manufacturer of doors, sandwich panels, cleanroom panels, partition and view glass panels, and the profiles that join them, based in Visakhapatnam (Vizag), Andhra Pradesh.',
    knowsAbout: CATEGORIES.map((c) => c.name),
    image: [OG_IMAGE.url, WORDMARK.url],
    address: {
      '@type': 'PostalAddress',
      ...(CONTACT.street ? { streetAddress: CONTACT.street } : {}),
      addressLocality: LOCATION.city,
      addressRegion: LOCATION.region,
      addressCountry: LOCATION.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: LOCATION.lat, longitude: LOCATION.lng },
    areaServed: LOCATION.serves.map((n) => ({ '@type': /Pradesh|Odisha|Telangana/.test(n) ? 'AdministrativeArea' : 'City', name: n })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'AKALKA product range',
      itemListElement: CATEGORIES.map((c) => ({ '@type': 'Offer', itemOffered: { '@type': 'Product', name: c.name, description: c.description, brand: { '@type': 'Brand', name: 'AKALKA' } } })),
    },
  };
  if (CONTACT.phone) org.telephone = CONTACT.phone;
  if (CONTACT.email) org.email = CONTACT.email;
  if (CONTACT.phone || CONTACT.email) {
    org.contactPoint = [{
      '@type': 'ContactPoint',
      contactType: 'sales',
      areaServed: 'IN',
      ...(CONTACT.phone ? { telephone: CONTACT.phone } : {}),
      ...(CONTACT.email ? { email: CONTACT.email } : {}),
    }];
  }
  /* The square "a" mark — the same artwork as the favicon — is the logo. */
  if (LOGO) org.logo = { '@type': 'ImageObject', '@id': `${SITE_URL}/#logo`, url: LOGO, contentUrl: LOGO, width: LOGO_SIZE, height: LOGO_SIZE, caption: `${SITE_NAME} logo` };
  return org;
}

function graph(route) {
  const url = canonical(route.path);
  const page = {
    '@type': route.type,
    '@id': `${url}#webpage`,
    url,
    name: route.title,
    description: route.description,
    inLanguage: 'en-IN',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    primaryImageOfPage: { '@type': 'ImageObject', url: OG_IMAGE.url, width: OG_IMAGE.w, height: OG_IMAGE.h },
  };
  const items = [
    organization(),
    { '@type': 'WebSite', '@id': SITE_ID, url: `${SITE_URL}/`, name: SITE_NAME, inLanguage: 'en-IN', publisher: { '@id': ORG_ID } },
    page,
  ];
  if (route.path !== '/') {
    page.breadcrumb = { '@id': `${url}#breadcrumb` };
    items.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: route.crumb, item: url },
      ],
    });
  }
  if (route.path === '/products') {
    page.mainEntity = {
      '@type': 'ItemList',
      name: 'AKALKA product range',
      numberOfItems: CHAPTERS.length,
      itemListElement: CHAPTERS.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        description: c.summary,
        url: `${url}#${c.id}`,
      })),
    };
  }
  if (route.path === '/contact') {
    items.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': items };
}

/* ---------- head ---------- */
function head(meta, url, ld) {
  const t = esc(meta.title);
  const d = esc(meta.description);
  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta name="robots" content="${url ? 'index, follow, max-image-preview:large' : 'noindex, follow'}" />`,
    url ? `<link rel="canonical" href="${url}" />` : '',
    url ? `<link rel="alternate" hreflang="en-IN" href="${url}" />` : '',
    url ? `<link rel="alternate" hreflang="x-default" href="${url}" />` : '',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${url || `${SITE_URL}/`}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    // `<` is escaped so the JSON can never close its own script tag.
    ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n    ');
}

/* ---------- readable snapshot ---------- */
const nav = () => `<nav aria-label="Site"><a href="${BASE}">Home</a> · <a href="${BASE}products/">Products</a> · <a href="${BASE}about/">About</a> · <a href="${BASE}contact/">Contact</a></nav>`;

const BODIES = {
  '/': () => `
    <h1>Engineered surfaces. Precise interiors.</h1>
    <p>AKALKA Doors &amp; Panels — doors and panels manufacturers in Visakhapatnam (Vizag), Andhra Pradesh, supplying Vizag, Anakapalle, Vizianagaram, Srikakulam, Rajahmundry, Kakinada and beyond.</p>
    <p>Doors, sandwich panels, cleanroom panels, partition systems, view glass and the profiles that join them — one coordinated manufacturing system.</p>
    <p>AKALKA manufactures doors, panels and profiles for clean, finished interiors — designed as one system, made to your sizes.</p>
    ${CHAPTERS.map((c) => `<section><h2>${esc(c.name)}</h2><p>${esc(c.summary)}</p><p><a href="${BASE}products/#${c.id}">${esc(c.name)} in the catalogue</a></p></section>`).join('')}
    <h2>Have a requirement? Send the sizes.</h2>
    <p>Doors, panels and profiles are manufactured to order. Share drawings, dimensions or a bill of quantities and receive a confirmed specification. <a href="${BASE}contact/">Start an enquiry</a>.</p>`,
  '/products': () => {
    const list = (items) => `<ul>${items.map((e) => `<li>${esc(e.name)}${e.note ? ` — ${esc(e.note)}` : ''}</li>`).join('')}</ul>`;
    const d = byId.doors;
    const sw = byId.sandwich;
    return `
    <h1>Three families. One language.</h1>
    <p>A room is built in three moves: the doors you pass through, the panels that make its walls, ceiling and glass, and the profiles and tracks that join it all.</p>
    <section id="doors">
      <h2>Doors, configured to requirement</h2>
      <p>${esc(d.description)}</p>
      <h3>Variants</h3>${list(d.variants)}
      <p>Types: ${esc(d.types.join(', '))}. Cores: ${esc(d.cores.join(', '))}. Finishes: ${esc(d.finishes.join(', '))}. Colours: ${esc(d.colours.join(', '))}. Made to your opening size.</p>
    </section>
    <section id="panels">
      <h2>Panels: wall, ceiling and glass</h2>
      <h3>Wall panels</h3>
      <p>${esc(sw.description)} Double-skin wall panels come in 50 mm and 100 mm thicknesses.</p>
      ${list(sw.panels)}
      <p>Finishes: ${esc(sw.finishes.join(', '))}. Colours: ${esc(sw.colours.join(', '))}.</p>
      <h3>Partition panels</h3>${list(byId.partition.items)}
      <h3>Cleanroom and ceiling panels</h3><p>${esc(byId.cleanroom.description)}</p>${list(byId.cleanroom.items)}
      <h3>View glass panels</h3>${list(byId.glass.items)}<p>${esc(byId.glass.options.join(', '))}.</p>
    </section>
    <section id="profiles">
      <h2>Profiles and tracks</h2>
      <p>${esc(byId.profiles.description)}</p>
      <ul>${byId.profiles.groups.map((g) => `<li>${esc(g.name)}: ${esc(g.options.join(', '))}</li>`).join('')}</ul>
    </section>
    <p><a href="${BASE}contact/">Start an enquiry</a></p>`;
  },
  '/about': () => `
    <h1>A manufacturer, defined by product.</h1>
    <p>Based in Visakhapatnam (Vizag), Andhra Pradesh.</p>
    <p>AKALKA manufactures doors, sandwich panels, cleanroom panels, partition and view glass panels — and the profiles that join them — for clean, finished interiors.</p>
    <p>At a glance: ${byId.doors.types.length} door types, ${PANEL_CORES.length} panel cores (${esc(PANEL_CORES.join(', '))}), ${WALL_THICKNESSES.length} wall thicknesses (${esc(WALL_THICKNESSES.join(' and '))}), ${byId.profiles.groups.length} profile groups.</p>
    <h2>The idea</h2>
    <p>Most interiors are assembled from parts that were never meant to meet. AKALKA makes the openings, the surfaces and the junctions as one system.</p>
    <h2>Three things, made to fit together</h2>
    ${PILLARS.map((p) => `<section><h3>${esc(p.h)} (${esc(p.k.toLowerCase())})</h3><p>${esc(p.p)}</p><p><a href="${BASE}products/#${p.id}">${esc(p.h)} in the catalogue</a></p></section>`).join('')}
    <h2>Openings, walls and junctions that read as one</h2>
    <p>Doors, panels and profiles are produced to meet, so a room reads as one continuous surface: the same coated finish, the same colours, the same confirmed specification.</p>
    <h2>Why AKALKA</h2>
    <ul>${PRINCIPLES.map((p) => `<li>${esc(p.t)}: ${esc(p.d)}</li>`).join('')}</ul>
    <h2>How we work</h2>
    <ol>${PROCESS.map((x) => `<li>${esc(x.t)}: ${esc(x.d)}</li>`).join('')}</ol>
    <p><a href="${BASE}contact/">Start an enquiry</a></p>`,
  '/contact': () => `
    <h1>Send the sizes. We confirm the rest.</h1>
    <p>AKALKA Doors &amp; Panels, Visakhapatnam (Vizag), Andhra Pradesh.</p>
    <p>Doors, panels and profiles are manufactured to order. Share drawings, dimensions or a bill of quantities and receive a confirmed specification.</p>
    ${CONTACT.email || CONTACT.phone || CONTACT.whatsapp ? `<h2>Reach us directly</h2><ul>${[
      CONTACT.email && `<li>Email: <a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a></li>`,
      CONTACT.phone && `<li>Mobile: <a href="${esc(telHref(CONTACT.phone))}">${esc(CONTACT.phone)}</a></li>`,
      CONTACT.whatsapp && `<li>WhatsApp: <a href="${esc(waHref(CONTACT.whatsapp))}">${esc(CONTACT.whatsapp)}</a></li>`,
      CONTACT.address && `<li>Location: ${esc(CONTACT.address)}</li>`,
    ].filter(Boolean).join('')}</ul>` : ''}
    <h2>Questions, answered straight.</h2>
    <dl>${FAQ.map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join('')}</dl>`,
};

/* Behind the boot screen for script-running visitors; shown in its place
   when scripts are off. */
const SNAP_CSS = `<noscript><style>#boot-shell{display:none}.seo-snap{max-width:72ch;margin:0 auto;padding:48px 20px;font:16px/1.65 system-ui,sans-serif;color:#42474d}.seo-snap h1{font-size:2rem;line-height:1.2}.seo-snap a{color:#577a00}</style></noscript>`;
const snapshot = (body) => `<div class="seo-snap">${nav()}${body}<p>© ${new Date().getFullYear()} ${esc(SITE_NAME)} · Crafted with care</p></div>`;

function page(meta, url, ld, body) {
  let html = shell.replace(/<!--seo[\s\S]*?<!--\/seo-->/, head(meta, url, ld));
  if (body) {
    html = html.replace('</head>', `  ${SNAP_CSS}\n  </head>`);
    html = html.replace(/(<div id="root">[\s\S]*?<div id="boot-shell">[\s\S]*?<\/noscript>\s*<\/div>)/, `$1\n      ${snapshot(body)}`);
  }
  return html;
}

if (!/<!--seo[\s\S]*?<!--\/seo-->/.test(shell)) throw new Error('postbuild: <!--seo--> block missing from index.html');

for (const r of ROUTES) {
  const html = page(r, canonical(r.path), graph(r), BODIES[r.path]());
  const dir = r.path === '/' ? outDir : `${outDir}${r.path}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, html);
}
writeFileSync(`${outDir}/404.html`, page(NOT_FOUND, null, null, null));
writeFileSync(`${outDir}/.nojekyll`, '');

const imageTags = (path) => (PAGE_IMAGES[path] || []).map((i) => `
    <image:image>
      <image:loc>${esc(i.loc)}</image:loc>
      <image:caption>${esc(i.caption)}</image:caption>
    </image:image>`).join('');

writeFileSync(
  `${outDir}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${ROUTES.map((r) => `  <url>
    <loc>${canonical(r.path)}</loc>
    <lastmod>${today}</lastmod>${imageTags(r.path)}
  </url>`).join('\n')}
</urlset>
`
);

/* Web app manifest: names the site, its colours and its icons for browsers,
   home screens and install prompts. The paths follow the base the app was
   built for, so they work on every host. */
writeFileSync(
  `${outDir}/site.webmanifest`,
  JSON.stringify(
    {
      name: SITE_NAME,
      short_name: 'AKALKA',
      description: 'Doors, panels and profiles made in Visakhapatnam, to your sizes.',
      lang: 'en-IN',
      start_url: BASE,
      scope: BASE,
      display: 'standalone',
      background_color: '#fafaf8',
      theme_color: '#2b3036',
      categories: ['business', 'manufacturing'],
      icons: [
        { src: `${BASE}favicon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: `${BASE}favicon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: `${BASE}akalka-symbol.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      ],
    },
    null,
    2
  ) + '\n'
);
writeFileSync(`${outDir}/robots.txt`, `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

let pruned = 0;
if (existsSync(`${outDir}/Images`)) {
  for (const f of readdirSync(`${outDir}/Images`)) {
    if (/\.png$/i.test(f)) {
      rmSync(`${outDir}/Images/${f}`);
      pruned += 1;
    }
  }
}
console.log(`postbuild: ${ROUTES.length} route pages, 404, sitemap.xml (with images), site.webmanifest, robots.txt in ${outDir}/; ${pruned} unreferenced PNG(s) pruned`);
