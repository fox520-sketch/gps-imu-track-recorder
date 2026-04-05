const CACHE_NAME = "gps-imu-wave2-v1";
const APP_SHELL = ["./","./index.html","./manifest.json","./sw.js","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;
  if(sameOrigin){
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match("./index.html")))
    );
    return;
  }
  event.respondWith(fetch(event.request).catch(() => caches.match("./index.html")));
});
self.addEventListener("message", event => {
  if(event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});