const CACHE_NAME = 'alarme-falante-v13';
const FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap'
];

// Instala e cacheia os arquivos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES.filter(f => !f.startsWith('http'))))
  );
  self.skipWaiting();
});

// Limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Serve do cache quando offline
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});

// Notificações agendadas (recebe mensagem do app)
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (e.data && e.data.type === 'SCHEDULE_ALARM') {
    const { id, label, time, delay } = e.data;
    setTimeout(() => {
      self.registration.showNotification('⏰ ' + (label || 'Alarme!'), {
        body: 'São ' + time + ' — ' + (label || 'Hora do alarme!'),
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: 'alarm-' + id,
        requireInteraction: true,
        vibrate: [300, 100, 300, 100, 300],
        actions: [{ action: 'stop', title: '🛑 Parar' }]
      });
    }, delay);
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./index.html'));
});
