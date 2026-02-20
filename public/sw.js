const CACHE_NAME = 'meditations-v3';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/timer.js',
  '/sounds/bell.wav',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32x32.png',
  '/icons/android-chrome-192x192.png',
  '/icons/favicon-16x16.png',
  '/icons/safari-pinned-tab.svg',
  '/favicon.ico',
];

const STATIC_DESTINATIONS = ['style', 'script', 'worker', 'image', 'font', 'audio'];

function isCacheableResponse(response) {
  return response && response.ok && (response.type === 'basic' || response.type === 'default');
}

function isStaticAssetRequest(request, pathname) {
  if (STATIC_DESTINATIONS.includes(request.destination)) {
    return true;
  }

  return pathname === '/manifest.webmanifest' || pathname.startsWith('/_next/static/');
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (isCacheableResponse(networkResponse)) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const fallback = await cache.match('/');
    if (fallback) {
      return fallback;
    }

    return new Response('Offline and no cached page available.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (isCacheableResponse(networkResponse)) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return new Response('Offline and requested asset is not cached.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== CACHE_NAME) {
          return caches.delete(cacheName);
        }
        return Promise.resolve();
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAssetRequest(request, url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});
