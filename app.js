"use strict";

console.log("CircleSync app.js v61 loaded");


const SUPABASE_URL =
    "https://mkecbhmkvrtwltejwzua.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_hWxse_7flC8kSKS_xlVkYw_BRUwJ2d8";


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

        return null;
    }


    try {

        serviceWorkerRegistration =
            await navigator.serviceWorker.register(
                "service-worker.js"
            );


        console.log(
            "CircleSync service worker registered."
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
// PAGE START
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

    const form =
        document.getElementById(
            "auth-form"
        );


    const emailInput =
        document.getElementById(
            "email"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const loginButton =
        document.getElementById(
            "login-btn"
        );


    const signupButton =
        document.getElementById(
            "signup-btn"
        );


    const message =
        document.getElementById(
            "auth-message"
        );


    function setMessage(
        text,
        isError
    ) {

        message.textContent =
            text;


        message.style.color =
            isError
                ? "#ff8a9a"
                : "#9cff7a";
    }


    function setBusy(
        busy
    ) {

        loginButton.disabled =
            busy;


        signupButton.disabled =
            busy;
    }


    const sessionResult =
        await supabaseClient.auth
            .getSession();


    if (
        sessionResult.data &&
        sessionResult.data.session
    ) {

        window.location.replace(
            "dashboard.html"
        );

        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            if (
                !email ||
                !password
            ) {

                setMessage(
                    "Enter both your email and password.",
                    true
                );


                return;
            }


            setBusy(true);


            setMessage(
                "Signing in...",
                false
            );


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

                    setMessage(
                        result.error.message,
                        true
                    );


                    return;
                }


                window.location.replace(
                    "dashboard.html"
                );


            } catch (error) {

                console.error(
                    error
                );


                setMessage(
                    "Unable to sign in.",
                    true
                );


            } finally {

                setBusy(false);
            }

        }
    );


    signupButton.addEventListener(
        "click",
        async function () {

            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            if (!email) {

                setMessage(
                    "Enter your email.",
                    true
                );


                return;
            }


            if (
                !password ||
                password.length < 6
            ) {

                setMessage(
                    "Password must be at least 6 characters.",
                    true
                );


                return;
            }


            setBusy(true);


            setMessage(
                "Creating account...",
                false
            );


            try {

                const redirectURL =
                    new URL(
                        "dashboard.html",
                        window.location.href
                    ).href;


                const result =
                    await supabaseClient.auth
                        .signUp({

                            email:
                                email,

                            password:
                                password,

                            options: {

                                emailRedirectTo:
                                    redirectURL
                            }

                        });


                if (
                    result.error
                ) {

                    setMessage(
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
                        "dashboard.html"
                    );


                    return;
                }


                setMessage(
                    "Account created. Confirm your email, then sign in.",
                    false
                );


            } catch (error) {

                console.error(
                    error
                );


                setMessage(
                    "Unable to create account.",
                    true
                );


            } finally {

                setBusy(false);
            }

        }
    );
}


// ==========================================================
// DASHBOARD
// ==========================================================

async function initDashboardPage() {

    let currentUser =
        null;


    let currentCircle =
        null;


    let currentRoutine =
        null;


    let focusActive =
        false;


    let focusStartedAt =
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
        !sessionResult.data ||
        !sessionResult.data.session
    ) {

        window.location.replace(
            "index.html"
        );


        return;
    }


    currentUser =
        sessionResult.data.session.user;


    document.getElementById(
        "user-email"
    ).textContent =
        currentUser.email;


    const recommendation =
        document.getElementById(
            "recommendation"
        );


    function showRecommendation(
        text
    ) {

        recommendation.textContent =
            text;
    }


    // ======================================================
    // LOG OUT
    // ======================================================

    document.getElementById(
        "logout-btn"
    ).addEventListener(
        "click",
        async function () {

            await supabaseClient.auth
                .signOut();


            window.location.replace(
                "index.html"
            );
        }
    );


    // ======================================================
    // NOTIFICATIONS
    // ======================================================

    const notificationButton =
        document.getElementById(
            "notification-btn"
        );


    const notificationStatus =
        document.getElementById(
            "notification-status"
        );


    function updateNotificationStatus() {

        if (
            !("Notification" in window)
        ) {

            notificationStatus.textContent =
                "Notifications are not supported by this browser.";


            notificationButton.disabled =
                true;


            return;
        }


        if (
            Notification.permission ===
            "granted"
        ) {

            notificationStatus.textContent =
                "Routine notifications are enabled.";


            notificationButton.textContent =
                "Notifications Enabled ✓";


            notificationButton.disabled =
                true;


            return;
        }


        if (
            Notification.permission ===
            "denied"
        ) {

            notificationStatus.textContent =
                "Notifications are blocked in your browser settings.";


            return;
        }


        notificationStatus.textContent =
            "Enable notifications to receive routine reminders.";
    }


    notificationButton.addEventListener(
        "click",
        async function () {

            if (
                !("Notification" in window)
            ) {

                return;
            }


            const permission =
                await Notification
                    .requestPermission();


            updateNotificationStatus();


            if (
                permission ===
                "granted"
            ) {

                await sendSystemNotification(
                    "CircleSync notifications enabled",
                    "Your routine reminders are ready."
                );
            }
        }
    );


    async function sendSystemNotification(
        title,
        body
    ) {

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


        if (
            serviceWorkerRegistration
        ) {

            try {

                await serviceWorkerRegistration
                    .showNotification(
                        title,
                        {

                            body:
                                body,

                            tag:
                                "circlesync-routine",

                            renotify:
                                true

                        }
                    );


                return;


            } catch (error) {

                console.error(
                    "Service worker notification error:",
                    error
                );
            }
        }


        new Notification(
            title,
            {

                body:
                    body
            }
        );
    }


    updateNotificationStatus();


    // ======================================================
    // MEMBERSHIPS
    // ======================================================

    async function getMyCircleIds() {

        const result =
            await supabaseClient
                .from(
                    "circle_members"
                )
                .select(
                    "circle_id"
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
            result.data || []
        ).map(
            function (item) {

                return item.circle_id;
            }
        );
    }


    // ======================================================
    // VISIBLE CIRCLES
    // ======================================================

    async function getVisibleCircles() {

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


    // ======================================================
    // ACTIVE CIRCLE
    // ======================================================

    async function loadMyCircle() {

        const memberships =
            await getMyCircleIds();


        const circles =
            await getVisibleCircles();


        const mine =
            circles.filter(
                function (circle) {

                    return (

                        circle.created_by ===
                            currentUser.id

                        ||

                        memberships.includes(
                            circle.id
                        )

                    );
                }
            );


        if (
            mine.length === 0
        ) {

            currentCircle =
                null;


            document.getElementById(
                "circle-name"
            ).textContent =
                "No Circle Selected";


            document.getElementById(
                "circle-description"
            ).textContent =
                "Create or join an accountability circle.";


            document.getElementById(
                "circle-list"
            ).innerHTML =
                "<li>No members loaded yet.</li>";


            await loadCircleFeed();


            return;
        }


        currentCircle =
            mine[0];


        document.getElementById(
            "circle-name"
        ).textContent =
            currentCircle.name;


        document.getElementById(
            "circle-description"
        ).textContent =
            currentCircle.description ||
            "No description provided.";


        await loadCircleMembers();


        await loadCircleFeed();
    }


    // ======================================================
    // CIRCLE MEMBERS
    // ======================================================

    async function loadCircleMembers() {

        const list =
            document.getElementById(
                "circle-list"
            );


        if (!currentCircle) {

            list.innerHTML =
                "<li>No members yet.</li>";


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
                    currentCircle.id
                );


        if (
            result.error
        ) {

            console.error(
                result.error
            );


            return;
        }


        list.innerHTML =
            "";


        (result.data || [])
            .forEach(
                function (member) {

                    const item =
                        document.createElement(
                            "li"
                        );


                    const name =
                        member.user_id ===
                        currentUser.id
                            ? "You"
                            : "Circle Member";


                    item.textContent =
                        name +
                        " — " +
                        member.role;


                    list.appendChild(
                        item
                    );
                }
            );
    }


    // ======================================================
    // DISCOVER
    // ======================================================

    async function loadDiscoverGroups() {

        const container =
            document.getElementById(
                "discover-groups"
            );


        container.innerHTML =
            "<p>Loading groups...</p>";


        const myIds =
            await getMyCircleIds();


        const circles =
            await getVisibleCircles();


        const publicCircles =
            circles.filter(
                function (circle) {

                    return (
                        circle.is_public ===
                        true
                    );
                }
            );


        container.innerHTML =
            "";


        if (
            publicCircles.length === 0
        ) {

            container.innerHTML =
                "<p>No public groups yet.</p>";


            return;
        }


        publicCircles.forEach(
            function (circle) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "discover-group-card";


                const heading =
                    document.createElement(
                        "h3"
                    );


                heading.textContent =
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


                if (
                    circle.created_by ===
                    currentUser.id
                ) {

                    button.textContent =
                        "Your Group ✓";


                    button.disabled =
                        true;


                } else if (
                    myIds.includes(
                        circle.id
                    )
                ) {

                    button.textContent =
                        "Joined ✓";


                    button.disabled =
                        true;


                } else {

                    button.textContent =
                        "Join Group";


                    button.addEventListener(
                        "click",
                        async function () {

                            const result =
                                await supabaseClient
                                    .from(
                                        "circle_members"
                                    )
                                    .insert({

                                        circle_id:
                                            circle.id,

                                        user_id:
                                            currentUser.id,

                                        role:
                                            "member"

                                    });


                            if (
                                result.error
                            ) {

                                showRecommendation(
                                    result.error.message
                                );


                                return;
                            }


                            currentCircle =
                                circle;


                            await loadMyCircle();


                            await loadDiscoverGroups();
                        }
                    );
                }


                card.appendChild(
                    heading
                );


                card.appendChild(
                    description
                );


                card.appendChild(
                    button
                );


                container.appendChild(
                    card
                );
            }
        );
    }


    document.getElementById(
        "refresh-groups-btn"
    ).addEventListener(
        "click",
        loadDiscoverGroups
    );


    // ======================================================
    // CREATE CIRCLE
    // ======================================================

    document.getElementById(
        "create-circle-btn"
    ).addEventListener(
        "click",
        async function () {

            const nameInput =
                document.getElementById(
                    "new-circle-name"
                );


            const descriptionInput =
                document.getElementById(
                    "new-circle-description"
                );


            const name =
                nameInput.value.trim();


            if (!name) {

                showRecommendation(
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


            if (
                result.error
            ) {

                showRecommendation(
                    result.error.message
                );


                return;
            }


            nameInput.value =
                "";


            descriptionInput.value =
                "";


            currentCircle =
                result.data;


            await loadMyCircle();


            await loadDiscoverGroups();
        }
    );


    // ======================================================
    // CHECK INS
    // ======================================================

    async function saveCheckIn(
        type,
        options
    ) {

        const data =
            options || {};


        const result =
            await supabaseClient
                .from(
                    "check_ins"
                )
                .insert({

                    user_id:
                        currentUser.id,

                    circle_id:
                        currentCircle
                            ? currentCircle.id
                            : null,

                    check_in_type:
                        type,

                    energy_level:
                        data.energy_level !==
                        undefined
                            ? data.energy_level
                            : null,

                    stress_level:
                        null,

                    sleep_hours:
                        null,

                    notes:
                        data.notes ||
                        null,

                    shared_with_circle:
                        data.shared_with_circle ===
                        true

                });


        if (
            result.error
        ) {

            console.error(
                result.error
            );


            showRecommendation(
                "Check-in failed: " +
                result.error.message
            );


            return false;
        }


        return true;
    }


    // ======================================================
    // TODAY COMPLETION
    // ======================================================

    async function getTodaysCompletedTypes() {

        const now =
            new Date();


        const start =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                0,
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
                    "check_in_type, created_at"
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .gte(
                    "created_at",
                    start.toISOString()
                );


        if (
            result.error
        ) {

            console.error(
                result.error
            );


            return [];
        }


        return Array.from(
            new Set(
                (result.data || [])
                    .map(
                        function (item) {

                            return item.check_in_type;
                        }
                    )
            )
        );
    }


    // ======================================================
    // ROUTINE ENGINE
    // ======================================================

    const nextUpLabel =
        document.getElementById(
            "next-up-label"
        );


    const nextUpTitle =
        document.getElementById(
            "next-up-title"
        );


    const nextUpCountdown =
        document.getElementById(
            "next-up-countdown"
        );


    const routineAlert =
        document.getElementById(
            "routine-alert"
        );


    function timeToDate(
        value
    ) {

        if (!value) {

            return null;
        }


        const pieces =
            value.split(":");


        if (
            pieces.length < 2
        ) {

            return null;
        }


        const now =
            new Date();


        const date =
            new Date(
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


        return date;
    }


    function formatClock(
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


    function getRoutineItems() {

        if (!currentRoutine) {

            return [];
        }


        return [

            {
                type:
                    "wake",

                name:
                    "Wake Up",

                icon:
                    "☀️",

                time:
                    currentRoutine.wake_time
            },

            {
                type:
                    "breakfast",

                name:
                    "Breakfast",

                icon:
                    "🍳",

                time:
                    currentRoutine.breakfast_time
            },

            {
                type:
                    "lunch",

                name:
                    "Lunch",

                icon:
                    "🥗",

                time:
                    currentRoutine.lunch_time
            },

            {
                type:
                    "rest",

                name:
                    "Rest",

                icon:
                    "😴",

                time:
                    currentRoutine.rest_start_time
            },

            {
                type:
                    "dinner",

                name:
                    "Dinner",

                icon:
                    "🍽",

                time:
                    currentRoutine.dinner_time
            },

            {
                type:
                    "sleep",

                name:
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


    function reminderStorageKey(
        type
    ) {

        const now =
            new Date();


        const date =
            now.getFullYear() +
            "-" +
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            ) +
            "-" +
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            "circlesync-reminder-" +
            date +
            "-" +
            type
        );
    }


    function reminderWasSent(
        type
    ) {

        return (
            localStorage.getItem(
                reminderStorageKey(
                    type
                )
            ) === "yes"
        );
    }


    function markReminderSent(
        type
    ) {

        localStorage.setItem(
            reminderStorageKey(
                type
            ),
            "yes"
        );
    }


    async function updateRoutineEngine() {

        if (!currentRoutine) {

            nextUpLabel.textContent =
                "No routine saved yet.";


            nextUpTitle.textContent =
                "Set your daily routine below";


            nextUpCountdown.textContent =
                "";


            routineAlert.textContent =
                "";


            return;
        }


        const completed =
            await getTodaysCompletedTypes();


        const now =
            new Date();


        const items =
            getRoutineItems()
                .map(
                    function (item) {

                        return {

                            type:
                                item.type,

                            name:
                                item.name,

                            icon:
                                item.icon,

                            date:
                                timeToDate(
                                    item.time
                                )

                        };
                    }
                )
                .filter(
                    function (item) {

                        return (
                            item.date !==
                            null
                        );
                    }
                )
                .sort(
                    function (a, b) {

                        return (
                            a.date -
                            b.date
                        );
                    }
                );


        if (
            items.length === 0
        ) {

            nextUpTitle.textContent =
                "No routine times set";


            return;
        }


        let nextItem =
            null;


        let overdueItem =
            null;


        for (
            let i = 0;
            i < items.length;
            i += 1
        ) {

            const item =
                items[i];


            const difference =
                item.date.getTime() -
                now.getTime();


            const completedToday =
                completed.includes(
                    item.type
                );


            if (
                difference <= 0 &&
                !completedToday
            ) {

                overdueItem =
                    item;
            }


            if (
                difference > 0 &&
                !nextItem
            ) {

                nextItem =
                    item;
            }
        }


        if (overdueItem) {

            const lateMinutes =
                Math.floor(
                    (
                        now.getTime() -
                        overdueItem.date.getTime()
                    ) / 60000
                );


            nextUpLabel.textContent =
                "Needs Attention";


            nextUpTitle.textContent =
                overdueItem.icon +
                " " +
                overdueItem.name;


            nextUpCountdown.textContent =
                lateMinutes <= 1
                    ? "Scheduled now"
                    : lateMinutes +
                      " minutes overdue";


            routineAlert.textContent =
                "Your " +
                overdueItem.name.toLowerCase() +
                " was scheduled for " +
                formatClock(
                    overdueItem.date
                ) +
                ".";


            showRecommendation(
                "Your " +
                overdueItem.name.toLowerCase() +
                " is overdue. Check in when you complete it."
            );


            if (
                !reminderWasSent(
                    overdueItem.type
                )
            ) {

                await sendSystemNotification(

                    overdueItem.icon +
                    " " +
                    overdueItem.name,

                    "Your scheduled time was " +
                    formatClock(
                        overdueItem.date
                    ) +
                    "."
                );


                markReminderSent(
                    overdueItem.type
                );
            }


            return;
        }


        if (nextItem) {

            const minutes =
                Math.ceil(
                    (
                        nextItem.date.getTime() -
                        now.getTime()
                    ) / 60000
                );


            nextUpLabel.textContent =
                "Next Up";


            nextUpTitle.textContent =
                nextItem.icon +
                " " +
                nextItem.name;


            if (
                minutes < 60
            ) {

                nextUpCountdown.textContent =
                    "In " +
                    minutes +
                    " minutes";


            } else {

                const hours =
                    Math.floor(
                        minutes / 60
                    );


                const remainingMinutes =
                    minutes % 60;


                nextUpCountdown.textContent =
                    "In " +
                    hours +
                    "h " +
                    remainingMinutes +
                    "m";
            }


            routineAlert.textContent =
                "Scheduled for " +
                formatClock(
                    nextItem.date
                ) +
                ".";


            if (
                minutes <= 30 &&
                minutes > 0
            ) {

                showRecommendation(
                    nextItem.name +
                    " is coming up in " +
                    minutes +
                    " minutes."
                );
            }


            return;
        }


        nextUpLabel.textContent =
            "Routine Complete";


        nextUpTitle.textContent =
            "✓ You're done for today";


        nextUpCountdown.textContent =
            "Nice work";


        routineAlert.textContent =
            "Your next routine begins tomorrow.";
    }


    function startRoutineEngine() {

        if (routineTimer) {

            clearInterval(
                routineTimer
            );
        }


        updateRoutineEngine();


        routineTimer =
            setInterval(
                updateRoutineEngine,
                60000
            );
    }


    // ======================================================
    // ENERGY
    // ======================================================

    const energyInput =
        document.getElementById(
            "energy-input"
        );


    const energyValue =
        document.getElementById(
            "energy-value"
        );


    const energyScore =
        document.getElementById(
            "energy-score"
        );


    energyInput.addEventListener(
        "input",
        function () {

            energyValue.textContent =
                energyInput.value;
        }
    );


    document.getElementById(
        "save-energy"
    ).addEventListener(
        "click",
        async function () {

            const value =
                Number(
                    energyInput.value
                );


            const saved =
                await saveCheckIn(
                    "energy",
                    {

                        energy_level:
                            value,

                        shared_with_circle:
                            false

                    }
                );


            if (saved) {

                energyScore.textContent =
                    String(
                        value * 10
                    );


                showRecommendation(
                    "Energy level saved privately."
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
                .limit(1)
                .maybeSingle();


        if (
            result.data &&
            result.data.energy_level !==
            null
        ) {

            energyInput.value =
                result.data.energy_level;


            energyValue.textContent =
                result.data.energy_level;


            energyScore.textContent =
                String(
                    result.data.energy_level *
                    10
                );
        }
    }


    // ======================================================
    // SHARED QUICK CHECK INS
    // ======================================================

    const checkInConfig = [

        [
            "breakfast-btn",
            "breakfast",
            "Breakfast recorded."
        ],

        [
            "lunch-btn",
            "lunch",
            "Lunch recorded."
        ],

        [
            "dinner-btn",
            "dinner",
            "Dinner recorded."
        ],

        [
            "rest-btn",
            "rest",
            "Rest recorded."
        ],

        [
            "working-btn",
            "focus",
            "Working status recorded."
        ],

        [
            "sleep-btn",
            "sleep",
            "Sleep check-in recorded."
        ],

        [
            "wake-btn",
            "wake",
            "Wake check-in recorded."
        ]

    ];


    checkInConfig.forEach(
        function (config) {

            const button =
                document.getElementById(
                    config[0]
                );


            button.addEventListener(
                "click",
                async function () {

                    button.disabled =
                        true;


                    const saved =
                        await saveCheckIn(
                            config[1],
                            {

                                shared_with_circle:
                                    Boolean(
                                        currentCircle
                                    )

                            }
                        );


                    button.disabled =
                        false;


                    if (saved) {

                        showRecommendation(
                            config[2]
                        );


                        await loadCircleFeed();


                        await updateRoutineEngine();
                    }
                }
            );
        }
    );


    // ======================================================
    // FOCUS MODE
    // ======================================================

    const focusButton =
        document.getElementById(
            "focus-btn"
        );


    const focusStatus =
        document.getElementById(
            "focus-status"
        );


    focusButton.addEventListener(
        "click",
        async function () {

            if (!focusActive) {

                focusActive =
                    true;


                focusStartedAt =
                    new Date();


                focusButton.textContent =
                    "End Focus Session";


                focusStatus.textContent =
                    "Focus session active.";


                showRecommendation(
                    "Focus mode started. CircleSync will keep watching your routine."
                );


                return;
            }


            const now =
                new Date();


            const minutes =
                Math.max(
                    1,
                    Math.round(
                        (
                            now.getTime() -
                            focusStartedAt.getTime()
                        ) / 60000
                    )
                );


            await saveCheckIn(
                "focus",
                {

                    notes:
                        "Completed a " +
                        minutes +
                        " minute focus session.",

                    shared_with_circle:
                        Boolean(
                            currentCircle
                        )

                }
            );


            focusActive =
                false;


            focusStartedAt =
                null;


            focusButton.textContent =
                "Start Focus Session";


            focusStatus.textContent =
                "Last focus session: " +
                minutes +
                " minutes.";


            await loadCircleFeed();


            await updateRoutineEngine();
        }
    );


    // ======================================================
    // MESSAGES
    // ======================================================

    const messageInput =
        document.getElementById(
            "circle-message"
        );


    const feedMessage =
        document.getElementById(
            "feed-message"
        );


    document.getElementById(
        "send-message-btn"
    ).addEventListener(
        "click",
        async function () {

            if (!currentCircle) {

                feedMessage.textContent =
                    "Join or create a circle first.";


                return;
            }


            const text =
                messageInput.value.trim();


            if (!text) {

                feedMessage.textContent =
                    "Enter a message first.";


                return;
            }


            const result =
                await supabaseClient
                    .from(
                        "circle_messages"
                    )
                    .insert({

                        circle_id:
                            currentCircle.id,

                        user_id:
                            currentUser.id,

                        message:
                            text

                    });


            if (
                result.error
            ) {

                feedMessage.textContent =
                    result.error.message;


                return;
            }


            messageInput.value =
                "";


            feedMessage.textContent =
                "Message sent.";


            await loadCircleFeed();
        }
    );


    // ======================================================
    // FEED
    // ======================================================

    async function loadCircleFeed() {

        const feed =
            document.getElementById(
                "circle-feed"
            );


        if (!currentCircle) {

            feed.innerHTML =
                "<p>Join or create a circle to see activity.</p>";


            return;
        }


        const messageResult =
            await supabaseClient
                .from(
                    "circle_messages"
                )
                .select(
                    "id, user_id, message, created_at"
                )
                .eq(
                    "circle_id",
                    currentCircle.id
                )
                .order(
                    "created_at",
                    {

                        ascending:
                            false
                    }
                )
                .limit(30);


        const checkResult =
            await supabaseClient
                .from(
                    "check_ins"
                )
                .select(
                    "id, user_id, check_in_type, notes, created_at"
                )
                .eq(
                    "circle_id",
                    currentCircle.id
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
                .limit(30);


        const items =
            [];


        (messageResult.data || [])
            .forEach(
                function (message) {

                    items.push({

                        type:
                            "message",

                        text:
                            "💬 " +
                            message.message,

                        created_at:
                            message.created_at

                    });
                }
            );


        (checkResult.data || [])
            .forEach(
                function (checkIn) {

                    items.push({

                        type:
                            "checkin",

                        text:
                            getCheckInLabel(
                                checkIn.check_in_type
                            ),

                        created_at:
                            checkIn.created_at

                    });
                }
            );


        items.sort(
            function (a, b) {

                return (
                    new Date(
                        b.created_at
                    ) -
                    new Date(
                        a.created_at
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
                "<p>No activity yet.</p>";


            return;
        }


        items.forEach(
            function (item) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "feed-item";


                const content =
                    document.createElement(
                        "p"
                    );


                content.textContent =
                    item.text;


                const time =
                    document.createElement(
                        "span"
                    );


                time.textContent =
                    new Date(
                        item.created_at
                    ).toLocaleString();


                card.appendChild(
                    content
                );


                card.appendChild(
                    time
                );


                feed.appendChild(
                    card
                );
            }
        );
    }


    function getCheckInLabel(
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
                "💻 Working",

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


    document.getElementById(
        "refresh-feed-btn"
    ).addEventListener(
        "click",
        loadCircleFeed
    );


    // ======================================================
    // ROUTINE FORM
    // ======================================================

    const wakeTime =
        document.getElementById(
            "wake-time"
        );


    const breakfastTime =
        document.getElementById(
            "breakfast-time"
        );


    const lunchTime =
        document.getElementById(
            "lunch-time"
        );


    const dinnerTime =
        document.getElementById(
            "dinner-time"
        );


    const restTime =
        document.getElementById(
            "rest-time"
        );


    const bedtime =
        document.getElementById(
            "bedtime"
        );


    const sleepGoal =
        document.getElementById(
            "sleep-goal"
        );


    const routineMessage =
        document.getElementById(
            "routine-message"
        );


    function valueOrNull(
        input
    ) {

        return input.value
            ? input.value
            : null;
    }


    function applyTime(
        input,
        value
    ) {

        input.value =
            value
                ? value.substring(
                    0,
                    5
                )
                : "";
    }


    document.getElementById(
        "save-routine-btn"
    ).addEventListener(
        "click",
        async function () {

            const goal =
                Number(
                    sleepGoal.value
                );


            if (
                goal < 1 ||
                goal > 24
            ) {

                routineMessage.textContent =
                    "Sleep goal must be between 1 and 24 hours.";


                return;
            }


            const routineData = {

                user_id:
                    currentUser.id,

                wake_time:
                    valueOrNull(
                        wakeTime
                    ),

                breakfast_time:
                    valueOrNull(
                        breakfastTime
                    ),

                lunch_time:
                    valueOrNull(
                        lunchTime
                    ),

                dinner_time:
                    valueOrNull(
                        dinnerTime
                    ),

                rest_start_time:
                    valueOrNull(
                        restTime
                    ),

                bedtime:
                    valueOrNull(
                        bedtime
                    ),

                sleep_goal_hours:
                    goal

            };


            const result =
                await supabaseClient
                    .from(
                        "routines"
                    )
                    .upsert(
                        routineData,
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

                routineMessage.textContent =
                    result.error.message;


                routineMessage.style.color =
                    "#ff8a9a";


                return;
            }


            currentRoutine =
                result.data;


            routineMessage.textContent =
                "Routine saved. Your reminders have been updated.";


            routineMessage.style.color =
                "#9cff7a";


            await updateRoutineEngine();
        }
    );


    async function loadRoutine() {

        const result =
            await supabaseClient
                .from(
                    "routines"
                )
                .select(
                    "wake_time, breakfast_time, lunch_time, dinner_time, rest_start_time, bedtime, sleep_goal_hours"
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
                result.error
            );


            return;
        }


        if (
            !result.data
        ) {

            currentRoutine =
                null;


            return;
        }


        currentRoutine =
            result.data;


        applyTime(
            wakeTime,
            currentRoutine.wake_time
        );


        applyTime(
            breakfastTime,
            currentRoutine.breakfast_time
        );


        applyTime(
            lunchTime,
            currentRoutine.lunch_time
        );


        applyTime(
            dinnerTime,
            currentRoutine.dinner_time
        );


        applyTime(
            restTime,
            currentRoutine.rest_start_time
        );


        applyTime(
            bedtime,
            currentRoutine.bedtime
        );


        sleepGoal.value =
            currentRoutine.sleep_goal_hours ||
            8;
    }


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    await loadLatestEnergy();


    await loadRoutine();


    await loadMyCircle();


    await loadDiscoverGroups();


    startRoutineEngine();


    showRecommendation(
        "CircleSync is monitoring today's routine."
    );


    console.log(
        "CircleSync dashboard v61 ready"
    );
}
