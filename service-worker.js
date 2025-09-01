/**
 * Service Worker for radicalkjax.com
 * Provides offline support and caching strategies
 */

const CACHE_NAME = 'radicalkjax-v1.0.0';
const RUNTIME_CACHE = 'radicalkjax-runtime';

// Files to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/assets/css/main.css',
  '/assets/css/fonts.css',
  '/assets/js/app.js',
  '/assets/fonts/uni0553-webfont.woff2',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch(() => { /* Cache failed */ })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // HTML requests - Network first, fall back to cache
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          
          caches.open(RUNTIME_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Return offline page if no cache match
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }
  
  // Static assets - Cache first, fall back to network
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            // Return from cache and update in background
            fetchAndUpdate(request);
            return response;
          }
          
          return fetch(request)
            .then((response) => {
              // Cache the new response
              const responseToCache = response.clone();
              
              caches.open(STATIC_CACHE_URLS.includes(url.pathname) ? CACHE_NAME : RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
              
              return response;
            });
        })
    );
    return;
  }
  
  // API requests - Network first, cache as fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone();
          
          caches.open(RUNTIME_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }
  
  // Default - Network with cache fallback
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Helper function to determine if URL is a static asset
function isStaticAsset(url) {
  const staticExtensions = [
    '.css', '.js', '.json', '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'
  ];
  
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// Helper function to fetch and update cache in background
function fetchAndUpdate(request) {
  fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        
        caches.open(RUNTIME_CACHE)
          .then((cache) => {
            cache.put(request, responseToCache);
          });
      }
    })
    .catch(() => {
      // Error handled silently
    });
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              return caches.delete(cacheName);
            })
          );
        })
        .then(() => {
          return self.clients.matchAll();
        })
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  }
});

async function syncPosts() {
  // Implement syncing logic for offline actions
}