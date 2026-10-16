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
import { ROUTES, NOT_FOUND, SITE_URL, SITE_NAME, LOGO, OG_IMAGE, LOCATION, canonical } from '../src/data/seo.js';
import { CATEGORIES } from '../src/data/products.js';
import { FAQ } from '../src/data/faq.js';
import { CONTACT } from '../src/data/company.js';

const outDir = process.env.VERCEL ? 'dist' : 'docs';
const shell = readFileSync(`${outDir}/index.html`, 'utf8');
const today = new Date().toISOString().slice(0, 10);
/* The base the app was built for ("/" or "/Akalka/"), read from the shell's
   own asset URLs, so snapshot links work on whichever host serves them. */
const BASE = (shell.match(/src="([^"]*?)assets\//) || [, '/'])[1];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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
    image: OG_IMAGE.url,
    address: {
      '@type': 'PostalAddress',
      ...(CONTACT.address ? { streetAddress: CONTACT.address } : {}),
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
  if (LOGO) org.logo = { '@type': 'ImageObject', url: LOGO };
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
      numberOfItems: CATEGORIES.length,
      itemListElement: CATEGORIES.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        description: c.description,
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
const cats = (link) => CATEGORIES.map((c) => `<section><h2>${esc(c.name)}</h2><p>${esc(c.description)}</p>${link ? `<p><a href="${BASE}products/#${c.id}">${esc(c.name)} in the catalogue</a></p>` : ''}</section>`).join('');

const BODIES = {
  '/': () => `
    <h1>Engineered surfaces. Precise interiors.</h1>
    <p>AKALKA Doors &amp; Panels — doors and panels manufacturers in Visakhapatnam (Vizag), Andhra Pradesh, supplying Vizag, Anakapalle, Vizianagaram, Srikakulam, Rajahmundry, Kakinada and beyond.</p>
    <p>Doors, sandwich panels, cleanroom panels, partition systems, view glass and the profiles that join them — one coordinated manufacturing system.</p>
    <p>AKALKA manufactures doors, panels and profiles for clean, finished interiors — designed as one system, made to your sizes.</p>
    ${cats(true)}
    <h2>Have a requirement? Send the sizes.</h2>
    <p>Doors, panels and profiles are manufactured to order. Share drawings, dimensions or a bill of quantities and receive a confirmed specification. <a href="${BASE}contact/">Start an enquiry</a>.</p>`,
  '/products': () => `
    <h1>${CATEGORIES.length} systems. One language.</h1>
    <p>Doors, panels and the profiles that join them.</p>
    ${CATEGORIES.map((c) => {
      const list = c.variants || c.panels || c.items || c.groups || [];
      return `<section id="${c.id}"><h2>${esc(c.name)}</h2><p>${esc(c.tagline || '')}</p><p>${esc(c.description)}</p>${list.length ? `<ul>${list.map((e) => `<li>${esc(e.name)}</li>`).join('')}</ul>` : ''}</section>`;
    }).join('')}
    <p><a href="${BASE}contact/">Start an enquiry</a></p>`,
  '/about': () => `
    <h1>A manufacturer, defined by product.</h1>
    <p>Based in Visakhapatnam (Vizag), Andhra Pradesh.</p>
    <p>AKALKA manufactures doors, sandwich panels, cleanroom panels, partition and view glass panels — and the profiles that join them — for clean, finished interiors.</p>
    <h2>Three things, made to fit together.</h2>
    <p>Most interiors are assembled from parts that were never meant to meet. AKALKA makes the openings, the surfaces and the junctions as one system.</p>
    <h2>Openings, walls and junctions that read as one.</h2>
    <p>Doors, panels and profiles are produced to meet — the same coated finish, the same colours, the same confirmed specification — so a room reads as one continuous surface.</p>
    <h2>Why AKALKA</h2>
    <ul>
      <li>Made to meet: doors, panels and profiles come from one maker, so junctions line up in the factory instead of being improvised on site.</li>
      <li>Variation without invention: sizes and colours adapt to requirement. Anything unconfirmed is marked plainly.</li>
      <li>Finish as discipline: White, Matt White or matched colour across every element, so the whole project stays coherent.</li>
    </ul>`,
  '/contact': () => `
    <h1>Send the sizes. We confirm the rest.</h1>
    <p>AKALKA Doors &amp; Panels, Visakhapatnam (Vizag), Andhra Pradesh.</p>
    <p>Doors, panels and profiles are manufactured to order. Share drawings, dimensions or a bill of quantities and receive a confirmed specification.</p>
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

writeFileSync(
  `${outDir}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${ROUTES.map((r) => `  <url>
    <loc>${canonical(r.path)}</loc>
    <lastmod>${today}</lastmod>${r.path === '/' ? `
    <image:image><image:loc>${OG_IMAGE.url}</image:loc></image:image>` : ''}
  </url>`).join('\n')}
</urlset>
`
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
console.log(`postbuild: ${ROUTES.length} route pages, 404, sitemap.xml, robots.txt in ${outDir}/; ${pruned} unreferenced PNG(s) pruned`);
