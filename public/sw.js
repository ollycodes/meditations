const CACHE_NAME = 'meditations-v1';

const urlsToCache = [
  '/',
  '/manifest.webmanifest',
  '/global.css',
  '/timer.js',
  'sounds/bell.wav',
  'icons/apple-touch-icon.png',
  'icons/favicon-32x32.png',
  'icons/android-chrome-192x192.png',
  'icons/favicon-16x16.png',
  'icons/safari-pinned-tab.svg',
];

self.addEventListener('install', (event) => {
  console.log('caching files...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('cache opened.')
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
