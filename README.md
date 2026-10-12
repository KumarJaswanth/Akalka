# AKALKA Doors & Panels

**Crafted with care.**

AKALKA is a manufacturing company focused on one coordinated product
system: **doors, panels and the profiles that join them**. Every opening,
wall surface and junction is produced to work together — so controlled,
partitioned and professionally finished interiors read as one continuous
surface.

---

## What AKALKA Manufactures

### Doors
- **Single Doors** and **Double Doors**, sized to requirement
- Core options: Honeycomb, Rockwool
- Finishes: pre-powder coated, powder coated
- Colours: White, Matt White, or matched to customer requirement

### Sandwich Panels
- **PUF double-skin wall panels** — 50 mm and 100 mm
- **Rockwool double-skin wall panels** — 50 mm and 100 mm
- **Rockwool sandwich panels** and **Honeycomb sandwich panels**
- Finished pre-powder coated or powder coated, in White, Matt White or
  customer-matched colour

### Cleanroom Panels
- Cleanroom wall panels
- Cleanroom ceiling panels
- Washable panels
- Flush wall panels

Flush, washable surfaces for clean, controlled environments — supplied
as a confirmed range, with classifications and performance data confirmed
on enquiry.

### Partition / Wall Panels
- Partition panels for dividing interior space
- Flush wall panels for flat, continuous wall surfaces

Flush Wall Panels also appear in the cleanroom range — the same confirmed
product, specified per application.

### Profiles & Accessories
- Corner profiles — powder-coated or non-coated
- 3D profiles, 2D profiles, C-channels, L-angles and box-type profiles
- Aluminium-coated profiles — R-70 and R-90 coatings
- C-type bottom tracks — 50 mm and 100 mm, powder-coated or non-coated

---

## Finishes & Colours

Across doors, panels and profiles, AKALKA works in a disciplined palette:
**White**, **Matt White**, or colour matched to customer requirement —
so every project stays visually coherent.

---

## How Specifying Works

1. **Find the range** — doors, sandwich, cleanroom, partition or profiles.
2. **Note the options** — variant, core, thickness, finish, colour and size.
3. **Send drawings** — openings, layouts and quantities for a confirmed
   specification. Anything unconfirmed is marked plainly, never invented.

---

## Developing the site

React 19 + Vite, React Router, Lenis (smooth scroll) and Framer Motion.

```bash
npm install
npm run dev       # local development
npm run build     # production build (see Deploying)
npm run preview   # serve the production build
```

### Where things live

| What | Where |
| --- | --- |
| The catalogue (the only source of product facts) | `src/data/products.js` |
| Phone, email, address, hours — empty until supplied | `src/data/company.js` |
| Photography and the hero photograph | `src/data/images.js` |
| Hero ("Through the door") | `src/components/Hero.jsx`, `src/hero.css` |
| 3D room, door and panel scenes | `src/components/Scenes.jsx`, `src/v2.css` |
| Shared scroll engine, reveals, parallax | `src/components/Reveal.jsx` |

### Numbering

Every product is identified by number, never by letter codes. A category
carries its catalogue number (`01` Doors … `06` Profiles & Accessories) and
every entry inside it is numbered from it (`01.1` … `01.6` for the six door
variants). The numbers are **derived from the order of `products.js`** — the
Products page, the dock, the 3D room tour, captions and the Home counts all
read them — so reordering or adding to the catalogue renumbers the whole site
and a number can never drift from the data. Counts on the site ("Six
families", "Four steps") are derived the same way.

### Contact details

Nothing is invented. Fill in any field of `CONTACT` in `src/data/company.js`
and it appears on the contact page and in the footer; an empty field is not
rendered anywhere.

### Enquiries

The form validates, gives each enquiry a reference, and keeps it on the
visitor's device. To deliver enquiries to an inbox or CRM, set
`VITE_ENQUIRY_ENDPOINT` at build time to an endpoint that accepts the
submission (a form service or your own API).

### Images

`public/Images` ships WebP only (the hero photograph is a 1280–3200 px width
ladder). Original PNG art lives in `assets-src/images`; any PNG still in
`public/Images` is dropped from the deploy by the post-build step.

### Deploying

* **Vercel** — builds to `dist/`, served from the domain root.
* **GitHub Pages** — `npm run build` writes to `docs/`, served from `/Akalka/`.

Both come from the same source; the base path follows the build target.

### Performance notes

Scroll-driven scenes write each value onto the smallest element that reads
it, share one read-then-write scroll frame (flushed from the smoother's own
scroll event), and honour `prefers-reduced-motion`. The page never reloads
itself: it re-measures in place after long absences, bfcache restores, and
idle stretches.

---

*AKALKA Doors & Panels — Specify the system. We manufacture it.*
