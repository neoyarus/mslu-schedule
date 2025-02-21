const CACHE_NAME = 'mslu-schedule-v1';
const STATIC_CACHE = [
    '/mslu-schedule/',
    '/mslu-schedule/index.html',
    '/mslu-schedule/manifest.json',
    '/mslu-schedule/icon-192.png',
    '/mslu-schedule/icon-512.png',
    '/mslu-schedule/icon-maskable-192.png',
    '/mslu-schedule/icon-maskable-512.png'
];

const API_CACHE = new Set();  // To track API URLs we've cached

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Handle API requests differently
    if (url.hostname.includes('cors.io') || 
        url.hostname.includes('codetabs.com') || 
        url.hostname.includes('cors-anywhere.herokuapp.com')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                        API_CACHE.add(event.request.url);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request)
                        .then(response => response || new Response(JSON.stringify({ error: 'Offline' }), {
                            headers: { 'Content-Type': 'application/json' }
                        }));
                })
        );
        return;
    }

    if (url.hostname === 'corsproxy.io') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache the API response
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                        API_CACHE.add(event.request.url);
                    });
                    return response;
                })
                .catch(() => {
                    // If offline, try to return cached API response
                    return caches.match(event.request)
                        .then(response => response || new Response(JSON.stringify({ error: 'Offline' }), {
                            headers: { 'Content-Type': 'application/json' }
                        }));
                })
        );
        return;
    }

    if (url.hostname === 'api.allorigins.win') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache the API response
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                        API_CACHE.add(event.request.url);
                    });
                    return response;
                })
                .catch(() => {
                    // If offline, try to return cached API response
                    return caches.match(event.request)
                        .then(response => response || new Response(JSON.stringify({ error: 'Offline' }), {
                            headers: { 'Content-Type': 'application/json' }
                        }));
                })
        );
        return;
    }

    if (url.origin === 'https://schedule.mslu.by') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache the API response
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                        API_CACHE.add(event.request.url);
                    });
                    return response;
                })
                .catch(() => {
                    // If offline, try to return cached API response
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Handle regular static files
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;  // Return cached version
                }
                return fetch(event.request);
            })
            .catch(() => {
                // Return fallback content if offline and no cache
                if (event.request.url.includes('favicon.ico')) {
                    return new Response();  // Empty response for favicon
                }
                return caches.match('./index.html');  // Return cached index.html as fallback
            })
    );
});
