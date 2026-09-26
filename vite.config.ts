import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',  // ← CHANGED: Let vite-plugin-pwa generate SW automatically
      workbox: {
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
        name: 'Hand Sign Camera Vanillate',
        short_name: 'HSC Vanillate',
        description: 'AI-powered hand gesture camera with real-time visual effects',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        scope: '/',
        start_url: '/'
      },
    })
  ],
  server: {
    port: 3000,
    https: true // Geolocation + camera requires HTTPS (even localhost can use self-signed)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false
  }
})
