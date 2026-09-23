import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  /* Project Pages live under /Akalka/ — all asset URLs are prefixed.
     Local dev keeps root base automatically. */
  base: '/Akalka/',
  plugins: [react()],
  build: {
    // Committed output: GitHub Pages publishes master:/docs directly.
    outDir: 'docs',
    assetsInlineLimit: 4096,
    cssMinify: true,
  },
});
