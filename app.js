"use strict";

console.log("CircleSync app.js v62 loaded");


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

    if (
        !("serviceWorker" in navigator)
    ) {

        console.log(
            "Service workers are not supported."
        );

        return null;
    }


    try {

        serviceWorkerRegistration =
            await navigator.serviceWorker
                .register(
                    "./service-worker.js"
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
// APP START
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

    const signinSection =
        document.getElementById(
            "signin-section"
        );


    const signupSection =
        document.getElementById(
            "signup-section"
        );


    const showSigninButton =
        document.getElementById(
            "show-signin-btn"
        );


    const showSignupButton =
        document.getElementById(
            "show-signup-btn"
        );


    const signinForm =
        document.getElementById(
            "signin-form"
        );


    const signupForm =
        document.getElementById(
            "signup-form"
        );


    const signinEmail =
        document.getElementById(
            "signin-email"
        );


    const signinPassword =
        document.getElementById(
            "signin-password"
        );


    const signupEmail =
        document.getElementById(
            "signup-email"
        );


    const signupPassword =
        document.getElementById(
            "signup-password"
        );


    const signupConfirmPassword =
        document.getElementById(
            "signup-confirm-password"
        );


    const loginButton =
        document.getElementById(
            "login-btn"
        );


    const signupButton =
        document.getElementById(
            "signup-btn"
        );


    const authMessage =
        document.getElementById(
            "auth-message"
        );


    // ======================================================
    // VALIDATE AUTH PAGE ELEMENTS
    // ======================================================

    if (
        !signinSection ||
        !signupSection ||
        !showSigninButton ||
        !showSignupButton ||
        !signinForm ||
        !signupForm ||
        !signinEmail ||
        !signinPassword ||
        !signupEmail ||
        !signupPassword ||
        !signupConfirmPassword ||
        !loginButton ||
        !signupButton ||
        !authMessage
    ) {

        console.error(
            "The authentication page is missing required HTML elements."
        );

        return;
    }


    // ======================================================
    // AUTH MESSAGE
    // ======================================================

    function showMessage(
        text,
        isError
    ) {

        authMessage.textContent =
            text;


        authMessage.style.color =
            isError
                ? "#ff8a9a"
                : "#9cff7a";
    }


    // ======================================================
    // SWITCH AUTH SCREENS
    // ======================================================

    function showSignin() {

        signinSection.hidden =
            false;


        signupSection.hidden =
            true;


        showSigninButton.classList.add(
            "active-tab"
        );


        showSignupButton.classList.remove(
            "active-tab"
        );


        authMessage.textContent =
            "";
    }


    function showSignup() {

        signinSection.hidden =
            true;


        signupSection.hidden =
            false;


        showSignupButton.classList.add(
            "active-tab"
        );


        showSigninButton.classList.remove(
            "active-tab"
        );


        authMessage.textContent =
            "";
    }


    showSigninButton.addEventListener(
        "click",
        showSignin
    );


    showSignupButton.addEventListener(
        "click",
        showSignup
    );


    // ======================================================
    // CHECK AUTH RETURN URL
    // ======================================================

    const currentUrl =
        new URL(
            window.location.href
        );


    const hashParams =
        new URLSearchParams(
            window.location.hash.substring(1)
        );


    const queryError =
        currentUrl.searchParams.get(
            "error_description"
        );


    const hashError =
        hashParams.get(
            "error_description"
        );


    const returnedError =
        queryError ||
        hashError;


    if (returnedError) {

        showMessage(
            decodeURIComponent(
                returnedError.replace(
                    /\+/g,
                    " "
                )
            ),
            true
        );
    }


    // ======================================================
    // SESSION CHECK
    // ======================================================

    const sessionResult =
        await supabaseClient.auth
            .getSession();


    if (
        sessionResult.error
    ) {

        console.error(
            "Session check error:",
            sessionResult.error
        );
    }


    if (
        sessionResult.data &&
        sessionResult.data.session
    ) {

        window.location.replace(
            "./dashboard.html"
        );

        return;
    }


    // ======================================================
    // SIGN IN
    // ======================================================

    signinForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                signinEmail.value.trim();


            const password =
                signinPassword.value;


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


            loginButton.disabled =
                true;


            loginButton.textContent =
                "Signing In...";


            showMessage(
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

                    console.error(
                        "Sign-in error:",
                        result.error
                    );


                    showMessage(
                        result.error.message,
                        true
                    );

                    return;
                }


                if (
                    !result.data ||
                    !result.data.session
                ) {

                    showMessage(
                        "Unable to create an active login session.",
                        true
                    );

                    return;
                }


                showMessage(
                    "Sign in successful.",
                    false
                );


                window.location.replace(
                    "./dashboard.html"
                );


            } catch (error) {

                console.error(
                    "Unexpected sign-in error:",
                    error
                );


                showMessage(
                    "Unable to sign in. Please try again.",
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


    // ======================================================
    // CREATE ACCOUNT
    // ======================================================

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                signupEmail.value.trim();


            const password =
                signupPassword.value;


            const confirmedPassword =
                signupConfirmPassword.value;


            if (!email) {

                showMessage(
                    "Enter your email address.",
                    true
                );

                return;
            }


            if (
                !password ||
                password.length < 6
            ) {

                showMessage(
                    "Your password must contain at least 6 characters.",
                    true
                );

                return;
            }


            if (
                password !==
                confirmedPassword
            ) {

                showMessage(
                    "Your passwords do not match.",
                    true
                );

                return;
            }


            signupButton.disabled =
                true;


            signupButton.textContent =
                "Creating Account...";


            showMessage(
                "Creating your account...",
                false
            );


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

                    console.error(
                        "Signup error:",
                        result.error
                    );


                    showMessage(
                        result.error.message,
                        true
                    );

                    return;
                }


                if (
                    result.data &&
                    result.data.session
                ) {

                    showMessage(
                        "Account created successfully.",
                        false
                    );


                    window.location.replace(
                        "./dashboard.html"
                    );

                    return;
                }


                showMessage(
                    "Account created! Check your email and click the confirmation link. After confirming, you will return to CircleSync and can sign in with the password you just created.",
                    false
                );


                signupPassword.value =
                    "";


                signupConfirmPassword.value =
                    "";


            } catch (error) {

                console.error(
                    "Unexpected signup error:",
                    error
                );


                showMessage(
                    "Unable to create your account. Please try again.",
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


// ==========================================================
// DASHBOARD PAGE
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
    // VERIFY SESSION
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
            "./index.html"
        );

        return;
    }


    currentUser =
        sessionResult.data.session.user;


    const userEmail =
        document.getElementById(
            "user-email"
        );


    const recommendation =
        document.getElementById(
            "recommendation"
        );


    if (userEmail) {

        userEmail.textContent =
            currentUser.email ||
            "Signed in";
    }


    function showRecommendation(
        text
    ) {

        if (recommendation) {

            recommendation.textContent =
                text;
        }
    }


    // ======================================================
    // LOG OUT
    // ======================================================

    const logoutButton =
        document.getElementById(
            "logout-btn"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async function () {

                const result =
                    await supabaseClient.auth
                        .signOut();


                if (
                    result.error
                ) {

                    showRecommendation(
                        "Unable to log out: " +
                        result.error.message
                    );

                    return;
                }


                window.location.replace(
                    "./index.html"
                );
            }
        );
    }


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
            !notificationButton ||
            !notificationStatus
        ) {

            return;
        }


        if (
            !("Notification" in window)
        ) {

            notificationStatus.textContent =
                "Notifications are not supported in this browser.";


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
                "Notifications are blocked. Enable them in your browser settings.";


            notificationButton.disabled =
                false;


            return;
        }


        notificationStatus.textContent =
            "Enable notifications to receive routine reminders.";
    }


    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            async function () {

                if (
                    !("Notification" in window)
                ) {

                    return;
                }


                try {

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


                } catch (error) {

                    console.error(
                        "Notification permission error:",
                        error
                    );
                }
            }
        );
    }


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


        try {

            new Notification(
                title,
                {

                    body:
                        body

                }
            );


        } catch (error) {

            console.error(
                "Notification error:",
                error
            );
        }
    }


    updateNotificationStatus();


    // ======================================================
    // PROFILE HELPERS
    // ======================================================

    async function getProfileMap(
        userIds
    ) {

        const map = {};


        if (
            !userIds ||
            userIds.length === 0
        ) {

            return map;
        }


        const uniqueIds =
            Array.from(
                new Set(
                    userIds
                )
            );


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
                "Profile load error:",
                result.error
            );

            return map;
        }


        (result.data || [])
            .forEach(
                function (profile) {

                    map[
                        profile.id
                    ] =
                        profile.display_name ||
                        "Circle Member";
                }
            );


        return map;
    }


    function getDisplayName(
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
            profileMap[
                userId
            ] ||
            "Circle Member"
        );
    }


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
                "Membership load error:",
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
                "Circle load error:",
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

        const membershipIds =
            await getMyCircleIds();


        const circles =
            await getVisibleCircles();


        const myCircles =
            circles.filter(
                function (circle) {

                    return (
                        circle.created_by ===
                            currentUser.id ||
                        membershipIds.includes(
                            circle.id
                        )
                    );
                }
            );


        const circleName =
            document.getElementById(
                "circle-name"
            );


        const circleDescription =
            document.getElementById(
                "circle-description"
            );


        const circleList =
            document.getElementById(
                "circle-list"
            );


        if (
            myCircles.length === 0
        ) {

            currentCircle =
                null;


            if (circleName) {

                circleName.textContent =
                    "No Circle Selected";
            }


            if (circleDescription) {

                circleDescription.textContent =
                    "Create or join an accountability circle.";
            }


            if (circleList) {

                circleList.innerHTML =
                    "<li>No members loaded yet.</li>";
            }


            await loadCircleFeed();


            return;
        }


        currentCircle =
            myCircles[0];


        if (circleName) {

            circleName.textContent =
                currentCircle.name;
        }


        if (circleDescription) {

            circleDescription.textContent =
                currentCircle.description ||
                "No description provided.";
        }


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


        if (!list) {

            return;
        }


        if (
            !currentCircle
        ) {

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
                )
                .order(
                    "joined_at",
                    {

                        ascending:
                            true

                    }
                );


        if (
            result.error
        ) {

            console.error(
                "Circle member load error:",
                result.error
            );


            list.innerHTML =
                "<li>Unable to load members.</li>";

            return;
        }


        const members =
            result.data || [];


        const ids =
            members.map(
                function (member) {

                    return member.user_id;
                }
            );


        const profileMap =
            await getProfileMap(
                ids
            );


        list.innerHTML =
            "";


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
                    getDisplayName(
                        member.user_id,
                        profileMap
                    ) +
                    " — " +
                    member.role;


                list.appendChild(
                    item
                );
            }
        );
    }


    // ======================================================
    // DISCOVER GROUPS
    // ======================================================

    async function loadDiscoverGroups() {

        const container =
            document.getElementById(
                "discover-groups"
            );


        if (!container) {

            return;
        }


        container.innerHTML =
            "<p>Loading groups...</p>";


        const myCircleIds =
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
                "<p>No public groups have been created yet.</p>";

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
                    myCircleIds.includes(
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

                            button.disabled =
                                true;


                            button.textContent =
                                "Joining...";


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

                                console.error(
                                    "Join group error:",
                                    result.error
                                );


                                showRecommendation(
                                    "Unable to join group: " +
                                    result.error.message
                                );


                                button.disabled =
                                    false;


                                button.textContent =
                                    "Join Group";


                                return;
                            }


                            currentCircle =
                                circle;


                            showRecommendation(
                                "You joined " +
                                circle.name +
                                "."
                            );


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


    const refreshGroupsButton =
        document.getElementById(
            "refresh-groups-btn"
        );


    if (refreshGroupsButton) {

        refreshGroupsButton.addEventListener(
            "click",
            loadDiscoverGroups
        );
    }


    // ======================================================
    // CREATE CIRCLE
    // ======================================================

    const createCircleButton =
        document.getElementById(
            "create-circle-btn"
        );


    if (createCircleButton) {

        createCircleButton.addEventListener(
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


                if (
                    !nameInput ||
                    !descriptionInput
                ) {

                    return;
                }


                const name =
                    nameInput.value.trim();


                const description =
                    descriptionInput.value.trim();


                if (!name) {

                    showRecommendation(
                        "Enter a circle name."
                    );

                    return;
                }


                createCircleButton.disabled =
                    true;


                createCircleButton.textContent =
                    "Creating...";


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

                    console.error(
                        "Create circle error:",
                        result.error
                    );


                    showRecommendation(
                        "Unable to create circle: " +
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


                showRecommendation(
                    "Your accountability circle was created."
                );


                await loadMyCircle();


                await loadDiscoverGroups();
            }
        );
    }


    // ======================================================
    // SAVE CHECK-IN
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
                        data.stress_level !==
                        undefined
                            ? data.stress_level
                            : null,

                    sleep_hours:
                        data.sleep_hours !==
                        undefined
                            ? data.sleep_hours
                            : null,

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
                "Check-in error:",
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


    const saveEnergyButton =
        document.getElementById(
            "save-energy"
        );


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


    if (
        saveEnergyButton &&
        energyInput
    ) {

        saveEnergyButton.addEventListener(
            "click",
            async function () {

                const level =
                    Number(
                        energyInput.value
                    );


                saveEnergyButton.disabled =
                    true;


                saveEnergyButton.textContent =
                    "Saving...";


                const saved =
                    await saveCheckIn(
                        "energy",
                        {

                            energy_level:
                                level,

                            shared_with_circle:
                                false

                        }
                    );


                saveEnergyButton.disabled =
                    false;


                saveEnergyButton.textContent =
                    "Save Energy Level";


                if (saved) {

                    if (energyScore) {

                        energyScore.textContent =
                            String(
                                level * 10
                            );
                    }


                    showRecommendation(
                        "Energy level saved privately."
                    );
                }
            }
        );
    }


    async function loadLatestEnergy() {

        if (
            !energyScore ||
            !energyInput ||
            !energyValue
        ) {

            return;
        }


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
            result.error
        ) {

            console.error(
                "Energy load error:",
                result.error
            );

            return;
        }


        if (
            result.data &&
            result.data.energy_level !==
            null
        ) {

            energyInput.value =
                String(
                    result.data.energy_level
                );


            energyValue.textContent =
                String(
                    result.data.energy_level
                );


            energyScore.textContent =
                String(
                    result.data.energy_level *
                    10
                );
        }
    }


    // ======================================================
    // TODAY'S COMPLETED TYPES
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
                "Today check-in load error:",
                result.error
            );

            return [];
        }


        return Array.from(
            new Set(
                (
                    result.data ||
                    []
                ).map(
                    function (item) {

                        return item.check_in_type;
                    }
                )
            )
        );
    }


    // ======================================================
    // QUICK CHECK-INS
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


            if (!button) {

                return;
            }


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


                    if (
                        focusStatus
                    ) {

                        focusStatus.textContent =
                            "Focus session active.";
                    }


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


                if (
                    focusStatus
                ) {

                    focusStatus.textContent =
                        "Last focus session: " +
                        minutes +
                        " minutes.";
                }


                showRecommendation(
                    "Focus session completed. Check whether you need food, water, movement, or rest."
                );


                await loadCircleFeed();


                await updateRoutineEngine();
            }
        );
    }


    // ======================================================
    // CIRCLE MESSAGES
    // ======================================================

    const messageInput =
        document.getElementById(
            "circle-message"
        );


    const sendMessageButton =
        document.getElementById(
            "send-message-btn"
        );


    const feedMessage =
        document.getElementById(
            "feed-message"
        );


    if (
        sendMessageButton &&
        messageInput
    ) {

        sendMessageButton.addEventListener(
            "click",
            async function () {

                if (
                    !currentCircle
                ) {

                    if (feedMessage) {

                        feedMessage.textContent =
                            "Join or create a circle first.";
                    }

                    return;
                }


                const text =
                    messageInput.value.trim();


                if (!text) {

                    if (feedMessage) {

                        feedMessage.textContent =
                            "Enter a message first.";
                    }

                    return;
                }


                sendMessageButton.disabled =
                    true;


                sendMessageButton.textContent =
                    "Sending...";


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


                sendMessageButton.disabled =
                    false;


                sendMessageButton.textContent =
                    "Send Message";


                if (
                    result.error
                ) {

                    console.error(
                        "Message error:",
                        result.error
                    );


                    if (feedMessage) {

                        feedMessage.textContent =
                            result.error.message;
                    }


                    return;
                }


                messageInput.value =
                    "";


                if (feedMessage) {

                    feedMessage.textContent =
                        "Message sent.";
                }


                await loadCircleFeed();
            }
        );
    }


    // ======================================================
    // CIRCLE FEED
    // ======================================================

    async function loadCircleFeed() {

        const feed =
            document.getElementById(
                "circle-feed"
            );


        if (!feed) {

            return;
        }


        if (
            !currentCircle
        ) {

            feed.innerHTML =
                "<p>Join or create a circle to see activity.</p>";

            return;
        }


        feed.innerHTML =
            "<p>Loading circle activity...</p>";


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
                .limit(50);


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
                .limit(50);


        if (
            messageResult.error
        ) {

            console.error(
                "Circle message feed error:",
                messageResult.error
            );
        }


        if (
            checkResult.error
        ) {

            console.error(
                "Circle check-in feed error:",
                checkResult.error
            );
        }


        const messages =
            messageResult.data ||
            [];


        const checkIns =
            checkResult.data ||
            [];


        const userIds =
            messages
                .map(
                    function (item) {

                        return item.user_id;
                    }
                )
                .concat(
                    checkIns.map(
                        function (item) {

                            return item.user_id;
                        }
                    )
                );


        const profileMap =
            await getProfileMap(
                userIds
            );


        const items = [];


        messages.forEach(
            function (message) {

                items.push({

                    kind:
                        "message",

                    userId:
                        message.user_id,

                    text:
                        message.message,

                    createdAt:
                        message.created_at

                });
            }
        );


        checkIns.forEach(
            function (checkIn) {

                items.push({

                    kind:
                        "checkin",

                    userId:
                        checkIn.user_id,

                    type:
                        checkIn.check_in_type,

                    text:
                        checkIn.notes,

                    createdAt:
                        checkIn.created_at

                });
            }
        );


        items.sort(
            function (a, b) {

                return (
                    new Date(
                        b.createdAt
                    ) -
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
                "<p>No activity yet. Send a message or complete a check-in.</p>";

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


                const top =
                    document.createElement(
                        "div"
                    );


                top.className =
                    "feed-item-top";


                const name =
                    document.createElement(
                        "strong"
                    );


                name.textContent =
                    getDisplayName(
                        item.userId,
                        profileMap
                    );


                const time =
                    document.createElement(
                        "span"
                    );


                time.textContent =
                    new Date(
                        item.createdAt
                    ).toLocaleString();


                top.appendChild(
                    name
                );


                top.appendChild(
                    time
                );


                const content =
                    document.createElement(
                        "p"
                    );


                if (
                    item.kind ===
                    "message"
                ) {

                    content.textContent =
                        "💬 " +
                        item.text;


                } else {

                    content.textContent =
                        getCheckInLabel(
                            item.type
                        );
                }


                card.appendChild(
                    top
                );


                card.appendChild(
                    content
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
                "💻 Working / Focus",

            sleep:
                "🌙 Went to sleep",

            wake:
                "☀️ Woke up",

            snack:
                "🍎 Had a snack"

        };


        return (
            labels[
                type
            ] ||
            "✓ Completed a check-in"
        );
    }


    const refreshFeedButton =
        document.getElementById(
            "refresh-feed-btn"
        );


    if (
        refreshFeedButton
    ) {

        refreshFeedButton.addEventListener(
            "click",
            loadCircleFeed
        );
    }


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


    const saveRoutineButton =
        document.getElementById(
            "save-routine-btn"
        );


    function valueOrNull(
        input
    ) {

        if (
            !input ||
            !input.value
        ) {

            return null;
        }


        return input.value;
    }


    function applyTime(
        input,
        value
    ) {

        if (!input) {

            return;
        }


        input.value =
            value
                ? value.substring(
                    0,
                    5
                )
                : "";
    }


    if (
        saveRoutineButton &&
        sleepGoal
    ) {

        saveRoutineButton.addEventListener(
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

                    if (
                        routineMessage
                    ) {

                        routineMessage.textContent =
                            "Sleep goal must be between 1 and 24 hours.";


                        routineMessage.style.color =
                            "#ff8a9a";
                    }


                    return;
                }


                saveRoutineButton.disabled =
                    true;


                saveRoutineButton.textContent =
                    "Saving...";


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


                    if (
                        routineMessage
                    ) {

                        routineMessage.textContent =
                            result.error.message;


                        routineMessage.style.color =
                            "#ff8a9a";
                    }


                    return;
                }


                currentRoutine =
                    result.data;


                if (
                    routineMessage
                ) {

                    routineMessage.textContent =
                        "Routine saved. Your reminders have been updated.";


                    routineMessage.style.color =
                        "#9cff7a";
                }


                await updateRoutineEngine();
            }
        );
    }


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
                "Routine load error:",
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


        if (
            sleepGoal
        ) {

            sleepGoal.value =
                currentRoutine.sleep_goal_hours ||
                8;
        }
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


        const parts =
            value.split(
                ":"
            );


        if (
            parts.length < 2
        ) {

            return null;
        }


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

        if (
            !currentRoutine
        ) {

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
            "circlesync-reminder-" +
            year +
            "-" +
            month +
            "-" +
            day +
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

        if (
            !nextUpLabel ||
            !nextUpTitle ||
            !nextUpCountdown ||
            !routineAlert
        ) {

            return;
        }


        if (
            !currentRoutine
        ) {

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

            nextUpLabel.textContent =
                "No routine times set";


            nextUpTitle.textContent =
                "Add routine times below";


            nextUpCountdown.textContent =
                "";


            routineAlert.textContent =
                "";


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


        if (
            overdueItem
        ) {

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
                "Scheduled for " +
                formatClock(
                    overdueItem.date
                ) +
                ".";


            showRecommendation(
                overdueItem.name +
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


        if (
            nextItem
        ) {

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


                const remainder =
                    minutes % 60;


                nextUpCountdown.textContent =
                    "In " +
                    hours +
                    "h " +
                    remainder +
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

        if (
            routineTimer
        ) {

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
        "CircleSync dashboard v62 ready"
    );
}
