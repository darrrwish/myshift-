/* Todo timeline shell cache. Change the version on each release. */
const CACHE='todoline-shell-v1-20261125';
const ROOT=new URL('./',self.location.href).href;
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL.map(p=>new Request(new URL(p,ROOT),{cache:'reload'})))));
});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('todoline-shell-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{
  const request=event.request,u=new URL(request.url);
  if(request.method!=='GET'||u.origin!==self.location.origin||!u.href.startsWith(ROOT))return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).catch(async()=>{const cache=await caches.open(CACHE);return (await cache.match(new URL('./index.html',ROOT)))||Response.error()}));
    return;
  }
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(request);if(cached)return cached;
    const r=await fetch(request);if(r.ok)await cache.put(request,r.clone());return r;
  }));
});
