// Post-build: SPA fallback + static-host marker, written into whichever
// directory the build targeted (docs/ for Pages, dist/ for Vercel).
// - 404.html: identical copy of index.html so deep routes (/products,
//   /about, /contact) resolve on hosts without rewrite rules.
// - .nojekyll: serve every file exactly as built (GitHub Pages).
import { copyFileSync, writeFileSync } from 'node:fs';

const outDir = process.env.VERCEL ? 'dist' : 'docs';

copyFileSync(`${outDir}/index.html`, `${outDir}/404.html`);
writeFileSync(`${outDir}/.nojekyll`, '');
console.log(`postbuild: ${outDir}/404.html + ${outDir}/.nojekyll ready`);
