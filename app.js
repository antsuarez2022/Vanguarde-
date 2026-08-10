"use strict";

console.log("CircleSync app.js v51 loaded");

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

        if (!message) {
            return;
        }


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

        if (loginButton) {
            loginButton.disabled =
                busy;
        }


        if (signupButton) {
            signupButton.disabled =
                busy;
        }
    }


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
            "dashboard.html"
        );

        return;
    }


    if (
        !form ||
        !emailInput ||
        !passwordInput ||
        !loginButton ||
        !signupButton
    ) {

        console.error(
            "Auth page is missing one or more required elements."
        );

        return;
    }


    // ======================================================
    // SIGN IN
    // ======================================================

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


    // ======================================================
    // SIGN UP
    // ======================================================

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

                            email:
                                email,

                            password:
                                password,

                            options: {

                                emailRedirectTo:
                                    redirectUrl
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

    let currentCircle =
        null;

    let currentUser =
        null;

    let focusActive =
        false;

    let focusStartedAt =
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


    const logoutButton =
        document.getElementById(
            "logout-btn"
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
                        "Could not log out: " +
                        result.error.message
                    );

                    return;
                }


                window.location.replace(
                    "index.html"
                );

            }
        );
    }


    // ======================================================
    // GET USER MEMBERSHIPS
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
    // GET VISIBLE CIRCLES
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
    // LOAD ACTIVE USER CIRCLE
    // ======================================================

    async function loadMyCircle() {

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


        const myCircleIds =
            await getMyCircleIds();


        const visibleCircles =
            await getVisibleCircles();


        const myCircles =
            visibleCircles.filter(
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

    }


    // ======================================================
    // LOAD CIRCLE MEMBERS
    // ======================================================

    async function loadCircleMembers() {

        const circleList =
            document.getElementById(
                "circle-list"
            );


        if (!circleList) {
            return;
        }


        if (
            !currentCircle
        ) {

            circleList.innerHTML =
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
                "Member load error:",
                result.error
            );


            circleList.innerHTML =
                "<li>Unable to load members.</li>";


            return;
        }


        const members =
            result.data || [];


        circleList.innerHTML =
            "";


        if (
            members.length === 0
        ) {

            if (
                currentCircle.created_by ===
                currentUser.id
            ) {

                const item =
                    document.createElement(
                        "li"
                    );


                item.textContent =
                    "You — owner";


                circleList.appendChild(
                    item
                );


            } else {

                circleList.innerHTML =
                    "<li>No members yet.</li>";

            }


            return;

        }


        members.forEach(
            function (member) {

                const item =
                    document.createElement(
                        "li"
                    );


                const label =
                    member.user_id ===
                    currentUser.id
                        ? "You"
                        : "Circle Member";


                item.textContent =
                    label +
                    " — " +
                    member.role;


                circleList.appendChild(
                    item
                );

            }
        );

    }


    // ======================================================
    // DISCOVER PUBLIC GROUPS
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


        const result =
            await supabaseClient
                .from(
                    "circles"
                )
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

                        ascending:
                            false
                    }
                );


        if (
            result.error
        ) {

            console.error(
                "Group discovery error:",
                result.error
            );


            container.innerHTML =
                "<p>Unable to load groups: " +
                result.error.message +
                "</p>";


            return;

        }


        const groups =
            result.data || [];


        console.log(
            "Public groups returned from Supabase:",
            groups
        );


        container.innerHTML =
            "";


        if (
            groups.length === 0
        ) {

            container.innerHTML =
                "<p>No public groups have been created yet.</p>";

            return;
        }


        groups.forEach(
            function (circle) {

                const groupCard =
                    document.createElement(
                        "div"
                    );


                groupCard.className =
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


                const statusButton =
                    document.createElement(
                        "button"
                    );


                statusButton.type =
                    "button";


                const isOwner =
                    circle.created_by ===
                    currentUser.id;


                const alreadyJoined =
                    myCircleIds.includes(
                        circle.id
                    );


                if (
                    isOwner
                ) {

                    statusButton.textContent =
                        "Your Group ✓";


                    statusButton.disabled =
                        true;


                } else if (
                    alreadyJoined
                ) {

                    statusButton.textContent =
                        "Joined ✓";


                    statusButton.disabled =
                        true;


                } else {

                    statusButton.textContent =
                        "Join Group";


                    statusButton.className =
                        "join-group-btn";


                    statusButton.addEventListener(
                        "click",
                        async function () {

                            statusButton.disabled =
                                true;


                            statusButton.textContent =
                                "Joining...";


                            const joined =
                                await joinCircle(
                                    circle
                                );


                            if (!joined) {

                                statusButton.disabled =
                                    false;


                                statusButton.textContent =
                                    "Join Group";
                            }

                        }
                    );

                }


                groupCard.appendChild(
                    title
                );


                groupCard.appendChild(
                    description
                );


                groupCard.appendChild(
                    statusButton
                );


                container.appendChild(
                    groupCard
                );

            }
        );

    }


    // ======================================================
    // JOIN GROUP
    // ======================================================

    async function joinCircle(
        circle
    ) {

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


            if (
                result.error.code ===
                "23505"
            ) {

                showRecommendation(
                    "You already belong to that group."
                );


            } else {

                showRecommendation(
                    "Unable to join group: " +
                    result.error.message
                );

            }


            return false;

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


        return true;

    }


    // ======================================================
    // REFRESH GROUPS
    // ======================================================

    const refreshGroupsButton =
        document.getElementById(
            "refresh-groups-btn"
        );


    if (
        refreshGroupsButton
    ) {

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


    if (
        createCircleButton
    ) {

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
                        "Create group error:",
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
                    "Your new accountability circle was created."
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
                                level

                        }
                    );


                saveEnergyButton.disabled =
                    false;


                saveEnergyButton.textContent =
                    "Save Energy Level";


                if (saved) {

                    if (
                        energyScore
                    ) {

                        energyScore.textContent =
                            String(
                                level * 10
                            );

                    }


                    showRecommendation(
                        "Energy level saved."
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

            energyScore.textContent =
                String(
                    result.data.energy_level *
                    10
                );


            energyInput.value =
                String(
                    result.data.energy_level
                );


            energyValue.textContent =
                String(
                    result.data.energy_level
                );

        }

    }


    // ======================================================
    // QUICK CHECK-INS
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
        function (item) {

            const button =
                document.getElementById(
                    item[0]
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
                            item[1]
                        );


                    button.disabled =
                        false;


                    if (saved) {

                        showRecommendation(
                            item[2]
                        );

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
                        "Focus mode started. Reassess food, water, movement, and rest when you finish."
                    );


                    return;
                }


                const endTime =
                    new Date();


                const minutes =
                    Math.max(
                        1,
                        Math.round(
                            (
                                endTime.getTime() -
                                focusStartedAt.getTime()
                            ) / 60000
                        )
                    );


                const saved =
                    await saveCheckIn(
                        "focus",
                        {

                            notes:
                                "Completed a " +
                                minutes +
                                " minute focus session."

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


                if (saved) {

                    showRecommendation(
                        "Focus session complete. Check whether you need food, water, movement, or rest."
                    );

                }

            }
        );
    }


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


    const saveRoutineButton =
        document.getElementById(
            "save-routine-btn"
        );


    function getTime(
        element
    ) {

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

        if (!element) {
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


                if (
                    routineMessage
                ) {

                    routineMessage.textContent =
                        "Routine saved successfully.";


                    routineMessage.style.color =
                        "#9cff7a";

                }


                showRecommendation(
                    "Your daily routine was saved."
                );

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
            sleepGoal &&
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
        "Welcome back. Create a circle, discover an existing group, or check in."
    );


    console.log(
        "CircleSync dashboard v51 ready."
    );

}
