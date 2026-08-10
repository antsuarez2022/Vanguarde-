"use strict";

console.log("CircleSync app.js v40 loaded");

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

        message.textContent =
            text;

        if (isError) {

            message.style.color =
                "#ff8a9a";

        } else {

            message.style.color =
                "#9cff7a";
        }
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

                    console.error(
                        "Sign in error:",
                        result.error
                    );


                    setMessage(
                        result.error.message,
                        true
                    );


                    return;
                }


                if (
                    !result.data ||
                    !result.data.session
                ) {

                    setMessage(
                        "No active session was returned.",
                        true
                    );

                    return;
                }


                setMessage(
                    "Signed in. Opening CircleSync...",
                    false
                );


                window.location.replace(
                    "dashboard.html"
                );


            } catch (error) {

                console.error(
                    "Unexpected sign in error:",
                    error
                );


                setMessage(
                    "Unable to sign in. Please try again.",
                    true
                );


            } finally {

                setBusy(false);
            }
        }
    );


    // ======================================================
    // CREATE ACCOUNT
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
                    "Enter your email address.",
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
                "Creating your account...",
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

                    console.error(
                        "Sign up error:",
                        result.error
                    );


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

                    setMessage(
                        "Account created. Opening CircleSync...",
                        false
                    );


                    window.location.replace(
                        "dashboard.html"
                    );


                    return;
                }


                setMessage(
                    "Account created. Check your email to confirm it, then return and sign in.",
                    false
                );


            } catch (error) {

                console.error(
                    "Unexpected sign up error:",
                    error
                );


                setMessage(
                    "Unable to create your account. Please try again.",
                    true
                );


            } finally {

                setBusy(false);
            }
        }
    );
}


// ==========================================================
// DASHBOARD PAGE
// ==========================================================

async function initDashboardPage() {

    let currentCircle =
        null;

    let focusActive =
        false;

    let focusStartedAt =
        null;


    // ======================================================
    // VERIFY LOGIN
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


    const currentUser =
        sessionResult.data.session.user;


    const userEmail =
        document.getElementById(
            "user-email"
        );


    const logoutButton =
        document.getElementById(
            "logout-btn"
        );


    const recommendation =
        document.getElementById(
            "recommendation"
        );


    userEmail.textContent =
        currentUser.email ||
        "Signed in";


    function showRecommendation(
        text
    ) {

        recommendation.textContent =
            text;
    }


    // ======================================================
    // LOG OUT
    // ======================================================

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


    // ======================================================
    // SAVE CHECK-IN
    // ======================================================

    async function saveCheckIn(
        type,
        extra
    ) {

        const options =
            extra || {};


        const record = {

            user_id:
                currentUser.id,

            circle_id:
                currentCircle
                    ? currentCircle.id
                    : null,

            check_in_type:
                type,

            energy_level:
                options.energy_level !==
                undefined
                    ? options.energy_level
                    : null,

            stress_level:
                options.stress_level !==
                undefined
                    ? options.stress_level
                    : null,

            sleep_hours:
                options.sleep_hours !==
                undefined
                    ? options.sleep_hours
                    : null,

            notes:
                options.notes ||
                null,

            shared_with_circle:
                options.shared_with_circle ===
                true
        };


        const result =
            await supabaseClient
                .from(
                    "check_ins"
                )
                .insert(
                    record
                );


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


    energyInput.addEventListener(
        "input",
        function () {

            energyValue.textContent =
                energyInput.value;
        }
    );


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

                energyScore.textContent =
                    String(
                        level * 10
                    );


                showRecommendation(
                    "Energy level saved."
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
    // QUICK CHECK INS
    // ======================================================

    const quickCheckIns = [

        [
            "breakfast-btn",
            "breakfast",
            "Breakfast recorded. Start the day fueled."
        ],

        [
            "lunch-btn",
            "lunch",
            "Lunch recorded. Recharge before locking back in."
        ],

        [
            "dinner-btn",
            "dinner",
            "Dinner recorded. Give yourself time to digest before bed."
        ],

        [
            "rest-btn",
            "rest",
            "Rest recorded. Recovery is part of productivity."
        ],

        [
            "working-btn",
            "focus",
            "Work check-in recorded. Reassess your energy afterward."
        ],

        [
            "sleep-btn",
            "sleep",
            "Sleep check-in recorded. Give yourself time to disconnect."
        ],

        [
            "wake-btn",
            "wake",
            "Wake check-in recorded. Make time for breakfast."
        ]
    ];


    quickCheckIns.forEach(
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
                            config[1]
                        );


                    button.disabled =
                        false;


                    if (saved) {

                        showRecommendation(
                            config[2]
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


                showRecommendation(
                    "Focus mode started. Reassess food, water, movement, and rest when you finish."
                );


                return;
            }


            const endedAt =
                new Date();


            const minutes =
                Math.max(
                    1,
                    Math.round(
                        (
                            endedAt.getTime() -
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


            focusStatus.textContent =
                "Last focus session: " +
                minutes +
                " minutes.";


            if (saved) {

                showRecommendation(
                    "Focus session finished. Check whether you need food, water, movement, or rest."
                );
            }
        }
    );


    // ======================================================
    // ACCOUNTABILITY CIRCLES
    // ======================================================

    const circleNameDisplay =
        document.getElementById(
            "circle-name"
        );


    const circleDescriptionDisplay =
        document.getElementById(
            "circle-description"
        );


    const circleList =
        document.getElementById(
            "circle-list"
        );


    const newCircleName =
        document.getElementById(
            "new-circle-name"
        );


    const newCircleDescription =
        document.getElementById(
            "new-circle-description"
        );


    const createCircleButton =
        document.getElementById(
            "create-circle-btn"
        );


    async function loadCircleMembers() {

        if (
            !currentCircle
        ) {

            circleList.innerHTML =
                "<li>No members loaded yet.</li>";


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


        circleList.innerHTML =
            "";


        if (
            !result.data ||
            result.data.length === 0
        ) {

            circleList.innerHTML =
                "<li>No members yet.</li>";


            return;
        }


        result.data.forEach(
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


    async function loadCircles() {

        const result =
            await supabaseClient
                .from(
                    "circles"
                )
                .select(
                    "id, name, description, created_by, created_at"
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


            showRecommendation(
                "Could not load circles: " +
                result.error.message
            );


            return;
        }


        if (
            !result.data ||
            result.data.length === 0
        ) {

            currentCircle =
                null;


            circleNameDisplay.textContent =
                "No Circle Selected";


            circleDescriptionDisplay.textContent =
                "Create an accountability circle to get started.";


            return;
        }


        currentCircle =
            result.data[0];


        circleNameDisplay.textContent =
            currentCircle.name;


        circleDescriptionDisplay.textContent =
            currentCircle.description ||
            "No description provided.";


        await loadCircleMembers();
    }


    createCircleButton.addEventListener(
        "click",
        async function () {

            const name =
                newCircleName.value.trim();


            const description =
                newCircleDescription.value.trim();


            if (!name) {

                showRecommendation(
                    "Enter a circle name first."
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
                            currentUser.id
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
                    "Circle creation error:",
                    result.error
                );


                showRecommendation(
                    "Circle could not be created: " +
                    result.error.message
                );


                return;
            }


            currentCircle =
                result.data;


            newCircleName.value =
                "";


            newCircleDescription.value =
                "";


            circleNameDisplay.textContent =
                currentCircle.name;


            circleDescriptionDisplay.textContent =
                currentCircle.description ||
                "No description provided.";


            await loadCircleMembers();


            showRecommendation(
                "Your accountability circle was created."
            );
        }
    );


    // ======================================================
    // DAILY ROUTINE
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


    const saveRoutineButton =
        document.getElementById(
            "save-routine-btn"
        );


    const routineMessage =
        document.getElementById(
            "routine-message"
        );


    function getTime(
        element
    ) {

        if (
            element &&
            element.value
        ) {

            return element.value;
        }


        return null;
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

                routineMessage.textContent =
                    "Sleep goal must be between 1 and 24 hours.";


                routineMessage.style.color =
                    "#ff8a9a";


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


            showRecommendation(
                "Your daily routine was saved."
            );
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

    await loadCircles();


    showRecommendation(
        "Welcome back. Check your energy, review your routine, or begin a focus session."
    );


    console.log(
        "CircleSync dashboard ready."
    );
}
