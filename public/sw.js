const CACHE_NAME = 'expensetrack-v2'
const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET requests, Supabase API calls, and page navigations
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/_next/data') ||
    url.hostname.includes('supabase') ||
    event.request.mode === 'navigate'
  ) {
    return
  }

  // Cache static assets (images, fonts, scripts, css)
  if (
    event.request.destination === 'image' ||
    event.request.destination === 'font' ||
    event.request.destination === 'style' ||
    event.request.destination === 'script'
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            if (response.ok && response.type === 'basic') {
              const responseClone = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone))
            }
            return response
          })
        )
      })
    )
  }
})
