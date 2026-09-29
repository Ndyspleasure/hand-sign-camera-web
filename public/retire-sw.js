// Served in place of /sw.js on the old vanillate-hand-sign-camera.netlify.app
// address (see netlify.toml). A returning visitor's service worker would keep
// serving the cached app there and never reach the redirect to
// https://handsign.vanillate.id, so this worker replaces it, clears its
// caches, unregisters and reloads open tabs, which then follow the redirect.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      await self.registration.unregister()
      const tabs = await self.clients.matchAll({ type: 'window' })
      await Promise.all(tabs.map((tab) => tab.navigate(tab.url).catch(() => undefined)))
    })(),
  )
})
