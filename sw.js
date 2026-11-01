// Offline cache for Horizon Garage. Bump VERSION when files change.
const VERSION="fh6-garage-v1";
const CORE=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","icon-maskable-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.host.endsWith("fonts.googleapis.com")||u.host.endsWith("fonts.gstatic.com")){
    e.respondWith(caches.open(VERSION).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>hit))));return;
  }
  if(u.origin!==location.origin)return;
  // app files: network first so updates arrive, cache when offline
  e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match("index.html"))));
});
