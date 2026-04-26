const CACHE = 'skycheck-v1';
const ASSETS = ['./weather-app.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Triggered by the main app via postMessage
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'WEATHER_NOTIFY') {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: event.data.icon || './icon-192.png',
      badge: './icon-192.png',
      tag: 'skycheck-weather',
      renotify: true,
      vibrate: [200, 100, 200],
      actions: [{ action: 'open', title: 'Open SkyCheck' }]
    });
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow('./weather-app.html'));
  }
});
