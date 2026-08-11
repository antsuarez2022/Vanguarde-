"use strict";

console.log("CircleSync app.js v72 loaded");


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


document.addEventListener(
    "DOMContentLoaded",
    async function () {

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

    const get =
        function (id) {

            return document.getElementById(
                id
            );
        };


    const signinSection =
        get("signin-section");

    const signupSection =
        get("signup-section");

    const showSigninButton =
        get("show-signin-btn");

    const showSignupButton =
        get("show-signup-btn");

    const signinForm =
        get("signin-form");

    const signupForm =
        get("signup-form");

    const signinEmail =
        get("signin-email");

    const signinPassword =
        get("signin-password");

    const signupEmail =
        get("signup-email");

    const signupPassword =
        get("signup-password");

    const signupConfirmPassword =
        get("signup-confirm-password");

    const loginButton =
        get("login-btn");

    const signupButton =
        get("signup-btn");

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
    }


    showSigninButton.addEventListener(
        "click",
        showSignin
    );


    showSignupButton.addEventListener(
        "click",
        showSignup
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


            const result =
                await supabaseClient.auth
                    .signInWithPassword({

                        email:
                            email,

                        password:
                            password

                    });


            loginButton.disabled =
                false;


            loginButton.textContent =
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
                signupEmail.value.trim();


            const password =
                signupPassword.value;


            const confirmation =
                signupConfirmPassword.value;


            if (!email) {

                showMessage(
                    "Enter your email.",
                    true
                );


                return;
            }


            if (
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
                confirmation
            ) {

                showMessage(
                    "Passwords do not match.",
                    true
                );


                return;
            }


            signupButton.disabled =
                true;


            signupButton.textContent =
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


            signupButton.disabled =
                false;


            signupButton.textContent =
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
                "Account created. Check your email and confirm your account, then sign in with your new password.",
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

        return document.getElementById(
            id
        );
    }


    let currentUser =
        null;


    let activeCircle =
        null;


    let myCircles =
        [];


    let currentRoutine =
        null;


    let focusStartedAt =
        null;


    let focusActive =
        false;


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


    get("user-email").textContent =
        currentUser.email ||
        "Signed in";


    function showRecommendation(
        text
    ) {

        const element =
            get(
                "recommendation"
            );


        if (element) {

            element.textContent =
                text;
        }
    }


    // ======================================================
    // LOG OUT
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
    // PROFILES
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
            ids.length === 0
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


        if (
            result.error
        ) {

            console.error(
                "Profile error:",
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


    function getDisplayName(
        userId,
        map
    ) {

        if (
            userId ===
            currentUser.id
        ) {

            return "You";
        }


        return (
            map[userId] ||
            "CircleSync User"
        );
    }


    // ======================================================
    // MEMBERSHIPS
    // ======================================================

    async function loadMyMemberships() {

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
                "Membership error:",
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
    // VISIBLE CIRCLES
    // ======================================================

    async function loadVisibleCircles() {

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
                "Circle error:",
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
    // LOAD MY CIRCLES
    // ======================================================

    async function loadMyCircles() {

        const results =
            await Promise.all([

                loadMyMemberships(),

                loadVisibleCircles()

            ]);


        const memberships =
            results[0];


        const circles =
            results[1];


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


        const savedId =
            localStorage.getItem(
                "circlesync-active-circle"
            );


        activeCircle =
            myCircles.find(
                function (circle) {

                    return (
                        circle.id ===
                        savedId
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


        renderCircleSwitcher();


        await renderActiveCircle();
    }


    // ======================================================
    // CIRCLE SWITCHER
    // ======================================================

    function renderCircleSwitcher() {

        const container =
            get(
                "my-circles-scroll"
            );


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
                    circle.id ===
                    activeCircle.id
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


    // ======================================================
    // ACTIVE CIRCLE
    // ======================================================

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


            get("join-requests-card")
                .hidden =
                true;


            get("circle-list")
                .innerHTML =
                "<li>No members loaded.</li>";


            get("circle-feed")
                .innerHTML =
                '<p class="empty-text">Choose a circle to see activity.</p>';


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

            loadCircleFeed(),

            loadOwnerRequests()

        ]);
    }


    // ======================================================
    // MEMBERS
    // ======================================================

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


        const list =
            get(
                "circle-list"
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


                const circleId =
                    activeCircle.id;


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
                            circleId
                        )
                        .eq(
                            "user_id",
                            currentUser.id
                        );


                if (
                    result.error
                ) {

                    showRecommendation(
                        result.error.message
                    );


                    return;
                }


                localStorage.removeItem(
                    "circlesync-active-circle"
                );


                showRecommendation(
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


    // ======================================================
    // DISCOVER GROUPS
    // ======================================================

    async function loadDiscoverGroups() {

        const container =
            get(
                "discover-groups"
            );


        container.innerHTML =
            '<p class="empty-text">Loading groups...</p>';


        const results =
            await Promise.all([

                loadVisibleCircles(),

                loadMyMemberships(),

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


        const requestsResult =
            results[2];


        if (
            requestsResult.error
        ) {

            console.error(
                "Request status error:",
                requestsResult.error
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


        const requestMap =
            new Map();


        (
            requestsResult.data ||
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


                                localStorage.setItem(
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

                                await requestToJoin(
                                    circle,
                                    button
                                );

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


    // ======================================================
    // REQUEST TO JOIN
    // ======================================================
    // THIS IS THE MAIN 403 FIX.
    //
    // We call the Supabase RPC instead of doing a direct
    // insert into circle_join_requests.
    // ======================================================

    async function requestToJoin(
        circle,
        button
    ) {

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


        button.textContent =
            "Request Pending";


        showRecommendation(
            "Your request to join " +
            circle.name +
            " was sent to its creator."
        );


        await loadDiscoverGroups();
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

        const card =
            get(
                "join-requests-card"
            );


        const container =
            get(
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
                    "id, requester_id, circle_id, status, created_at"
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

            console.error(
                "Owner request load error:",
                result.error
            );


            container.innerHTML =
                '<p class="empty-text">Unable to load requests.</p>';


            return;
        }


        const requests =
            result.data ||
            [];


        container.innerHTML =
            "";


        if (
            requests.length === 0
        ) {

            container.innerHTML =
                '<p class="empty-text">No pending requests.</p>';


            return;
        }


        const profileMap =
            await getProfileMap(
                requests.map(
                    function (request) {

                        return request.requester_id;
                    }
                )
            );


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


                const requesterName =
                    document.createElement(
                        "strong"
                    );


                requesterName.textContent =
                    profileMap[
                        request.requester_id
                    ]
                    ||
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
                    requesterName
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


                actions.appendChild(
                    accept
                );


                actions.appendChild(
                    decline
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


    // ======================================================
    // ACCEPT / DECLINE
    // ======================================================

    async function respondToRequest(
        requestId,
        approve,
        rowElement
    ) {

        if (
            rowElement
        ) {

            const buttons =
                rowElement.querySelectorAll(
                    "button"
                );


            buttons.forEach(
                function (button) {

                    button.disabled =
                        true;

                }
            );
        }


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
                "Respond request RPC error:",
                result.error
            );


            showRecommendation(
                "Unable to respond: " +
                result.error.message
            );


            if (
                rowElement
            ) {

                rowElement
                    .querySelectorAll(
                        "button"
                    )
                    .forEach(
                        function (button) {

                            button.disabled =
                                false;

                        }
                    );
            }


            return;
        }


        // Immediately remove it visually.
        // Supabase Realtime also triggers reload below.

        if (
            rowElement
        ) {

            rowElement.remove();
        }


        showRecommendation(
            approve
                ? "Request accepted. The user is now a member."
                : "Request declined."
        );


        await Promise.all([

            loadOwnerRequests(),

            loadCircleMembers(),

            loadMyCircles()

        ]);
    }


    // ======================================================
    // CREATE CIRCLE
    // ======================================================

    get("create-circle-btn")
        .addEventListener(
            "click",
            async function () {

                const nameInput =
                    get(
                        "new-circle-name"
                    );


                const descriptionInput =
                    get(
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


                await Promise.all([

                    loadMyCircles(),

                    loadDiscoverGroups()

                ]);

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
                        data.energy_level ??
                        null,

                    stress_level:
                        data.stress_level ??
                        null,

                    sleep_hours:
                        data.sleep_hours ??
                        null,

                    notes:
                        data.notes ??
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
        get(
            "energy-input"
        );


    const energyValue =
        get(
            "energy-value"
        );


    const energyScore =
        get(
            "energy-score"
        );


    energyInput.addEventListener(
        "input",
        function () {

            energyValue.textContent =
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
            result.error ||
            !result.data
        ) {

            return;
        }


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


    // ======================================================
    // QUICK CHECK-INS
    // ======================================================

    const checks = [

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
            "Sleep recorded."
        ],

        [
            "wake-btn",
            "wake",
            "Wake-up recorded."
        ]

    ];


    checks.forEach(
        function (item) {

            get(item[0])
                .addEventListener(
                    "click",
                    async function () {

                        const saved =
                            await saveCheckIn(
                                item[1],
                                {

                                    shared_with_circle:
                                        Boolean(
                                            activeCircle
                                        )

                                }
                            );


                        if (
                            saved
                        ) {

                            showRecommendation(
                                item[2]
                            );


                            await updateRoutineEngine();
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

                const button =
                    get(
                        "focus-btn"
                    );


                const status =
                    get(
                        "focus-status"
                    );


                if (
                    !focusActive
                ) {

                    focusActive =
                        true;


                    focusStartedAt =
                        new Date();


                    button.textContent =
                        "End Focus Session";


                    status.textContent =
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


                button.textContent =
                    "Start Focus Session";


                status.textContent =
                    "Last focus session: " +
                    minutes +
                    " minutes.";

            }
        );


    // ======================================================
    // MESSAGE
    // ======================================================

    get("send-message-btn")
        .addEventListener(
            "click",
            async function () {

                const input =
                    get(
                        "circle-message"
                    );


                const status =
                    get(
                        "feed-message"
                    );


                if (
                    !activeCircle
                ) {

                    status.textContent =
                        "Choose a circle first.";


                    return;
                }


                const text =
                    input.value.trim();


                if (!text) {

                    status.textContent =
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

                    status.textContent =
                        result.error.message;


                    return;
                }


                input.value =
                    "";


                status.textContent =
                    "Message sent.";

            }
        );


    // ======================================================
    // FEED
    // ======================================================

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


    async function loadCircleFeed() {

        const feed =
            get(
                "circle-feed"
            );


        if (
            !activeCircle
        ) {

            feed.innerHTML =
                '<p class="empty-text">Choose a circle to view activity.</p>';


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


        const messages =
            results[0].data ||
            [];


        const checkIns =
            results[1].data ||
            [];


        const profileMap =
            await getProfileMap([

                ...messages.map(
                    function (message) {

                        return message.user_id;
                    }
                ),

                ...checkIns.map(
                    function (check) {

                        return check.user_id;
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
                function (check) {

                    return {

                        userId:
                            check.user_id,

                        text:
                            checkInLabel(
                                check.check_in_type
                            ),

                        createdAt:
                            check.created_at

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


                meta.appendChild(
                    name
                );


                meta.appendChild(
                    time
                );


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


    get("refresh-feed-btn")
        .addEventListener(
            "click",
            loadCircleFeed
        );


    // ======================================================
    // ROUTINE
    // ======================================================

    const routineInputs = {

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

        bedtime:
            get("bedtime"),

        sleepGoal:
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


        if (
            result.error ||
            !result.data
        ) {

            return;
        }


        currentRoutine =
            result.data;


        function setTime(
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


        setTime(
            routineInputs.wake,
            currentRoutine.wake_time
        );


        setTime(
            routineInputs.breakfast,
            currentRoutine.breakfast_time
        );


        setTime(
            routineInputs.lunch,
            currentRoutine.lunch_time
        );


        setTime(
            routineInputs.dinner,
            currentRoutine.dinner_time
        );


        setTime(
            routineInputs.rest,
            currentRoutine.rest_start_time
        );


        setTime(
            routineInputs.bedtime,
            currentRoutine.bedtime
        );


        routineInputs.sleepGoal.value =
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
                                    routineInputs.wake.value ||
                                    null,

                                breakfast_time:
                                    routineInputs.breakfast.value ||
                                    null,

                                lunch_time:
                                    routineInputs.lunch.value ||
                                    null,

                                dinner_time:
                                    routineInputs.dinner.value ||
                                    null,

                                rest_start_time:
                                    routineInputs.rest.value ||
                                    null,

                                bedtime:
                                    routineInputs.bedtime.value ||
                                    null,

                                sleep_goal_hours:
                                    Number(
                                        routineInputs
                                            .sleepGoal
                                            .value
                                    )

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

                    get("routine-message")
                        .textContent =
                        result.error.message;


                    return;
                }


                currentRoutine =
                    result.data;


                get("routine-message")
                    .textContent =
                    "Routine saved.";


                await updateRoutineEngine();

            }
        );


    async function getCompletedToday() {

        const now =
            new Date();


        const start =
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
                    start.toISOString()
                );


        return Array.from(
            new Set(
                (
                    result.data ||
                    []
                ).map(
                    function (row) {

                        return row.check_in_type;
                    }
                )
            )
        );
    }


    function routineDate(
        time
    ) {

        if (!time) {

            return null;
        }


        const parts =
            time.split(
                ":"
            );


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


    async function updateRoutineEngine() {

        if (
            !currentRoutine
        ) {

            get("next-up-label")
                .textContent =
                "No routine saved";


            get("next-up-title")
                .textContent =
                "Set your routine below";


            get("next-up-countdown")
                .textContent =
                "";


            return;
        }


        const completed =
            await getCompletedToday();


        const routineItems = [

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

                    date:
                        routineDate(
                            item[2]
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


        const now =
            new Date();


        let overdue =
            null;


        let next =
            null;


        routineItems.forEach(
            function (item) {

                if (
                    item.date <=
                    now

                    &&

                    !completed.includes(
                        item.type
                    )
                ) {

                    overdue =
                        item;
                }


                if (
                    !next &&
                    item.date >
                    now
                ) {

                    next =
                        item;
                }

            }
        );


        if (
            overdue
        ) {

            const minutes =
                Math.floor(
                    (
                        now -
                        overdue.date
                    )
                    /
                    60000
                );


            get("next-up-label")
                .textContent =
                "Needs Attention";


            get("next-up-title")
                .textContent =
                overdue.title;


            get("next-up-countdown")
                .textContent =
                minutes <= 1
                    ? "Scheduled now"
                    : minutes +
                      " minutes overdue";


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


            get("next-up-label")
                .textContent =
                "Next Up";


            get("next-up-title")
                .textContent =
                next.title;


            get("next-up-countdown")
                .textContent =
                minutes < 60
                    ? "In " +
                      minutes +
                      " minutes"
                    : "In " +
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


    function startRoutineTimer() {

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
    // SUPABASE REALTIME
    // ======================================================
    //
    // No 20-second polling.
    //
    // RLS decides which request rows each user can receive.
    // The creator can read requests for their circle.
    // Requesters can read their own requests.
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
                    "circlesync-v72-" +
                    currentUser.id
                )


                // JOIN REQUESTS

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
                            "Realtime join request:",
                            payload
                        );


                        // Creator request list immediately updates.
                        await loadOwnerRequests();


                        // Requester's Discover button updates:
                        // Pending -> Joined or Request Again.
                        await loadDiscoverGroups();


                        // If they were approved, membership may
                        // now exist.
                        await loadMyCircles();
                    }
                )


                // MEMBERSHIPS

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


                        await loadCircleMembers();
                    }
                )


                // MESSAGES

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

                        if (
                            !activeCircle
                        ) {

                            return;
                        }


                        const row =
                            payload.new &&
                            payload.new.circle_id
                                ? payload.new
                                : payload.old;


                        if (
                            row &&
                            row.circle_id ===
                            activeCircle.id
                        ) {

                            await loadCircleFeed();
                        }
                    }
                )


                // CHECK INS

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

                        if (
                            !activeCircle
                        ) {

                            return;
                        }


                        const row =
                            payload.new &&
                            payload.new.circle_id
                                ? payload.new
                                : payload.old;


                        if (
                            row &&
                            row.circle_id ===
                            activeCircle.id
                        ) {

                            await loadCircleFeed();
                        }
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


    await loadDiscoverGroups();


    startRealtime();


    startRoutineTimer();


    showRecommendation(
        "CircleSync is connected to Supabase."
    );


    console.log(
        "CircleSync dashboard v72 ready"
    );
}
