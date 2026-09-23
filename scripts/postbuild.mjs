// Post-build for branch-published GitHub Pages (master:/docs):
// - 404.html: identical copy of index.html so deep routes (/products,
//   /about, /contact) resolve instead of showing a Pages 404.
// - .nojekyll: serve every file exactly as built.
import { copyFileSync, writeFileSync } from 'node:fs';

copyFileSync('docs/index.html', 'docs/404.html');
writeFileSync('docs/.nojekyll', '');
console.log('postbuild: docs/404.html + docs/.nojekyll ready');
