/* Once Upon A Time — Service Worker
   Strategy:
   - Precache the app shell + offline fallback.
   - Same-origin GET: stale-while-revalidate.
   - Cross-origin or non-GET: network-only.
   - Navigation requests that fail offline → fall back to offline.html.
   Increment CACHE_VERSION on every deploy that ships changed assets.
   Uses relative paths so this works under both GitHub Pages (/Once-Upon-A-Time/)
   and a custom Shopify-hosted root. */

const CACHE_VERSION = 'v2.2026.04.30-recommendations-pdf';
const SHELL_CACHE = `ouat-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `ouat-runtime-${CACHE_VERSION}`;

// Resolve all shell URLs relative to the SW's own scope.
const SCOPE = new URL(self.registration ? self.registration.scope : './', self.location).pathname;

const SHELL_ASSETS = [
  '',                       // scope index → index.html
  'index.html',
  'offline.html',
  'once-upon-a-time-assets/styles/design-system.css',
  'once-upon-a-time-assets/styles/components.css',
  'once-upon-a-time-assets/phosphor/style.css',
  'once-upon-a-time-assets/mock-system.js',
  'once-upon-a-time-assets/fonts/Voltra-Normal.ttf',
  'once-upon-a-time-assets/fonts/Chivo-Variable.ttf',
  'once-upon-a-time-assets/logo/full-icon.png',
  'once-upon-a-time-assets/favicon/favicon-32.png'
].map((p) => new URL(p, self.location).toString());

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.all(SHELL_ASSETS.map((url) =>
        cache.add(url).catch(() => { /* tolerate missing assets */ })
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const offline = await caches.match(new URL('offline.html', self.location).toString());
          return offline || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
