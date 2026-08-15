// ═══════════════════════════════════════════════════════════
// IDHAM ERP PWA — Service Worker v1
// Offline caching + background sync strategy
// ═══════════════════════════════════════════════════════════

const CACHE_V = "idham-erp-v2-20260808-v80";
const STATIC  = [
  "/",
  "/index.html",
  "/css/design-system.css",
  "/css/layout.css",
  "/css/components.css",
  "/js/app.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ── Install: cache shell ──
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_V).then(c => c.addAll(STATIC)).catch(() => {})
  );
  self.skipWaiting();
});

// ── Activate: delete old caches ──
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_V).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: Network First, fallback to cache ──
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Skip Firebase/API requests — always network
  if (url.hostname.includes("firestore.googleapis.com") ||
      url.hostname.includes("firebase") ||
      url.hostname.includes("googleapis.com") ||
      url.pathname.includes("/identitytoolkit/")) {
    return;
  }

  // Skip Representative App requests completely (handled natively or by rep cache-busting)
  if (url.pathname.includes("/rep") || 
      url.pathname.includes("/sw-rep") || 
      url.pathname.includes("manifest-rep.json")) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful GET responses
        if (res && res.status === 200 && e.request.method === "GET") {
          const contentType = res.headers.get("content-type") || "";
          const isHtml = contentType.includes("text/html");
          const isJsRequest = url.pathname.endsWith(".js") || url.search.includes(".js") || url.pathname.includes(".js");
          const isCssRequest = url.pathname.endsWith(".css") || url.search.includes(".css") || url.pathname.includes(".css");

          // Do not cache HTML responses for JS/CSS static assets
          if (!(isHtml && (isJsRequest || isCssRequest))) {
            const clone = res.clone();
            caches.open(CACHE_V).then(c => c.put(e.request, clone));
          }
        }
        return res;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(e.request);
        if (cachedResponse) return cachedResponse;

        // Fallback for navigation requests (SPA routes)
        if (e.request.mode === "navigate") {
          const indexHtml = await caches.match("/index.html");
          if (indexHtml) return indexHtml;
        }

        // Return a valid offline fallback Response object
        return new Response("Offline connection error", {
          status: 503,
          statusText: "Offline",
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      })
  );
});
