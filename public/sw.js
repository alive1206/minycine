const CACHE_NAME = "minycine-v6";

const PRECACHE_URLS = ["/", "/manifest.json"];

// Install: precache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  // Do NOT call skipWaiting() — let new SW activate on next app open
  // to prevent mid-session page reloads that restart the splash animation
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});

// Fetch: network-first for navigations AND Next.js assets, cache-first for others
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API calls and external requests
  if (
    request.url.includes("/api/") ||
    !request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  // Navigation requests & Next.js bundles: network-first
  // This ensures the latest HTML/CSS/JS is always served
  if (request.mode === "navigate" || request.url.includes("/_next/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // Other static assets (icons, manifest, etc.): cache-first
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }),
    ),
  );
});
