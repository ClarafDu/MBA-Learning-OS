const cacheName = 'imba-esg-offline-v4';
const root = new URL('./', self.location.href);
const urls = ['./', 'index.html', 'styles.css', 'app.js', 'content.js', 'exam.js', 'reference.js', 'bilingual.js', 'locale.js']
  .map(path => new URL(path, root).href);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache =>
    cache.addAll(urls.map(url => new Request(url, {cache:'reload'})))
  ).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('imba-esg-offline-') && key !== cacheName)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  url.search = '';
  url.hash = '';
  if (event.request.method !== 'GET' || !urls.includes(url.href)) return;
  event.respondWith(fetch(event.request).catch(async () => {
    const cache = await caches.open(cacheName);
    return (await cache.match(url.href)) || Response.error();
  }));
});
