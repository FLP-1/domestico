/**
 * Service Worker para PWA
 * Cache básico para offline support
 */

const CACHE_NAME = 'dom-v1';
const STATIC_CACHE_NAME = 'dom-static-v1';

// Assets para cachear
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/logo-optimized.webp',
  '/manifest.json',
];

// Instalar Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) {
            return (
              name !== CACHE_NAME && name !== STATIC_CACHE_NAME
            );
          })
          .map(function(name) {
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);

  // Cache strategy: Network First para páginas, Cache First para assets
  if (request.method === 'GET') {
    if (
      url.pathname.startsWith('/_next/static') ||
      url.pathname.startsWith('/static') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.webp') ||
      url.pathname.endsWith('.ico')
    ) {
      // Cache First para assets estáticos
      event.respondWith(cacheFirst(request));
    } else {
      // Network First para páginas
      event.respondWith(networkFirst(request));
    }
  }
});

// Cache First strategy
function cacheFirst(request) {
  return caches.open(STATIC_CACHE_NAME).then(function(cache) {
    return cache.match(request).then(function(cached) {
      if (cached) {
        return cached;
      }

      return fetch(request).then(function(response) {
        if (response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(function() {
        // Se falhar, retornar resposta offline básica
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      });
    });
  });
}

// Network First strategy
function networkFirst(request) {
  return caches.open(CACHE_NAME).then(function(cache) {
    return fetch(request).then(function(response) {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(function() {
      return cache.match(request).then(function(cached) {
        if (cached) {
          return cached;
        }
        // Retornar página offline básica
        return new Response(
          '<!DOCTYPE html><html><head><title>Offline - Sistema DOM</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><h1>Você está offline</h1><p>Verifique sua conexão com a internet.</p></body></html>',
          {
            headers: { 'Content-Type': 'text/html' },
          }
        );
      });
    });
  });
}

