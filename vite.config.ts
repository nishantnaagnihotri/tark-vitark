import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // public/manifest.json is the single source of truth for the PWA manifest.
      // Disable plugin-generated manifest to avoid duplication.
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)([\\/]|$)/.test(id)) {
            return 'vendor';
          }
        }
      }
    }
  }
});
