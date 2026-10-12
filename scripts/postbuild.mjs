// Post-build: SPA fallback + static-host marker, written into whichever
// directory the build targeted (docs/ for Pages, dist/ for Vercel).
// - 404.html: identical copy of index.html so deep routes (/products,
//   /about, /contact) resolve on hosts without rewrite rules.
// - .nojekyll: serve every file exactly as built (GitHub Pages).
// - Images/: the site ships WebP only. Anything still PNG in public/Images
//   is source art or a photograph rejected on quality (watermarks, foreign
//   signage) — never referenced, so it is dropped from the deploy rather
//   than shipped as dead weight. Source art lives in assets-src/.
import { copyFileSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';

const outDir = process.env.VERCEL ? 'dist' : 'docs';

copyFileSync(`${outDir}/index.html`, `${outDir}/404.html`);
writeFileSync(`${outDir}/.nojekyll`, '');

let pruned = 0;
if (existsSync(`${outDir}/Images`)) {
  for (const f of readdirSync(`${outDir}/Images`)) {
    if (/\.png$/i.test(f)) {
      rmSync(`${outDir}/Images/${f}`);
      pruned += 1;
    }
  }
}
console.log(`postbuild: ${outDir}/404.html + ${outDir}/.nojekyll ready; ${pruned} unreferenced PNG(s) pruned`);
