"use strict";

console.log("CircleSync app.js v70 loaded");

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
// AUTH
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


    const required = [

        signinSection,
        signupSection,
        showSigninButton,
        showSignupButton,
        signinForm,
        signupForm,
        signinEmail,
        signinPassword,
        signupEmail,
        signupPassword,
        signupConfirmPassword,
        loginButton,
        signupButton,
        authMessage

    ];


    if (
        required.some(
            function (element) {

                return !element;
            }
        )
    ) {

        console.error(
            "Authentication page is missing required elements."
        );


        return;
    }


    function showMessage(
        text,
        isError
    ) {

        authMessage.textContent =
            text;


        authMessage.className =
            "status " +
            (
                isError
                    ? "error-message"
                    : "success-message"
            );
    }


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


    const pageURL =
        new URL(
            window.location.href
        );


    const hashParameters =
        new URLSearchParams(
            window.location.hash.substring(
                1
            )
        );


    const returnedError =
        pageURL.searchParams.get(
            "error_description"
        ) ||
        hashParameters.get(
            "error_description"
        );


    if (
        returnedError
    ) {

        showMessage(
            returnedError.replace(
                /\+/g,
                " "
            ),
            true
        );
    }


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
                        "No active session was created.",
                        true
                    );


                    return;
                }


                window.location.replace(
                    "./dashboard.html"
                );


            } catch (error) {

                console.error(
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
                    "Password must be at least 6 characters.",
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

                    window.location.replace(
                        "./dashboard.html"
                    );


                    return;
                }


                showMessage(
                    "Account created. Check your email, confirm your account, then return here and sign in with the password you created.",
                    false
                );


                signupPassword.value =
                    "";


                signupConfirmPassword.value =
                    "";


            } catch (error) {

                console.error(
                    error
                );


                showMessage(
                    "Unable to create your account.",
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
// DASHBOARD
// ==========================================================

async function initDashboardPage() {

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

    let routineTimer =
        null;

    let requestPollTimer =
        null;

    const seenRequestIds =
        new Set();

    let requestPollInitialized =
        false;


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


    function byId(id) {

        return document.getElementById(
            id
        );
    }


    const recommendation =
        byId(
            "recommendation"
        );


    byId(
        "user-email"
    ).textContent =
        currentUser.email ||
        "Signed in";


    function showRecommendation(
        text
    ) {

        if (
            recommendation
        ) {

            recommendation.textContent =
                text;
        }
    }


    // ======================================================
    // LOGOUT
    // ======================================================

    byId(
        "logout-btn"
    ).addEventListener(
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


    // ======================================================
    // NOTIFICATIONS
    // ======================================================

    function updateNotificationStatus() {

        const button =
            byId(
                "notification-btn"
            );


        const status =
            byId(
                "notification-status"
            );


        if (
            !button ||
            !status
        ) {

            return;
        }


        if (
            !(
                "Notification"
                in window
            )
        ) {

            status.textContent =
                "Notifications are not supported by this browser.";


            button.disabled =
                true;


            return;
        }


        if (
            Notification.permission ===
            "granted"
        ) {

            status.textContent =
                "Routine and owner request notifications are enabled.";


            button.textContent =
                "Notifications Enabled ✓";


            button.disabled =
                true;


            return;
        }


        if (
            Notification.permission ===
            "denied"
        ) {

            status.textContent =
                "Notifications are blocked in your browser settings.";


            return;
        }


        status.textContent =
            "Enable notifications for routine reminders and owner join requests.";
    }


    async function sendSystemNotification(
        title,
        body,
        tag
    ) {

        if (
            !(
                "Notification"
                in window
            )
        ) {

            return;
        }


        if (
            Notification.permission !==
            "granted"
        ) {

            return;
        }


        try {

            if (
                serviceWorkerRegistration
            ) {

                await serviceWorkerRegistration
                    .showNotification(
                        title,
                        {

                            body:
                                body,

                            tag:
                                tag ||
                                "circlesync",

                            renotify:
                                true

                        }
                    );


            } else {

                new Notification(
                    title,
                    {

                        body:
                            body

                    }
                );
            }


        } catch (error) {

            console.error(
                "Notification error:",
                error
            );
        }
    }


    byId(
        "notification-btn"
    ).addEventListener(
        "click",
        async function () {

            if (
                !(
                    "Notification"
                    in window
                )
            ) {

                return;
            }


            await Notification
                .requestPermission();


            updateNotificationStatus();

        }
    );


    updateNotificationStatus();


    // ======================================================
    // PROFILES
    // ======================================================

    async function getProfileMap(
        userIds
    ) {

        const profileMap =
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

            return profileMap;
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
                "Profile load error:",
                result.error
            );


            return profileMap;
        }


        (
            result.data ||
            []
        ).forEach(
            function (profile) {

                profileMap[
                    profile.id
                ] =
                    profile.display_name ||
                    "Circle Member";

            }
        );


        return profileMap;
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
            profileMap[
                userId
            ] ||
            "Circle Member"
        );
    }


    // ======================================================
    // CIRCLE DATA
    // ======================================================

    async function getMembershipRows() {

        const result =
            await supabaseClient
                .from(
                    "circle_members"
                )
                .select(
                    "circle_id, user_id, role, joined_at"
                )
                .eq(
                    "user_id",
                    currentUser.id
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
                "Membership load error:",
                result.error
            );


            return [];
        }


        return (
            result.data ||
            []
        );
    }


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


        return (
            result.data ||
            []
        );
    }


    // ======================================================
    // MY CIRCLES
    // ======================================================

    async function loadMyCircles() {

        const results =
            await Promise.all([

                getMembershipRows(),

                getVisibleCircles()

            ]);


        const memberships =
            results[0];


        const circles =
            results[1];


        const membershipMap =
            new Map();


        memberships.forEach(
            function (row) {

                membershipMap.set(
                    row.circle_id,
                    row
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

                        return {

                            ...circle,

                            role:
                                circle.created_by ===
                                currentUser.id
                                    ? "owner"
                                    : (
                                        membershipMap.get(
                                            circle.id
                                        )
                                    ).role

                        };

                    }
                );


        const savedCircleId =
            localStorage.getItem(
                "circlesync-active-circle"
            );


        activeCircle =
            myCircles.find(
                function (circle) {

                    return (
                        circle.id ===
                        savedCircleId
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

            localStorage.setItem(
                "circlesync-active-circle",
                activeCircle.id
            );


        } else {

            localStorage.removeItem(
                "circlesync-active-circle"
            );
        }


        renderMyCircleSwitcher();


        await renderActiveCircle();
    }


    function renderMyCircleSwitcher() {

        const container =
            byId(
                "my-circles-scroll"
            );


        container.innerHTML =
            "";


        if (
            myCircles.length ===
            0
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


                        localStorage.setItem(
                            "circlesync-active-circle",
                            circle.id
                        );


                        renderMyCircleSwitcher();


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

        const name =
            byId(
                "circle-name"
            );


        const description =
            byId(
                "circle-description"
            );


        const leaveButton =
            byId(
                "leave-circle-btn"
            );


        if (
            !activeCircle
        ) {

            name.textContent =
                "No Circle Selected";


            description.textContent =
                "Create a circle or request to join one.";


            leaveButton.hidden =
                true;


            byId(
                "circle-list"
            ).innerHTML =
                "<li>No members loaded yet.</li>";


            byId(
                "circle-feed"
            ).innerHTML =
                '<p class="empty-text">Select a circle to view its feed.</p>';


            byId(
                "join-requests-card"
            ).hidden =
                true;


            return;
        }


        name.textContent =
            activeCircle.name;


        description.textContent =
            activeCircle.description ||
            "No description provided.";


        leaveButton.hidden =
            activeCircle.role ===
            "owner";


        await Promise.all([

            loadCircleMembers(),

            loadCircleFeed(),

            loadOwnerJoinRequests()

        ]);
    }


    // ======================================================
    // MEMBERS
    // ======================================================

    async function loadCircleMembers() {

        const list =
            byId(
                "circle-list"
            );


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


        if (
            result.error
        ) {

            list.innerHTML =
                "<li>Unable to load members.</li>";


            return;
        }


        const members =
            result.data ||
            [];


        const profileMap =
            await getProfileMap(
                members.map(
                    function (member) {

                        return member.user_id;
                    }
                )
            );


        list.innerHTML =
            "";


        if (
            members.length ===
            0
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
                    displayName(
                        member.user_id,
                        profileMap
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

    byId(
        "leave-circle-btn"
    ).addEventListener(
        "click",
        async function () {

            if (
                !activeCircle ||
                activeCircle.role ===
                "owner"
            ) {

                return;
            }


            const confirmed =
                window.confirm(
                    "Leave " +
                    activeCircle.name +
                    "?"
                );


            if (
                !confirmed
            ) {

                return;
            }


            const leavingCircleId =
                activeCircle.id;


            const leavingName =
                activeCircle.name;


            const result =
                await supabaseClient
                    .from(
                        "circle_members"
                    )
                    .delete()
                    .eq(
                        "circle_id",
                        leavingCircleId
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    );


            if (
                result.error
            ) {

                showRecommendation(
                    "Unable to leave circle: " +
                    result.error.message
                );


                return;
            }


            localStorage.removeItem(
                "circlesync-active-circle"
            );


            showRecommendation(
                "You left " +
                leavingName +
                "."
            );


            await loadMyCircles();


            await loadDiscoverGroups();

        }
    );


    // ======================================================
    // DISCOVER GROUPS
    // ======================================================

    async function loadDiscoverGroups() {

        const container =
            byId(
                "discover-groups"
            );


        container.innerHTML =
            '<p class="empty-text">Loading groups...</p>';


        const results =
            await Promise.all([

                getVisibleCircles(),

                getMembershipRows(),

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


        const circles =
            results[0];


        const memberships =
            results[1];


        const requestResult =
            results[2];


        const memberIds =
            new Set(
                memberships.map(
                    function (membership) {

                        return membership.circle_id;
                    }
                )
            );


        const latestRequestByCircle =
            new Map();


        if (
            !requestResult.error
        ) {

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
        }


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
            publicCircles.length ===
            0
        ) {

            container.innerHTML =
                '<p class="empty-text">No public circles have been created yet.</p>';


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
                    memberIds.has(
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
                        (
                            activeCircle &&
                            activeCircle.id ===
                            circle.id
                        )
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
                                selectedCircle
                            ) {

                                activeCircle =
                                    selectedCircle;


                                localStorage.setItem(
                                    "circlesync-active-circle",
                                    selectedCircle.id
                                );


                                renderMyCircleSwitcher();


                                await renderActiveCircle();


                                window.scrollTo({

                                    top:
                                        byId(
                                            "my-circle-card"
                                        ).offsetTop -
                                        16,

                                    behavior:
                                        "smooth"

                                });
                            }

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

                    if (
                        request &&
                        request.status ===
                        "declined"
                    ) {

                        button.textContent =
                            "Request Again";


                    } else {

                        button.textContent =
                            "Request to Join";
                    }


                    button.addEventListener(
                        "click",
                        async function () {

                            button.disabled =
                                true;


                            button.textContent =
                                "Sending Request...";


                            const result =
                                await supabaseClient
                                    .from(
                                        "circle_join_requests"
                                    )
                                    .insert({

                                        circle_id:
                                            circle.id,

                                        requester_id:
                                            currentUser.id,

                                        status:
                                            "pending"

                                    });


                            if (
                                result.error
                            ) {

                                showRecommendation(
                                    "Unable to send request: " +
                                    result.error.message
                                );


                                button.disabled =
                                    false;


                                button.textContent =
                                    "Request to Join";


                                return;
                            }


                            showRecommendation(
                                "Request sent to the creator of " +
                                circle.name +
                                "."
                            );


                            await loadDiscoverGroups();

                        }
                    );
                }


                card.appendChild(
                    title
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


    byId(
        "refresh-groups-btn"
    ).addEventListener(
        "click",
        loadDiscoverGroups
    );


    // ======================================================
    // OWNER REQUESTS
    // ======================================================

    async function loadOwnerJoinRequests() {

        const card =
            byId(
                "join-requests-card"
            );


        const container =
            byId(
                "join-requests-list"
            );


        if (
            !activeCircle ||
            activeCircle.created_by !==
            currentUser.id
        ) {

            card.hidden =
                true;


            return;
        }


        card.hidden =
            false;


        const result =
            await supabaseClient
                .from(
                    "circle_join_requests"
                )
                .select(
                    "id, circle_id, requester_id, status, created_at"
                )
                .eq(
                    "circle_id",
                    activeCircle.id
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

            container.innerHTML =
                '<p class="empty-text">Unable to load requests.</p>';


            return;
        }


        const requests =
            result.data ||
            [];


        const profileMap =
            await getProfileMap(
                requests.map(
                    function (request) {

                        return request.requester_id;
                    }
                )
            );


        container.innerHTML =
            "";


        if (
            requests.length ===
            0
        ) {

            container.innerHTML =
                '<p class="empty-text">No pending requests.</p>';


            return;
        }


        requests.forEach(
            function (request) {

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


                const name =
                    document.createElement(
                        "strong"
                    );


                name.textContent =
                    profileMap[
                        request.requester_id
                    ] ||
                    "CircleSync User";


                const time =
                    document.createElement(
                        "span"
                    );


                time.textContent =
                    new Date(
                        request.created_at
                    ).toLocaleString();


                info.appendChild(
                    name
                );


                info.appendChild(
                    time
                );


                const actions =
                    document.createElement(
                        "div"
                    );


                actions.className =
                    "request-actions";


                const acceptButton =
                    document.createElement(
                        "button"
                    );


                acceptButton.type =
                    "button";


                acceptButton.className =
                    "compact-btn";


                acceptButton.textContent =
                    "Accept";


                const declineButton =
                    document.createElement(
                        "button"
                    );


                declineButton.type =
                    "button";


                declineButton.className =
                    "compact-btn danger-outline";


                declineButton.textContent =
                    "Decline";


                acceptButton.addEventListener(
                    "click",
                    function () {

                        respondToRequest(
                            request.id,
                            true
                        );

                    }
                );


                declineButton.addEventListener(
                    "click",
                    function () {

                        respondToRequest(
                            request.id,
                            false
                        );

                    }
                );


                actions.appendChild(
                    acceptButton
                );


                actions.appendChild(
                    declineButton
                );


                row.appendChild(
                    info
                );


                row.appendChild(
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
        approve
    ) {

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

            showRecommendation(
                "Unable to respond to request: " +
                result.error.message
            );


            return;
        }


        showRecommendation(
            approve
                ? "Join request accepted."
                : "Join request declined."
        );


        await Promise.all([

            loadOwnerJoinRequests(),

            loadCircleMembers()

        ]);
    }


    // ======================================================
    // REQUEST NOTIFICATION POLLING
    // ======================================================

    async function pollOwnerRequests() {

        const ownedCircleIds =
            myCircles
                .filter(
                    function (circle) {

                        return (
                            circle.created_by ===
                            currentUser.id
                        );
                    }
                )
                .map(
                    function (circle) {

                        return circle.id;
                    }
                );


        if (
            ownedCircleIds.length ===
            0
        ) {

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
                    ownedCircleIds
                )
                .eq(
                    "status",
                    "pending"
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
                "Request polling error:",
                result.error
            );


            return;
        }


        const requests =
            result.data ||
            [];


        const newRequests =
            requests.filter(
                function (request) {

                    return (
                        !seenRequestIds.has(
                            request.id
                        )
                    );
                }
            );


        requests.forEach(
            function (request) {

                seenRequestIds.add(
                    request.id
                );

            }
        );


        if (
            requestPollInitialized &&
            newRequests.length >
            0
        ) {

            const circle =
                myCircles.find(
                    function (item) {

                        return (
                            item.id ===
                            newRequests[0]
                                .circle_id
                        );
                    }
                );


            await sendSystemNotification(

                "New CircleSync join request",

                newRequests.length +
                " new request" +
                (
                    newRequests.length ===
                    1
                        ? ""
                        : "s"
                )
                +
                (
                    circle
                        ? " for " +
                          circle.name
                        : ""
                )
                +
                ".",

                "circlesync-join-request"

            );


            showRecommendation(
                "You have " +
                newRequests.length +
                " new join request" +
                (
                    newRequests.length ===
                    1
                        ? ""
                        : "s"
                )
                +
                "."
            );
        }


        requestPollInitialized =
            true;


        if (
            activeCircle &&
            activeCircle.created_by ===
            currentUser.id
        ) {

            await loadOwnerJoinRequests();
        }
    }


    function startRequestPolling() {

        if (
            requestPollTimer
        ) {

            clearInterval(
                requestPollTimer
            );
        }


        pollOwnerRequests();


        requestPollTimer =
            setInterval(
                pollOwnerRequests,
                20000
            );
    }


    // ======================================================
    // CREATE CIRCLE
    // ======================================================

    byId(
        "create-circle-btn"
    ).addEventListener(
        "click",
        async function () {

            const nameInput =
                byId(
                    "new-circle-name"
                );


            const descriptionInput =
                byId(
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


            const button =
                byId(
                    "create-circle-btn"
                );


            button.disabled =
                true;


            button.textContent =
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


            localStorage.setItem(
                "circlesync-active-circle",
                result.data.id
            );


            showRecommendation(
                result.data.name +
                " was created."
            );


            await loadMyCircles();


            await loadDiscoverGroups();

        }
    );


    // ======================================================
    // SAVE CHECK-IN
    // ======================================================

    async function saveCheckIn(
        type,
        options
    ) {

        const data =
            options ||
            {};


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
        byId(
            "energy-input"
        );


    const energyValue =
        byId(
            "energy-value"
        );


    const energyScore =
        byId(
            "energy-score"
        );


    energyInput.addEventListener(
        "input",
        function () {

            energyValue.textContent =
                energyInput.value;
        }
    );


    byId(
        "save-energy"
    ).addEventListener(
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

                        shared_with_circle:
                            false

                    }
                );


            if (
                saved
            ) {

                energyScore.textContent =
                    String(
                        level *
                        10
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


        energyInput.value =
            String(
                result.data
                    .energy_level
            );


        energyValue.textContent =
            String(
                result.data
                    .energy_level
            );


        energyScore.textContent =
            String(
                result.data
                    .energy_level *
                10
            );
    }


    // ======================================================
    // QUICK CHECK INS
    // ======================================================

    const quickChecks = [

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


    quickChecks.forEach(
        function (configuration) {

            const buttonId =
                configuration[0];


            const type =
                configuration[1];


            const message =
                configuration[2];


            byId(
                buttonId
            ).addEventListener(
                "click",
                async function () {

                    const button =
                        byId(
                            buttonId
                        );


                    button.disabled =
                        true;


                    const saved =
                        await saveCheckIn(
                            type,
                            {

                                shared_with_circle:
                                    Boolean(
                                        activeCircle
                                    )

                            }
                        );


                    button.disabled =
                        false;


                    if (
                        saved
                    ) {

                        showRecommendation(
                            message
                        );


                        await Promise.all([

                            loadCircleFeed(),

                            updateRoutineEngine()

                        ]);
                    }

                }
            );

        }
    );


    // ======================================================
    // FOCUS
    // ======================================================

    const focusButton =
        byId(
            "focus-btn"
        );


    const focusStatus =
        byId(
            "focus-status"
        );


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


                focusStatus.textContent =
                    "Focus session active.";


                return;
            }


            const minutes =
                Math.max(

                    1,

                    Math.round(

                        (
                            Date.now() -
                            focusStartedAt
                                .getTime()
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

                    shared_with_circle:
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


            focusStatus.textContent =
                "Last focus session: " +
                minutes +
                " minutes.";


            await Promise.all([

                loadCircleFeed(),

                updateRoutineEngine()

            ]);

        }
    );


    // ======================================================
    // MESSAGES
    // ======================================================

    const messageInput =
        byId(
            "circle-message"
        );


    const feedMessage =
        byId(
            "feed-message"
        );


    byId(
        "send-message-btn"
    ).addEventListener(
        "click",
        async function () {

            if (
                !activeCircle
            ) {

                feedMessage.textContent =
                    "Choose a circle first.";


                return;
            }


            const text =
                messageInput
                    .value
                    .trim();


            if (
                !text
            ) {

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
                            activeCircle.id,

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


    function getCheckInLabel(
        type
    ) {

        const labels =
            {

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
            labels[
                type
            ]
            ||
            "✓ Completed a check-in"
        );
    }


    async function loadCircleFeed() {

        const feed =
            byId(
                "circle-feed"
            );


        if (
            !activeCircle
        ) {

            feed.innerHTML =
                '<p class="empty-text">Choose a circle to see its feed.</p>';


            return;
        }


        const results =
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
                        "id, user_id, check_in_type, notes, created_at"
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
            results[0].data ||
            [];


        const checks =
            results[1].data ||
            [];


        const profileMap =
            await getProfileMap([

                ...messages.map(
                    function (item) {

                        return item.user_id;
                    }
                ),

                ...checks.map(
                    function (item) {

                        return item.user_id;
                    }
                )

            ]);


        const items =
            [


                ...messages.map(
                    function (item) {

                        return {

                            kind:
                                "message",

                            userId:
                                item.user_id,

                            text:
                                item.message,

                            createdAt:
                                item.created_at

                        };

                    }
                ),


                ...checks.map(
                    function (item) {

                        return {

                            kind:
                                "checkin",

                            userId:
                                item.user_id,

                            type:
                                item.check_in_type,

                            createdAt:
                                item.created_at

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


                const who =
                    document.createElement(
                        "strong"
                    );


                who.textContent =
                    displayName(
                        item.userId,
                        profileMap
                    );


                const when =
                    document.createElement(
                        "span"
                    );


                when.textContent =
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


                meta.appendChild(
                    who
                );


                meta.appendChild(
                    when
                );


                const text =
                    document.createElement(
                        "p"
                    );


                if (
                    item.kind ===
                    "message"
                ) {

                    text.textContent =
                        "💬 " +
                        item.text;


                } else {

                    text.textContent =
                        getCheckInLabel(
                            item.type
                        );
                }


                row.appendChild(
                    meta
                );


                row.appendChild(
                    text
                );


                feed.appendChild(
                    row
                );

            }
        );
    }


    byId(
        "refresh-feed-btn"
    ).addEventListener(
        "click",
        loadCircleFeed
    );


    // ======================================================
    // ROUTINE
    // ======================================================

    const wakeTime =
        byId(
            "wake-time"
        );


    const breakfastTime =
        byId(
            "breakfast-time"
        );


    const lunchTime =
        byId(
            "lunch-time"
        );


    const dinnerTime =
        byId(
            "dinner-time"
        );


    const restTime =
        byId(
            "rest-time"
        );


    const bedtime =
        byId(
            "bedtime"
        );


    const sleepGoal =
        byId(
            "sleep-goal"
        );


    const routineMessage =
        byId(
            "routine-message"
        );


    function valueOrNull(
        input
    ) {

        return (
            input &&
            input.value
        )
            ? input.value
            : null;
    }


    function applyTime(
        input,
        value
    ) {

        if (
            input
        ) {

            input.value =
                value
                    ? value.substring(
                        0,
                        5
                    )
                    : "";
        }
    }


    byId(
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

                routineMessage.textContent =
                    result.error.message;


                routineMessage.className =
                    "status error-message";


                return;
            }


            currentRoutine =
                result.data;


            routineMessage.textContent =
                "Routine saved. Reminders updated.";


            routineMessage.className =
                "status success-message";


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
            result.error ||
            !result.data
        ) {

            return;
        }


        currentRoutine =
            result.data;


        applyTime(
            wakeTime,
            result.data.wake_time
        );


        applyTime(
            breakfastTime,
            result.data.breakfast_time
        );


        applyTime(
            lunchTime,
            result.data.lunch_time
        );


        applyTime(
            dinnerTime,
            result.data.dinner_time
        );


        applyTime(
            restTime,
            result.data.rest_start_time
        );


        applyTime(
            bedtime,
            result.data.bedtime
        );


        sleepGoal.value =
            result.data
                .sleep_goal_hours ||
            8;
    }


    async function getTodaysCompletedTypes() {

        const now =
            new Date();


        const start =
            new Date(

                now.getFullYear(),

                now.getMonth(),

                now.getDate()

            ).toISOString();


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
                    start
                );


        if (
            result.error
        ) {

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


    function timeToDate(
        value
    ) {

        if (
            !value
        ) {

            return null;
        }


        const pieces =
            value.split(
                ":"
            );


        const hours =
            Number(
                pieces[0]
            );


        const minutes =
            Number(
                pieces[1]
            );


        const now =
            new Date();


        return new Date(

            now.getFullYear(),

            now.getMonth(),

            now.getDate(),

            hours,

            minutes,

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
                    currentRoutine
                        .wake_time

            },

            {

                type:
                    "breakfast",

                name:
                    "Breakfast",

                icon:
                    "🍳",

                time:
                    currentRoutine
                        .breakfast_time

            },

            {

                type:
                    "lunch",

                name:
                    "Lunch",

                icon:
                    "🥗",

                time:
                    currentRoutine
                        .lunch_time

            },

            {

                type:
                    "rest",

                name:
                    "Rest",

                icon:
                    "😴",

                time:
                    currentRoutine
                        .rest_start_time

            },

            {

                type:
                    "dinner",

                name:
                    "Dinner",

                icon:
                    "🍽",

                time:
                    currentRoutine
                        .dinner_time

            },

            {

                type:
                    "sleep",

                name:
                    "Bedtime",

                icon:
                    "🌙",

                time:
                    currentRoutine
                        .bedtime

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

        const today =
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                );


        return (
            "circlesync-reminder-" +
            today +
            "-" +
            type
        );
    }


    async function updateRoutineEngine() {

        const label =
            byId(
                "next-up-label"
            );


        const title =
            byId(
                "next-up-title"
            );


        const countdown =
            byId(
                "next-up-countdown"
            );


        const alert =
            byId(
                "routine-alert"
            );


        if (
            !currentRoutine
        ) {

            label.textContent =
                "No routine saved yet.";


            title.textContent =
                "Set your daily routine below";


            countdown.textContent =
                "";


            alert.textContent =
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

                            ...item,

                            date:
                                timeToDate(
                                    item.time
                                )

                        };

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


        let overdue =
            null;


        let next =
            null;


        for (
            const item
            of items
        ) {

            const difference =
                item.date -
                now;


            if (
                difference <= 0 &&
                !completed.includes(
                    item.type
                )
            ) {

                overdue =
                    item;
            }


            if (
                difference > 0 &&
                !next
            ) {

                next =
                    item;
            }
        }


        if (
            overdue
        ) {

            const lateMinutes =
                Math.floor(
                    (
                        now -
                        overdue.date
                    )
                    /
                    60000
                );


            label.textContent =
                "Needs Attention";


            title.textContent =
                overdue.icon +
                " " +
                overdue.name;


            countdown.textContent =
                lateMinutes <=
                1
                    ? "Scheduled now"
                    : lateMinutes +
                      " minutes overdue";


            alert.textContent =
                "Scheduled for " +
                formatClock(
                    overdue.date
                )
                +
                ".";


            const reminderKey =
                reminderStorageKey(
                    overdue.type
                );


            if (
                !localStorage.getItem(
                    reminderKey
                )
            ) {

                await sendSystemNotification(

                    overdue.icon +
                    " " +
                    overdue.name,

                    "Scheduled for " +
                    formatClock(
                        overdue.date
                    )
                    +
                    ".",

                    "routine-" +
                    overdue.type

                );


                localStorage.setItem(
                    reminderKey,
                    "yes"
                );
            }


            return;
        }


        if (
            next
        ) {

            const minutes =
                Math.ceil(
                    (
                        next.date -
                        now
                    )
                    /
                    60000
                );


            label.textContent =
                "Next Up";


            title.textContent =
                next.icon +
                " " +
                next.name;


            if (
                minutes <
                60
            ) {

                countdown.textContent =
                    "In " +
                    minutes +
                    " minutes";


            } else {

                countdown.textContent =
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


            alert.textContent =
                "Scheduled for " +
                formatClock(
                    next.date
                )
                +
                ".";


            return;
        }


        label.textContent =
            "Routine Complete";


        title.textContent =
            "✓ You're done for today";


        countdown.textContent =
            "Nice work";


        alert.textContent =
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

    await Promise.all([

        loadLatestEnergy(),

        loadRoutine()

    ]);


    await loadMyCircles();


    await loadDiscoverGroups();


    startRoutineEngine();


    startRequestPolling();


    showRecommendation(
        "CircleSync is monitoring today's routine."
    );


    console.log(
        "CircleSync dashboard v70 ready"
    );
}
