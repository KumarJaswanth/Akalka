import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Dual-target build:
   - GitHub Pages (default): served from the /Akalka/ subpath, output
     committed to docs/ for branch publishing.
   - Vercel (VERCEL env set by their builder): served from domain root,
     output to dist/ which Vercel picks up automatically.
   Router basename + logo follow import.meta.env.BASE_URL, so both work
   with zero code changes. */
const isVercel = !!process.env.VERCEL;
const base = isVercel ? '/' : '/Akalka/';

export default defineConfig({
  base,
  plugins: [
    react(),
    {
      name: 'favicon-base',
      transformIndexHtml(html) {
        return html.replaceAll('%FAVICON_BASE%', base);
      },
    },
  ],
  build: {
    outDir: isVercel ? 'dist' : 'docs',
    assetsInlineLimit: 4096,
    cssMinify: true,
  },
});
