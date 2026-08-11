"use strict";

const CACHE_NAME = "circlesync-v74";

const APP_FILES = [
    "./",
    "./index.html",
    "./dashboard.html",
    "./styles.css",
    "./app.js",
    "./manifest.json"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(APP_FILES);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }

                    return null;
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(function (response) {
                if (
                    !response ||
                    response.status !== 200 ||
                    response.type === "opaque"
                ) {
                    return response;
                }

                const responseClone = response.clone();

                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, responseClone);
                });

                return response;
            })
            .catch(function () {
                return caches.match(event.request).then(function (cachedResponse) {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    if (event.request.mode === "navigate") {
                        return caches.match("./index.html");
                    }

                    return Response.error();
                });
            })
    );
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    event.waitUntil(
        clients
            .matchAll({
                type: "window",
                includeUncontrolled: true
            })
            .then(function (clientList) {
                for (const client of clientList) {
                    if (
                        client.url.includes("/Vanguarde-/") &&
                        "focus" in client
                    ) {
                        return client.focus();
                    }
                }

                if (clients.openWindow) {
                    return clients.openWindow("./dashboard.html");
                }

                return null;
            })
    );
});
