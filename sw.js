/* Satsooma Show Sign-up: keeps a copy of the app on the device so it opens with no signal.
   When you publish a new version, change CACHE below so devices pick it up. */
const CACHE = "satsooma-signup-v1.0.0";
const FILES = [
  "./", "index.html", "manifest.webmanifest",
  "fonts/Sora-Regular.ttf", "fonts/Sora-SemiBold.ttf", "fonts/Sora-Bold.ttf", "fonts/Sora-ExtraBold.ttf",
  "img/mcs.png", "img/recc.jpg", "img/tm.png", "img/hg.png", "img/rw.png",
  "img/icon-192.png", "img/icon-512.png", "img/apple-touch-icon.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  /* Serve from the saved copy first (works offline); refresh it in the background when online. */
  e.respondWith(caches.open(CACHE).then(async cache => {
    const key = e.request.mode === "navigate" ? "index.html" : e.request;
    const hit = await cache.match(key, { ignoreSearch: true });
    const net = fetch(e.request).then(res => { if (res && res.ok && e.request.mode !== "navigate") cache.put(e.request, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || new Response("Offline", { status: 503 });
  }));
});
