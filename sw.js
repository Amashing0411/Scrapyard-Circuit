// Scrapyard Circuit offline cache. The page and its code are fetched fresh when online (so deploys show up);
// audio and images are cached the first time they play and then served from the cache.
const CACHE = 'scrapyard-v67';
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'src/sim.js', 'src/draw.js', 'src/data.js', 'src/ui.js', 'src/venues.js', 'src/audio.js', 'src/voice.js', 'src/arena.js', 'src/styles.css', 'src/road-map.css']).catch(() => {}))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate' || ['document', 'script', 'style'].includes(r.destination)) {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('./'))));
    return;
  }
  if (r.headers.has('range')) return; // let the browser stream audio ranges directly
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok && res.status === 200) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })));
});
