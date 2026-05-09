const CACHE = 'athleteos-v2'; // bump version to force refresh
const ASSETS = [
  '/athleteos/',
  '/athleteos/index.html',
  '/athleteos/manifest.json',
  '/athleteos/icon-192.png',
  '/athleteos/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('pollinations.ai') ||
      e.request.url.includes('openfoodfacts') ||
      e.request.url.includes('fonts.g')) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('/athleteos/index.html')));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(c => c || fetch(e.request).then(r => {
      const cl = r.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, cl));
      return r;
    }))
  );
});
