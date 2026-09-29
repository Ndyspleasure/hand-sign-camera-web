import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { seoPages } from './scripts/seo-plugin'

export default defineConfig({
  plugins: [
    react(),
    seoPages(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      includeManifestIcons: false,
      workbox: {
        // Only the camera app is an SPA; content pages are real pages and
        // must never be answered with the app shell.
        navigateFallback: '/camera/index.html',
        navigateFallbackAllowlist: [/^\/camera\//],
        globPatterns: ['**/*.{js,css,html,svg,ico,png,webmanifest}'],
        globIgnores: ['og/**', 'mediapipe/**', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'retire-sw.js'],
        // Cache everything, forever (app manages cache manually for model updates)
        // The 11 MB WASM binaries exceed the default precache size limit, so
        // they are cached at runtime on first use instead of being precached.
        runtimeCaching: [
          {
            // Same-origin MediaPipe WASM runtime (public/mediapipe/wasm).
            urlPattern: /\/mediapipe\/wasm\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mediapipe-wasm',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 year
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Hand-landmarker model (.task) from Google's model CDN.
            urlPattern: /.*\.task$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'models',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ],
        skipWaiting: true,
        clientsClaim: true
      },
      manifest: {
        id: '/camera/',
        name: 'Hand Sign Camera by Vanillate',
        short_name: 'Hand Sign Cam',
        description: 'Real-time hand gesture camera: 16 hand signs, each with its own live visual effect. Runs on your device.',
        lang: 'en',
        categories: ['entertainment', 'photo', 'utilities'],
        theme_color: '#071014',
        background_color: '#071014',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/camera/?source=pwa',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Gesture guide', url: '/gestures/' },
          { name: 'Demo', url: '/camera/?demo' },
        ],
      },
    })
  ],
  server: {
    // http://localhost is a secure context, so camera access works without
    // HTTPS in dev. (Vite 5 no longer auto-generates a cert for `https: true`,
    // which left the dev server serving a broken TLS endpoint.)
    port: 3000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'ES2020',
    rollupOptions: {
      input: { camera: path.resolve(__dirname, 'camera/index.html') },
    },
    minify: 'terser',
    sourcemap: false
  }
})
