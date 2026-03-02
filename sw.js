/**
 * Service Worker - Cyber Security Study Guide
 * Enables offline access by caching all guide resources
 */

const CACHE_NAME = 'cyber-security-guide-v1';
const urlsToCache = [
    './',
    './index.html',
    './unit1.html',
    './unit2.html',
    './unit3.html',
    './unit4.html',
    './unit5.html',
    './exam-prep.html',
    './revision.html',
    './glossary.html',
    './syllabus.html',
    './styles.css',
    './script.js',
    './favicon.svg',
    './manifest.json'
];

// Install: cache all resources
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
            .then(function() {
                return self.skipWaiting();
            })
    );
});

// Activate: clean old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) {
                    return name !== CACHE_NAME;
                }).map(function(name) {
                    return caches.delete(name);
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// Fetch: serve from cache first, fall back to network
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            if (cachedResponse) {
                // Return cached version, but also fetch update in background
                event.waitUntil(
                    fetch(event.request).then(function(networkResponse) {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then(function(cache) {
                                cache.put(event.request, networkResponse);
                            });
                        }
                    }).catch(function() { /* offline, ignore */ })
                );
                return cachedResponse;
            }
            // Not in cache, fetch from network
            return fetch(event.request).then(function(networkResponse) {
                if (networkResponse && networkResponse.status === 200) {
                    var responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(function() {
                // Offline fallback for HTML pages
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
