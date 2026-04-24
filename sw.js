// sw.js - Race Krono Offline Service Worker
const CACHE_NAME = 'racekrono-v2';
const ASSETS = [
  '/',
  'index.html',
  'manifest.json',
  'https://raw.githubusercontent.com/racekrono/adv/refs/heads/main/Logo.png'
];

// Instalação: Cacheia os arquivos base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Estratégia: Cache First (Se tiver no cache, usa. Se não, tenta rede e guarda no cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        // Se for uma imagem de tulipa (GitHub), guarda no cache automaticamente
        if (event.request.url.includes('githubusercontent')) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
