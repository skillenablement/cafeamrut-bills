const CACHE = "cafeamrut-v1";
const OFFLINE_URLS = [
  "./",
  "./index.html"
];

self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e=>{
  // Only cache GET requests for same origin
  if(e.request.method !== "GET") return;
  if(!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(res=>{
        // Cache fresh responses
        if(res.ok){
          const copy = res.clone();
          caches.open(CACHE).then(c=>c.put(e.request, copy));
        }
        return res;
      })
      .catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html")))
  );
});
