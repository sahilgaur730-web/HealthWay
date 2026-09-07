/**
 * HealthWay Service Worker - Low-Connectivity & Offline PWA
 * Government of Maharashtra - Department of Public Health
 * Strictly zero unicode emojis.
 */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `healthway-static-${CACHE_VERSION}`;
const API_CACHE = `healthway-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `healthway-images-${CACHE_VERSION}`;

// Static shell assets to cache on install
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.png',
  '/logo.png'
];

// Critical API endpoints to pre-cache / cache with stale-while-revalidate
const API_CACHE_URLS = [
  '/api/medicines',
  '/api/medicines/stock',
  '/api/dashboard/district',
  '/api/referrals',
  '/api/diagnostics'
];

// Install Event - Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_FILES).catch((err) => {
          console.warn('[ServiceWorker] Static cache addAll partial error:', err);
        });
      }),
      caches.open(API_CACHE).then((cache) => {
        return Promise.all(
          API_CACHE_URLS.map((url) =>
            fetch(url)
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch(() => {
                // Ignore network failure during pre-cache
              })
          )
        );
      })
    ])
  );
  self.skipWaiting();
});

// Activate Event - Clean up obsolete caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Multi-tier caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (handled by IndexedDB sync queue)
  if (request.method !== 'GET') return;

  // Only handle same-origin or explicit assets
  if (!url.origin.includes(self.location.origin) && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // Strategy 1: Cache First for static assets, scripts, stylesheets, fonts, and images
  if (
    request.url.includes('/assets/') ||
    request.url.includes('.css') ||
    request.url.includes('.js') ||
    request.url.includes('.png') ||
    request.url.includes('.jpg') ||
    request.url.includes('.svg') ||
    request.url.includes('.ico') ||
    request.url.includes('fonts.gstatic.com') ||
    request.url.includes('fonts.googleapis.com')
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Strategy 2: Stale-While-Revalidate for API endpoints
  if (request.url.includes('/api/')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // Strategy 3: Network-First with offline fallback for HTML navigation
  if (request.headers.get('accept')?.includes('text/html') || request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }
});

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Network error and asset not cached', { status: 503 });
  }
}

// Stale-While-Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        // Notify open tabs that fresh data has arrived
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'DATA_UPDATED',
              url: request.url,
              timestamp: new Date().toISOString()
            });
          });
        });
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await networkFetch;
  if (networkResponse) {
    return networkResponse;
  }

  return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
    headers: { 'Content-Type': 'application/json' },
    status: 503
  });
}

// Network-First with Offline Fallback
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Offline - please reconnect to internet.', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Background Sync Listener
self.addEventListener('sync', (event) => {
  if (
    event.tag === 'sync-healthway-data' ||
    event.tag === 'sync-health-data' ||
    event.tag === 'sync-triage' ||
    event.tag === 'sync-records'
  ) {
    event.waitUntil(notifyClientsToSync());
  }
});

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'TRIGGER_BACKGROUND_SYNC',
      timestamp: new Date().toISOString()
    });
  });
}

// Push Notifications Listener
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'HealthWay Maharashtra', {
        body: data.body || 'New operational update received.',
        icon: '/logo.png',
        badge: '/favicon.png',
        data: data.data || {},
        actions: [
          { action: 'view', title: 'View Update' },
          { action: 'dismiss', title: 'Dismiss' }
        ],
        vibrate: data.urgent ? [200, 100, 200, 100, 200] : [200]
      })
    );
  } catch (err) {
    console.warn('[ServiceWorker] Push notification error:', err);
  }
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return self.clients.openWindow(event.notification.data?.url || '/');
      })
    );
  }
});
