import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // ── Base path ─────────────────────────────────────────────────────────────
  // CRITICAL: must match the Nginx location block and React Router basename.
  // All asset paths in the built output will be prefixed with /yortech/
  // e.g. /yortech/assets/index-abc123.js
  base: '/yortech/',

  // ── Dev server ────────────────────────────────────────────────────────────
  server: {
    port: 5173,

    // Proxy API calls to the Express backend during development.
    // In dev, requests to /api/* are forwarded to localhost:3001
    // so you don't need CORS headers or run both servers on the same port.
    proxy: {
      '/api': {
        target:       'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  // ── Build output ──────────────────────────────────────────────────────────
  build: {
    outDir:    'dist',
    sourcemap: false,      // disable in production for smaller bundle size

    rollupOptions: {
      output: {
        // Split vendor libraries into a separate chunk.
        // React and React Router don't change between deploys,
        // so browsers can cache them independently of your app code.
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
