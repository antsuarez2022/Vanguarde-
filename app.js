"use strict";

console.log("CircleSync app.js v60 loaded");


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


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        if (document.body.id === "auth-page") {

            await initAuthPage();

            return;
        }


        if (document.body.id === "dashboard-page") {

            await initDashboardPage();
        }

    }
);


// ==========================================================
// AUTH PAGE
// ==========================================================

async function initAuthPage() {

    const form =
        document.getElementById("auth-form");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const loginButton =
        document.getElementById("login-btn");

    const signupButton =
        document.getElementById("signup-btn");

    const message =
        document.getElementById("auth-message");


    function setMessage(text, isError) {

        if (!message) {
            return;
        }

        message.textContent = text;

        message.style.color =
            isError
                ? "#ff8a9a"
                : "#9cff7a";
    }


    function setBusy(busy) {

        loginButton.disabled = busy;

        signupButton.disabled = busy;
    }


    const sessionResult =
        await supabaseClient.auth.getSession();


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


            if (!email || !password) {

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

                            email: email,

                            password: password
                        });


                if (result.error) {

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
                    "Sign in error:",
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

                const redirectUrl =
                    new URL(
                        "dashboard.html",
                        window.location.href
                    ).href;


                const result =
                    await supabaseClient.auth
                        .signUp({

                            email: email,

                            password: password,

                            options: {

                                emailRedirectTo:
                                    redirectUrl
                            }

                        });


                if (result.error) {

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
                    "Account created. Check your email to confirm it, then sign in.",
                    false
                );


            } catch (error) {

                console.error(
                    "Sign up error:",
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

    let currentUser = null;

    let currentCircle = null;

    let focusActive = false;

    let focusStartedAt = null;


    const sessionResult =
        await supabaseClient.auth.getSession();


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
            currentUser.email;
    }


    function showRecommendation(text) {

        if (recommendation) {

            recommendation.textContent =
                text;
        }
    }


    // ======================================================
    // LOG OUT
    // ======================================================

    document
        .getElementById("logout-btn")
        .addEventListener(
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
    // PROFILES
    // ======================================================

    async function getProfileMap(
        userIds
    ) {

        const profileMap = {};


        if (
            !userIds ||
            userIds.length === 0
        ) {

            return profileMap;
        }


        const uniqueIds =
            Array.from(
                new Set(userIds)
            );


        const result =
            await supabaseClient
                .from("profiles")
                .select(
                    "id, display_name"
                )
                .in(
                    "id",
                    uniqueIds
                );


        if (result.error) {

            console.error(
                "Profile load error:",
                result.error
            );

            return profileMap;
        }


        (result.data || [])
            .forEach(
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
            profileMap[userId] ||
            "Circle Member"
        );
    }


    // ======================================================
    // MEMBERSHIPS
    // ======================================================

    async function getMyCircleIds() {

        const result =
            await supabaseClient
                .from("circle_members")
                .select("circle_id")
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (result.error) {

            console.error(
                "Membership error:",
                result.error
            );

            return [];
        }


        return (
            result.data || []
        ).map(
            function (membership) {

                return membership.circle_id;
            }
        );
    }


    // ======================================================
    // VISIBLE CIRCLES
    // ======================================================

    async function getVisibleCircles() {

        const result =
            await supabaseClient
                .from("circles")
                .select(
                    "id, name, description, created_by, is_public, created_at"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (result.error) {

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

        const myCircleIds =
            await getMyCircleIds();


        const circles =
            await getVisibleCircles();


        const myCircles =
            circles.filter(
                function (circle) {

                    return (
                        circle.created_by ===
                            currentUser.id ||
                        myCircleIds.includes(
                            circle.id
                        )
                    );
                }
            );


        if (
            myCircles.length === 0
        ) {

            currentCircle = null;


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
            myCircles[0];


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
                .from("circle_members")
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
                        ascending: true
                    }
                );


        if (result.error) {

            console.error(
                "Member error:",
                result.error
            );

            list.innerHTML =
                "<li>Unable to load members.</li>";

            return;
        }


        const members =
            result.data || [];


        const userIds =
            members.map(
                function (member) {

                    return member.user_id;
                }
            );


        const profiles =
            await getProfileMap(
                userIds
            );


        list.innerHTML = "";


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
                        profiles
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


        container.innerHTML =
            "<p>Loading groups...</p>";


        const membershipIds =
            await getMyCircleIds();


        const result =
            await supabaseClient
                .from("circles")
                .select(
                    "id, name, description, created_by, is_public, created_at"
                )
                .eq(
                    "is_public",
                    true
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (result.error) {

            container.textContent =
                "Unable to load groups.";

            console.error(
                result.error
            );

            return;
        }


        const groups =
            result.data || [];


        container.innerHTML = "";


        if (
            groups.length === 0
        ) {

            container.innerHTML =
                "<p>No public groups have been created yet.</p>";

            return;
        }


        groups.forEach(
            function (circle) {

                const card =
                    document.createElement(
                        "div"
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


                const owner =
                    circle.created_by ===
                    currentUser.id;


                const joined =
                    membershipIds.includes(
                        circle.id
                    );


                if (owner) {

                    button.textContent =
                        "Your Group ✓";

                    button.disabled =
                        true;


                } else if (joined) {

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
                                    result.error
                                );


                                button.disabled =
                                    false;


                                button.textContent =
                                    "Join Group";


                                showRecommendation(
                                    "Could not join group: " +
                                    result.error.message
                                );


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


    document
        .getElementById(
            "refresh-groups-btn"
        )
        .addEventListener(
            "click",
            loadDiscoverGroups
        );


    // ======================================================
    // CREATE GROUP
    // ======================================================

    document
        .getElementById(
            "create-circle-btn"
        )
        .addEventListener(
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


                const description =
                    descriptionInput.value.trim();


                if (!name) {

                    showRecommendation(
                        "Enter a circle name."
                    );

                    return;
                }


                const result =
                    await supabaseClient
                        .from("circles")
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


                if (result.error) {

                    console.error(
                        result.error
                    );


                    showRecommendation(
                        "Unable to create circle: " +
                        result.error.message
                    );


                    return;
                }


                nameInput.value = "";

                descriptionInput.value = "";


                currentCircle =
                    result.data;


                showRecommendation(
                    "Your accountability circle was created."
                );


                await loadMyCircle();

                await loadDiscoverGroups();

            }
        );


    // ======================================================
    // CHECK-INS
    // ======================================================

    async function saveCheckIn(
        type,
        options
    ) {

        const data =
            options || {};


        const result =
            await supabaseClient
                .from("check_ins")
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
                        data.notes || null,

                    shared_with_circle:
                        data.shared_with_circle ===
                        true

                });


        if (result.error) {

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


    sendMessageButton.addEventListener(
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


            if (result.error) {

                console.error(
                    "Message error:",
                    result.error
                );


                feedMessage.textContent =
                    result.error.message;


                return;
            }


            messageInput.value = "";


            feedMessage.textContent =
                "Message sent.";


            await loadCircleFeed();

        }
    );


    // ======================================================
    // CIRCLE FEED
    // ======================================================

    async function loadCircleFeed() {

        const feed =
            document.getElementById(
                "circle-feed"
            );


        if (!currentCircle) {

            feed.innerHTML =
                "<p>Join or create a circle to see group activity.</p>";

            return;
        }


        feed.innerHTML =
            "<p>Loading circle activity...</p>";


        const messagesResult =
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
                        ascending: false
                    }
                )
                .limit(50);


        const checkInsResult =
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
                        ascending: false
                    }
                )
                .limit(50);


        if (messagesResult.error) {

            console.error(
                "Message feed error:",
                messagesResult.error
            );
        }


        if (checkInsResult.error) {

            console.error(
                "Check-in feed error:",
                checkInsResult.error
            );
        }


        const messages =
            messagesResult.data || [];


        const checkIns =
            checkInsResult.data || [];


        const allUserIds =
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
                allUserIds
            );


        const feedItems = [];


        messages.forEach(
            function (message) {

                feedItems.push({

                    kind:
                        "message",

                    user_id:
                        message.user_id,

                    text:
                        message.message,

                    created_at:
                        message.created_at

                });
            }
        );


        checkIns.forEach(
            function (checkIn) {

                feedItems.push({

                    kind:
                        "checkin",

                    user_id:
                        checkIn.user_id,

                    check_in_type:
                        checkIn.check_in_type,

                    text:
                        checkIn.notes,

                    created_at:
                        checkIn.created_at

                });
            }
        );


        feedItems.sort(
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


        feed.innerHTML = "";


        if (
            feedItems.length === 0
        ) {

            feed.innerHTML =
                "<p>No circle activity yet. Send the first message or make a check-in.</p>";

            return;
        }


        feedItems.forEach(
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
                        item.user_id,
                        profileMap
                    );


                const time =
                    document.createElement(
                        "span"
                    );


                time.textContent =
                    formatFeedTime(
                        item.created_at
                    );


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
                            item.check_in_type
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
                "💻 Checked in as working",

            sleep:
                "🌙 Went to sleep",

            wake:
                "☀️ Woke up",

            snack:
                "🍎 Had a snack"

        };


        return (
            labels[type] ||
            "✓ Completed a check-in"
        );
    }


    function formatFeedTime(
        value
    ) {

        const date =
            new Date(value);


        return date.toLocaleString(
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
    }


    document
        .getElementById(
            "refresh-feed-btn"
        )
        .addEventListener(
            "click",
            loadCircleFeed
        );


    // ======================================================
    // ENERGY - PRIVATE
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


    document
        .getElementById(
            "save-energy"
        )
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


                if (saved) {

                    energyScore.textContent =
                        String(
                            level * 10
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
                        ascending: false
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
    // SHARED QUICK CHECK INS
    // ======================================================

    const checkIns = [

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


    checkIns.forEach(
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

                focusActive = true;

                focusStartedAt =
                    new Date();


                focusButton.textContent =
                    "End Focus Session";


                focusStatus.textContent =
                    "Focus session active.";


                return;
            }


            const end =
                new Date();


            const minutes =
                Math.max(
                    1,
                    Math.round(
                        (
                            end.getTime() -
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


            focusActive = false;

            focusStartedAt = null;


            focusButton.textContent =
                "Start Focus Session";


            focusStatus.textContent =
                "Last focus session: " +
                minutes +
                " minutes.";


            showRecommendation(
                "Focus session completed."
            );


            await loadCircleFeed();

        }
    );


    // ======================================================
    // ROUTINE
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


    function getTime(element) {

        return (
            element &&
            element.value
        )
            ? element.value
            : null;
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


    document
        .getElementById(
            "save-routine-btn"
        )
        .addEventListener(
            "click",
            async function () {

                const goal =
                    Number(
                        sleepGoal.value
                    );


                const result =
                    await supabaseClient
                        .from("routines")
                        .upsert(
                            {

                                user_id:
                                    currentUser.id,

                                wake_time:
                                    getTime(
                                        wakeTime
                                    ),

                                breakfast_time:
                                    getTime(
                                        breakfastTime
                                    ),

                                lunch_time:
                                    getTime(
                                        lunchTime
                                    ),

                                dinner_time:
                                    getTime(
                                        dinnerTime
                                    ),

                                rest_start_time:
                                    getTime(
                                        restTime
                                    ),

                                bedtime:
                                    getTime(
                                        bedtime
                                    ),

                                sleep_goal_hours:
                                    goal

                            },
                            {

                                onConflict:
                                    "user_id"

                            }
                        );


                if (result.error) {

                    routineMessage.textContent =
                        result.error.message;


                    routineMessage.style.color =
                        "#ff8a9a";


                    return;
                }


                routineMessage.textContent =
                    "Routine saved successfully.";


                routineMessage.style.color =
                    "#9cff7a";
            }
        );


    async function loadRoutine() {

        const result =
            await supabaseClient
                .from("routines")
                .select(
                    "wake_time, breakfast_time, lunch_time, dinner_time, rest_start_time, bedtime, sleep_goal_hours"
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .maybeSingle();


        if (!result.data) {

            return;
        }


        setTime(
            wakeTime,
            result.data.wake_time
        );


        setTime(
            breakfastTime,
            result.data.breakfast_time
        );


        setTime(
            lunchTime,
            result.data.lunch_time
        );


        setTime(
            dinnerTime,
            result.data.dinner_time
        );


        setTime(
            restTime,
            result.data.rest_start_time
        );


        setTime(
            bedtime,
            result.data.bedtime
        );


        if (
            result.data.sleep_goal_hours
        ) {

            sleepGoal.value =
                result.data.sleep_goal_hours;
        }
    }


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    await loadLatestEnergy();

    await loadRoutine();

    await loadMyCircle();

    await loadDiscoverGroups();


    showRecommendation(
        "Welcome back. Your circle can now see shared check-ins and messages."
    );


    console.log(
        "CircleSync dashboard v60 ready"
    );
}
