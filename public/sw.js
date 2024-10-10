// const { request } = require("http");
const CACHE_NAME = 'meditations-v2';

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

async function addToCache(request) {
  const cacheResponse = await caches.match(request);
  if (cacheResponse) {
    return cacheResponse;
  }

  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response)
    return networkResponse;
  } catch (error) {
    console.log('network error.')
  }

  return new Response('Network error happened.', {
    status: 408,
    headers: { 'Content-Type': 'text/plain' }
  })
}

self.addEventListener('install', (event) => {
  console.log('caching files...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('cache opened.')
      return cache.addAll(urlsToCache)
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
    addToCache(event.request)
  );
});


// caches.match(event.request).then((response) => {
//   if (response) { return response; }
//   try {
//     const networkResponse = await fetch(event.request);
//     addToCache(event.request, networkResponse.clone());
//     return networkResponse;
//   } catch (error) {
//     console.log('network error.')
//   }
//
// return response || fetch(event.request);
// })
