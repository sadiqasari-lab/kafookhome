// KAFOOK — Minimal Service Worker
// Required for PWA installability. Does not cache; passes everything to network.

self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  // Pass-through — always fetch from network.
  event.respondWith(fetch(event.request));
});
