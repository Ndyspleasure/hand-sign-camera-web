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
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/npm\/@mediapipe/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mediapipe-wasm',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 365 } // 1 year
            }
          },
          {
            urlPattern: /.*\.task$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'models',
              expiration: { maxEntries: 10 }
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
