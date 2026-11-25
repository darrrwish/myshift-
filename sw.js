/* Change this cache version on each release. Never store private app data here. */
const CACHE='almihwar-shell-v17-20261124';
const ROOT=new URL('./',self.location.href).href;
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(async cache=>{
    await cache.addAll(SHELL.map(p=>new Request(new URL(p,ROOT),{cache:'reload'})));
    // Optional Excel support. Failure here must not block offline installation.
    try{const r=await fetch('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js');if(r.ok)await cache.put('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js',r)}catch(_){}
  }));
});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('almihwar-shell-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  const request=event.request,u=new URL(request.url);
  if(request.method!=='GET')return;
  if(request.mode==='navigate'&&u.origin===self.location.origin&&u.href.startsWith(ROOT)){
    event.respondWith(fetch(request).catch(async()=>{const cache=await caches.open(CACHE);return (await cache.match(new URL('./index.html',ROOT)))||Response.error()}));return;
  }
  const staticPaths=SHELL.map(p=>new URL(p,ROOT).href);
  if(staticPaths.includes(u.href)||['fonts.googleapis.com','fonts.gstatic.com','cdnjs.cloudflare.com'].includes(u.hostname)){
    event.respondWith(caches.open(CACHE).then(async cache=>{
      const cached=await cache.match(request);if(cached)return cached;
      const r=await fetch(request);if(r.ok||r.type==='opaque')await cache.put(request,r.clone());return r;
    }));
  }
  // Quran, trivia, translation, news and all other remote requests stay network-only.
});
