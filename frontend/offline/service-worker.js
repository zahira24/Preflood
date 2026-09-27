
const CACHE = 'preflood-shell-v2';
const SHELL = ['/', '/offline.html', '/css/styles.css', '/js/app.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) =>
            key.startsWith('preflood-shell-') && key !== CACHE
          )
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never cache API responses.
  if (url.pathname.startsWith('/api/')) return;

  const isAppJs = url.pathname === '/js/app.js';
  const isNavigation = event.request.mode === 'navigate';

  // Fetch the latest page and JavaScript first.
  if (isAppJs || isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE).then((cache) =>
              cache.put(event.request, copy)
            );
          }

          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);

          return cached || caches.match('/offline.html');
        })
    );

    return;
  }

  // Cache-first for other static assets.
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached ||
      fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE).then((cache) =>
            cache.put(event.request, copy)
          );
        }

        return response;
      }).catch(() => caches.match('/offline.html'))
    )
  );
});
