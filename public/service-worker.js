// public/service-worker.js - PWA Service Worker for G&G Recipe App
/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'gg-recipes-v1';
const IMAGE_CACHE = 'gg-images-v1';

// Install event - skip waiting
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

// Activate event - claim clients immediately
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Chrome extension requests and dev server websocket
  if (url.protocol === 'chrome-extension:' || url.pathname === '/ws') return;

  // Skip cross-origin requests except for images
  if (url.origin !== self.location.origin && !request.destination === 'image') return;

  // Handle Firebase/API requests - network only
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('googleapis') ||
      url.hostname.includes('openai') ||
      url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return offline response for API failures
        return new Response(
          JSON.stringify({ error: 'You appear to be offline' }),
          { 
            status: 503,
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      })
    );
    return;
  }

  // Handle image requests - cache first
  if (request.destination === 'image' || 
      request.url.includes('unsplash') || 
      request.url.includes('images')) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(request).then((response) => {
          // Only cache successful image responses
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          // Return a placeholder for failed image loads
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // Handle app requests - network first, fallback to cache
  event.respondWith(
    fetch(request).then((response) => {
      // Only cache successful responses from our origin
      if (response && response.status === 200 && response.type === 'basic') {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Don't cache the service worker itself
          if (!request.url.includes('service-worker.js')) {
            cache.put(request, responseToCache);
          }
        });
      }
      return response;
    }).catch(() => {
      // Try cache for offline support
      return caches.match(request).then((response) => {
        if (response) {
          return response;
        }

        // For navigation requests, return the cached index.html
        if (request.mode === 'navigate') {
          return caches.match('/').then((indexResponse) => {
            if (indexResponse) {
              return indexResponse;
            }
            // Final fallback
            return new Response(
              '<h1>Offline</h1><p>Please check your internet connection.</p>',
              { 
                status: 503,
                headers: { 'Content-Type': 'text/html' } 
              }
            );
          });
        }

        // Generic offline response
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Message event - handle skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Optional: Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-recipes') {
    event.waitUntil(
      // Implement sync logic here if needed
      Promise.resolve()
    );
  }
});