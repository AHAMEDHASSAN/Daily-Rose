const CACHE_NAME = 'daily-rose-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './daily_rose_icon.png',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;700;900&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap',
    'https://fonts.gstatic.com/s/cairo/v28/SLXGc1nu6HkveRf-Ed9D.woff2',
    'https://fonts.gstatic.com/s/amiri/v26/J7afpQF87fWnXv_JmAnm.woff2'
];

// Install Event - Cache all assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and adding assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - Network First for the main page, Cache First for others
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // For navigation requests (the main page), try network first, then cache
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match('./index.html'))
        );
        return;
    }

    // For other assets, try cache first, then network
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request).then((fetchResponse) => {
                    // Optionally cache new assets found on the fly
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                });
            })
            .catch(() => {
                // If both fail and it's an image, maybe return a placeholder
            })
    );
});
