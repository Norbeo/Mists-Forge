/* Service worker : le jeu fonctionne hors connexion une fois installé. */
const CACHE = "forge-brumes2-5b3c399826";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png", "./favicon-64.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  // polices Google : servies du cache, rafraîchies en arrière-plan
  if (url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    e.respondWith(caches.open(CACHE).then(async c => { const hit = await c.match(req); const net = fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => hit); return hit || net; }));
    return;
  }
  if (url.origin !== location.origin) return;
  // page du jeu : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  if (req.mode === "navigate") { e.respondWith(fetch(req).then(r => { caches.open(CACHE).then(c => c.put("./index.html", r.clone())); return r; }).catch(() => caches.match("./index.html"))); return; }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
