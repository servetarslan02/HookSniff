// HookSniff Service Worker — Katman 13
// Cache strategies for offline support and faster repeat visits

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `hooksniff-static-${CACHE_VERSION}`;
const PAGES_CACHE = `hooksniff-pages-${CACHE_VERSION}`;
const API_CACHE = `hooksniff-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `hooksniff-images-${CACHE_VERSION}`;

// Static assets to pre-cache on install
const PRECACHE_URLS = [
  '/offline',
  '/favicon.svg',
  '/favicon-32.png',
  '/favicon-16.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
];

// Max entries per cache (prevent unbounded growth)
const MAX_CACHE_ENTRIES = {
  [PAGES_CACHE]: 50,
  [API_CACHE]: 100,
  [IMAGE_CACHE]: 60,
};

// API paths that should NEVER be cached (auth, real-time data)
const NEVER_CACHE_API = [
  '/v1/auth/',
  '/v1/broadcasts',
  '/v1/notifications',
  '/health',
];

// Install — pre-cache critical static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        // Non-fatal: some resources might not exist yet
        console.warn('[SW] Pre-cache partial failure:', err);
      });
    })
  );
  // Activate immediately, don't wait for old SW
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, PAGES_CACHE, API_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// Fetch — route to appropriate cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except fonts/images from known CDNs)
  if (url.origin !== self.location.origin) {
    if (isStaticAsset(url)) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    }
    return;
  }

  // Route by resource type
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImage(url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (isApiRequest(url)) {
    event.respondWith(networkFirstWithTimeout(request, API_CACHE, 3000));
  } else {
    event.respondWith(networkFirstWithTimeout(request, PAGES_CACHE, 5000));
  }
});

// --- Cache Strategies ---

// Cache-first: fast for static assets that rarely change
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      await trimCache(cacheName);
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// Network-first with timeout: fresh data preferred, fallback to cache
async function networkFirstWithTimeout(request, cacheName, timeoutMs) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      await trimCache(cacheName);
    }
    return response;
  } catch {
    // Network failed or timed out — try cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // If it's a navigation request, serve offline page
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline');
      if (offlinePage) return offlinePage;
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// --- Helpers ---

function isStaticAsset(url) {
  const pathname = url.pathname;
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/_next/data/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.ttf') ||
    url.hostname !== self.location.origin && (
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')
    )
  );
}

function isImage(url) {
  const pathname = url.pathname;
  return (
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.avif') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  );
}

function isApiRequest(url) {
  const pathname = url.pathname;

  // Never cache auth or real-time endpoints
  if (NEVER_CACHE_API.some((p) => pathname.includes(p))) {
    return false;
  }

  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/v1/') ||
    pathname.startsWith('/api/health')
  );
}

async function trimCache(cacheName) {
  const maxEntries = MAX_CACHE_ENTRIES[cacheName];
  if (!maxEntries) return;

  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // Delete oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data === 'clearCaches') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});
