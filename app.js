"use strict";

/* ==========================================================
   CIRCLESYNC
   APP.JS VERSION 75
   ========================================================== */

console.log("CircleSync app.js v75 loaded");


/* ==========================================================
   SUPABASE CONFIGURATION
   ========================================================== */

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


/* ==========================================================
   SERVICE WORKER
   ========================================================== */

async function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) {

        console.warn(
            "Service workers are not supported by this browser."
        );

        return null;
    }


    try {

        serviceWorkerRegistration =
            await navigator.serviceWorker.register(
                "./service-worker.js"
            );


        await serviceWorkerRegistration.update();


        serviceWorkerRegistration =
            await navigator.serviceWorker.ready;


        console.log(
            "CircleSync service worker v75 ready."
        );


        return serviceWorkerRegistration;


    } catch (error) {

        console.error(
            "CircleSync service worker registration failed:",
            error
        );


        return null;
    }
}


/* ==========================================================
   START APPLICATION
   ========================================================== */

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


/* ==========================================================
   AUTH PAGE
   ========================================================== */

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


    if (
        !signinSection ||
        !signupSection ||
        !signinTab ||
        !signupTab ||
        !signinForm ||
        !signupForm ||
        !authMessage
    ) {

        console.error(
            "CircleSync authentication HTML is missing required elements."
        );

        return;
    }


    function showAuthMessage(
        message,
        isError
    ) {

        authMessage.textContent =
            message;


        authMessage.className =
            isError
                ? "status error-message"
                : "status success-message";
    }


    function showSignin() {

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


    function showSignup() {

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


    signinTab.addEventListener(
        "click",
        showSignin
    );


    signupTab.addEventListener(
        "click",
        showSignup
    );


    /* ------------------------------------------------------
       If the user already has a session, send them
       directly to the dashboard.
       ------------------------------------------------------ */

    const sessionResult =
        await supabaseClient.auth.getSession();


    if (
        sessionResult.data &&
        sessionResult.data.session
    ) {

        window.location.replace(
            "./dashboard.html"
        );

        return;
    }


    /* ------------------------------------------------------
       SIGN IN
       ------------------------------------------------------ */

    signinForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const emailInput =
                get("signin-email");


            const passwordInput =
                get("signin-password");


            const loginButton =
                get("login-btn");


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            if (
                !email ||
                !password
            ) {

                showAuthMessage(
                    "Enter your email and password.",
                    true
                );

                return;
            }


            loginButton.disabled =
                true;


            loginButton.textContent =
                "Signing In...";


            try {

                const result =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email:
                                email,

                            password:
                                password

                        });


                if (
                    result.error
                ) {

                    showAuthMessage(
                        result.error.message,
                        true
                    );

                    return;
                }


                window.location.replace(
                    "./dashboard.html"
                );


            } catch (error) {

                console.error(
                    "Sign-in error:",
                    error
                );


                showAuthMessage(
                    "Unable to sign in right now.",
                    true
                );


            } finally {

                loginButton.disabled =
                    false;


                loginButton.textContent =
                    "Sign In";
            }

        }
    );


    /* ------------------------------------------------------
       CREATE ACCOUNT
       ------------------------------------------------------ */

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const emailInput =
                get("signup-email");


            const passwordInput =
                get("signup-password");


            const confirmInput =
                get("signup-confirm-password");


            const signupButton =
                get("signup-btn");


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            const confirmation =
                confirmInput.value;


            if (!email) {

                showAuthMessage(
                    "Enter an email address.",
                    true
                );

                return;
            }


            if (
                password.length < 6
            ) {

                showAuthMessage(
                    "Password must contain at least 6 characters.",
                    true
                );

                return;
            }


            if (
                password !==
                confirmation
            ) {

                showAuthMessage(
                    "The passwords do not match.",
                    true
                );

                return;
            }


            signupButton.disabled =
                true;


            signupButton.textContent =
                "Creating Account...";


            try {

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


                if (
                    result.error
                ) {

                    showAuthMessage(
                        result.error.message,
                        true
                    );

                    return;
                }


                if (
                    result.data &&
                    result.data.session
                ) {

                    window.location.replace(
                        "./dashboard.html"
                    );

                    return;
                }


                showAuthMessage(
                    "Account created. Check your email, confirm your account, then return here and sign in with the password you created.",
                    false
                );


                passwordInput.value =
                    "";


                confirmInput.value =
                    "";


            } catch (error) {

                console.error(
                    "Signup error:",
                    error
                );


                showAuthMessage(
                    "Unable to create your account right now.",
                    true
                );


            } finally {

                signupButton.disabled =
                    false;


                signupButton.textContent =
                    "Create Account";
            }

        }
    );
}


/* ==========================================================
   DASHBOARD
   ========================================================== */

async function initDashboardPage() {

    function get(id) {

        return document.getElementById(id);
    }


    /* ======================================================
       APPLICATION STATE
       ====================================================== */

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


    let latestEnergyLevel =
        null;


    /* ======================================================
       SESSION CHECK
       ====================================================== */

    const sessionResult =
        await supabaseClient.auth.getSession();


    if (
        sessionResult.error ||
        !sessionResult.data ||
        !sessionResult.data.session
    ) {

        window.location.replace(
            "./index.html"
        );

        return;
    }


    currentUser =
        sessionResult.data.session.user;


    if (
        get("user-email")
    ) {

        get("user-email").textContent =
            currentUser.email ||
            "Signed in";
    }


    /* ======================================================
       SAFE UI HELPERS
       ====================================================== */

    function setText(
        elementId,
        text
    ) {

        const element =
            get(elementId);


        if (element) {

            element.textContent =
                text;
        }
    }


    function recommendation(
        text
    ) {

        setText(
            "recommendation",
            text
        );
    }


    /* ======================================================
       LOG OUT
       ====================================================== */

    const logoutButton =
        get("logout-btn");


    if (
        logoutButton
    ) {

        logoutButton.addEventListener(
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
    }


    /* ======================================================
       NOTIFICATION PREFERENCE
       Stored in Supabase:
       notification_preferences
       ====================================================== */

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
                "Notification preference read error:",
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


    /* ======================================================
       DISPLAY A NOTIFICATION
       ====================================================== */

    async function displayNotification(
        title,
        body,
        tag
    ) {

        if (
            !("Notification" in window)
        ) {

            console.warn(
                "Notification API unavailable."
            );

            return false;
        }


        if (
            Notification.permission !==
            "granted"
        ) {

            console.warn(
                "Notification permission is not granted."
            );

            return false;
        }


        const notificationOptions = {

            body:
                body,

            tag:
                tag,

            renotify:
                true,

            requireInteraction:
                true,

            timestamp:
                Date.now(),

            data: {

                url:
                    "./dashboard.html"

            }

        };


        /* --------------------------------------------------
           First choice:
           persistent service-worker notification.
           -------------------------------------------------- */

        try {

            const registration =
                serviceWorkerRegistration
                ||
                await navigator.serviceWorker.ready;


            if (
                registration &&
                registration.showNotification
            ) {

                await registration.showNotification(
                    title,
                    notificationOptions
                );


                console.log(
                    "CircleSync notification sent:",
                    title
                );


                return true;
            }


        } catch (error) {

            console.error(
                "Service-worker notification failed:",
                error
            );
        }


        /* --------------------------------------------------
           Desktop Chrome fallback.
           -------------------------------------------------- */

        try {

            const browserNotification =
                new Notification(
                    title,
                    {

                        body:
                            body,

                        tag:
                            tag,

                        requireInteraction:
                            true

                    }
                );


            browserNotification.onclick =
                function () {

                    window.focus();


                    browserNotification.close();
                };


            console.log(
                "CircleSync fallback notification sent:",
                title
            );


            return true;


        } catch (error) {

            console.error(
                "Fallback notification failed:",
                error
            );


            return false;
        }
    }


    /* ======================================================
       NOTIFICATION BUTTON
       TRUE ON / OFF TOGGLE
       ====================================================== */

    async function updateNotificationButton() {

        const button =
            get("notification-btn");


        const status =
            get("notification-status");


        if (
            !button ||
            !status
        ) {

            return;
        }


        if (
            !("Notification" in window)
        ) {

            button.textContent =
                "Notifications Unsupported";


            button.disabled =
                true;


            status.textContent =
                "This browser does not support notifications.";


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
                "Chrome is blocking notifications for CircleSync. Change this site's notification permission to Allow, then reload the page.";


            return;
        }


        if (
            Notification.permission ===
            "granted" &&
            enabled
        ) {

            button.textContent =
                "Disable Notifications";


            status.textContent =
                "Notifications are ON. You will get a reminder before scheduled routines and an overdue warning if you do not check in.";


            return;
        }


        button.textContent =
            "Enable Notifications";


        status.textContent =
            "Notifications are OFF.";
    }


    const notificationButton =
        get("notification-btn");


    if (
        notificationButton
    ) {

        notificationButton.addEventListener(
            "click",
            async function () {

                notificationButton.disabled =
                    true;


                try {

                    const currentlyEnabled =
                        await getNotificationPreference();


                    /* --------------------------------------
                       USER IS TURNING NOTIFICATIONS OFF
                       -------------------------------------- */

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

                            recommendation(
                                "Routine notifications are off. Your schedule and check-ins will still be tracked, but CircleSync will not send routine alerts."
                            );
                        }


                        return;
                    }


                    /* --------------------------------------
                       USER IS TURNING NOTIFICATIONS ON
                       -------------------------------------- */

                    if (
                        !("Notification" in window)
                    ) {

                        recommendation(
                            "This browser does not support web notifications."
                        );

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

                        recommendation(
                            "Chrome is blocking CircleSync notifications. Open this site's browser settings, set Notifications to Allow, then reload CircleSync."
                        );

                        return;
                    }


                    if (
                        permission !==
                        "granted"
                    ) {

                        recommendation(
                            "CircleSync needs notification permission before routine reminders can be enabled."
                        );

                        return;
                    }


                    const saved =
                        await saveNotificationPreference(
                            true
                        );


                    if (
                        !saved
                    ) {

                        recommendation(
                            "CircleSync could not save your notification preference to Supabase."
                        );

                        return;
                    }


                    await displayNotification(

                        "CircleSync Notifications On ✅",

                        "Notifications are working. CircleSync will remind you before meals, rest, bedtime, and wake time.",

                        "circlesync-enabled-" +
                        Date.now()

                    );


                    recommendation(
                        "Notifications are on. CircleSync will remind you 5 minutes before your routine and warn you again 15 minutes after the scheduled time if you have not checked in."
                    );


                    await checkRoutineNotifications();


                } catch (error) {

                    console.error(
                        "Notification toggle error:",
                        error
                    );


                    recommendation(
                        "CircleSync could not change your notification setting."
                    );


                } finally {

                    notificationButton.disabled =
                        false;


                    await updateNotificationButton();
                }

            }
        );
    }


    /* ======================================================
       PROFILE HELPERS
       ====================================================== */

    async function getProfileMap(
        userIds
    ) {

        const map =
            {};


        const uniqueIds =
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
            uniqueIds.length ===
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
                    uniqueIds
                );


        if (
            result.error
        ) {

            console.error(
                "Profile lookup error:",
                result.error
            );


            return map;
        }


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
            profileMap[userId] ||
            "CircleSync User"
        );
    }


    /* ======================================================
       CIRCLE DATABASE HELPERS
       ====================================================== */

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
                "Membership query error:",
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
                "Circle query error:",
                result.error
            );


            return [];
        }


        return (
            result.data ||
            []
        );
    }


    /* ======================================================
       LOAD MY CIRCLES
       ====================================================== */

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


        const savedCircleId =
            sessionStorage.getItem(
                "circlesync-active-circle"
            );


        const previousCircleId =
            activeCircle
                ? activeCircle.id
                : savedCircleId;


        activeCircle =
            myCircles.find(
                function (circle) {

                    return (
                        circle.id ===
                        previousCircleId
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


        } else {

            sessionStorage.removeItem(
                "circlesync-active-circle"
            );
        }


        renderCircleSwitcher();


        await renderActiveCircle();
    }


    /* ======================================================
       CIRCLE SWITCHER
       ====================================================== */

    function renderCircleSwitcher() {

        const container =
            get("my-circles-scroll");


        if (
            !container
        ) {

            return;
        }


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


                        await updateSmartRecommendation();

                    }
                );


                container.appendChild(
                    button
                );

            }
        );
    }


    /* ======================================================
       ACTIVE CIRCLE
       ====================================================== */

    async function renderActiveCircle() {

        const leaveButton =
            get("leave-circle-btn");


        if (
            !activeCircle
        ) {

            setText(
                "circle-name",
                "No Circle Selected"
            );


            setText(
                "circle-description",
                "Create a circle or request to join one."
            );


            if (
                leaveButton
            ) {

                leaveButton.hidden =
                    true;
            }


            const memberList =
                get("circle-list");


            if (
                memberList
            ) {

                memberList.innerHTML =
                    "<li>No members.</li>";
            }


            const feed =
                get("circle-feed");


            if (
                feed
            ) {

                feed.innerHTML =
                    '<p class="empty-text">Select a circle to see its activity.</p>';
            }


            return;
        }


        setText(
            "circle-name",
            activeCircle.name
        );


        setText(
            "circle-description",
            activeCircle.description ||
            "No description provided."
        );


        if (
            leaveButton
        ) {

            leaveButton.hidden =
                activeCircle.role ===
                "owner";
        }


        await Promise.all([

            loadCircleMembers(),

            loadCircleFeed()

        ]);
    }


    /* ======================================================
       CIRCLE MEMBERS
       ====================================================== */

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
                )
                .order(
                    "joined_at",
                    {

                        ascending:
                            true

                    }
                );


        const memberList =
            get("circle-list");


        if (
            !memberList
        ) {

            return;
        }


        if (
            result.error
        ) {

            console.error(
                "Circle members error:",
                result.error
            );


            memberList.innerHTML =
                "<li>Unable to load members.</li>";


            return;
        }


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


        memberList.innerHTML =
            "";


        if (
            members.length ===
            0
        ) {

            memberList.innerHTML =
                "<li>No members yet.</li>";

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


                memberList.appendChild(
                    item
                );

            }
        );
    }


    /* ======================================================
       LEAVE CIRCLE
       ====================================================== */

    const leaveCircleButton =
        get("leave-circle-btn");


    if (
        leaveCircleButton
    ) {

        leaveCircleButton.addEventListener(
            "click",
            async function () {

                if (
                    !activeCircle ||
                    activeCircle.role ===
                    "owner"
                ) {

                    return;
                }


                const circleName =
                    activeCircle.name;


                const confirmed =
                    window.confirm(
                        "Leave " +
                        circleName +
                        "?"
                    );


                if (
                    !confirmed
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

                    recommendation(
                        "CircleSync could not leave the circle: " +
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

                    loadDiscoverGroups(),

                    loadOwnerRequests()

                ]);


                recommendation(
                    "You left " +
                    circleName +
                    ". You can request to join it again later if the group remains public."
                );

            }
        );
    }


    /* ======================================================
       DISCOVER GROUPS
       ====================================================== */

    async function loadDiscoverGroups() {

        const container =
            get("discover-groups");


        if (
            !container
        ) {

            return;
        }


        container.innerHTML =
            '<p class="empty-text">Loading groups...</p>';


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


        if (
            requestResult.error
        ) {

            console.error(
                "Discover request-status error:",
                requestResult.error
            );
        }


        const membershipIds =
            new Set(
                memberships.map(
                    function (membership) {

                        return membership.circle_id;

                    }
                )
            );


        const latestRequestByCircle =
            new Map();


        (
            requestResult.data ||
            []
        ).forEach(
            function (request) {

                if (
                    !latestRequestByCircle.has(
                        request.circle_id
                    )
                ) {

                    latestRequestByCircle.set(
                        request.circle_id,
                        request
                    );
                }

            }
        );


        container.innerHTML =
            "";


        const publicCircles =
            circles.filter(
                function (circle) {

                    return (
                        circle.is_public ===
                        true
                    );

                }
            );


        if (
            publicCircles.length ===
            0
        ) {

            container.innerHTML =
                '<p class="empty-text">No public circles are available yet.</p>';

            return;
        }


        publicCircles.forEach(
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


                const isOwner =
                    circle.created_by ===
                    currentUser.id;


                const isMember =
                    membershipIds.has(
                        circle.id
                    );


                const request =
                    latestRequestByCircle.get(
                        circle.id
                    );


                if (
                    isOwner
                ) {

                    button.textContent =
                        "Your Circle ✓";


                    button.disabled =
                        true;


                } else if (
                    isMember
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

                            const selectedCircle =
                                myCircles.find(
                                    function (item) {

                                        return (
                                            item.id ===
                                            circle.id
                                        );

                                    }
                                );


                            if (
                                !selectedCircle
                            ) {

                                return;
                            }


                            activeCircle =
                                selectedCircle;


                            sessionStorage.setItem(
                                "circlesync-active-circle",
                                selectedCircle.id
                            );


                            renderCircleSwitcher();


                            await renderActiveCircle();


                            await updateSmartRecommendation();

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
                                "Sending Request...";


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

                                console.error(
                                    "Join request RPC error:",
                                    result.error
                                );


                                button.disabled =
                                    false;


                                button.textContent =
                                    "Request to Join";


                                recommendation(
                                    "Your request could not be sent: " +
                                    result.error.message
                                );


                                return;
                            }


                            button.textContent =
                                "Request Pending";


                            recommendation(
                                "Your request to join " +
                                circle.name +
                                " was sent. The circle creator can now accept or decline it."
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


    const refreshGroupsButton =
        get("refresh-groups-btn");


    if (
        refreshGroupsButton
    ) {

        refreshGroupsButton.addEventListener(
            "click",
            loadDiscoverGroups
        );
    }


    /* ======================================================
       OWNER JOIN REQUESTS

       IMPORTANT:
       This always looks at ALL circles the user owns,
       not merely the currently active circle.
       ====================================================== */

    async function loadOwnerRequests() {

        const container =
            get("join-requests-list");


        if (
            !container
        ) {

            return;
        }


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
                '<p class="empty-text">Create a circle to begin receiving join requests.</p>';

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
                "Owner request query error:",
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


                const information =
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


                information.append(
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
                            row,
                            circle
                        );

                    }
                );


                decline.addEventListener(
                    "click",
                    async function () {

                        await respondToRequest(
                            request.id,
                            false,
                            row,
                            circle
                        );

                    }
                );


                actions.append(
                    accept,
                    decline
                );


                row.append(
                    information,
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
        requestRow,
        circle
    ) {

        const buttons =
            requestRow.querySelectorAll(
                "button"
            );


        buttons.forEach(
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

            console.error(
                "Respond-to-request RPC error:",
                result.error
            );


            recommendation(
                "CircleSync could not process this join request: " +
                result.error.message
            );


            buttons.forEach(
                function (button) {

                    button.disabled =
                        false;

                }
            );


            return;
        }


        /* --------------------------------------------------
           Remove ONLY the request itself.
           The Join Requests card remains on screen.
           -------------------------------------------------- */

        requestRow.remove();


        recommendation(
            approve

                ? "Request accepted. The new member can now open " +
                  (
                      circle
                          ? circle.name
                          : "the circle"
                  ) +
                  ", participate in its feed, and share check-ins."

                : "Request declined. The request has been removed from your pending requests."
        );


        await Promise.all([

            loadOwnerRequests(),

            loadMyCircles(),

            loadDiscoverGroups(),

            loadCircleMembers()

        ]);
    }


    /* ======================================================
       CREATE CIRCLE
       ====================================================== */

    const createCircleButton =
        get("create-circle-btn");


    if (
        createCircleButton
    ) {

        createCircleButton.addEventListener(
            "click",
            async function () {

                const nameInput =
                    get("new-circle-name");


                const descriptionInput =
                    get("new-circle-description");


                const name =
                    nameInput.value.trim();


                const description =
                    descriptionInput.value.trim();


                if (
                    !name
                ) {

                    recommendation(
                        "Give your accountability circle a name before creating it."
                    );

                    return;
                }


                createCircleButton.disabled =
                    true;


                createCircleButton.textContent =
                    "Creating Circle...";


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


                createCircleButton.disabled =
                    false;


                createCircleButton.textContent =
                    "Create Circle";


                if (
                    result.error
                ) {

                    recommendation(
                        "CircleSync could not create the circle: " +
                        result.error.message
                    );

                    return;
                }


                nameInput.value =
                    "";


                descriptionInput.value =
                    "";


                sessionStorage.setItem(
                    "circlesync-active-circle",
                    result.data.id
                );


                await Promise.all([

                    loadMyCircles(),

                    loadDiscoverGroups(),

                    loadOwnerRequests()

                ]);


                recommendation(
                    result.data.name +
                    " has been created. Other CircleSync users can now discover it and request to join."
                );

            }
        );
    }


    /* ======================================================
       SAVE CHECK-IN
       ====================================================== */

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

                    stress_level:
                        options.stress_level ??
                        null,

                    sleep_hours:
                        options.sleep_hours ??
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

            console.error(
                "Check-in error:",
                result.error
            );


            recommendation(
                "CircleSync could not save this check-in: " +
                result.error.message
            );


            return false;
        }


        return true;
    }


    /* ======================================================
       ENERGY
       ====================================================== */

    const energyInput =
        get("energy-input");


    const energyValue =
        get("energy-value");


    if (
        energyInput &&
        energyValue
    ) {

        energyInput.addEventListener(
            "input",
            function () {

                energyValue.textContent =
                    energyInput.value;

            }
        );
    }


    const saveEnergyButton =
        get("save-energy");


    if (
        saveEnergyButton
    ) {

        saveEnergyButton.addEventListener(
            "click",
            async function () {

                const level =
                    Number(
                        energyInput.value
                    );


                const saved =
                    await saveCheckIn(
                        "energy",
                        {

                            energy_level:
                                level,

                            shared:
                                false

                        }
                    );


                if (
                    !saved
                ) {

                    return;
                }


                latestEnergyLevel =
                    level;


                setText(
                    "energy-score",
                    String(
                        level *
                        10
                    )
                );


                await updateSmartRecommendation();

            }
        );
    }


    async function loadLatestEnergy() {

        const result =
            await supabaseClient
                .from(
                    "check_ins"
                )
                .select(
                    "energy_level, created_at"
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
            result.error ||
            !result.data
        ) {

            return;
        }


        latestEnergyLevel =
            Number(
                result.data.energy_level
            );


        if (
            energyInput
        ) {

            energyInput.value =
                String(
                    latestEnergyLevel
                );
        }


        if (
            energyValue
        ) {

            energyValue.textContent =
                String(
                    latestEnergyLevel
                );
        }


        setText(
            "energy-score",
            String(
                latestEnergyLevel *
                10
            )
        );
    }


    /* ======================================================
       QUICK CHECK-INS
       ====================================================== */

    const quickCheckConfiguration = [

        {
            id:
                "breakfast-btn",

            type:
                "breakfast",

            message:
                "Breakfast recorded. Starting the day with food can help you avoid pushing your first meal too far into the day."
        },

        {
            id:
                "lunch-btn",

            type:
                "lunch",

            message:
                "Lunch recorded. You have completed your scheduled midday meal."
        },

        {
            id:
                "dinner-btn",

            type:
                "dinner",

            message:
                "Dinner recorded. Keep your remaining evening routine in mind so dinner does not push bedtime later."
        },

        {
            id:
                "rest-btn",

            type:
                "rest",

            message:
                "Rest recorded. Use the break to reset before returning to your responsibilities."
        },

        {
            id:
                "working-btn",

            type:
                "focus",

            message:
                "Working check-in recorded. Stay focused, but keep your next meal, rest, or bedtime in view."
        },

        {
            id:
                "sleep-btn",

            type:
                "sleep",

            message:
                "Bedtime recorded. Your sleep check-in is complete for tonight."
        },

        {
            id:
                "wake-btn",

            type:
                "wake",

            message:
                "Wake-up recorded. Check your breakfast time next so the morning does not turn into another skipped meal."
        }

    ];


    quickCheckConfiguration.forEach(
        function (configuration) {

            const button =
                get(
                    configuration.id
                );


            if (
                !button
            ) {

                return;
            }


            button.addEventListener(
                "click",
                async function () {

                    button.disabled =
                        true;


                    const success =
                        await saveCheckIn(
                            configuration.type,
                            {

                                shared:
                                    Boolean(
                                        activeCircle
                                    )

                            }
                        );


                    button.disabled =
                        false;


                    if (
                        !success
                    ) {

                        return;
                    }


                    recommendation(
                        configuration.message
                    );


                    await Promise.all([

                        loadCircleFeed(),

                        updateRoutineEngine(),

                        checkRoutineNotifications()

                    ]);


                    await updateSmartRecommendation(
                        configuration.message
                    );

                }
            );

        }
    );


    /* ======================================================
       FOCUS MODE
       ====================================================== */

    const focusButton =
        get("focus-btn");


    if (
        focusButton
    ) {

        focusButton.addEventListener(
            "click",
            async function () {

                if (
                    !focusActive
                ) {

                    focusActive =
                        true;


                    focusStartedAt =
                        new Date();


                    focusButton.textContent =
                        "End Focus Session";


                    setText(
                        "focus-status",
                        "Focus session active."
                    );


                    recommendation(
                        "Focus mode is active. CircleSync will continue watching your scheduled meals, rest, and bedtime while you work."
                    );


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
                            "Completed a " +
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


                focusButton.textContent =
                    "Start Focus Session";


                setText(
                    "focus-status",
                    "Last focus session: " +
                    minutes +
                    " minutes."
                );


                recommendation(
                    minutes >= 45

                        ? "You focused for " +
                          minutes +
                          " minutes. This is a good point to check whether you need water, food, movement, or a short rest before starting another long session."

                        : "Focus session complete. Check your Next Up card before beginning another task."
                );


                await loadCircleFeed();

            }
        );
    }


    /* ======================================================
       CIRCLE MESSAGES
       ====================================================== */

    const sendMessageButton =
        get("send-message-btn");


    if (
        sendMessageButton
    ) {

        sendMessageButton.addEventListener(
            "click",
            async function () {

                if (
                    !activeCircle
                ) {

                    setText(
                        "feed-message",
                        "Select a circle before sending a message."
                    );

                    return;
                }


                const input =
                    get("circle-message");


                const message =
                    input.value.trim();


                if (
                    !message
                ) {

                    setText(
                        "feed-message",
                        "Enter a message first."
                    );

                    return;
                }


                sendMessageButton.disabled =
                    true;


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
                                message

                        });


                sendMessageButton.disabled =
                    false;


                if (
                    result.error
                ) {

                    console.error(
                        "Message error:",
                        result.error
                    );


                    setText(
                        "feed-message",
                        result.error.message
                    );


                    return;
                }


                input.value =
                    "";


                setText(
                    "feed-message",
                    "Message sent."
                );


                await loadCircleFeed();

            }
        );
    }


    function checkInLabel(
        type
    ) {

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
            "✓ Completed a check-in"
        );
    }


    /* ======================================================
       CIRCLE FEED
       ====================================================== */

    async function loadCircleFeed() {

        const feed =
            get("circle-feed");


        if (
            !feed
        ) {

            return;
        }


        if (
            !activeCircle
        ) {

            feed.innerHTML =
                '<p class="empty-text">Select a circle to view activity.</p>';

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
                        "id, user_id, message, created_at"
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
                        "id, user_id, check_in_type, created_at"
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


        if (
            messageResult.error
        ) {

            console.error(
                "Feed message query error:",
                messageResult.error
            );
        }


        if (
            checkResult.error
        ) {

            console.error(
                "Feed check-in query error:",
                checkResult.error
            );
        }


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

                        userId:
                            message.user_id,

                        text:
                            "💬 " +
                            message.message,

                        createdAt:
                            message.created_at

                    };

                }
            ),

            ...checkIns.map(
                function (checkIn) {

                    return {

                        userId:
                            checkIn.user_id,

                        text:
                            checkInLabel(
                                checkIn.check_in_type
                            ),

                        createdAt:
                            checkIn.created_at

                    };

                }
            )

        ];


        items.sort(
            function (a, b) {

                return (
                    new Date(
                        b.createdAt
                    )
                    -
                    new Date(
                        a.createdAt
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
                        item.userId,
                        profiles
                    );


                const time =
                    document.createElement(
                        "span"
                    );


                time.textContent =
                    new Date(
                        item.createdAt
                    ).toLocaleString(
                        [],
                        {

                            month:
                                "short",

                            day:
                                "numeric",

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


    const refreshFeedButton =
        get("refresh-feed-btn");


    if (
        refreshFeedButton
    ) {

        refreshFeedButton.addEventListener(
            "click",
            loadCircleFeed
        );
    }


    /* ======================================================
       ROUTINE ELEMENTS
       ====================================================== */

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


    /* ======================================================
       LOAD ROUTINE
       ====================================================== */

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


        if (
            result.error
        ) {

            console.error(
                "Routine load error:",
                result.error
            );


            currentRoutine =
                null;


            return;
        }


        currentRoutine =
            result.data ||
            null;


        if (
            !currentRoutine
        ) {

            return;
        }


        function assignTime(
            element,
            value
        ) {

            if (
                !element
            ) {

                return;
            }


            element.value =
                value
                    ? value.substring(
                        0,
                        5
                    )
                    : "";
        }


        assignTime(
            routineElements.wake,
            currentRoutine.wake_time
        );


        assignTime(
            routineElements.breakfast,
            currentRoutine.breakfast_time
        );


        assignTime(
            routineElements.lunch,
            currentRoutine.lunch_time
        );


        assignTime(
            routineElements.dinner,
            currentRoutine.dinner_time
        );


        assignTime(
            routineElements.rest,
            currentRoutine.rest_start_time
        );


        assignTime(
            routineElements.sleep,
            currentRoutine.bedtime
        );


        if (
            routineElements.goal
        ) {

            routineElements.goal.value =
                currentRoutine.sleep_goal_hours ||
                8;
        }
    }


    /* ======================================================
       SAVE ROUTINE
       ====================================================== */

    const saveRoutineButton =
        get("save-routine-btn");


    if (
        saveRoutineButton
    ) {

        saveRoutineButton.addEventListener(
            "click",
            async function () {

                const sleepGoal =
                    Number(
                        routineElements.goal.value
                    );


                if (
                    sleepGoal < 1 ||
                    sleepGoal > 24
                ) {

                    setText(
                        "routine-message",
                        "Sleep goal must be between 1 and 24 hours."
                    );

                    return;
                }


                saveRoutineButton.disabled =
                    true;


                saveRoutineButton.textContent =
                    "Saving Routine...";


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
                                    sleepGoal,

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


                saveRoutineButton.disabled =
                    false;


                saveRoutineButton.textContent =
                    "Save Routine";


                if (
                    result.error
                ) {

                    console.error(
                        "Routine save error:",
                        result.error
                    );


                    setText(
                        "routine-message",
                        result.error.message
                    );


                    recommendation(
                        "CircleSync could not update your routine."
                    );


                    return;
                }


                currentRoutine =
                    result.data;


                setText(
                    "routine-message",
                    "Routine saved. Your Next Up schedule and notifications have been updated."
                );


                await Promise.all([

                    updateRoutineEngine(),

                    checkRoutineNotifications(),

                    updateSmartRecommendation()

                ]);

            }
        );
    }


    /* ======================================================
       TODAY'S COMPLETED ROUTINES
       ====================================================== */

    function startOfToday() {

        const now =
            new Date();


        return new Date(

            now.getFullYear(),

            now.getMonth(),

            now.getDate(),

            0,

            0,

            0,

            0

        );
    }


    async function completedToday() {

        const result =
            await supabaseClient
                .from(
                    "check_ins"
                )
                .select(
                    "check_in_type, created_at"
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .gte(
                    "created_at",
                    startOfToday()
                        .toISOString()
                );


        if (
            result.error
        ) {

            console.error(
                "Today's check-ins error:",
                result.error
            );


            return new Set();
        }


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


    /* ======================================================
       TIME HELPERS
       ====================================================== */

    function timeToday(
        timeValue
    ) {

        if (
            !timeValue
        ) {

            return null;
        }


        const pieces =
            timeValue.split(
                ":"
            );


        const now =
            new Date();


        return new Date(

            now.getFullYear(),

            now.getMonth(),

            now.getDate(),

            Number(
                pieces[0]
            ),

            Number(
                pieces[1]
            ),

            0,

            0

        );
    }


    function formatTime(
        date
    ) {

        return date.toLocaleTimeString(
            [],
            {

                hour:
                    "numeric",

                minute:
                    "2-digit"

            }
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

                type:
                    "wake",

                title:
                    "Wake Up",

                icon:
                    "☀️",

                time:
                    currentRoutine.wake_time

            },

            {

                type:
                    "breakfast",

                title:
                    "Breakfast",

                icon:
                    "🍳",

                time:
                    currentRoutine.breakfast_time

            },

            {

                type:
                    "lunch",

                title:
                    "Lunch",

                icon:
                    "🥗",

                time:
                    currentRoutine.lunch_time

            },

            {

                type:
                    "rest",

                title:
                    "Rest",

                icon:
                    "😴",

                time:
                    currentRoutine.rest_start_time

            },

            {

                type:
                    "dinner",

                title:
                    "Dinner",

                icon:
                    "🍽",

                time:
                    currentRoutine.dinner_time

            },

            {

                type:
                    "sleep",

                title:
                    "Bedtime",

                icon:
                    "🌙",

                time:
                    currentRoutine.bedtime

            }

        ].filter(
            function (item) {

                return Boolean(
                    item.time
                );

            }
        );
    }


    /* ======================================================
       NOTIFICATION LOG
       Prevents duplicate notifications.
       ====================================================== */

    function localDateString() {

        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            year +
            "-" +
            month +
            "-" +
            day
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
                    localDateString()
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


        if (
            result.error
        ) {

            console.error(
                "Notification log read error:",
                result.error
            );


            return false;
        }


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
                            localDateString(),

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
                "Notification log save error:",
                result.error
            );
        }
    }


    /* ======================================================
       NOTIFICATION MESSAGES
       ====================================================== */

    function upcomingNotificationText(
        type
    ) {

        const messages = {

            wake:
                "Your scheduled wake-up time is in 5 minutes.",

            breakfast:
                "Breakfast is coming up. Finish what you're doing and make time to eat.",

            lunch:
                "Lunch is coming up. Prepare to step away from work or class and eat.",

            rest:
                "Your planned rest is coming up. Get ready to pause and recharge.",

            dinner:
                "Dinner is coming up. Start wrapping up so you can eat at your scheduled time.",

            sleep:
                "Bedtime is coming up. Start winding down so you can get to sleep on schedule."

        };


        return (
            messages[type] ||
            "Your next CircleSync routine is coming up."
        );
    }


    function overdueNotificationText(
        type
    ) {

        const messages = {

            wake:
                "Your scheduled wake-up time passed 15 minutes ago and you have not checked in as awake.",

            breakfast:
                "Your breakfast time passed 15 minutes ago and you have not checked in. Make time to eat instead of letting breakfast get skipped.",

            lunch:
                "Your lunch time passed 15 minutes ago and you have not checked in. Pause what you're doing and make time for lunch.",

            rest:
                "Your planned rest time passed 15 minutes ago and you have not checked in. Consider taking your break before continuing.",

            dinner:
                "Your dinner time passed 15 minutes ago and you have not checked in. Try not to push dinner too late into your evening.",

            sleep:
                "Your bedtime passed 15 minutes ago and you have not checked in. Start winding down so tonight does not push tomorrow's routine later."

        };


        return (
            messages[type] ||
            "Your scheduled CircleSync activity is overdue."
        );
    }


    /* ======================================================
       V75 ROUTINE NOTIFICATION ENGINE

       IMPORTANT CHANGE:
       BEFORE reminder:
       from 5 minutes before -> scheduled time.

       OVERDUE:
       any time after 15 minutes late.

       Supabase log prevents duplicate alerts.
       ====================================================== */

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


        const notificationsEnabled =
            await getNotificationPreference();


        if (
            !notificationsEnabled
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

            /* ----------------------------------------------
               If user already checked in, no reminder.
               ---------------------------------------------- */

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


            if (
                !scheduled
            ) {

                continue;
            }


            const millisecondsUntil =
                scheduled.getTime() -
                now.getTime();


            const minutesUntil =
                millisecondsUntil /
                60000;


            /* ----------------------------------------------
               FIVE-MINUTE REMINDER

               v75 intentionally uses a wider eligibility
               window:

               <= 5 minutes before
               AND
               still before scheduled time.

               This means if Chrome checks at 4:41 before,
               3:50 before, 1:20 before, etc., it still
               sends the one pre-routine reminder.
               ---------------------------------------------- */

            if (
                minutesUntil <= 5 &&
                minutesUntil > 0
            ) {

                const sent =
                    await notificationAlreadySent(
                        item.type,
                        "five-minute"
                    );


                if (
                    !sent
                ) {

                    const shown =
                        await displayNotification(

                            item.icon +
                            " " +
                            item.title +
                            " in 5 minutes",

                            upcomingNotificationText(
                                item.type
                            ),

                            "circlesync-before-" +
                            item.type +
                            "-" +
                            localDateString()

                        );


                    if (
                        shown
                    ) {

                        await markNotificationSent(
                            item.type,
                            "five-minute"
                        );


                        recommendation(
                            item.title +
                            " is coming up soon. Finish what you're doing and prepare to follow the routine you scheduled."
                        );
                    }
                }
            }


            /* ----------------------------------------------
               FIFTEEN-MINUTE OVERDUE WARNING
               ---------------------------------------------- */

            if (
                minutesUntil <= -15
            ) {

                const sent =
                    await notificationAlreadySent(
                        item.type,
                        "overdue"
                    );


                if (
                    sent
                ) {

                    continue;
                }


                /* ------------------------------------------
                   Recheck Supabase immediately before
                   sending the warning.
                   ------------------------------------------ */

                const latestCompleted =
                    await completedToday();


                if (
                    latestCompleted.has(
                        item.type
                    )
                ) {

                    continue;
                }


                const shown =
                    await displayNotification(

                        item.icon +
                        " " +
                        item.title +
                        " is overdue",

                        overdueNotificationText(
                            item.type
                        ),

                        "circlesync-overdue-" +
                        item.type +
                        "-" +
                        localDateString()

                    );


                if (
                    shown
                ) {

                    await markNotificationSent(
                        item.type,
                        "overdue"
                    );


                    recommendation(
                        overdueNotificationText(
                            item.type
                        )
                    );
                }
            }
        }
    }


    /* ======================================================
       NEXT UP ENGINE
       ====================================================== */

    async function updateRoutineEngine() {

        if (
            !currentRoutine
        ) {

            setText(
                "next-up-label",
                "No Routine"
            );


            setText(
                "next-up-title",
                "Set your routine below"
            );


            setText(
                "next-up-countdown",
                ""
            );


            setText(
                "routine-alert",
                "Save your routine to start tracking meals, rest, wake time, and bedtime."
            );


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
                .filter(
                    function (item) {

                        return Boolean(
                            item.scheduled
                        );

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


        const overdueItems =
            items.filter(
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
            );


        const overdue =
            overdueItems.length
                ? overdueItems[
                    overdueItems.length -
                    1
                ]
                : null;


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
                Math.max(

                    0,

                    Math.floor(
                        (
                            now -
                            overdue.scheduled
                        )
                        /
                        60000
                    )

                );


            setText(
                "next-up-label",
                "Needs Attention"
            );


            setText(
                "next-up-title",
                overdue.icon +
                " " +
                overdue.title
            );


            setText(
                "next-up-countdown",
                minutes === 0

                    ? "Scheduled now"

                    : minutes +
                      " minute" +
                      (
                          minutes === 1
                              ? ""
                              : "s"
                      ) +
                      " overdue"
            );


            setText(
                "routine-alert",
                "Scheduled for " +
                formatTime(
                    overdue.scheduled
                ) +
                "."
            );


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


            setText(
                "next-up-label",
                "Next Up"
            );


            setText(
                "next-up-title",
                next.icon +
                " " +
                next.title
            );


            if (
                minutes < 60
            ) {

                setText(
                    "next-up-countdown",
                    "In " +
                    minutes +
                    " minute" +
                    (
                        minutes === 1
                            ? ""
                            : "s"
                    )
                );


            } else {

                const hours =
                    Math.floor(
                        minutes /
                        60
                    );


                const remainingMinutes =
                    minutes %
                    60;


                setText(
                    "next-up-countdown",
                    "In " +
                    hours +
                    "h " +
                    remainingMinutes +
                    "m"
                );
            }


            setText(
                "routine-alert",
                "Scheduled for " +
                formatTime(
                    next.scheduled
                ) +
                "."
            );


            return;
        }


        setText(
            "next-up-label",
            "Routine Complete"
        );


        setText(
            "next-up-title",
            "✓ You're done for today"
        );


        setText(
            "next-up-countdown",
            "Nice work"
        );


        setText(
            "routine-alert",
            "Your next saved routine begins tomorrow."
        );
    }


    /* ======================================================
       SMART RECOMMENDATIONS
       ====================================================== */

    async function updateSmartRecommendation(
        preferredMessage = null
    ) {

        if (
            preferredMessage
        ) {

            recommendation(
                preferredMessage
            );

            return;
        }


        if (
            !currentRoutine
        ) {

            recommendation(
                "Start by saving your wake, meal, rest, and bedtime schedule. CircleSync can then compare your actual check-ins with the routine you want to follow."
            );

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
                .filter(
                    function (item) {

                        return Boolean(
                            item.scheduled
                        );

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


        /* --------------------------------------------------
           1. OVERDUE ACTIVITY TAKES PRIORITY
           -------------------------------------------------- */

        const overdueItems =
            items.filter(
                function (item) {

                    return (

                        item.scheduled <
                            now

                        &&

                        !completed.has(
                            item.type
                        )

                    );

                }
            );


        if (
            overdueItems.length > 0
        ) {

            const mostRecentOverdue =
                overdueItems[
                    overdueItems.length -
                    1
                ];


            const lateMinutes =
                Math.floor(
                    (
                        now -
                        mostRecentOverdue.scheduled
                    )
                    /
                    60000
                );


            if (
                mostRecentOverdue.type ===
                "breakfast"
            ) {

                recommendation(
                    "Breakfast is " +
                    lateMinutes +
                    " minutes past your scheduled time and you have not checked in. If possible, make eating your next interruption rather than allowing the morning to turn into another skipped breakfast."
                );

                return;
            }


            if (
                mostRecentOverdue.type ===
                "lunch"
            ) {

                recommendation(
                    "Lunch is " +
                    lateMinutes +
                    " minutes overdue. Your schedule may be taking priority over eating again; finish the immediate task you are on and create a stopping point for lunch."
                );

                return;
            }


            if (
                mostRecentOverdue.type ===
                "dinner"
            ) {

                recommendation(
                    "Dinner is " +
                    lateMinutes +
                    " minutes overdue. Try to eat before dinner begins pushing your bedtime later."
                );

                return;
            }


            if (
                mostRecentOverdue.type ===
                "rest"
            ) {

                recommendation(
                    "Your planned rest is " +
                    lateMinutes +
                    " minutes overdue. A short reset now may be more useful than continuing until your energy drops further."
                );

                return;
            }


            if (
                mostRecentOverdue.type ===
                "sleep"
            ) {

                recommendation(
                    "You are " +
                    lateMinutes +
                    " minutes past your planned bedtime without a sleep check-in. Start reducing stimulation and transition away from work so tomorrow's wake-up routine is easier."
                );

                return;
            }


            if (
                mostRecentOverdue.type ===
                "wake"
            ) {

                recommendation(
                    "Your wake time is " +
                    lateMinutes +
                    " minutes past schedule without a wake-up check-in. Once you're up, check your breakfast time so oversleeping does not automatically turn into a skipped meal."
                );

                return;
            }
        }


        /* --------------------------------------------------
           2. LOW ENERGY
           -------------------------------------------------- */

        if (
            latestEnergyLevel !== null &&
            latestEnergyLevel <= 3
        ) {

            recommendation(
                "Your latest energy level is " +
                latestEnergyLevel +
                "/10. Avoid treating low energy as a reason to push through everything at once—check whether your next planned action should be food, rest, or sleep."
            );

            return;
        }


        /* --------------------------------------------------
           3. FOCUS SESSION
           -------------------------------------------------- */

        if (
            focusActive &&
            focusStartedAt
        ) {

            const focusMinutes =
                Math.floor(
                    (
                        Date.now() -
                        focusStartedAt.getTime()
                    )
                    /
                    60000
                );


            if (
                focusMinutes >= 45
            ) {

                recommendation(
                    "You've been in Focus Mode for about " +
                    focusMinutes +
                    " minutes. Before continuing, check the Next Up card so deep focus does not cause you to miss a meal or rest break."
                );

                return;
            }
        }


        /* --------------------------------------------------
           4. UPCOMING ACTIVITY
           -------------------------------------------------- */

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


            if (
                minutes <= 15
            ) {

                recommendation(
                    next.title +
                    " is coming up in about " +
                    minutes +
                    " minute" +
                    (
                        minutes === 1
                            ? ""
                            : "s"
                    ) +
                    ". Start creating a stopping point now so your current responsibility does not override the routine you planned."
                );

                return;
            }


            if (
                next.type ===
                "breakfast"
            ) {

                recommendation(
                    "Your next scheduled routine is breakfast at " +
                    formatTime(
                        next.scheduled
                    ) +
                    ". Giving yourself enough time before leaving can reduce the chance of skipping it."
                );

                return;
            }


            if (
                next.type ===
                "lunch"
            ) {

                recommendation(
                    "Lunch is your next scheduled routine at " +
                    formatTime(
                        next.scheduled
                    ) +
                    ". Try to identify where you can naturally pause your work before that time arrives."
                );

                return;
            }


            if (
                next.type ===
                "dinner"
            ) {

                recommendation(
                    "Dinner is scheduled for " +
                    formatTime(
                        next.scheduled
                    ) +
                    ". Keeping dinner near that time can help protect the bedtime you scheduled later."
                );

                return;
            }


            if (
                next.type ===
                "rest"
            ) {

                recommendation(
                    "Your next planned rest is at " +
                    formatTime(
                        next.scheduled
                    ) +
                    ". Use it as a deliberate reset instead of waiting until you are exhausted."
                );

                return;
            }


            if (
                next.type ===
                "sleep"
            ) {

                recommendation(
                    "Bedtime is scheduled for " +
                    formatTime(
                        next.scheduled
                    ) +
                    ". Consider beginning your wind-down before that time rather than treating bedtime as the moment you stop working."
                );

                return;
            }


            if (
                next.type ===
                "wake"
            ) {

                recommendation(
                    "Your next scheduled wake time is " +
                    formatTime(
                        next.scheduled
                    ) +
                    ". Keep your bedtime goal in view so tomorrow morning does not begin with lost time."
                );

                return;
            }
        }


        /* --------------------------------------------------
           5. COMPLETED ROUTINE
           -------------------------------------------------- */

        if (
            items.length > 0 &&
            items.every(
                function (item) {

                    return completed.has(
                        item.type
                    );

                }
            )
        ) {

            recommendation(
                "You've completed all of today's scheduled CircleSync check-ins. Review what worked today and try to repeat the same timing tomorrow."
            );

            return;
        }


        /* --------------------------------------------------
           DEFAULT
           -------------------------------------------------- */

        recommendation(
            activeCircle

                ? "Your routine is currently on track. Keep the Next Up card visible while you work, and use " +
                  activeCircle.name +
                  " when you want accountability from your circle."

                : "Your routine is currently on track. Keep checking the Next Up card and record each meal, rest period, wake-up, and bedtime when it happens."
        );
    }


    /* ======================================================
       ROUTINE MONITOR
       ====================================================== */

    function startRoutineMonitoring() {

        if (
            routineTimer
        ) {

            clearInterval(
                routineTimer
            );
        }


        /* Immediate check */

        Promise.all([

            updateRoutineEngine(),

            checkRoutineNotifications(),

            updateSmartRecommendation()

        ]);


        /*
         * Check every 15 seconds.
         *
         * This DOES NOT mean a notification is sent
         * every 15 seconds. Supabase's notification log
         * prevents duplicates.
         */

        routineTimer =
            setInterval(
                async function () {

                    await updateRoutineEngine();


                    await checkRoutineNotifications();


                    await updateSmartRecommendation();

                },
                15000
            );
    }


    /* ======================================================
       SUPABASE REALTIME
       ====================================================== */

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
                    "circlesync-v75-" +
                    currentUser.id
                )


                /* ------------------------------------------
                   JOIN REQUESTS
                   ------------------------------------------ */

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
                    async function (
                        payload
                    ) {

                        console.log(
                            "CircleSync join-request realtime event:",
                            payload
                        );


                        await Promise.all([

                            loadOwnerRequests(),

                            loadDiscoverGroups(),

                            loadMyCircles()

                        ]);

                    }
                )


                /* ------------------------------------------
                   MEMBERSHIP CHANGES
                   ------------------------------------------ */

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
                    async function (
                        payload
                    ) {

                        console.log(
                            "CircleSync membership realtime event:",
                            payload
                        );


                        await Promise.all([

                            loadMyCircles(),

                            loadDiscoverGroups(),

                            loadOwnerRequests()

                        ]);

                    }
                )


                /* ------------------------------------------
                   CIRCLE MESSAGES
                   ------------------------------------------ */

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
                    async function (
                        payload
                    ) {

                        console.log(
                            "CircleSync message realtime event:",
                            payload
                        );


                        await loadCircleFeed();

                    }
                )


                /* ------------------------------------------
                   CHECK INS
                   ------------------------------------------ */

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
                    async function (
                        payload
                    ) {

                        console.log(
                            "CircleSync check-in realtime event:",
                            payload
                        );


                        await Promise.all([

                            loadCircleFeed(),

                            updateRoutineEngine(),

                            updateSmartRecommendation()

                        ]);

                    }
                )


                .subscribe(
                    function (
                        status,
                        error
                    ) {

                        console.log(
                            "CircleSync Realtime:",
                            status
                        );


                        if (
                            error
                        ) {

                            console.error(
                                "CircleSync Realtime error:",
                                error
                            );
                        }

                    }
                );
    }


    /* ======================================================
       INITIAL LOAD
       ====================================================== */

    await Promise.all([

        loadLatestEnergy(),

        loadRoutine()

    ]);


    await loadMyCircles();


    await Promise.all([

        loadDiscoverGroups(),

        loadOwnerRequests(),

        updateNotificationButton()

    ]);


    startRealtime();


    startRoutineMonitoring();


    await updateSmartRecommendation();


    console.log(
        "CircleSync dashboard v75 ready."
    );
}
