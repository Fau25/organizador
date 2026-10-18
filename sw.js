/* Mi Día · service worker
 * Guarda la app en el móvil para que abra al instante y funcione sin conexión.
 * Cuando subas cambios, sube también este número para que el móvil se actualice. */
const VERSION = 'mi-dia-v42';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google (script de sincronización y calendario): siempre en directo, nunca en caché
  if (url.hostname.endsWith('google.com') || url.hostname.endsWith('googleusercontent.com')) return;

  // La propia app: primero la red (para coger cambios), si no hay conexión, la copia guardada
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Tipografías de Google Fonts: copia guardada primero
  if (url.hostname.includes('fonts.g')) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
      }))
    );
  }
});
