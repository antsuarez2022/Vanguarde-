"use strict";


const CACHE_NAME =
    "circlesync-v61";


const APP_FILES = [

    "./",

    "./index.html",

    "./dashboard.html",

    "./styles.css",

    "./app.js",

    "./manifest.json"

];


self.addEventListener(
    "install",
    function (event) {

        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )
                .then(
                    function (cache) {

                        return cache.addAll(
                            APP_FILES
                        );
                    }
                )

        );


        self.skipWaiting();
    }
);


self.addEventListener(
    "activate",
    function (event) {

        event.waitUntil(

            caches
                .keys()
                .then(
                    function (keys) {

                        return Promise.all(

                            keys.map(
                                function (key) {

                                    if (
                                        key !==
                                        CACHE_NAME
                                    ) {

                                        return caches.delete(
                                            key
                                        );
                                    }


                                    return null;
                                }
                            )

                        );
                    }
                )

        );


        self.clients.claim();
    }
);


self.addEventListener(
    "fetch",
    function (event) {

        if (
            event.request.method !==
            "GET"
        ) {

            return;
        }


        event.respondWith(

            fetch(
                event.request
            )
                .then(
                    function (response) {

                        const clone =
                            response.clone();


                        caches
                            .open(
                                CACHE_NAME
                            )
                            .then(
                                function (cache) {

                                    cache.put(
                                        event.request,
                                        clone
                                    );
                                }
                            );


                        return response;
                    }
                )
                .catch(
                    function () {

                        return caches.match(
                            event.request
                        );
                    }
                )

        );
    }
);


self.addEventListener(
    "notificationclick",
    function (event) {

        event.notification.close();


        event.waitUntil(

            clients.matchAll(
                {

                    type:
                        "window",

                    includeUncontrolled:
                        true

                }
            )
            .then(
                function (
                    clientList
                ) {

                    for (
                        const client
                        of clientList
                    ) {

                        if (
                            "focus" in client
                        ) {

                            return client.focus();
                        }
                    }


                    if (
                        clients.openWindow
                    ) {

                        return clients.openWindow(
                            "./dashboard.html"
                        );
                    }


                    return null;
                }
            )

        );
    }
);
