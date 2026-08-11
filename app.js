"use strict";

console.log("CircleSync app.js v74 loaded");


const SUPABASE_URL =
    "https://mkecbhmkvrtwltejwzua.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_hWxse_7flC8kSKS_xlVkYw_BRUwJ2d8";


const WEBSITE_SIGNIN_URL =
    "https://antsuarez2022.github.io/Vanguarde-/";


if (!window.supabase) {
    throw new Error(
        "Supabase library failed to load."
    );
}


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


let serviceWorkerRegistration =
    null;


// ==========================================================
// SERVICE WORKER
// ==========================================================

async function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) {

        console.warn(
            "Service workers are not supported."
        );

        return null;
    }


    try {

        serviceWorkerRegistration =
            await navigator.serviceWorker.register(
                "./service-worker.js?v=74"
            );


        await navigator.serviceWorker.ready;


        console.log(
            "CircleSync service worker v74 ready."
        );


        return serviceWorkerRegistration;


    } catch (error) {

        console.error(
            "Service worker registration failed:",
            error
        );


        return null;
    }
}


// ==========================================================
// START APP
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await registerServiceWorker();


        if (
            document.body.id ===
            "auth-page"
        ) {

            await initAuthPage();

            return;
        }


        if (
            document.body.id ===
            "dashboard-page"
        ) {

            await initDashboardPage();
        }

    }
);


// ==========================================================
// AUTH PAGE
// ==========================================================

async function initAuthPage() {

    function get(id) {
        return document.getElementById(id);
    }


    const signinSection =
        get("signin-section");

    const signupSection =
        get("signup-section");

    const signinTab =
        get("show-signin-btn");

    const signupTab =
        get("show-signup-btn");

    const signinForm =
        get("signin-form");

    const signupForm =
        get("signup-form");

    const authMessage =
        get("auth-message");


    function showMessage(
        text,
        isError
    ) {

        authMessage.textContent =
            text;


        authMessage.className =
            isError
                ? "status error-message"
                : "status success-message";
    }


    signinTab.addEventListener(
        "click",
        function () {

            signinSection.hidden =
                false;


            signupSection.hidden =
                true;


            signinTab.classList.add(
                "active-tab"
            );


            signupTab.classList.remove(
                "active-tab"
            );

        }
    );


    signupTab.addEventListener(
        "click",
        function () {

            signinSection.hidden =
                true;


            signupSection.hidden =
                false;


            signupTab.classList.add(
                "active-tab"
            );


            signinTab.classList.remove(
                "active-tab"
            );

        }
    );


    const sessionResult =
        await supabaseClient.auth
            .getSession();


    if (
        sessionResult.data &&
        sessionResult.data.session
    ) {

        window.location.replace(
            "./dashboard.html"
        );


        return;
    }


    signinForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                get("signin-email")
                    .value
                    .trim();


            const password =
                get("signin-password")
                    .value;


            if (
                !email ||
                !password
            ) {

                showMessage(
                    "Enter your email and password.",
                    true
                );

                return;
            }


            const button =
                get("login-btn");


            button.disabled =
                true;


            button.textContent =
                "Signing In...";


            const result =
                await supabaseClient.auth
                    .signInWithPassword({

                        email:
                            email,

                        password:
                            password

                    });


            button.disabled =
                false;


            button.textContent =
                "Sign In";


            if (
                result.error
            ) {

                showMessage(
                    result.error.message,
                    true
                );

                return;
            }


            window.location.replace(
                "./dashboard.html"
            );

        }
    );


    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                get("signup-email")
                    .value
                    .trim();


            const password =
                get("signup-password")
                    .value;


            const confirmation =
                get("signup-confirm-password")
                    .value;


            if (!email) {

                showMessage(
                    "Enter an email.",
                    true
                );

                return;
            }


            if (
                password.length < 6
            ) {

                showMessage(
                    "Password must contain at least 6 characters.",
                    true
                );

                return;
            }


            if (
                password !==
                confirmation
            ) {

                showMessage(
                    "Passwords do not match.",
                    true
                );

                return;
            }


            const button =
                get("signup-btn");


            button.disabled =
                true;


            button.textContent =
                "Creating Account...";


            const result =
                await supabaseClient.auth
                    .signUp({

                        email:
                            email,

                        password:
                            password,

                        options: {

                            emailRedirectTo:
                                WEBSITE_SIGNIN_URL

                        }

                    });


            button.disabled =
                false;


            button.textContent =
                "Create Account";


            if (
                result.error
            ) {

                showMessage(
                    result.error.message,
                    true
                );

                return;
            }


            showMessage(
                "Account created. Check your email and confirm your account, then return here to sign in.",
                false
            );

        }
    );
}


// ==========================================================
// DASHBOARD
// ==========================================================

async function initDashboardPage() {

    function get(id) {
        return document.getElementById(id);
    }


    let currentUser =
        null;

    let activeCircle =
        null;

    let myCircles =
        [];

    let currentRoutine =
        null;

    let focusActive =
        false;

    let focusStartedAt =
        null;

    let realtimeChannel =
        null;

    let routineTimer =
        null;


    // ======================================================
    // SESSION
    // ======================================================

    const sessionResult =
        await supabaseClient.auth
            .getSession();


    if (
        sessionResult.error ||
        !sessionResult.data.session
    ) {

        window.location.replace(
            "./index.html"
        );

        return;
    }


    currentUser =
        sessionResult.data.session.user;


    get("user-email").textContent =
        currentUser.email;


    function recommend(text) {

        get("recommendation")
            .textContent =
            text;
    }


    // ======================================================
    // LOGOUT
    // ======================================================

    get("logout-btn")
        .addEventListener(
            "click",
            async function () {

                if (
                    realtimeChannel
                ) {

                    await supabaseClient
                        .removeChannel(
                            realtimeChannel
                        );
                }


                await supabaseClient.auth
                    .signOut();


                window.location.replace(
                    "./index.html"
                );

            }
        );


    // ======================================================
    // NOTIFICATION DATABASE SETTING
    // ======================================================

    async function getNotificationPreference() {

        const result =
            await supabaseClient
                .from(
                    "notification_preferences"
                )
                .select(
                    "routine_notifications"
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .maybeSingle();


        if (
            result.error
        ) {

            console.error(
                "Notification preference error:",
                result.error
            );

            return false;
        }


        return Boolean(
            result.data &&
            result.data.routine_notifications
        );
    }


    async function saveNotificationPreference(
        enabled
    ) {

        const result =
            await supabaseClient
                .from(
                    "notification_preferences"
                )
                .upsert(
                    {

                        user_id:
                            currentUser.id,

                        routine_notifications:
                            enabled,

                        updated_at:
                            new Date()
                                .toISOString()

                    },
                    {

                        onConflict:
                            "user_id"

                    }
                );


        if (
            result.error
        ) {

            console.error(
                "Notification preference save error:",
                result.error
            );

            return false;
        }


        return true;
    }


    // ======================================================
    // SHOW NOTIFICATION
    // ======================================================

    async function showNotification(
        title,
        body,
        tag
    ) {

        if (
            !("Notification" in window)
        ) {

            return false;
        }


        if (
            Notification.permission !==
            "granted"
        ) {

            return false;
        }


        try {

            const registration =
                serviceWorkerRegistration
                ||
                await navigator
                    .serviceWorker
                    .ready;


            await registration
                .showNotification(
                    title,
                    {

                        body:
                            body,

                        tag:
                            tag,

                        renotify:
                            false,

                        requireInteraction:
                            true,

                        data: {

                            url:
                                "./dashboard.html"

                        }

                    }
                );


            return true;


        } catch (error) {

            console.error(
                "Notification display error:",
                error
            );


            return false;
        }
    }


    // ======================================================
    // NOTIFICATION BUTTON UI
    // ======================================================

    async function updateNotificationUI() {

        const button =
            get(
                "notification-btn"
            );


        const status =
            get(
                "notification-status"
            );


        if (
            !("Notification" in window)
        ) {

            button.disabled =
                true;


            button.textContent =
                "Notifications Unsupported";


            status.textContent =
                "This browser does not support web notifications.";


            return;
        }


        const enabled =
            await getNotificationPreference();


        if (
            Notification.permission ===
            "denied"
        ) {

            button.textContent =
                "Enable Notifications";


            status.textContent =
                "Chrome is blocking notifications. Click the site icon beside the address bar, open Site Settings, set Notifications to Allow, then reload CircleSync.";


            return;
        }


        if (
            Notification.permission ===
            "granted"

            &&

            enabled
        ) {

            button.textContent =
                "Disable Notifications";


            status.textContent =
                "Notifications are ON. CircleSync will remind you 5 minutes before a routine and warn you 15 minutes afterward if you have not checked in.";


            return;
        }


        button.textContent =
            "Enable Notifications";


        status.textContent =
            "Notifications are OFF.";
    }


    // ======================================================
    // TRUE ON/OFF TOGGLE
    // ======================================================

    get("notification-btn")
        .addEventListener(
            "click",
            async function () {

                const button =
                    get(
                        "notification-btn"
                    );


                const status =
                    get(
                        "notification-status"
                    );


                button.disabled =
                    true;


                try {

                    const currentlyEnabled =
                        await getNotificationPreference();


                    // --------------------------------------
                    // TURN OFF
                    // --------------------------------------

                    if (
                        currentlyEnabled
                    ) {

                        const saved =
                            await saveNotificationPreference(
                                false
                            );


                        if (
                            saved
                        ) {

                            status.textContent =
                                "CircleSync notifications have been turned off.";
                        }


                        await updateNotificationUI();


                        return;
                    }


                    // --------------------------------------
                    // TURN ON
                    // --------------------------------------

                    if (
                        !("Notification" in window)
                    ) {

                        status.textContent =
                            "Notifications are not supported by this browser.";


                        return;
                    }


                    let permission =
                        Notification.permission;


                    if (
                        permission ===
                        "default"
                    ) {

                        permission =
                            await Notification
                                .requestPermission();
                    }


                    if (
                        permission ===
                        "denied"
                    ) {

                        status.textContent =
                            "Chrome has blocked notifications. Open Site Settings for this website and change Notifications to Allow.";


                        return;
                    }


                    if (
                        permission !==
                        "granted"
                    ) {

                        status.textContent =
                            "Notification permission was not granted.";


                        return;
                    }


                    const saved =
                        await saveNotificationPreference(
                            true
                        );


                    if (
                        !saved
                    ) {

                        status.textContent =
                            "CircleSync could not save your notification preference.";


                        return;
                    }


                    const testShown =
                        await showNotification(

                            "CircleSync Notifications Are On ✅",

                            "This is a test reminder. You will receive routine alerts 5 minutes before and overdue alerts 15 minutes afterward.",

                            "circlesync-test-" +
                            Date.now()

                        );


                    if (
                        testShown
                    ) {

                        status.textContent =
                            "Notifications enabled. A test notification was sent.";
                    }


                    await updateNotificationUI();


                } catch (error) {

                    console.error(
                        "Notification toggle error:",
                        error
                    );


                    status.textContent =
                        "CircleSync could not change the notification setting.";


                } finally {

                    button.disabled =
                        false;
                }

            }
        );


    await updateNotificationUI();


    // ======================================================
    // PROFILE HELPERS
    // ======================================================

    async function getProfileMap(
        userIds
    ) {

        const map = {};


        const ids =
            Array.from(
                new Set(
                    (
                        userIds ||
                        []
                    ).filter(
                        Boolean
                    )
                )
            );


        if (
            ids.length ===
            0
        ) {

            return map;
        }


        const result =
            await supabaseClient
                .from(
                    "profiles"
                )
                .select(
                    "id, display_name"
                )
                .in(
                    "id",
                    ids
                );


        (
            result.data ||
            []
        ).forEach(
            function (profile) {

                map[
                    profile.id
                ] =
                    profile.display_name ||
                    "CircleSync User";

            }
        );


        return map;
    }


    function displayName(
        userId,
        profileMap
    ) {

        if (
            userId ===
            currentUser.id
        ) {

            return "You";
        }


        return (
            profileMap[userId]
            ||
            "CircleSync User"
        );
    }


    // ======================================================
    // CIRCLE DATA
    // ======================================================

    async function getMemberships() {

        const result =
            await supabaseClient
                .from(
                    "circle_members"
                )
                .select(
                    "circle_id, role, joined_at"
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (
            result.error
        ) {

            console.error(
                result.error
            );


            return [];
        }


        return (
            result.data ||
            []
        );
    }


    async function getCircles() {

        const result =
            await supabaseClient
                .from(
                    "circles"
                )
                .select(
                    "id, name, description, created_by, is_public, created_at"
                )
                .order(
                    "created_at",
                    {

                        ascending:
                            false

                    }
                );


        if (
            result.error
        ) {

            console.error(
                result.error
            );


            return [];
        }


        return (
            result.data ||
            []
        );
    }


    async function loadMyCircles() {

        const [
            memberships,
            circles
        ] =
            await Promise.all([

                getMemberships(),

                getCircles()

            ]);


        const membershipMap =
            new Map();


        memberships.forEach(
            function (membership) {

                membershipMap.set(
                    membership.circle_id,
                    membership
                );

            }
        );


        myCircles =
            circles
                .filter(
                    function (circle) {

                        return (

                            circle.created_by ===
                                currentUser.id

                            ||

                            membershipMap.has(
                                circle.id
                            )

                        );

                    }
                )
                .map(
                    function (circle) {

                        const membership =
                            membershipMap.get(
                                circle.id
                            );


                        return {

                            ...circle,

                            role:
                                circle.created_by ===
                                currentUser.id

                                    ? "owner"

                                    : membership
                                        ? membership.role
                                        : "member"

                        };

                    }
                );


        const savedId =
            sessionStorage.getItem(
                "circlesync-active-circle"
            );


        const previousId =
            activeCircle
                ? activeCircle.id
                : savedId;


        activeCircle =
            myCircles.find(
                function (circle) {

                    return (
                        circle.id ===
                        previousId
                    );

                }
            )
            ||
            myCircles[0]
            ||
            null;


        if (
            activeCircle
        ) {

            sessionStorage.setItem(
                "circlesync-active-circle",
                activeCircle.id
            );
        }


        renderCircleSwitcher();


        await renderActiveCircle();
    }


    function renderCircleSwitcher() {

        const container =
            get(
                "my-circles-scroll"
            );


        container.innerHTML =
            "";


        if (
            myCircles.length ===
            0
        ) {

            container.innerHTML =
                '<p class="empty-text">You do not belong to any circles yet.</p>';


            return;
        }


        myCircles.forEach(
            function (circle) {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "circle-chip";


                if (
                    activeCircle &&
                    activeCircle.id ===
                    circle.id
                ) {

                    button.classList.add(
                        "active-circle-chip"
                    );
                }


                button.textContent =
                    circle.name +
                    (
                        circle.role ===
                        "owner"
                            ? " ★"
                            : ""
                    );


                button.addEventListener(
                    "click",
                    async function () {

                        activeCircle =
                            circle;


                        sessionStorage.setItem(
                            "circlesync-active-circle",
                            circle.id
                        );


                        renderCircleSwitcher();


                        await renderActiveCircle();

                    }
                );


                container.appendChild(
                    button
                );

            }
        );
    }


    async function renderActiveCircle() {

        if (
            !activeCircle
        ) {

            get("circle-name")
                .textContent =
                "No Circle Selected";


            get("circle-description")
                .textContent =
                "Create a circle or request to join one.";


            get("leave-circle-btn")
                .hidden =
                true;


            get("circle-list")
                .innerHTML =
                "<li>No members.</li>";


            get("circle-feed")
                .innerHTML =
                '<p class="empty-text">No active circle.</p>';


            return;
        }


        get("circle-name")
            .textContent =
            activeCircle.name;


        get("circle-description")
            .textContent =
            activeCircle.description ||
            "No description provided.";


        get("leave-circle-btn")
            .hidden =
            activeCircle.role ===
            "owner";


        await Promise.all([

            loadCircleMembers(),

            loadCircleFeed()

        ]);
    }


    async function loadCircleMembers() {

        if (
            !activeCircle
        ) {

            return;
        }


        const result =
            await supabaseClient
                .from(
                    "circle_members"
                )
                .select(
                    "user_id, role, joined_at"
                )
                .eq(
                    "circle_id",
                    activeCircle.id
                );


        const members =
            result.data ||
            [];


        const profiles =
            await getProfileMap(
                members.map(
                    function (member) {

                        return member.user_id;

                    }
                )
            );


        const list =
            get(
                "circle-list"
            );


        list.innerHTML =
            "";


        if (
            members.length ===
            0
        ) {

            list.innerHTML =
                "<li>No members.</li>";


            return;
        }


        members.forEach(
            function (member) {

                const item =
                    document.createElement(
                        "li"
                    );


                item.textContent =
                    displayName(
                        member.user_id,
                        profiles
                    )
                    +
                    " — "
                    +
                    member.role;


                list.appendChild(
                    item
                );

            }
        );
    }


    // ======================================================
    // LEAVE CIRCLE
    // ======================================================

    get("leave-circle-btn")
        .addEventListener(
            "click",
            async function () {

                if (
                    !activeCircle

                    ||

                    activeCircle.role ===
                    "owner"
                ) {

                    return;
                }


                if (
                    !window.confirm(
                        "Leave " +
                        activeCircle.name +
                        "?"
                    )
                ) {

                    return;
                }


                const result =
                    await supabaseClient
                        .from(
                            "circle_members"
                        )
                        .delete()
                        .eq(
                            "circle_id",
                            activeCircle.id
                        )
                        .eq(
                            "user_id",
                            currentUser.id
                        );


                if (
                    result.error
                ) {

                    recommend(
                        result.error.message
                    );


                    return;
                }


                activeCircle =
                    null;


                sessionStorage.removeItem(
                    "circlesync-active-circle"
                );


                await Promise.all([

                    loadMyCircles(),

                    loadDiscoverGroups()

                ]);

            }
        );


    // ======================================================
    // DISCOVER GROUPS
    // ======================================================

    async function loadDiscoverGroups() {

        const [
            circles,
            memberships,
            requestResult
        ] =
            await Promise.all([

                getCircles(),

                getMemberships(),

                supabaseClient
                    .from(
                        "circle_join_requests"
                    )
                    .select(
                        "id, circle_id, status, created_at"
                    )
                    .eq(
                        "requester_id",
                        currentUser.id
                    )
                    .order(
                        "created_at",
                        {

                            ascending:
                                false

                        }
                    )

            ]);


        const memberIds =
            new Set(
                memberships.map(
                    function (membership) {

                        return membership.circle_id;

                    }
                )
            );


        const requestMap =
            new Map();


        (
            requestResult.data ||
            []
        ).forEach(
            function (request) {

                if (
                    !requestMap.has(
                        request.circle_id
                    )
                ) {

                    requestMap.set(
                        request.circle_id,
                        request
                    );
                }

            }
        );


        const container =
            get(
                "discover-groups"
            );


        container.innerHTML =
            "";


        circles
            .filter(
                function (circle) {

                    return circle.is_public;

                }
            )
            .forEach(
                function (circle) {

                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "discover-group-card";


                    const title =
                        document.createElement(
                            "h3"
                        );


                    title.textContent =
                        circle.name;


                    const description =
                        document.createElement(
                            "p"
                        );


                    description.textContent =
                        circle.description ||
                        "No description provided.";


                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    const owner =
                        circle.created_by ===
                        currentUser.id;


                    const member =
                        memberIds.has(
                            circle.id
                        );


                    const request =
                        requestMap.get(
                            circle.id
                        );


                    if (
                        owner
                    ) {

                        button.textContent =
                            "Your Circle ✓";


                        button.disabled =
                            true;


                    } else if (
                        member
                    ) {

                        button.textContent =
                            activeCircle &&
                            activeCircle.id ===
                            circle.id

                                ? "Active Circle ✓"

                                : "Open Circle";


                        button.addEventListener(
                            "click",
                            async function () {

                                activeCircle =
                                    myCircles.find(
                                        function (item) {

                                            return (
                                                item.id ===
                                                circle.id
                                            );

                                        }
                                    );


                                sessionStorage.setItem(
                                    "circlesync-active-circle",
                                    circle.id
                                );


                                renderCircleSwitcher();


                                await renderActiveCircle();

                            }
                        );


                    } else if (
                        request &&
                        request.status ===
                        "pending"
                    ) {

                        button.textContent =
                            "Request Pending";


                        button.disabled =
                            true;


                    } else {

                        button.textContent =
                            request &&
                            request.status ===
                            "declined"

                                ? "Request Again"

                                : "Request to Join";


                        button.addEventListener(
                            "click",
                            async function () {

                                button.disabled =
                                    true;


                                button.textContent =
                                    "Sending...";


                                const result =
                                    await supabaseClient.rpc(
                                        "submit_circle_join_request",
                                        {

                                            circle_id_input:
                                                circle.id

                                        }
                                    );


                                if (
                                    result.error
                                ) {

                                    button.disabled =
                                        false;


                                    button.textContent =
                                        "Request to Join";


                                    recommend(
                                        "Request failed: " +
                                        result.error.message
                                    );


                                    return;
                                }


                                button.textContent =
                                    "Request Pending";


                                recommend(
                                    "Request sent to the creator of " +
                                    circle.name +
                                    "."
                                );


                                await loadDiscoverGroups();

                            }
                        );
                    }


                    card.append(
                        title,
                        description,
                        button
                    );


                    container.appendChild(
                        card
                    );

                }
            );
    }


    get("refresh-groups-btn")
        .addEventListener(
            "click",
            loadDiscoverGroups
        );


    // ======================================================
    // OWNER REQUESTS
    // ======================================================

    async function loadOwnerRequests() {

        const container =
            get(
                "join-requests-list"
            );


        const ownedCircles =
            myCircles.filter(
                function (circle) {

                    return (
                        circle.created_by ===
                        currentUser.id
                    );

                }
            );


        container.innerHTML =
            "";


        if (
            ownedCircles.length ===
            0
        ) {

            container.innerHTML =
                '<p class="empty-text">Create a circle to receive join requests.</p>';


            return;
        }


        const ownedIds =
            ownedCircles.map(
                function (circle) {

                    return circle.id;

                }
            );


        const result =
            await supabaseClient
                .from(
                    "circle_join_requests"
                )
                .select(
                    "id, circle_id, requester_id, status, created_at"
                )
                .in(
                    "circle_id",
                    ownedIds
                )
                .eq(
                    "status",
                    "pending"
                )
                .order(
                    "created_at",
                    {

                        ascending:
                            true

                    }
                );


        if (
            result.error
        ) {

            console.error(
                "Owner join request error:",
                result.error
            );


            container.innerHTML =
                '<p class="error-message">Unable to load join requests.</p>';


            return;
        }


        const requests =
            result.data ||
            [];


        if (
            requests.length ===
            0
        ) {

            container.innerHTML =
                '<p class="empty-text">No pending join requests right now.</p>';


            return;
        }


        const profiles =
            await getProfileMap(
                requests.map(
                    function (request) {

                        return request.requester_id;

                    }
                )
            );


        requests.forEach(
            function (request) {

                const circle =
                    ownedCircles.find(
                        function (item) {

                            return (
                                item.id ===
                                request.circle_id
                            );

                        }
                    );


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "request-row";


                const info =
                    document.createElement(
                        "div"
                    );


                const person =
                    document.createElement(
                        "strong"
                    );


                person.textContent =
                    profiles[
                        request.requester_id
                    ]
                    ||
                    "CircleSync User";


                const circleText =
                    document.createElement(
                        "span"
                    );


                circleText.textContent =
                    "wants to join " +
                    (
                        circle
                            ? circle.name
                            : "your circle"
                    );


                info.append(
                    person,
                    circleText
                );


                const actions =
                    document.createElement(
                        "div"
                    );


                actions.className =
                    "request-actions";


                const accept =
                    document.createElement(
                        "button"
                    );


                accept.type =
                    "button";


                accept.className =
                    "compact-btn";


                accept.textContent =
                    "Accept";


                const decline =
                    document.createElement(
                        "button"
                    );


                decline.type =
                    "button";


                decline.className =
                    "compact-btn danger-outline";


                decline.textContent =
                    "Decline";


                accept.addEventListener(
                    "click",
                    async function () {

                        await respondToRequest(
                            request.id,
                            true,
                            row
                        );

                    }
                );


                decline.addEventListener(
                    "click",
                    async function () {

                        await respondToRequest(
                            request.id,
                            false,
                            row
                        );

                    }
                );


                actions.append(
                    accept,
                    decline
                );


                row.append(
                    info,
                    actions
                );


                container.appendChild(
                    row
                );

            }
        );
    }


    async function respondToRequest(
        requestId,
        approve,
        row
    ) {

        row
            .querySelectorAll(
                "button"
            )
            .forEach(
                function (button) {

                    button.disabled =
                        true;

                }
            );


        const result =
            await supabaseClient.rpc(
                "respond_to_circle_join_request",
                {

                    request_id_input:
                        requestId,

                    approve_input:
                        approve

                }
            );


        if (
            result.error
        ) {

            recommend(
                result.error.message
            );


            row
                .querySelectorAll(
                    "button"
                )
                .forEach(
                    function (button) {

                        button.disabled =
                            false;

                    }
                );


            return;
        }


        row.remove();


        recommend(
            approve
                ? "Request accepted."
                : "Request declined."
        );


        await Promise.all([

            loadOwnerRequests(),

            loadMyCircles(),

            loadDiscoverGroups()

        ]);

    }


    // ======================================================
    // CREATE CIRCLE
    // ======================================================

    get("create-circle-btn")
        .addEventListener(
            "click",
            async function () {

                const name =
                    get("new-circle-name")
                        .value
                        .trim();


                const description =
                    get("new-circle-description")
                        .value
                        .trim();


                if (
                    !name
                ) {

                    recommend(
                        "Enter a circle name."
                    );


                    return;
                }


                const result =
                    await supabaseClient
                        .from(
                            "circles"
                        )
                        .insert({

                            name:
                                name,

                            description:
                                description,

                            created_by:
                                currentUser.id,

                            is_public:
                                true

                        })
                        .select()
                        .single();


                if (
                    result.error
                ) {

                    recommend(
                        result.error.message
                    );


                    return;
                }


                get("new-circle-name")
                    .value =
                    "";


                get("new-circle-description")
                    .value =
                    "";


                await Promise.all([

                    loadMyCircles(),

                    loadDiscoverGroups(),

                    loadOwnerRequests()

                ]);

            }
        );


    // ======================================================
    // CHECK INS
    // ======================================================

    async function saveCheckIn(
        type,
        options = {}
    ) {

        const result =
            await supabaseClient
                .from(
                    "check_ins"
                )
                .insert({

                    user_id:
                        currentUser.id,

                    circle_id:
                        activeCircle
                            ? activeCircle.id
                            : null,

                    check_in_type:
                        type,

                    energy_level:
                        options.energy_level ??
                        null,

                    notes:
                        options.notes ??
                        null,

                    shared_with_circle:
                        options.shared ===
                        true

                });


        if (
            result.error
        ) {

            recommend(
                result.error.message
            );


            return false;
        }


        return true;
    }


    // ======================================================
    // ENERGY
    // ======================================================

    const energyInput =
        get(
            "energy-input"
        );


    energyInput.addEventListener(
        "input",
        function () {

            get(
                "energy-value"
            ).textContent =
                energyInput.value;

        }
    );


    get("save-energy")
        .addEventListener(
            "click",
            async function () {

                const level =
                    Number(
                        energyInput.value
                    );


                if (
                    await saveCheckIn(
                        "energy",
                        {

                            energy_level:
                                level,

                            shared:
                                false

                        }
                    )
                ) {

                    get(
                        "energy-score"
                    ).textContent =
                        String(
                            level *
                            10
                        );

                }

            }
        );


    async function loadLatestEnergy() {

        const result =
            await supabaseClient
                .from(
                    "check_ins"
                )
                .select(
                    "energy_level"
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .not(
                    "energy_level",
                    "is",
                    null
                )
                .order(
                    "created_at",
                    {

                        ascending:
                            false

                    }
                )
                .limit(
                    1
                )
                .maybeSingle();


        if (
            !result.data
        ) {

            return;
        }


        energyInput.value =
            result.data.energy_level;


        get(
            "energy-value"
        ).textContent =
            result.data.energy_level;


        get(
            "energy-score"
        ).textContent =
            result.data.energy_level *
            10;
    }


    // ======================================================
    // QUICK CHECK INS
    // ======================================================

    const quickChecks = [

        [
            "breakfast-btn",
            "breakfast",
            "Breakfast completed."
        ],

        [
            "lunch-btn",
            "lunch",
            "Lunch completed."
        ],

        [
            "dinner-btn",
            "dinner",
            "Dinner completed."
        ],

        [
            "rest-btn",
            "rest",
            "Rest completed."
        ],

        [
            "working-btn",
            "focus",
            "Working check-in completed."
        ],

        [
            "sleep-btn",
            "sleep",
            "Bedtime check-in completed."
        ],

        [
            "wake-btn",
            "wake",
            "Wake-up completed."
        ]

    ];


    quickChecks.forEach(
        function (item) {

            get(
                item[0]
            ).addEventListener(
                "click",
                async function () {

                    const success =
                        await saveCheckIn(
                            item[1],
                            {

                                shared:
                                    Boolean(
                                        activeCircle
                                    )

                            }
                        );


                    if (
                        success
                    ) {

                        recommend(
                            item[2]
                        );


                        await Promise.all([

                            loadCircleFeed(),

                            updateRoutineEngine(),

                            checkRoutineNotifications()

                        ]);

                    }

                }
            );

        }
    );


    // ======================================================
    // FOCUS
    // ======================================================

    get("focus-btn")
        .addEventListener(
            "click",
            async function () {

                if (
                    !focusActive
                ) {

                    focusActive =
                        true;


                    focusStartedAt =
                        new Date();


                    get(
                        "focus-btn"
                    ).textContent =
                        "End Focus Session";


                    get(
                        "focus-status"
                    ).textContent =
                        "Focus session active.";


                    return;
                }


                const minutes =
                    Math.max(
                        1,
                        Math.round(
                            (
                                Date.now() -
                                focusStartedAt.getTime()
                            )
                            /
                            60000
                        )
                    );


                await saveCheckIn(
                    "focus",
                    {

                        notes:
                            minutes +
                            " minute focus session.",

                        shared:
                            Boolean(
                                activeCircle
                            )

                    }
                );


                focusActive =
                    false;


                focusStartedAt =
                    null;


                get(
                    "focus-btn"
                ).textContent =
                    "Start Focus Session";


                get(
                    "focus-status"
                ).textContent =
                    "Last session: " +
                    minutes +
                    " minutes.";

            }
        );


    // ======================================================
    // MESSAGES
    // ======================================================

    get("send-message-btn")
        .addEventListener(
            "click",
            async function () {

                if (
                    !activeCircle
                ) {

                    get(
                        "feed-message"
                    ).textContent =
                        "Select a circle first.";


                    return;
                }


                const input =
                    get(
                        "circle-message"
                    );


                const text =
                    input.value.trim();


                if (
                    !text
                ) {

                    return;
                }


                const result =
                    await supabaseClient
                        .from(
                            "circle_messages"
                        )
                        .insert({

                            circle_id:
                                activeCircle.id,

                            user_id:
                                currentUser.id,

                            message:
                                text

                        });


                if (
                    result.error
                ) {

                    get(
                        "feed-message"
                    ).textContent =
                        result.error.message;


                    return;
                }


                input.value =
                    "";


                await loadCircleFeed();

            }
        );


    function checkInLabel(type) {

        const labels = {

            breakfast:
                "🍳 Ate breakfast",

            lunch:
                "🥗 Ate lunch",

            dinner:
                "🍽 Ate dinner",

            rest:
                "😴 Took a rest",

            focus:
                "💻 Working / Focus",

            sleep:
                "🌙 Went to sleep",

            wake:
                "☀️ Woke up"

        };


        return (
            labels[type] ||
            "✓ Check-in"
        );
    }


    async function loadCircleFeed() {

        const feed =
            get(
                "circle-feed"
            );


        if (
            !activeCircle
        ) {

            feed.innerHTML =
                '<p class="empty-text">Select a circle.</p>';


            return;
        }


        const [
            messageResult,
            checkResult
        ] =
            await Promise.all([

                supabaseClient
                    .from(
                        "circle_messages"
                    )
                    .select(
                        "user_id, message, created_at"
                    )
                    .eq(
                        "circle_id",
                        activeCircle.id
                    )
                    .order(
                        "created_at",
                        {

                            ascending:
                                false

                        }
                    )
                    .limit(
                        50
                    ),

                supabaseClient
                    .from(
                        "check_ins"
                    )
                    .select(
                        "user_id, check_in_type, created_at"
                    )
                    .eq(
                        "circle_id",
                        activeCircle.id
                    )
                    .eq(
                        "shared_with_circle",
                        true
                    )
                    .order(
                        "created_at",
                        {

                            ascending:
                                false

                        }
                    )
                    .limit(
                        50
                    )

            ]);


        const messages =
            messageResult.data ||
            [];


        const checkIns =
            checkResult.data ||
            [];


        const profiles =
            await getProfileMap([

                ...messages.map(
                    function (item) {
                        return item.user_id;
                    }
                ),

                ...checkIns.map(
                    function (item) {
                        return item.user_id;
                    }
                )

            ]);


        const items = [

            ...messages.map(
                function (message) {

                    return {

                        user:
                            message.user_id,

                        text:
                            "💬 " +
                            message.message,

                        time:
                            message.created_at

                    };

                }
            ),

            ...checkIns.map(
                function (checkIn) {

                    return {

                        user:
                            checkIn.user_id,

                        text:
                            checkInLabel(
                                checkIn.check_in_type
                            ),

                        time:
                            checkIn.created_at

                    };

                }
            )

        ];


        items.sort(
            function (a, b) {

                return (
                    new Date(
                        b.time
                    )
                    -
                    new Date(
                        a.time
                    )
                );

            }
        );


        feed.innerHTML =
            "";


        if (
            items.length ===
            0
        ) {

            feed.innerHTML =
                '<p class="empty-text">No activity yet.</p>';


            return;
        }


        items.forEach(
            function (item) {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "feed-row";


                const meta =
                    document.createElement(
                        "div"
                    );


                meta.className =
                    "feed-meta";


                const name =
                    document.createElement(
                        "strong"
                    );


                name.textContent =
                    displayName(
                        item.user,
                        profiles
                    );


                const time =
                    document.createElement(
                        "span"
                    );


                time.textContent =
                    new Date(
                        item.time
                    ).toLocaleTimeString(
                        [],
                        {

                            hour:
                                "numeric",

                            minute:
                                "2-digit"

                        }
                    );


                const body =
                    document.createElement(
                        "p"
                    );


                body.textContent =
                    item.text;


                meta.append(
                    name,
                    time
                );


                row.append(
                    meta,
                    body
                );


                feed.appendChild(
                    row
                );

            }
        );
    }


    get("refresh-feed-btn")
        .addEventListener(
            "click",
            loadCircleFeed
        );


    // ======================================================
    // ROUTINE
    // ======================================================

    const routineElements = {

        wake:
            get("wake-time"),

        breakfast:
            get("breakfast-time"),

        lunch:
            get("lunch-time"),

        dinner:
            get("dinner-time"),

        rest:
            get("rest-time"),

        sleep:
            get("bedtime"),

        goal:
            get("sleep-goal")

    };


    async function loadRoutine() {

        const result =
            await supabaseClient
                .from(
                    "routines"
                )
                .select(
                    "*"
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .maybeSingle();


        currentRoutine =
            result.data ||
            null;


        if (
            !currentRoutine
        ) {

            return;
        }


        function setTime(
            element,
            value
        ) {

            element.value =
                value
                    ? value.substring(
                        0,
                        5
                    )
                    : "";

        }


        setTime(
            routineElements.wake,
            currentRoutine.wake_time
        );


        setTime(
            routineElements.breakfast,
            currentRoutine.breakfast_time
        );


        setTime(
            routineElements.lunch,
            currentRoutine.lunch_time
        );


        setTime(
            routineElements.dinner,
            currentRoutine.dinner_time
        );


        setTime(
            routineElements.rest,
            currentRoutine.rest_start_time
        );


        setTime(
            routineElements.sleep,
            currentRoutine.bedtime
        );


        routineElements.goal.value =
            currentRoutine.sleep_goal_hours ||
            8;
    }


    get("save-routine-btn")
        .addEventListener(
            "click",
            async function () {

                const result =
                    await supabaseClient
                        .from(
                            "routines"
                        )
                        .upsert(
                            {

                                user_id:
                                    currentUser.id,

                                wake_time:
                                    routineElements.wake.value ||
                                    null,

                                breakfast_time:
                                    routineElements.breakfast.value ||
                                    null,

                                lunch_time:
                                    routineElements.lunch.value ||
                                    null,

                                dinner_time:
                                    routineElements.dinner.value ||
                                    null,

                                rest_start_time:
                                    routineElements.rest.value ||
                                    null,

                                bedtime:
                                    routineElements.sleep.value ||
                                    null,

                                sleep_goal_hours:
                                    Number(
                                        routineElements.goal.value
                                    ),

                                updated_at:
                                    new Date()
                                        .toISOString()

                            },
                            {

                                onConflict:
                                    "user_id"

                            }
                        )
                        .select()
                        .single();


                if (
                    result.error
                ) {

                    get(
                        "routine-message"
                    ).textContent =
                        result.error.message;


                    return;
                }


                currentRoutine =
                    result.data;


                get(
                    "routine-message"
                ).textContent =
                    "Routine saved. Reminders updated.";


                await updateRoutineEngine();


                await checkRoutineNotifications();

            }
        );


    async function completedToday() {

        const now =
            new Date();


        const start =
            new Date(

                now.getFullYear(),

                now.getMonth(),

                now.getDate(),

                0,

                0,

                0

            );


        const result =
            await supabaseClient
                .from(
                    "check_ins"
                )
                .select(
                    "check_in_type"
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .gte(
                    "created_at",
                    start.toISOString()
                );


        return new Set(
            (
                result.data ||
                []
            ).map(
                function (item) {

                    return item.check_in_type;

                }
            )
        );
    }


    function timeToday(
        value
    ) {

        if (
            !value
        ) {

            return null;
        }


        const parts =
            value.split(
                ":"
            );


        const now =
            new Date();


        return new Date(

            now.getFullYear(),

            now.getMonth(),

            now.getDate(),

            Number(
                parts[0]
            ),

            Number(
                parts[1]
            ),

            0,

            0

        );
    }


    function routineItems() {

        if (
            !currentRoutine
        ) {

            return [];
        }


        return [

            {
                type: "wake",
                title: "Wake Up",
                icon: "☀️",
                time: currentRoutine.wake_time
            },

            {
                type: "breakfast",
                title: "Breakfast",
                icon: "🍳",
                time: currentRoutine.breakfast_time
            },

            {
                type: "lunch",
                title: "Lunch",
                icon: "🥗",
                time: currentRoutine.lunch_time
            },

            {
                type: "rest",
                title: "Rest",
                icon: "😴",
                time: currentRoutine.rest_start_time
            },

            {
                type: "dinner",
                title: "Dinner",
                icon: "🍽",
                time: currentRoutine.dinner_time
            },

            {
                type: "sleep",
                title: "Bedtime",
                icon: "🌙",
                time: currentRoutine.bedtime
            }

        ].filter(
            function (item) {

                return Boolean(
                    item.time
                );

            }
        );
    }


    // ======================================================
    // NOTIFICATION LOG
    // ======================================================

    function todayString() {

        const now =
            new Date();


        return [
            now.getFullYear(),
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            ),
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            )
        ].join(
            "-"
        );
    }


    async function notificationAlreadySent(
        type,
        stage
    ) {

        const result =
            await supabaseClient
                .from(
                    "routine_notification_log"
                )
                .select(
                    "id"
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .eq(
                    "routine_date",
                    todayString()
                )
                .eq(
                    "routine_type",
                    type
                )
                .eq(
                    "notification_stage",
                    stage
                )
                .maybeSingle();


        return Boolean(
            result.data
        );
    }


    async function markNotificationSent(
        type,
        stage
    ) {

        const result =
            await supabaseClient
                .from(
                    "routine_notification_log"
                )
                .upsert(
                    {

                        user_id:
                            currentUser.id,

                        routine_date:
                            todayString(),

                        routine_type:
                            type,

                        notification_stage:
                            stage

                    },
                    {

                        onConflict:
                            "user_id,routine_date,routine_type,notification_stage"

                    }
                );


        if (
            result.error
        ) {

            console.error(
                "Notification log error:",
                result.error
            );
        }
    }


    // ======================================================
    // ROUTINE NOTIFICATIONS
    // ======================================================

    async function checkRoutineNotifications() {

        if (
            !currentRoutine
        ) {

            return;
        }


        if (
            !("Notification" in window)
        ) {

            return;
        }


        if (
            Notification.permission !==
            "granted"
        ) {

            return;
        }


        const enabled =
            await getNotificationPreference();


        if (
            !enabled
        ) {

            return;
        }


        const completed =
            await completedToday();


        const now =
            new Date();


        for (
            const item
            of routineItems()
        ) {

            if (
                completed.has(
                    item.type
                )
            ) {

                continue;
            }


            const scheduled =
                timeToday(
                    item.time
                );


            const differenceMinutes =
                (
                    scheduled.getTime()
                    -
                    now.getTime()
                )
                /
                60000;


            // ==================================================
            // FIVE MINUTES BEFORE
            // ==================================================

            if (
                differenceMinutes <= 5.25

                &&

                differenceMinutes >= 4.25
            ) {

                const sent =
                    await notificationAlreadySent(
                        item.type,
                        "five-minute"
                    );


                if (
                    !sent
                ) {

                    await showNotification(

                        item.icon +
                        " " +
                        item.title +
                        " in 5 minutes",

                        upcomingMessage(
                            item.type
                        ),

                        "five-minute-" +
                        item.type +
                        "-" +
                        todayString()

                    );


                    await markNotificationSent(
                        item.type,
                        "five-minute"
                    );
                }
            }


            // ==================================================
            // FIFTEEN MINUTES AFTER
            // ==================================================

            if (
                differenceMinutes <= -15
            ) {

                const sent =
                    await notificationAlreadySent(
                        item.type,
                        "overdue"
                    );


                if (
                    !sent
                ) {

                    const latest =
                        await completedToday();


                    if (
                        !latest.has(
                            item.type
                        )
                    ) {

                        await showNotification(

                            item.icon +
                            " " +
                            item.title +
                            " is overdue",

                            overdueMessage(
                                item.type
                            ),

                            "overdue-" +
                            item.type +
                            "-" +
                            todayString()

                        );


                        await markNotificationSent(
                            item.type,
                            "overdue"
                        );
                    }
                }
            }
        }
    }


    function upcomingMessage(
        type
    ) {

        const messages = {

            breakfast:
                "Breakfast is in 5 minutes. Get ready to eat before your schedule gets busy.",

            lunch:
                "Lunch is in 5 minutes. Finish what you're doing and make time to eat.",

            dinner:
                "Dinner is in 5 minutes. Start wrapping up so you can eat on time.",

            rest:
                "Your rest break starts in 5 minutes. Prepare to step away for a moment.",

            sleep:
                "Bedtime is in 5 minutes. Start winding down for the night.",

            wake:
                "Your scheduled wake-up time is in 5 minutes."

        };


        return (
            messages[type]
            ||
            "Your next routine starts in 5 minutes."
        );
    }


    function overdueMessage(
        type
    ) {

        const messages = {

            breakfast:
                "You have not checked in for breakfast. Your breakfast time passed 15 minutes ago.",

            lunch:
                "You have not checked in for lunch. Your scheduled lunch time passed 15 minutes ago.",

            dinner:
                "You have not checked in for dinner. Your scheduled dinner time passed 15 minutes ago.",

            rest:
                "You have not checked in for your planned rest. Take a break before continuing.",

            sleep:
                "You have not checked in for bedtime. Your scheduled bedtime passed 15 minutes ago.",

            wake:
                "You have not checked in as awake. Your wake-up time passed 15 minutes ago."

        };


        return (
            messages[type]
            ||
            "Your scheduled routine activity is overdue."
        );
    }


    // ======================================================
    // NEXT UP ENGINE
    // ======================================================

    async function updateRoutineEngine() {

        if (
            !currentRoutine
        ) {

            get("next-up-label")
                .textContent =
                "No Routine";


            get("next-up-title")
                .textContent =
                "Set your routine below";


            get("next-up-countdown")
                .textContent =
                "";


            return;
        }


        const completed =
            await completedToday();


        const now =
            new Date();


        const items =
            routineItems()
                .map(
                    function (item) {

                        return {

                            ...item,

                            scheduled:
                                timeToday(
                                    item.time
                                )

                        };

                    }
                )
                .sort(
                    function (a, b) {

                        return (
                            a.scheduled -
                            b.scheduled
                        );

                    }
                );


        const overdue =
            items
                .filter(
                    function (item) {

                        return (

                            item.scheduled <=
                                now

                            &&

                            !completed.has(
                                item.type
                            )

                        );

                    }
                )
                .pop();


        const next =
            items.find(
                function (item) {

                    return (
                        item.scheduled >
                        now
                    );

                }
            );


        if (
            overdue
        ) {

            const minutes =
                Math.floor(
                    (
                        now -
                        overdue.scheduled
                    )
                    /
                    60000
                );


            get("next-up-label")
                .textContent =
                "Needs Attention";


            get("next-up-title")
                .textContent =
                overdue.icon +
                " " +
                overdue.title;


            get("next-up-countdown")
                .textContent =
                minutes +
                " minutes overdue";


            return;
        }


        if (
            next
        ) {

            const minutes =
                Math.ceil(
                    (
                        next.scheduled -
                        now
                    )
                    /
                    60000
                );


            get("next-up-label")
                .textContent =
                "Next Up";


            get("next-up-title")
                .textContent =
                next.icon +
                " " +
                next.title;


            if (
                minutes < 60
            ) {

                get("next-up-countdown")
                    .textContent =
                    "In " +
                    minutes +
                    " minutes";


            } else {

                get("next-up-countdown")
                    .textContent =
                    "In " +
                    Math.floor(
                        minutes /
                        60
                    )
                    +
                    "h "
                    +
                    (
                        minutes %
                        60
                    )
                    +
                    "m";
            }


            return;
        }


        get("next-up-label")
            .textContent =
            "Routine Complete";


        get("next-up-title")
            .textContent =
            "✓ Done for today";


        get("next-up-countdown")
            .textContent =
            "Nice work";
    }


    function startRoutineMonitoring() {

        if (
            routineTimer
        ) {

            clearInterval(
                routineTimer
            );
        }


        updateRoutineEngine();


        checkRoutineNotifications();


        routineTimer =
            setInterval(
                async function () {

                    await updateRoutineEngine();


                    await checkRoutineNotifications();

                },
                15000
            );
    }


    // ======================================================
    // REALTIME
    // ======================================================

    function startRealtime() {

        if (
            realtimeChannel
        ) {

            supabaseClient.removeChannel(
                realtimeChannel
            );
        }


        realtimeChannel =
            supabaseClient
                .channel(
                    "circlesync-v74-" +
                    currentUser.id
                )


                .on(
                    "postgres_changes",
                    {

                        event:
                            "*",

                        schema:
                            "public",

                        table:
                            "circle_join_requests"

                    },
                    async function () {

                        await loadOwnerRequests();


                        await loadDiscoverGroups();


                        await loadMyCircles();

                    }
                )


                .on(
                    "postgres_changes",
                    {

                        event:
                            "*",

                        schema:
                            "public",

                        table:
                            "circle_members"

                    },
                    async function () {

                        await loadMyCircles();


                        await loadDiscoverGroups();


                        await loadOwnerRequests();

                    }
                )


                .on(
                    "postgres_changes",
                    {

                        event:
                            "*",

                        schema:
                            "public",

                        table:
                            "circle_messages"

                    },
                    async function () {

                        await loadCircleFeed();

                    }
                )


                .on(
                    "postgres_changes",
                    {

                        event:
                            "*",

                        schema:
                            "public",

                        table:
                            "check_ins"

                    },
                    async function () {

                        await loadCircleFeed();


                        await updateRoutineEngine();

                    }
                )


                .subscribe(
                    function (status) {

                        console.log(
                            "CircleSync Realtime:",
                            status
                        );

                    }
                );
    }


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    await Promise.all([

        loadLatestEnergy(),

        loadRoutine()

    ]);


    await loadMyCircles();


    await Promise.all([

        loadDiscoverGroups(),

        loadOwnerRequests()

    ]);


    startRealtime();


    startRoutineMonitoring();


    recommend(
        "CircleSync is connected to Supabase."
    );


    console.log(
        "CircleSync dashboard v74 ready."
    );
}
