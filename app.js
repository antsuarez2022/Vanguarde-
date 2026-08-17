"use strict";

console.log("CircleSync app.js v77 loaded");


/* ==========================================================
   SUPABASE
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
        return null;
    }


    try {

        const registration =
            await navigator.serviceWorker.register(
                "./service-worker.js"
            );


        await registration.update();


        serviceWorkerRegistration =
            await navigator.serviceWorker.ready;


        console.log(
            "CircleSync service worker v77 ready."
        );


        return serviceWorkerRegistration;

    } catch (error) {

        console.error(
            "Service worker error:",
            error
        );


        return null;
    }
}


/* ==========================================================
   APP START
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

        return;
    }


    function showAuthMessage(
        message,
        error
    ) {

        authMessage.textContent =
            message;


        authMessage.className =
            error
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


            const button =
                get("login-btn");


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

                showAuthMessage(
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


            const button =
                get("signup-btn");


            if (!email) {

                showAuthMessage(
                    "Enter an email.",
                    true
                );

                return;
            }


            if (
                password.length < 6
            ) {

                showAuthMessage(
                    "Password must be at least 6 characters.",
                    true
                );

                return;
            }


            if (
                password !==
                confirmation
            ) {

                showAuthMessage(
                    "Passwords do not match.",
                    true
                );

                return;
            }


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

                showAuthMessage(
                    result.error.message,
                    true
                );

                return;
            }


            showAuthMessage(
                "Account created. You can now sign in with your password.",
                false
            );

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


    let currentUser =
        null;

    let currentRoutine =
        null;

    let activeCircle =
        null;

    let myCircles =
        [];

    let latestEnergy =
        null;

    let focusActive =
        false;

    let focusStartedAt =
        null;

    let realtimeChannel =
        null;

    let routineTimer =
        null;


    function setText(
        id,
        value
    ) {

        const element =
            get(id);


        if (element) {
            element.textContent =
                value;
        }
    }


    function recommend(
        message
    ) {

        setText(
            "recommendation",
            message
        );
    }


    /* ======================================================
       AUTH CHECK
       ====================================================== */

    const sessionResult =
        await supabaseClient.auth.getSession();


    if (
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


    setText(
        "user-email",
        currentUser.email ||
        "Signed in"
    );


    /* ======================================================
       LOGOUT
       ====================================================== */

    get("logout-btn")
        ?.addEventListener(
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


    /* ======================================================
       CIRCLE MANAGEMENT TABS
       ====================================================== */

    const joinRequestsTab =
        get("join-requests-tab");


    const createCircleTab =
        get("create-circle-tab");


    const joinRequestsPanel =
        get("join-requests-panel");


    const createCirclePanel =
        get("create-circle-panel");


    function showJoinRequestsTab() {

        if (
            !joinRequestsTab ||
            !createCircleTab ||
            !joinRequestsPanel ||
            !createCirclePanel
        ) {
            return;
        }


        joinRequestsPanel.hidden =
            false;


        createCirclePanel.hidden =
            true;


        joinRequestsTab
            .classList
            .add(
                "active-management-tab"
            );


        createCircleTab
            .classList
            .remove(
                "active-management-tab"
            );


        joinRequestsTab.setAttribute(
            "aria-selected",
            "true"
        );


        createCircleTab.setAttribute(
            "aria-selected",
            "false"
        );
    }


    function showCreateCircleTab() {

        if (
            !joinRequestsTab ||
            !createCircleTab ||
            !joinRequestsPanel ||
            !createCirclePanel
        ) {
            return;
        }


        joinRequestsPanel.hidden =
            true;


        createCirclePanel.hidden =
            false;


        createCircleTab
            .classList
            .add(
                "active-management-tab"
            );


        joinRequestsTab
            .classList
            .remove(
                "active-management-tab"
            );


        createCircleTab.setAttribute(
            "aria-selected",
            "true"
        );


        joinRequestsTab.setAttribute(
            "aria-selected",
            "false"
        );
    }


    joinRequestsTab
        ?.addEventListener(
            "click",
            showJoinRequestsTab
        );


    createCircleTab
        ?.addEventListener(
            "click",
            showCreateCircleTab
        );


    /* ======================================================
       NOTIFICATIONS
       ====================================================== */

    async function readNotificationPreference() {

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


        return !result.error;
    }


    async function showNotification(
        title,
        body,
        tag
    ) {

        if (
            !("Notification" in window) ||
            Notification.permission !==
                "granted"
        ) {

            return false;
        }


        try {

            const registration =
                serviceWorkerRegistration ||
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
                "Notification error:",
                error
            );


            return false;
        }
    }


    async function updateNotificationUI() {

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

            button.disabled =
                true;

            button.textContent =
                "Notifications Unsupported";

            status.textContent =
                "This browser does not support notifications.";

            return;
        }


        const enabled =
            await readNotificationPreference();


        if (
            enabled &&
            Notification.permission ===
                "granted"
        ) {

            button.textContent =
                "Disable Notifications";

            status.textContent =
                "Notifications are ON.";

        } else {

            button.textContent =
                "Enable Notifications";

            status.textContent =
                "Notifications are OFF.";
        }
    }


    get("notification-btn")
        ?.addEventListener(
            "click",
            async function () {

                const enabled =
                    await readNotificationPreference();


                if (enabled) {

                    await saveNotificationPreference(
                        false
                    );


                    recommend(
                        "Routine notifications have been turned off."
                    );


                    await updateNotificationUI();

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
                    permission !==
                    "granted"
                ) {

                    recommend(
                        "Chrome needs permission before CircleSync can send notifications."
                    );

                    return;
                }


                await saveNotificationPreference(
                    true
                );


                await showNotification(
                    "CircleSync Notifications On ✅",
                    "CircleSync notifications are now enabled.",
                    "circlesync-enabled-" +
                        Date.now()
                );


                recommend(
                    "Notifications are enabled. CircleSync will use your saved routine to help keep meals, rest, and sleep visible."
                );


                await updateNotificationUI();

            }
        );


    /* ======================================================
       ENERGY
       ====================================================== */

    const energyInput =
        get("energy-input");


    energyInput
        ?.addEventListener(
            "input",
            function () {

                setText(
                    "energy-value",
                    energyInput.value
                );

            }
        );


    get("save-energy")
        ?.addEventListener(
            "click",
            async function () {

                const level =
                    Number(
                        energyInput.value
                    );


                const result =
                    await supabaseClient
                        .from(
                            "check_ins"
                        )
                        .insert({

                            user_id:
                                currentUser.id,

                            circle_id:
                                null,

                            check_in_type:
                                "energy",

                            energy_level:
                                level,

                            shared_with_circle:
                                false

                        });


                if (
                    result.error
                ) {

                    recommend(
                        result.error.message
                    );

                    return;
                }


                latestEnergy =
                    level;


                setText(
                    "energy-score",
                    String(
                        level *
                        10
                    )
                );


                if (
                    level <= 3
                ) {

                    recommend(
                        "Your energy is low. Check whether your next priority should be food, rest, or sleep before pushing into another long task."
                    );

                } else if (
                    level <= 6
                ) {

                    recommend(
                        "Your energy is moderate. Protect your next meal or rest period so your energy does not continue falling."
                    );

                } else {

                    recommend(
                        "Your energy is strong. Use it productively, but keep your Next Up routine visible so focus does not cause you to skip a meal or rest."
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
                .limit(1)
                .maybeSingle();


        if (
            !result.data
        ) {
            return;
        }


        latestEnergy =
            Number(
                result.data.energy_level
            );


        if (
            energyInput
        ) {

            energyInput.value =
                latestEnergy;
        }


        setText(
            "energy-value",
            latestEnergy
        );


        setText(
            "energy-score",
            latestEnergy * 10
        );
    }


    /* ======================================================
       CHECK INS
       ====================================================== */

    async function saveCheckIn(
        type,
        message
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

                    shared_with_circle:
                        Boolean(
                            activeCircle
                        )

                });


        if (
            result.error
        ) {

            recommend(
                "Check-in failed: " +
                    result.error.message
            );

            return;
        }


        recommend(
            message
        );


        await Promise.all([

            loadCircleFeed(),

            updateRoutineDisplay()

        ]);
    }


    const quickChecks = [

        [
            "breakfast-btn",
            "breakfast",
            "Breakfast recorded. Protecting your first meal can make it easier to maintain energy through the rest of your morning."
        ],

        [
            "lunch-btn",
            "lunch",
            "Lunch recorded. You successfully created time to eat instead of letting your responsibilities completely override your routine."
        ],

        [
            "dinner-btn",
            "dinner",
            "Dinner recorded. Keep your planned bedtime in view so your evening routine stays balanced."
        ],

        [
            "rest-btn",
            "rest",
            "Rest recorded. Use this pause to recharge before returning to your responsibilities."
        ],

        [
            "working-btn",
            "focus",
            "Working status recorded. Stay focused, but check Next Up periodically so deep focus does not make you miss a meal or rest period."
        ],

        [
            "sleep-btn",
            "sleep",
            "Bedtime recorded. Your sleep routine is complete for tonight."
        ],

        [
            "wake-btn",
            "wake",
            "Wake-up recorded. Check your breakfast schedule next so the morning does not turn into another skipped meal."
        ]

    ];


    quickChecks.forEach(
        function (item) {

            get(item[0])
                ?.addEventListener(
                    "click",
                    function () {

                        saveCheckIn(
                            item[1],
                            item[2]
                        );

                    }
                );

        }
    );


    /* ======================================================
       FOCUS
       ====================================================== */

    get("focus-btn")
        ?.addEventListener(
            "click",
            async function () {

                const button =
                    get("focus-btn");


                if (
                    !focusActive
                ) {

                    focusActive =
                        true;


                    focusStartedAt =
                        new Date();


                    button.textContent =
                        "End Focus Session";


                    setText(
                        "focus-status",
                        "Focus session active."
                    );


                    recommend(
                        "Focus Mode is active. Keep your Next Up routine in mind while you work."
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
                            ) /
                            60000
                        )
                    );


                focusActive =
                    false;


                focusStartedAt =
                    null;


                button.textContent =
                    "Start Focus Session";


                setText(
                    "focus-status",
                    "Last session: " +
                        minutes +
                        " minutes."
                );


                await saveCheckIn(
                    "focus",
                    minutes >= 45
                        ? "You focused for " +
                          minutes +
                          " minutes. Before beginning another long session, check whether you need food, water, movement, or rest."
                        : "Focus session complete. Check your Next Up routine before beginning another task."
                );

            }
        );


    /* ======================================================
       CIRCLE HELPERS
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
                result.error
            );

            return [];
        }


        return result.data || [];
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


        return result.data || [];
    }


    /* ======================================================
       MY CIRCLES
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
                                    : (
                                        membership
                                            ? membership.role
                                            : "member"
                                    )

                        };

                    }
                );


        const savedCircle =
            sessionStorage.getItem(
                "circlesync-active-circle"
            );


        activeCircle =
            myCircles.find(
                function (circle) {

                    return (
                        circle.id ===
                        savedCircle
                    );

                }
            )
            ||
            myCircles[0]
            ||
            null;


        renderCircleSwitcher();


        await renderActiveCircle();
    }


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
            myCircles.length === 0
        ) {

            container.innerHTML =
                '<p class="empty-text">You have not joined any circles yet.</p>';

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

            setText(
                "circle-name",
                "No Circle Selected"
            );


            setText(
                "circle-description",
                "Create a circle or request to join one."
            );


            if (
                get("leave-circle-btn")
            ) {

                get(
                    "leave-circle-btn"
                ).hidden =
                    true;
            }


            setText(
                "circle-list",
                ""
            );


            const feed =
                get("circle-feed");


            if (
                feed
            ) {

                feed.innerHTML =
                    '<p class="empty-text">Select a circle to view activity.</p>';
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
            get("leave-circle-btn")
        ) {

            get(
                "leave-circle-btn"
            ).hidden =
                activeCircle.role ===
                "owner";
        }


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
                    "user_id, role"
                )
                .eq(
                    "circle_id",
                    activeCircle.id
                );


        const list =
            get("circle-list");


        if (
            !list
        ) {
            return;
        }


        list.innerHTML =
            "";


        if (
            result.error
        ) {

            list.innerHTML =
                "<li>Unable to load members.</li>";

            return;
        }


        const members =
            result.data || [];


        if (
            members.length === 0
        ) {

            list.innerHTML =
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
                    member.user_id ===
                    currentUser.id
                        ? "You — " +
                          member.role
                        : "Circle Member — " +
                          member.role;


                list.appendChild(
                    item
                );

            }
        );
    }


    /* ======================================================
       LEAVE CIRCLE
       ====================================================== */

    get("leave-circle-btn")
        ?.addEventListener(
            "click",
            async function () {

                if (
                    !activeCircle ||
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


                const circleName =
                    activeCircle.name;


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


                recommend(
                    "You left " +
                        circleName +
                        "."
                );


                await Promise.all([

                    loadMyCircles(),

                    loadDiscoverGroups()

                ]);

            }
        );


    /* ======================================================
       CREATE CIRCLE
       ====================================================== */

    get("create-circle-btn")
        ?.addEventListener(
            "click",
            async function () {

                const nameInput =
                    get("new-circle-name");


                const descriptionInput =
                    get(
                        "new-circle-description"
                    );


                const button =
                    get("create-circle-btn");


                const name =
                    nameInput.value.trim();


                if (
                    !name
                ) {

                    setText(
                        "create-circle-message",
                        "Enter a circle name."
                    );

                    return;
                }


                button.disabled =
                    true;


                button.textContent =
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
                                descriptionInput
                                    .value
                                    .trim(),

                            created_by:
                                currentUser.id,

                            is_public:
                                true

                        })
                        .select()
                        .single();


                button.disabled =
                    false;


                button.textContent =
                    "Create Circle";


                if (
                    result.error
                ) {

                    setText(
                        "create-circle-message",
                        result.error.message
                    );

                    return;
                }


                nameInput.value =
                    "";


                descriptionInput.value =
                    "";


                setText(
                    "create-circle-message",
                    result.data.name +
                        " was created."
                );


                sessionStorage.setItem(
                    "circlesync-active-circle",
                    result.data.id
                );


                recommend(
                    result.data.name +
                        " has been created. Other CircleSync users can now discover it and request to join."
                );


                await Promise.all([

                    loadMyCircles(),

                    loadDiscoverGroups(),

                    loadOwnerRequests()

                ]);


                showJoinRequestsTab();

            }
        );


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


        const membershipIds =
            new Set(
                memberships.map(
                    function (item) {

                        return item.circle_id;

                    }
                )
            );


        const requestMap =
            new Map();


        (
            requestResult.data || []
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


        container.innerHTML =
            "";


        const visible =
            circles.filter(
                function (circle) {

                    return (
                        circle.is_public ===
                        true
                    );

                }
            );


        if (
            visible.length === 0
        ) {

            container.innerHTML =
                '<p class="empty-text">No public circles are available.</p>';

            return;
        }


        visible.forEach(
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
                    membershipIds.has(
                        circle.id
                    );


                const request =
                    requestMap.get(
                        circle.id
                    );


                if (owner) {

                    button.textContent =
                        "Your Circle ✓";

                    button.disabled =
                        true;

                } else if (member) {

                    button.textContent =
                        activeCircle &&
                        activeCircle.id ===
                            circle.id
                            ? "Active Circle ✓"
                            : "Open Circle";


                    button.addEventListener(
                        "click",
                        async function () {

                            const selected =
                                myCircles.find(
                                    function (item) {

                                        return (
                                            item.id ===
                                            circle.id
                                        );

                                    }
                                );


                            if (
                                !selected
                            ) {
                                return;
                            }


                            activeCircle =
                                selected;


                            sessionStorage.setItem(
                                "circlesync-active-circle",
                                selected.id
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

                                button.disabled =
                                    false;

                                button.textContent =
                                    "Request to Join";


                                recommend(
                                    "Unable to send request: " +
                                        result.error.message
                                );


                                return;
                            }


                            button.textContent =
                                "Request Pending";


                            recommend(
                                "Your request to join " +
                                    circle.name +
                                    " was sent to the creator."
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
        ?.addEventListener(
            "click",
            loadDiscoverGroups
        );


    /* ======================================================
       JOIN REQUESTS
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
            ownedCircles.length === 0
        ) {

            setText(
                "request-count",
                "0"
            );


            container.innerHTML =
                '<p class="empty-text">Create a circle to begin receiving join requests.</p>';


            return;
        }


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
                    ownedCircles.map(
                        function (circle) {

                            return circle.id;

                        }
                    )
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
                "Join requests:",
                result.error
            );


            container.innerHTML =
                '<p class="error-message">Unable to load join requests.</p>';

            return;
        }


        const requests =
            result.data || [];


        setText(
            "request-count",
            String(
                requests.length
            )
        );


        if (
            requests.length === 0
        ) {

            container.innerHTML =
                '<p class="empty-text">No pending join requests right now.</p>';

            return;
        }


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
                    "CircleSync User";


                const description =
                    document.createElement(
                        "span"
                    );


                description.textContent =
                    " wants to join " +
                    (
                        circle
                            ? circle.name
                            : "your circle"
                    );


                info.append(
                    person,
                    description
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


                async function respond(
                    approve
                ) {

                    accept.disabled =
                        true;

                    decline.disabled =
                        true;


                    const response =
                        await supabaseClient.rpc(
                            "respond_to_circle_join_request",
                            {

                                request_id_input:
                                    request.id,

                                approve_input:
                                    approve

                            }
                        );


                    if (
                        response.error
                    ) {

                        accept.disabled =
                            false;

                        decline.disabled =
                            false;


                        recommend(
                            response.error.message
                        );

                        return;
                    }


                    /*
                     * ONLY the request row is removed.
                     * The Join Requests tab and section stay.
                     */

                    row.remove();


                    recommend(
                        approve
                            ? "Join request accepted. The user is now a member of the circle."
                            : "Join request declined. The request was removed."
                    );


                    await Promise.all([

                        loadOwnerRequests(),

                        loadMyCircles(),

                        loadDiscoverGroups(),

                        loadCircleMembers()

                    ]);

                }


                accept.addEventListener(
                    "click",
                    function () {

                        respond(true);

                    }
                );


                decline.addEventListener(
                    "click",
                    function () {

                        respond(false);

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


    /* ======================================================
       MESSAGES
       ====================================================== */

    get("send-message-btn")
        ?.addEventListener(
            "click",
            async function () {

                if (
                    !activeCircle
                ) {

                    setText(
                        "feed-message",
                        "Select a circle first."
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
                                message

                        });


                if (
                    result.error
                ) {

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
            "✓ Check-In"
        );
    }


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
            messagesResult,
            checksResult
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
                    .limit(50),

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
                    .limit(50)

            ]);


        const items = [];


        (
            messagesResult.data || []
        ).forEach(
            function (message) {

                items.push({

                    userId:
                        message.user_id,

                    text:
                        "💬 " +
                        message.message,

                    createdAt:
                        message.created_at

                });

            }
        );


        (
            checksResult.data || []
        ).forEach(
            function (check) {

                items.push({

                    userId:
                        check.user_id,

                    text:
                        checkInLabel(
                            check.check_in_type
                        ),

                    createdAt:
                        check.created_at

                });

            }
        );


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
            items.length === 0
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


                const user =
                    document.createElement(
                        "strong"
                    );


                user.textContent =
                    item.userId ===
                    currentUser.id
                        ? "You"
                        : "Circle Member";


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


                const text =
                    document.createElement(
                        "p"
                    );


                text.textContent =
                    item.text;


                meta.append(
                    user,
                    time
                );


                row.append(
                    meta,
                    text
                );


                feed.appendChild(
                    row
                );

            }
        );
    }


    get("refresh-feed-btn")
        ?.addEventListener(
            "click",
            loadCircleFeed
        );


    /* ======================================================
       ROUTINE
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


    async function loadRoutine() {

        const result =
            await supabaseClient
                .from(
                    "routines"
                )
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .maybeSingle();


        if (
            result.error
        ) {

            console.error(
                result.error
            );

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


        function assign(
            element,
            value
        ) {

            if (
                element
            ) {

                element.value =
                    value
                        ? value.substring(
                            0,
                            5
                        )
                        : "";
            }
        }


        assign(
            routineElements.wake,
            currentRoutine.wake_time
        );

        assign(
            routineElements.breakfast,
            currentRoutine.breakfast_time
        );

        assign(
            routineElements.lunch,
            currentRoutine.lunch_time
        );

        assign(
            routineElements.dinner,
            currentRoutine.dinner_time
        );

        assign(
            routineElements.rest,
            currentRoutine.rest_start_time
        );

        assign(
            routineElements.sleep,
            currentRoutine.bedtime
        );


        routineElements.goal.value =
            currentRoutine.sleep_goal_hours ||
            8;
    }


    get("save-routine-btn")
        ?.addEventListener(
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
                                    routineElements
                                        .wake
                                        .value ||
                                    null,

                                breakfast_time:
                                    routineElements
                                        .breakfast
                                        .value ||
                                    null,

                                lunch_time:
                                    routineElements
                                        .lunch
                                        .value ||
                                    null,

                                dinner_time:
                                    routineElements
                                        .dinner
                                        .value ||
                                    null,

                                rest_start_time:
                                    routineElements
                                        .rest
                                        .value ||
                                    null,

                                bedtime:
                                    routineElements
                                        .sleep
                                        .value ||
                                    null,

                                sleep_goal_hours:
                                    Number(
                                        routineElements
                                            .goal
                                            .value
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

                    setText(
                        "routine-message",
                        result.error.message
                    );

                    return;
                }


                currentRoutine =
                    result.data;


                setText(
                    "routine-message",
                    "Routine saved."
                );


                recommend(
                    "Your routine has been updated. CircleSync will compare your Quick Check-Ins against these times."
                );


                await updateRoutineDisplay();

            }
        );


    function timeToday(value) {

        if (
            !value
        ) {
            return null;
        }


        const parts =
            value.split(":");


        const now =
            new Date();


        return new Date(

            now.getFullYear(),

            now.getMonth(),

            now.getDate(),

            Number(parts[0]),

            Number(parts[1]),

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

            [
                "wake",
                "☀️ Wake Up",
                currentRoutine.wake_time
            ],

            [
                "breakfast",
                "🍳 Breakfast",
                currentRoutine.breakfast_time
            ],

            [
                "lunch",
                "🥗 Lunch",
                currentRoutine.lunch_time
            ],

            [
                "rest",
                "😴 Rest",
                currentRoutine.rest_start_time
            ],

            [
                "dinner",
                "🍽 Dinner",
                currentRoutine.dinner_time
            ],

            [
                "sleep",
                "🌙 Bedtime",
                currentRoutine.bedtime
            ]

        ]
        .filter(
            function (item) {

                return Boolean(
                    item[2]
                );

            }
        )
        .map(
            function (item) {

                return {

                    type:
                        item[0],

                    title:
                        item[1],

                    scheduled:
                        timeToday(
                            item[2]
                        )

                };

            }
        );
    }


    async function completedToday() {

        const now =
            new Date();


        const beginning =
            new Date(

                now.getFullYear(),

                now.getMonth(),

                now.getDate()

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
                    beginning.toISOString()
                );


        return new Set(
            (
                result.data || []
            ).map(
                function (item) {

                    return item.check_in_type;

                }
            )
        );
    }


    async function updateRoutineDisplay() {

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


            recommend(
                "Start by saving your wake, meal, rest, and bedtime schedule so CircleSync can provide useful recommendations."
            );


            return;
        }


        const completed =
            await completedToday();


        const now =
            new Date();


        const items =
            routineItems()
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


        if (
            overdue
        ) {

            const minutes =
                Math.floor(
                    (
                        now -
                        overdue.scheduled
                    ) /
                    60000
                );


            setText(
                "next-up-label",
                "Needs Attention"
            );


            setText(
                "next-up-title",
                overdue.title
            );


            setText(
                "next-up-countdown",
                minutes +
                    " minutes overdue"
            );


            if (
                overdue.type ===
                "breakfast"
            ) {

                recommend(
                    "Breakfast is " +
                        minutes +
                        " minutes overdue. If possible, make eating your next stopping point instead of allowing the morning to turn into another skipped breakfast."
                );

            } else if (
                overdue.type ===
                "lunch"
            ) {

                recommend(
                    "Lunch is " +
                        minutes +
                        " minutes overdue. Finish the immediate task you are working on and create a clear stopping point so you can eat."
                );

            } else if (
                overdue.type ===
                "dinner"
            ) {

                recommend(
                    "Dinner is " +
                        minutes +
                        " minutes overdue. Eating soon can help prevent your evening meal from pushing bedtime even later."
                );

            } else if (
                overdue.type ===
                "rest"
            ) {

                recommend(
                    "Your planned rest is " +
                        minutes +
                        " minutes overdue. A short reset may help you return to your responsibilities with more energy."
                );

            } else if (
                overdue.type ===
                "sleep"
            ) {

                recommend(
                    "You are " +
                        minutes +
                        " minutes past your planned bedtime. Begin winding down so tomorrow's wake-up and breakfast routine are easier."
                );

            } else {

                recommend(
                    "Your wake time is " +
                        minutes +
                        " minutes past schedule. Once you are up, check your breakfast time so the delay does not turn into a skipped meal."
                );
            }


            return;
        }


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
                    ) /
                    60000
                );


            setText(
                "next-up-label",
                "Next Up"
            );


            setText(
                "next-up-title",
                next.title
            );


            setText(
                "next-up-countdown",
                minutes < 60
                    ? "In " +
                      minutes +
                      " minutes"
                    : "In " +
                      Math.floor(
                          minutes / 60
                      ) +
                      "h " +
                      (
                          minutes % 60
                      ) +
                      "m"
            );


            if (
                minutes <= 15
            ) {

                recommend(
                    next.title.replace(
                        /^[^\s]+\s/,
                        ""
                    ) +
                    " is coming up soon. Start creating a stopping point now so your current responsibility does not override your routine."
                );

            } else if (
                latestEnergy !== null &&
                latestEnergy <= 3
            ) {

                recommend(
                    "Your energy is currently low. Keep your next scheduled meal or rest period protected instead of trying to push through everything at once."
                );

            } else {

                recommend(
                    "Your routine is currently on track. Keep the Next Up card visible while you work so your schedule does not disappear behind your responsibilities."
                );
            }


            return;
        }


        setText(
            "next-up-label",
            "Routine Complete"
        );


        setText(
            "next-up-title",
            "✓ Done for today"
        );


        setText(
            "next-up-countdown",
            "Nice work"
        );


        recommend(
            "You have reached the end of today's saved routine. Review what worked today and try to repeat the same timing tomorrow."
        );
    }


    /* ======================================================
       REALTIME
       ====================================================== */

    function startRealtime() {

        realtimeChannel =
            supabaseClient
                .channel(
                    "circlesync-v77-" +
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

                        await Promise.all([

                            loadOwnerRequests(),

                            loadDiscoverGroups()

                        ]);

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

                        await Promise.all([

                            loadMyCircles(),

                            loadOwnerRequests(),

                            loadDiscoverGroups()

                        ]);

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
                    loadCircleFeed
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

                        await Promise.all([

                            loadCircleFeed(),

                            updateRoutineDisplay()

                        ]);

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


    /* ======================================================
       INITIAL LOAD
       ====================================================== */

    await Promise.all([

        loadLatestEnergy(),

        loadRoutine(),

        updateNotificationUI()

    ]);


    await loadMyCircles();


    await Promise.all([

        loadDiscoverGroups(),

        loadOwnerRequests(),

        updateRoutineDisplay()

    ]);


    startRealtime();


    routineTimer =
        setInterval(
            updateRoutineDisplay,
            30000
        );


    console.log(
        "CircleSync dashboard v77 ready."
    );
}
