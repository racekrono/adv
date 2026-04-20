// sw.js - Versão Otimizada para Rally
const CACHE_NAME = 'rally-tracker-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './NoSleep.min.js',
  'https://raw.githubusercontent.com/racekrono/adv/refs/heads/main/Logo.png',
  'https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.17.1/firebase-database-compat.js'
];

// Instalação: Guarda os ficheiros críticos no telemóvel
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Capacitor: Armazenando ficheiros para uso offline...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos se houver atualização
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.claim();
});
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posicoes') {
    console.log('Sincronizando posições de rally em segundo plano...');
  }
});
// Interceção de pedidos (Fetch)
self.addEventListener('fetch', (event) => {
  // Para o Firebase (Realtime DB), não tentamos cachear via Service Worker 
  // porque o próprio SDK do Firebase já tem o seu "capacitor" interno.
  if (event.request.url.includes('firebaseio.com')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Se tivermos o ficheiro no cache, usamos (ajuda no deserto/trilha)
      // Se não, vamos buscar à rede
      return response || fetch(event.request).catch(() => {
        // Se estiver totalmente offline e o ficheiro não estiver no cache
        console.log('Offline: Ficheiro não encontrado no capacitor.');
      });
    })
  );
});
