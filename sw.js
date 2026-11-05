// Сплюшка: офлайн-кеш. Версія: 1
var C='sp-1';
var CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
var LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
self.addEventListener('install',function(e){
 e.waitUntil(caches.open(C).then(function(c){return c.addAll(CORE).then(function(){return c.add(new Request(LIB,{mode:'cors'})).catch(function(){})})}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
 e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==C}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
 var r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||/supabase\.co$/.test(u.hostname))return; // дані: лише мережа
 if(u.origin===location.origin&&(r.mode==='navigate'||/\/(index\.html)?$/.test(u.pathname))){
  // сторінка: спершу мережа (щоб приходили оновлення), без інтернету з кешу
  e.respondWith(fetch(r).then(function(res){var cp=res.clone();caches.open(C).then(function(c){c.put('./index.html',cp)});return res}).catch(function(){return caches.match('./index.html')}));
  return;
 }
 if(u.origin===location.origin||/(jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname)){
  // бібліотека, шрифти, іконки: з кешу, у фоні оновлюємо
  e.respondWith(caches.match(r).then(function(hit){
   var net=fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque')){var cp=res.clone();caches.open(C).then(function(c){c.put(r,cp)})}return res}).catch(function(){return hit});
   return hit||net;
  }));
 }
});
