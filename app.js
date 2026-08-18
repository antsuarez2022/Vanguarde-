"use strict";

console.log("CircleSync app.js v84.2 loaded");


/* ==========================================================
   SUPABASE CONFIG
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


/* ==========================================================
   APP START
   ========================================================== */

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


/* ==========================================================
   USERNAME HELPERS
   ========================================================== */

function normalizeUsername(value) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();
}


function validUsername(value) {

    return /^[a-z0-9_]{3,24}$/.test(
        normalizeUsername(value)
    );
}


async function usernameAvailable(
    username
) {

    const clean =
        normalizeUsername(
            username
        );


    if (
        !validUsername(clean)
    ) {
        return false;
    }


    const result =
        await supabaseClient.rpc(
            "is_username_available",
            {
                username_input:
                    clean
            }
        );


    if (result.error) {

        console.error(
            "Username availability error:",
            result.error
        );

        throw result.error;
    }


    return (
        result.data ===
        true
    );
}


/* ==========================================================
   AUTH PAGE
   ========================================================== */

async function initAuthPage() {

    function get(id) {
        return document.getElementById(
            id
        );
    }


    const signinSection =
        get("signin-section");

    const signupSection =
        get("signup-section");

    const signinForm =
        get("signin-form");

    const signupForm =
        get("signup-form");

    const signinTab =
        get("show-signin-btn");

    const signupTab =
        get("show-signup-btn");

    const authMessage =
        get("auth-message");


    function showMessage(
        message,
        error = false
    ) {

        if (!authMessage) {
            return;
        }


        authMessage.textContent =
            message;


        authMessage.className =
            error
                ? "status error-message"
                : "status success-message";
    }


    function showSignIn() {

        if (signinSection) {
            signinSection.hidden =
                false;
        }


        if (signupSection) {
            signupSection.hidden =
                true;
        }


        signinTab?.classList.add(
            "active-tab"
        );


        signupTab?.classList.remove(
            "active-tab"
        );


        signupTab?.classList.add(
            "secondary"
        );
    }


    function showSignUp() {

        if (signinSection) {
            signinSection.hidden =
                true;
        }


        if (signupSection) {
            signupSection.hidden =
                false;
        }


        signupTab?.classList.add(
            "active-tab"
        );


        signupTab?.classList.remove(
            "secondary"
        );


        signinTab?.classList.remove(
            "active-tab"
        );
    }


    signinTab?.addEventListener(
        "click",
        showSignIn
    );


    signupTab?.addEventListener(
        "click",
        showSignUp
    );


    const sessionResult =
        await supabaseClient.auth
            .getSession();


    if (
        sessionResult.data?.session
    ) {

        window.location.replace(
            "./dashboard.html"
        );

        return;
    }


    /* ======================================================
       SIGN IN
       ====================================================== */

    signinForm?.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                get("signin-email")
                    ?.value
                    .trim();


            const password =
                get("signin-password")
                    ?.value;


            const button =
                get("login-btn");


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


            if (button) {

                button.disabled =
                    true;

                button.textContent =
                    "Signing In...";
            }


            const result =
                await supabaseClient.auth
                    .signInWithPassword({

                        email,
                        password

                    });


            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    "Sign In";
            }


            if (result.error) {

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


    /* ======================================================
       SIGN UP
       ====================================================== */

    signupForm?.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                normalizeUsername(

                    get(
                        "signup-username"
                    )?.value

                );


            const email =
                get("signup-email")
                    ?.value
                    .trim();


            const password =
                get("signup-password")
                    ?.value;


            const confirmation =
                get(
                    "signup-confirm-password"
                )?.value;


            const button =
                get("signup-btn");


            if (
                !validUsername(
                    username
                )
            ) {

                showMessage(
                    "Username must be 3–24 characters using only letters, numbers and underscores.",
                    true
                );

                return;
            }


            if (!email) {

                showMessage(
                    "Enter an email address.",
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
                confirmation
            ) {

                showMessage(
                    "Passwords do not match.",
                    true
                );

                return;
            }


            if (button) {

                button.disabled =
                    true;

                button.textContent =
                    "Checking Username...";
            }


            try {

                const available =
                    await usernameAvailable(
                        username
                    );


                if (!available) {

                    if (button) {

                        button.disabled =
                            false;

                        button.textContent =
                            "Create Account";
                    }


                    showMessage(
                        "That username is already taken.",
                        true
                    );

                    return;
                }

            } catch (error) {

                if (button) {

                    button.disabled =
                        false;

                    button.textContent =
                        "Create Account";
                }


                showMessage(
                    "Unable to check username availability.",
                    true
                );

                return;
            }


            if (button) {

                button.textContent =
                    "Creating Account...";
            }


            const result =
                await supabaseClient.auth
                    .signUp({

                        email,
                        password,

                        options: {

                            emailRedirectTo:
                                WEBSITE_SIGNIN_URL,

                            data: {

                                username:
                                    username

                            }

                        }

                    });


            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    "Create Account";
            }


            if (result.error) {

                showMessage(
                    result.error.message,
                    true
                );

                return;
            }


            if (
                result.data?.session
            ) {

                window.location.replace(
                    "./dashboard.html"
                );

                return;
            }


            showMessage(
                "Account created. Check your email for the confirmation link.",
                false
            );


            signupForm.reset();
        }
    );


    console.log(
        "CircleSync auth v84.2 ready."
    );
}


/* ==========================================================
   DASHBOARD
   ========================================================== */

async function initDashboardPage() {

    function get(id) {
        return document.getElementById(
            id
        );
    }


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
       STATE
       ====================================================== */

    let currentUser =
        null;

    let currentProfile =
        null;

    let currentRoutine =
        null;

    let latestEnergy =
        null;

    let focusActive =
        false;

    let focusStartedAt =
        null;

    let activeCircle =
        null;

    let myCircles =
        [];

    let realtimeChannel =
        null;

    let recentCheckIns =
        [];

    let lastCheckInRefresh =
        0;


    /* ======================================================
       ROUTINE ORDER
       ====================================================== */

    const ROUTINE_ORDER = [

        {
            type:
                "wake",

            title:
                "☀️ Wake Up",

            field:
                "wake_time"
        },

        {
            type:
                "breakfast",

            title:
                "🍳 Breakfast",

            field:
                "breakfast_time"
        },

        {
            type:
                "lunch",

            title:
                "🥗 Lunch",

            field:
                "lunch_time"
        },

        {
            type:
                "rest",

            title:
                "😴 Rest",

            field:
                "rest_start_time"
        },

        {
            type:
                "dinner",

            title:
                "🍽 Dinner",

            field:
                "dinner_time"
        },

        {
            type:
                "sleep",

            title:
                "🌙 Bedtime",

            field:
                "bedtime"
        }

    ];


    /* ======================================================
       ALARM STATE
       ====================================================== */

    let alarmsEnabled =
        localStorage.getItem(
            "circlesync-alarms-enabled"
        ) === "true";


    let audioContext =
        null;


    let activeAlarm =
        null;


    let alarmRepeatTimer =
        null;


    const firedAlarmKeys =
        new Set();


    /* ======================================================
       SESSION
       ====================================================== */

    const sessionResult =
        await supabaseClient.auth
            .getSession();


    if (
        !sessionResult.data?.session
    ) {

        window.location.replace(
            "./index.html"
        );

        return;
    }


    currentUser =
        sessionResult
            .data
            .session
            .user;


    /* ======================================================
       PROFILE
       ====================================================== */

    async function loadCurrentProfile() {

        const result =
            await supabaseClient
                .from("profiles")
                .select(
                    "id, username, avatar_url"
                )
                .eq(
                    "id",
                    currentUser.id
                )
                .maybeSingle();


        if (result.error) {

            console.error(
                "Profile load error:",
                result.error
            );

            return;
        }


        if (!result.data) {

            const fallback =
                "user_" +
                currentUser.id
                    .replaceAll(
                        "-",
                        ""
                    )
                    .substring(
                        0,
                        8
                    );


            const insertResult =
                await supabaseClient
                    .from("profiles")
                    .upsert({

                        id:
                            currentUser.id,

                        username:
                            fallback,

                        display_name:
                            fallback

                    })
                    .select(
                        "id, username, avatar_url"
                    )
                    .single();


            if (
                insertResult.error
            ) {

                console.error(
                    "Profile repair error:",
                    insertResult.error
                );

                return;
            }


            currentProfile =
                insertResult.data;

        } else {

            currentProfile =
                result.data;
        }


        const username =
            currentProfile?.username ||
            "circlesync_user";


        setText(
            "user-username",
            "@" + username
        );


        setText(
            "profile-current-username",
            "@" + username
        );


        const input =
            get(
                "profile-username-input"
            );


        if (input) {

            input.value =
                username;
        }
    }


    await loadCurrentProfile();


    /* ======================================================
       CHANGE USERNAME
       ====================================================== */

    get("save-username-btn")
        ?.addEventListener(
            "click",
            async function () {

                const input =
                    get(
                        "profile-username-input"
                    );


                const button =
                    get(
                        "save-username-btn"
                    );


                const username =
                    normalizeUsername(
                        input?.value
                    );


                if (
                    !validUsername(
                        username
                    )
                ) {

                    setText(
                        "profile-message",
                        "Username must be 3–24 characters using only letters, numbers and underscores."
                    );

                    return;
                }


                if (
                    username ===
                    currentProfile?.username
                ) {

                    setText(
                        "profile-message",
                        "That is already your username."
                    );

                    return;
                }


                button.disabled =
                    true;


                button.textContent =
                    "Checking...";


                try {

                    const available =
                        await usernameAvailable(
                            username
                        );


                    if (!available) {

                        button.disabled =
                            false;

                        button.textContent =
                            "Save Username";


                        setText(
                            "profile-message",
                            "That username is already taken."
                        );

                        return;
                    }

                } catch (error) {

                    button.disabled =
                        false;

                    button.textContent =
                        "Save Username";


                    setText(
                        "profile-message",
                        "Unable to check username availability."
                    );

                    return;
                }


                button.textContent =
                    "Saving...";


                const result =
                    await supabaseClient
                        .from("profiles")
                        .update({

                            username,
                            display_name:
                                username,

                            updated_at:
                                new Date()
                                    .toISOString()

                        })
                        .eq(
                            "id",
                            currentUser.id
                        )
                        .select(
                            "id, username, avatar_url"
                        )
                        .single();


                button.disabled =
                    false;


                button.textContent =
                    "Save Username";


                if (result.error) {

                    setText(
                        "profile-message",
                        result.error.message
                    );

                    return;
                }


                currentProfile =
                    result.data;


                setText(
                    "user-username",
                    "@" +
                    currentProfile.username
                );


                setText(
                    "profile-current-username",
                    "@" +
                    currentProfile.username
                );


                setText(
                    "profile-message",
                    "Username updated."
                );


                await Promise.all([

                    loadCircleMembers(),

                    loadCircleFeed(),

                    loadOwnerRequests()

                ]);
            }
        );


    /* ======================================================
       LOGOUT
       ====================================================== */

    get("logout-btn")
        ?.addEventListener(
            "click",
            async function () {

                stopAlarm();


                if (realtimeChannel) {

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
       DATE HELPERS
       ====================================================== */

    function startOfDay(date) {

        return new Date(

            date.getFullYear(),

            date.getMonth(),

            date.getDate(),

            0,
            0,
            0,
            0

        );
    }


    function addDays(
        date,
        days
    ) {

        const result =
            new Date(date);


        result.setDate(
            result.getDate() +
            days
        );


        return result;
    }


    function parseClock(clock) {

        if (!clock) {
            return null;
        }


        const parts =
            clock.split(":");


        return {

            hours:
                Number(parts[0]),

            minutes:
                Number(parts[1])

        };
    }


    function dateAtClock(
        baseDate,
        clock
    ) {

        const parsed =
            parseClock(
                clock
            );


        if (!parsed) {
            return null;
        }


        return new Date(

            baseDate.getFullYear(),

            baseDate.getMonth(),

            baseDate.getDate(),

            parsed.hours,

            parsed.minutes,

            0,
            0

        );
    }


    function formatDateKey(date) {

        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
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


    /* ======================================================
       ROUTINE CYCLE
       ====================================================== */

    function buildCycle(
        baseDate
    ) {

        if (!currentRoutine) {
            return [];
        }


        let workingDate =
            startOfDay(
                baseDate
            );


        let previousTime =
            null;


        const cycle =
            [];


        for (
            const definition
            of ROUTINE_ORDER
        ) {

            const clock =
                currentRoutine[
                    definition.field
                ];


            if (!clock) {
                continue;
            }


            let scheduled =
                dateAtClock(
                    workingDate,
                    clock
                );


            if (
                previousTime &&
                scheduled <=
                previousTime
            ) {

                workingDate =
                    addDays(
                        workingDate,
                        1
                    );


                scheduled =
                    dateAtClock(
                        workingDate,
                        clock
                    );
            }


            const cycleKey =
                formatDateKey(
                    baseDate
                );


            cycle.push({

                ...definition,

                scheduled,

                cycleDate:
                    cycleKey,

                id:
                    cycleKey +
                    "|" +
                    definition.type +
                    "|" +
                    scheduled.toISOString()

            });


            previousTime =
                scheduled;
        }


        return cycle;
    }


    function buildContinuousSchedule() {

        if (!currentRoutine) {
            return [];
        }


        const today =
            startOfDay(
                new Date()
            );


        const schedule =
            [];


        for (
            let offset = -2;
            offset <= 4;
            offset += 1
        ) {

            schedule.push(

                ...buildCycle(

                    addDays(
                        today,
                        offset
                    )

                )

            );
        }


        schedule.sort(
            function (
                first,
                second
            ) {

                return (
                    first.scheduled -
                    second.scheduled
                );
            }
        );


        return schedule;
    }


    /* ======================================================
       CHECK-IN REFRESH
       ====================================================== */

    async function refreshRecentCheckIns() {

        const now =
            new Date();


        const start =
            addDays(
                startOfDay(now),
                -2
            );


        const end =
            addDays(
                startOfDay(now),
                4
            );


        const result =
            await supabaseClient
                .from("check_ins")
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
                )
                .lt(
                    "created_at",
                    end.toISOString()
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            true
                    }
                );


        if (result.error) {

            console.error(
                "Check-in refresh error:",
                result.error
            );

            return;
        }


        recentCheckIns =
            result.data ||
            [];


        lastCheckInRefresh =
            Date.now();


        if (activeAlarm) {

            const schedule =
                buildContinuousSchedule();


            const occurrence =
                schedule.find(
                    function (item) {

                        return (
                            item.id ===
                            activeAlarm.occurrenceId
                        );
                    }
                );


            if (
                occurrence &&
                isOccurrenceCompleted(
                    occurrence,
                    schedule
                )
            ) {

                stopAlarm(
                    occurrence.type
                );
            }
        }
    }


    function getNextOccurrenceOfType(
        occurrence,
        schedule
    ) {

        return (
            schedule.find(
                function (candidate) {

                    return (

                        candidate.type ===
                            occurrence.type

                        &&

                        candidate.scheduled >
                            occurrence.scheduled

                    );
                }
            )
            ||
            null
        );
    }


    function isOccurrenceCompleted(
        occurrence,
        schedule
    ) {

        const windowStart =
            new Date(

                occurrence.scheduled
                    .getTime()

                -

                10 *
                60 *
                1000

            );


        const nextSameType =
            getNextOccurrenceOfType(
                occurrence,
                schedule
            );


        const windowEnd =
            nextSameType

                ? new Date(

                    nextSameType.scheduled
                        .getTime()

                    -

                    10 *
                    60 *
                    1000

                )

                : new Date(

                    occurrence.scheduled
                        .getTime()

                    +

                    24 *
                    60 *
                    60 *
                    1000

                );


        return recentCheckIns.some(
            function (checkIn) {

                if (
                    checkIn.check_in_type !==
                    occurrence.type
                ) {

                    return false;
                }


                const checkTime =
                    new Date(
                        checkIn.created_at
                    );


                return (

                    checkTime >=
                        windowStart

                    &&

                    checkTime <
                        windowEnd

                );
            }
        );
    }


    /* ======================================================
       COUNTDOWN
       ====================================================== */

    function formatCountdown(
        milliseconds
    ) {

        const totalSeconds =
            Math.max(
                0,
                Math.floor(
                    milliseconds /
                    1000
                )
            );


        const days =
            Math.floor(
                totalSeconds /
                86400
            );


        const hours =
            Math.floor(
                (
                    totalSeconds %
                    86400
                ) /
                3600
            );


        const minutes =
            Math.floor(
                (
                    totalSeconds %
                    3600
                ) /
                60
            );


        const seconds =
            totalSeconds %
            60;


        const clock =

            String(hours)
                .padStart(
                    2,
                    "0"
                )

            +

            ":"

            +

            String(minutes)
                .padStart(
                    2,
                    "0"
                )

            +

            ":"

            +

            String(seconds)
                .padStart(
                    2,
                    "0"
                );


        if (days > 0) {

            return (
                days +
                "d " +
                clock
            );
        }


        return clock;
    }


    function formatScheduledTime(
        date
    ) {

        const now =
            new Date();


        const today =
            startOfDay(
                now
            );


        const tomorrow =
            addDays(
                today,
                1
            );


        if (
            date >= tomorrow &&
            date <
            addDays(
                tomorrow,
                1
            )
        ) {

            return (
                "Tomorrow at " +

                date.toLocaleTimeString(
                    [],
                    {
                        hour:
                            "numeric",

                        minute:
                            "2-digit"
                    }
                )
            );
        }


        if (
            formatDateKey(date) !==
            formatDateKey(now)
        ) {

            return (

                date.toLocaleDateString(
                    [],
                    {
                        weekday:
                            "short",

                        month:
                            "short",

                        day:
                            "numeric"
                    }
                )

                +

                " at "

                +

                date.toLocaleTimeString(
                    [],
                    {
                        hour:
                            "numeric",

                        minute:
                            "2-digit"
                    }
                )

            );
        }


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


    /* ======================================================
       CURRENT ROUTINE TARGET
       ====================================================== */

    function getCurrentRoutineTarget() {

        if (!currentRoutine) {

            return {

                state:
                    "none",

                occurrence:
                    null

            };
        }


        const schedule =
            buildContinuousSchedule();


        const now =
            new Date();


        const overdueLimit =
            6 *
            60 *
            60 *
            1000;


        const overdue =
            schedule.find(
                function (occurrence) {

                    const age =
                        now -
                        occurrence.scheduled;


                    return (

                        age >= 0

                        &&

                        age <= overdueLimit

                        &&

                        !isOccurrenceCompleted(
                            occurrence,
                            schedule
                        )

                    );
                }
            );


        if (overdue) {

            return {

                state:
                    "overdue",

                occurrence:
                    overdue

            };
        }


        const next =
            schedule.find(
                function (occurrence) {

                    return (
                        occurrence.scheduled >
                        now
                    );
                }
            );


        if (next) {

            return {

                state:
                    "upcoming",

                occurrence:
                    next

            };
        }


        return {

            state:
                "none",

            occurrence:
                null

        };
    }


    /* ======================================================
       NEXT UP + FLOATING CLOCK
       ====================================================== */

    function updateRoutineDisplays() {

        if (!currentRoutine) {

            setText(
                "alarm-label",
                "No Routine"
            );


            setText(
                "alarm-title",
                "Save your routine"
            );


            setText(
                "alarm-countdown",
                "--:--"
            );


            setText(
                "next-up-label",
                "No Routine"
            );


            setText(
                "next-up-title",
                "Save your routine below"
            );


            setText(
                "next-up-countdown",
                ""
            );


            setText(
                "next-up-time",
                ""
            );


            return;
        }


        const target =
            getCurrentRoutineTarget();


        if (!target.occurrence) {
            return;
        }


        const occurrence =
            target.occurrence;


        if (
            target.state ===
            "upcoming"
        ) {

            const countdown =
                formatCountdown(

                    occurrence.scheduled -

                    new Date()

                );


            setText(
                "next-up-label",
                "Next Up"
            );


            setText(
                "next-up-title",
                occurrence.title
            );


            setText(
                "next-up-countdown",
                "In " +
                countdown
            );


            setText(
                "next-up-time",
                formatScheduledTime(
                    occurrence.scheduled
                )
            );


            if (!activeAlarm) {

                setText(
                    "alarm-label",
                    "Next Up"
                );


                setText(
                    "alarm-title",
                    occurrence.title
                );


                setText(
                    "alarm-countdown",
                    countdown
                );
            }


            return;
        }


        if (
            target.state ===
            "overdue"
        ) {

            const overdueText =
                formatCountdown(

                    new Date() -

                    occurrence.scheduled

                );


            setText(
                "next-up-label",
                "Needs Attention"
            );


            setText(
                "next-up-title",
                occurrence.title
            );


            setText(
                "next-up-countdown",
                overdueText +
                " overdue"
            );


            setText(
                "next-up-time",

                "Scheduled " +

                formatScheduledTime(
                    occurrence.scheduled
                )
            );


            if (!activeAlarm) {

                setText(
                    "alarm-label",
                    "Needs Attention"
                );


                setText(
                    "alarm-title",
                    occurrence.title
                );


                setText(
                    "alarm-countdown",
                    overdueText +
                    " overdue"
                );
            }
        }
    }


    /* ======================================================
       AUDIO
       ====================================================== */

    async function prepareAudio() {

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContextClass) {

            throw new Error(
                "Web Audio is not supported in this browser."
            );
        }


        if (!audioContext) {

            audioContext =
                new AudioContextClass();
        }


        if (
            audioContext.state ===
            "suspended"
        ) {

            await audioContext.resume();
        }


        return (
            audioContext.state ===
            "running"
        );
    }


    function playSoftChime() {

        if (
            !audioContext ||
            audioContext.state !==
            "running"
        ) {

            return;
        }


        const now =
            audioContext.currentTime;


        const master =
            audioContext.createGain();


        master.gain
            .setValueAtTime(
                0.0001,
                now
            );


        master.gain
            .exponentialRampToValueAtTime(
                0.13,
                now + 0.08
            );


        master.gain
            .exponentialRampToValueAtTime(
                0.0001,
                now + 2.4
            );


        master.connect(
            audioContext.destination
        );


        const notes = [

            523.25,
            659.25,
            783.99

        ];


        notes.forEach(
            function (
                frequency,
                index
            ) {

                const oscillator =
                    audioContext
                        .createOscillator();


                const gain =
                    audioContext
                        .createGain();


                oscillator.type =
                    "sine";


                oscillator.frequency.value =
                    frequency;


                gain.gain.value =
                    0.28;


                oscillator.connect(
                    gain
                );


                gain.connect(
                    master
                );


                oscillator.start(

                    now +

                    index *
                    0.18

                );


                oscillator.stop(

                    now +

                    1.5 +

                    index *
                    0.18

                );
            }
        );
    }


    /* ======================================================
       ALARM BUTTON
       ====================================================== */

    function updateAlarmButton() {

        const button =
            get(
                "alarm-settings-btn"
            );


        if (!button) {
            return;
        }


        if (alarmsEnabled) {

            button.textContent =
                "Disable Routine Alarms";


            button.classList.add(
                "alarm-enabled-button"
            );


            setText(
                "alarm-status",
                "Routine alarms are ON 24/7. CircleSync alerts 10 minutes before every routine. If its matching check-in is missing, reminders occur every 10 minutes afterward. Once an alarm activates, its sound repeats every 5 seconds until the matching check-in is completed."
            );

        } else {

            button.textContent =
                "Enable Routine Alarms";


            button.classList.remove(
                "alarm-enabled-button"
            );


            setText(
                "alarm-status",
                "Routine alarms are currently off."
            );
        }
    }


    async function enableAlarms() {

        try {

            await prepareAudio();


            alarmsEnabled =
                true;


            localStorage.setItem(
                "circlesync-alarms-enabled",
                "true"
            );


            updateAlarmButton();


            playSoftChime();


            recommend(
                "Routine alarms are enabled. CircleSync will continuously cycle through Wake, Breakfast, Lunch, Rest, Dinner, Bedtime and the next day's Wake."
            );

        } catch (error) {

            console.error(
                "Audio error:",
                error
            );


            alarmsEnabled =
                false;


            localStorage.setItem(
                "circlesync-alarms-enabled",
                "false"
            );


            updateAlarmButton();


            recommend(
                "CircleSync could not activate audio. Click somewhere on the page and try enabling alarms again."
            );
        }
    }


    function disableAlarms() {

        alarmsEnabled =
            false;


        localStorage.setItem(
            "circlesync-alarms-enabled",
            "false"
        );


        stopAlarm();


        updateAlarmButton();


        updateRoutineDisplays();


        recommend(
            "Routine alarms are off. Your routine remains saved."
        );
    }


    get("alarm-settings-btn")
        ?.addEventListener(
            "click",
            async function () {

                if (alarmsEnabled) {

                    disableAlarms();

                } else {

                    await enableAlarms();
                }
            }
        );


    updateAlarmButton();


    /* ======================================================
       ACTIVE ALARM
       SOUND EVERY 5 SECONDS
       ====================================================== */

    function startAlarm(
        occurrence,
        label,
        alarmKeyValue
    ) {

        if (!alarmsEnabled) {
            return;
        }


        if (
            activeAlarm?.key ===
            alarmKeyValue
        ) {
            return;
        }


        stopAlarm();


        activeAlarm = {

            type:
                occurrence.type,

            occurrenceId:
                occurrence.id,

            key:
                alarmKeyValue

        };


        get(
            "routine-alarm-widget"
        )
            ?.classList
            .add(
                "alarm-active"
            );


        setText(
            "alarm-label",
            label
        );


        setText(
            "alarm-title",
            occurrence.title
        );


        setText(
            "alarm-countdown",
            "ALARM"
        );


        playSoftChime();


        alarmRepeatTimer =
            setInterval(
                function () {

                    playSoftChime();

                },
                5000
            );
    }


    function stopAlarm(
        type = null
    ) {

        /*
         * If a specific routine type was supplied,
         * only stop the alarm if it matches.
         */

        if (
            type &&
            activeAlarm &&
            activeAlarm.type !==
            type
        ) {
            return;
        }


        if (alarmRepeatTimer) {

            clearInterval(
                alarmRepeatTimer
            );


            alarmRepeatTimer =
                null;
        }


        activeAlarm =
            null;


        get(
            "routine-alarm-widget"
        )
            ?.classList
            .remove(
                "alarm-active"
            );


        updateRoutineDisplays();
    }


    /* ======================================================
       ALARM EVENTS
       ====================================================== */

    function buildAlarmEvents() {

        const schedule =
            buildContinuousSchedule();


        const events =
            [];


        for (
            const occurrence
            of schedule
        ) {

            /*
             * 10 MINUTES BEFORE
             */

            events.push({

                occurrence,

                kind:
                    "before",

                sequence:
                    0,

                time:
                    new Date(

                        occurrence.scheduled
                            .getTime()

                        -

                        10 *
                        60 *
                        1000

                    )

            });


            /*
             * EVERY 10 MINUTES AFTER
             */

            const nextSame =
                getNextOccurrenceOfType(
                    occurrence,
                    schedule
                );


            const stopAt =
                nextSame

                    ? nextSame.scheduled

                    : new Date(

                        occurrence.scheduled
                            .getTime()

                        +

                        24 *
                        60 *
                        60 *
                        1000

                    );


            let sequence =
                1;


            let reminderTime =
                new Date(

                    occurrence.scheduled
                        .getTime()

                    +

                    10 *
                    60 *
                    1000

                );


            while (
                reminderTime <
                stopAt
            ) {

                events.push({

                    occurrence,

                    kind:
                        "after",

                    sequence,

                    time:
                        new Date(
                            reminderTime
                        )

                });


                sequence +=
                    1;


                reminderTime =
                    new Date(

                        occurrence.scheduled
                            .getTime()

                        +

                        sequence *
                        10 *
                        60 *
                        1000

                    );
            }
        }


        events.sort(
            function (
                first,
                second
            ) {

                return (
                    first.time -
                    second.time
                );
            }
        );


        return events;
    }


    function alarmKey(
        event
    ) {

        return (

            event.occurrence.id

            +

            "|"

            +

            event.kind

            +

            "|"

            +

            event.sequence

        );
    }


    /* ======================================================
       ALARM ENGINE
       ====================================================== */

    async function checkForDueAlarm() {

        if (
            Date.now() -
            lastCheckInRefresh >=
            5000
        ) {

            await refreshRecentCheckIns();
        }


        if (
            !alarmsEnabled ||
            !currentRoutine
        ) {

            return;
        }


        const schedule =
            buildContinuousSchedule();


        const events =
            buildAlarmEvents();


        const now =
            new Date();


        const dueEvent =
            events.find(
                function (event) {

                    const elapsed =
                        now -
                        event.time;


                    if (
                        elapsed < 0 ||
                        elapsed > 65000
                    ) {

                        return false;
                    }


                    if (
                        firedAlarmKeys.has(
                            alarmKey(event)
                        )
                    ) {

                        return false;
                    }


                    /*
                     * BOTH BEFORE AND AFTER alarms
                     * should be skipped if matching
                     * check-in already exists.
                     */

                    if (
                        isOccurrenceCompleted(
                            event.occurrence,
                            schedule
                        )
                    ) {

                        return false;
                    }


                    return true;
                }
            );


        if (!dueEvent) {
            return;
        }


        await refreshRecentCheckIns();


        if (
            isOccurrenceCompleted(
                dueEvent.occurrence,
                buildContinuousSchedule()
            )
        ) {

            return;
        }


        const key =
            alarmKey(
                dueEvent
            );


        firedAlarmKeys.add(
            key
        );


        if (
            dueEvent.kind ===
            "before"
        ) {

            startAlarm(

                dueEvent.occurrence,

                "10 Minutes Before",

                key

            );


            recommend(

                dueEvent.occurrence.title +

                " is coming up in 10 minutes. Start wrapping up your current activity."

            );


            return;
        }


        const minutesLate =
            dueEvent.sequence *
            10;


        startAlarm(

            dueEvent.occurrence,

            minutesLate +
            " Minutes After",

            key

        );


        recommend(

            dueEvent.occurrence.title +

            " is " +

            minutesLate +

            " minutes past its scheduled time and its matching Quick Check-In is still missing."

        );
    }


    /* ======================================================
       ROUTINES
       ====================================================== */

    const routineElements = {

        wake:
            get("wake-time"),

        breakfast:
            get("breakfast-time"),

        lunch:
            get("lunch-time"),

        rest:
            get("rest-time"),

        dinner:
            get("dinner-time"),

        bedtime:
            get("bedtime"),

        goal:
            get("sleep-goal")

    };


    async function loadRoutine() {

        const result =
            await supabaseClient
                .from("routines")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .maybeSingle();


        if (result.error) {

            console.error(
                "Routine error:",
                result.error
            );

            return;
        }


        currentRoutine =
            result.data ||
            null;


        if (!currentRoutine) {
            return;
        }


        function assign(
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
            routineElements.rest,
            currentRoutine.rest_start_time
        );


        assign(
            routineElements.dinner,
            currentRoutine.dinner_time
        );


        assign(
            routineElements.bedtime,
            currentRoutine.bedtime
        );


        if (routineElements.goal) {

            routineElements.goal.value =
                currentRoutine.sleep_goal_hours ||
                8;
        }
    }


    get("save-routine-btn")
        ?.addEventListener(
            "click",
            async function () {

                const button =
                    get(
                        "save-routine-btn"
                    );


                button.disabled =
                    true;


                button.textContent =
                    "Saving...";


                const result =
                    await supabaseClient
                        .from("routines")
                        .upsert(
                            {

                                user_id:
                                    currentUser.id,

                                wake_time:
                                    routineElements.wake
                                        ?.value ||
                                    null,

                                breakfast_time:
                                    routineElements.breakfast
                                        ?.value ||
                                    null,

                                lunch_time:
                                    routineElements.lunch
                                        ?.value ||
                                    null,

                                rest_start_time:
                                    routineElements.rest
                                        ?.value ||
                                    null,

                                dinner_time:
                                    routineElements.dinner
                                        ?.value ||
                                    null,

                                bedtime:
                                    routineElements.bedtime
                                        ?.value ||
                                    null,

                                sleep_goal_hours:
                                    Number(
                                        routineElements.goal
                                            ?.value ||
                                        8
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


                button.disabled =
                    false;


                button.textContent =
                    "Save Routine";


                if (result.error) {

                    setText(
                        "routine-message",
                        result.error.message
                    );

                    return;
                }


                currentRoutine =
                    result.data;


                firedAlarmKeys.clear();


                stopAlarm();


                setText(
                    "routine-message",
                    "Routine saved. Your 24/7 schedule and alarms have been updated."
                );


                recommend(
                    "Your routine is updated. CircleSync will continue through Wake, Breakfast, Lunch, Rest, Dinner, Bedtime and the next day's Wake."
                );


                updateRoutineDisplays();


                await checkForDueAlarm();
            }
        );


    /* ======================================================
       FIXED QUICK CHECK-IN SAVE
       ====================================================== */

    async function saveCheckIn(
        type,
        successMessage
    ) {

        console.log(
            "CircleSync check-in pressed:",
            type
        );


        /*
         * STOP THE MATCHING ALARM IMMEDIATELY.
         *
         * We do this BEFORE waiting on Supabase.
         */

        stopAlarm(
            type
        );


        /*
         * Add check-in locally immediately.
         */

        const localCheckIn = {

            check_in_type:
                type,

            created_at:
                new Date()
                    .toISOString()

        };


        recentCheckIns.push(
            localCheckIn
        );


        /*
         * Update Next Up immediately.
         */

        updateRoutineDisplays();


        /*
         * Try shared circle check-in first.
         */

        const sharedCheckIn = {

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

        };


        console.log(
            "Attempting CircleSync check-in:",
            sharedCheckIn
        );


        let result =
            await supabaseClient
                .from("check_ins")
                .insert(
                    sharedCheckIn
                )
                .select();


        /*
         * If circle sharing is blocked by RLS
         * or membership state, retry privately.
         */

        if (
            result.error &&
            activeCircle
        ) {

            console.error(
                "Shared check-in failed:",
                result.error
            );


            console.warn(
                "Retrying check-in privately."
            );


            const privateCheckIn = {

                user_id:
                    currentUser.id,

                circle_id:
                    null,

                check_in_type:
                    type,

                shared_with_circle:
                    false

            };


            result =
                await supabaseClient
                    .from("check_ins")
                    .insert(
                        privateCheckIn
                    )
                    .select();


            if (!result.error) {

                console.log(
                    "Private check-in saved successfully."
                );


                recommend(
                    successMessage +
                    " It was saved privately because CircleSync could not share it with the active circle."
                );


                await refreshRecentCheckIns();


                updateRoutineDisplays();


                try {

                    await loadCircleFeed();

                } catch (feedError) {

                    console.warn(
                        "Feed refresh warning:",
                        feedError
                    );
                }


                return true;
            }
        }


        /*
         * Total save failure.
         */

        if (result.error) {

            console.error(
                "CircleSync check-in failed completely:",
                result.error
            );


            console.error(
                "Message:",
                result.error.message
            );


            console.error(
                "Details:",
                result.error.details
            );


            console.error(
                "Hint:",
                result.error.hint
            );


            console.error(
                "Code:",
                result.error.code
            );


            /*
             * Remove temporary local record.
             */

            const localIndex =
                recentCheckIns.indexOf(
                    localCheckIn
                );


            if (
                localIndex !==
                -1
            ) {

                recentCheckIns.splice(
                    localIndex,
                    1
                );
            }


            /*
             * Alarm stays stopped for the button press,
             * but database failure is shown.
             */

            recommend(
                "The alarm was stopped, but CircleSync could not save the check-in to Supabase. Please try again."
            );


            updateRoutineDisplays();


            return false;
        }


        console.log(
            "CircleSync check-in saved:",
            result.data
        );


        recommend(
            successMessage
        );


        await refreshRecentCheckIns();


        updateRoutineDisplays();


        try {

            await loadCircleFeed();

        } catch (feedError) {

            console.warn(
                "Circle feed refresh failed:",
                feedError
            );
        }


        return true;
    }


    /* ======================================================
       QUICK CHECK-IN BUTTONS
       ====================================================== */

    const quickChecks = [

        [
            "wake-btn",
            "wake",
            "Wake-up recorded. Wake reminders for this routine occurrence are cleared."
        ],

        [
            "breakfast-btn",
            "breakfast",
            "Breakfast recorded. Breakfast reminders for this routine occurrence are cleared."
        ],

        [
            "lunch-btn",
            "lunch",
            "Lunch recorded. Lunch reminders for this routine occurrence are cleared."
        ],

        [
            "rest-btn",
            "rest",
            "Rest recorded. Rest reminders for this routine occurrence are cleared."
        ],

        [
            "dinner-btn",
            "dinner",
            "Dinner recorded. Dinner reminders for this routine occurrence are cleared."
        ],

        [
            "sleep-btn",
            "sleep",
            "Bedtime recorded. Bedtime reminders are cleared and CircleSync will continue toward your next Wake."
        ],

        [
            "working-btn",
            "focus",
            "Working status recorded. Your 24/7 routine clock will continue running."
        ]

    ];


    quickChecks.forEach(
        function (
            configuration
        ) {

            const buttonId =
                configuration[0];


            const checkInType =
                configuration[1];


            const successMessage =
                configuration[2];


            const button =
                get(
                    buttonId
                );


            if (!button) {

                console.error(
                    "CircleSync could not find Quick Check-In button:",
                    buttonId
                );

                return;
            }


            console.log(
                "CircleSync connected Quick Check-In:",
                buttonId,
                "→",
                checkInType
            );


            button.addEventListener(
                "click",
                async function () {

                    console.log(
                        "Quick Check-In CLICK:",
                        checkInType
                    );


                    /*
                     * STOP ALARM FIRST.
                     */

                    stopAlarm(
                        checkInType
                    );


                    try {

                        await prepareAudio();

                    } catch (audioError) {

                        console.warn(
                            "Audio preparation warning:",
                            audioError
                        );
                    }


                    button.disabled =
                        true;


                    const originalText =
                        button.textContent;


                    button.textContent =
                        originalText +
                        " ✓";


                    try {

                        const success =
                            await saveCheckIn(

                                checkInType,

                                successMessage

                            );


                        if (success) {

                            setTimeout(
                                function () {

                                    button.textContent =
                                        originalText;

                                },
                                900
                            );

                        } else {

                            button.textContent =
                                originalText;
                        }

                    } catch (error) {

                        console.error(
                            "Unexpected Quick Check-In error:",
                            error
                        );


                        recommend(
                            "The alarm was stopped, but CircleSync encountered an unexpected error while saving the check-in."
                        );


                        button.textContent =
                            originalText;

                    } finally {

                        button.disabled =
                            false;
                    }
                }
            );
        }
    );


    /* ======================================================
       ENERGY
       ====================================================== */

    const energyInput =
        get(
            "energy-input"
        );


    energyInput?.addEventListener(
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
                        energyInput?.value ||
                        5
                    );


                const result =
                    await supabaseClient
                        .from("check_ins")
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


                if (result.error) {

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
                        level * 10
                    )
                );


                if (
                    level <= 3
                ) {

                    recommend(
                        "Your energy is low. Protect your next meal, rest period, or sleep opportunity."
                    );

                } else if (
                    level <= 6
                ) {

                    recommend(
                        "Your energy is moderate. Stay aware of your next routine."
                    );

                } else {

                    recommend(
                        "Your energy is strong. Use it productively while staying on schedule."
                    );
                }
            }
        );


    async function loadLatestEnergy() {

        const result =
            await supabaseClient
                .from("check_ins")
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


        if (!result.data) {
            return;
        }


        latestEnergy =
            Number(
                result.data.energy_level
            );


        if (energyInput) {

            energyInput.value =
                String(
                    latestEnergy
                );
        }


        setText(
            "energy-value",
            String(
                latestEnergy
            )
        );


        setText(
            "energy-score",
            String(
                latestEnergy * 10
            )
        );
    }


    /* ======================================================
       FOCUS
       ====================================================== */

    get("focus-btn")
        ?.addEventListener(
            "click",
            async function () {

                const button =
                    get("focus-btn");


                if (!focusActive) {

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
                        "Focus Mode is active. Your routine clock will continue running."
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
                    "Focus session complete."
                );
            }
        );


    /* ======================================================
       CIRCLE MANAGEMENT TABS
       ====================================================== */

    const joinRequestsTab =
        get(
            "join-requests-tab"
        );


    const createCircleTab =
        get(
            "create-circle-tab"
        );


    const joinRequestsPanel =
        get(
            "join-requests-panel"
        );


    const createCirclePanel =
        get(
            "create-circle-panel"
        );


    function showJoinRequests() {

        if (
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
            ?.classList
            .add(
                "active-management-tab"
            );


        createCircleTab
            ?.classList
            .remove(
                "active-management-tab"
            );
    }


    function showCreateCircle() {

        if (
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
            ?.classList
            .add(
                "active-management-tab"
            );


        joinRequestsTab
            ?.classList
            .remove(
                "active-management-tab"
            );
    }


    joinRequestsTab
        ?.addEventListener(
            "click",
            showJoinRequests
        );


    createCircleTab
        ?.addEventListener(
            "click",
            showCreateCircle
        );


    /* ======================================================
       MEMBERSHIPS
       ====================================================== */

    async function getMemberships() {

        const result =
            await supabaseClient
                .from("circle_members")
                .select(
                    "circle_id, role, joined_at"
                )
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
            result.data ||
            []
        );
    }


    async function getCircles() {

        const result =
            await supabaseClient
                .from("circles")
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


        if (result.error) {

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

                        return {

                            ...circle,

                            role:
                                circle.created_by ===
                                currentUser.id

                                    ? "owner"

                                    : membershipMap.get(
                                        circle.id
                                    )?.role ||
                                    "member"

                        };
                    }
                );


        const saved =
            sessionStorage.getItem(
                "circlesync-active-circle"
            );


        activeCircle =
            myCircles.find(
                function (circle) {

                    return (
                        circle.id ===
                        saved
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
            get(
                "my-circles-scroll"
            );


        if (!container) {
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


                button.textContent =

                    circle.name +

                    (
                        circle.role ===
                        "owner"

                            ? " ★"

                            : ""
                    );


                if (
                    activeCircle?.id ===
                    circle.id
                ) {

                    button.classList.add(
                        "active-circle-chip"
                    );
                }


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

        const leaveButton =
            get(
                "leave-circle-btn"
            );


        if (!activeCircle) {

            setText(
                "circle-name",
                "No Circle Selected"
            );


            setText(
                "circle-description",
                "Create a circle or request to join one."
            );


            if (leaveButton) {

                leaveButton.hidden =
                    true;
            }


            await loadCircleFeed();

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


        if (leaveButton) {

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

        const list =
            get(
                "circle-list"
            );


        if (!list) {
            return;
        }


        if (!activeCircle) {

            list.innerHTML =
                "<li>Select a circle to view members.</li>";

            return;
        }


        const result =
            await supabaseClient
                .from(
                    "circle_member_profiles"
                )
                .select(
                    "user_id, username, role"
                )
                .eq(
                    "circle_id",
                    activeCircle.id
                );


        list.innerHTML =
            "";


        if (result.error) {

            console.error(
                "Member profile error:",
                result.error
            );


            list.innerHTML =
                "<li>Unable to load members.</li>";

            return;
        }


        const members =
            result.data ||
            [];


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


                const username =
                    member.username ||
                    "circlesync_user";


                item.textContent =

                    "@" +
                    username +
                    " — " +
                    member.role +

                    (
                        member.user_id ===
                        currentUser.id

                            ? " (You)"

                            : ""
                    );


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


                if (result.error) {

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


    /* ======================================================
       CREATE CIRCLE
       ====================================================== */

    get("create-circle-btn")
        ?.addEventListener(
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
                    nameInput?.value
                        .trim();


                if (!name) {

                    setText(
                        "create-circle-message",
                        "Enter a circle name."
                    );

                    return;
                }


                const result =
                    await supabaseClient
                        .from("circles")
                        .insert({

                            name,

                            description:
                                descriptionInput
                                    ?.value
                                    .trim() ||
                                "",

                            created_by:
                                currentUser.id,

                            is_public:
                                true

                        })
                        .select()
                        .single();


                if (result.error) {

                    setText(
                        "create-circle-message",
                        result.error.message
                    );

                    return;
                }


                if (nameInput) {
                    nameInput.value =
                        "";
                }


                if (descriptionInput) {
                    descriptionInput.value =
                        "";
                }


                sessionStorage.setItem(
                    "circlesync-active-circle",
                    result.data.id
                );


                setText(
                    "create-circle-message",
                    result.data.name +
                    " created."
                );


                await Promise.all([

                    loadMyCircles(),

                    loadDiscoverGroups(),

                    loadOwnerRequests()

                ]);


                showJoinRequests();
            }
        );


    /* ======================================================
       DISCOVER GROUPS
       ====================================================== */

    async function loadDiscoverGroups() {

        const container =
            get(
                "discover-groups"
            );


        if (!container) {
            return;
        }


        const [
            circles,
            memberships,
            requestsResult
        ] =
            await Promise.all([

                getCircles(),

                getMemberships(),

                supabaseClient
                    .from(
                        "circle_join_requests"
                    )
                    .select(
                        "circle_id, status, created_at"
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

                        return (
                            item.circle_id
                        );
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
            publicCircles.length === 0
        ) {

            container.innerHTML =
                '<p class="empty-text">No public circles are available.</p>';

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


                const request =
                    requestMap.get(
                        circle.id
                    );


                if (
                    circle.created_by ===
                    currentUser.id
                ) {

                    button.textContent =
                        "Your Circle ✓";


                    button.disabled =
                        true;

                } else if (
                    membershipIds.has(
                        circle.id
                    )
                ) {

                    button.textContent =

                        activeCircle?.id ===
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


                            if (!selected) {
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
                    request?.status ===
                    "pending"
                ) {

                    button.textContent =
                        "Request Pending";


                    button.disabled =
                        true;

                } else {

                    button.textContent =

                        request?.status ===
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


                            if (result.error) {

                                button.disabled =
                                    false;


                                button.textContent =
                                    "Request to Join";


                                recommend(
                                    result.error.message
                                );

                                return;
                            }


                            button.textContent =
                                "Request Pending";


                            recommend(

                                "Your request was sent to the creator of " +

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
        ?.addEventListener(
            "click",
            loadDiscoverGroups
        );


    /* ======================================================
       OWNER JOIN REQUESTS
       ====================================================== */

    async function loadOwnerRequests() {

        const container =
            get(
                "join-requests-list"
            );


        if (!container) {
            return;
        }


        const owned =
            myCircles.filter(
                function (circle) {

                    return (
                        circle.created_by ===
                        currentUser.id
                    );
                }
            );


        if (
            owned.length === 0
        ) {

            setText(
                "request-count",
                "0"
            );


            container.innerHTML =
                '<p class="empty-text">Create a circle to receive requests.</p>';

            return;
        }


        const result =
            await supabaseClient
                .from(
                    "circle_join_request_feed"
                )
                .select(

                    "id, circle_id, requester_id, requester_username, status, created_at"

                )
                .in(

                    "circle_id",

                    owned.map(
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


        if (result.error) {

            console.error(
                "Join request error:",
                result.error
            );


            container.innerHTML =
                '<p class="empty-text">Unable to load join requests.</p>';

            return;
        }


        const requests =
            result.data ||
            [];


        setText(
            "request-count",
            String(
                requests.length
            )
        );


        container.innerHTML =
            "";


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
                    owned.find(
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


                const username =
                    request.requester_username ||
                    "circlesync_user";


                info.textContent =

                    "@" +
                    username +
                    " wants to join " +

                    (
                        circle?.name ||
                        "your circle"
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


                accept.textContent =
                    "Accept";


                const decline =
                    document.createElement(
                        "button"
                    );


                decline.type =
                    "button";


                decline.textContent =
                    "Decline";


                decline.className =
                    "danger-outline";


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


                    if (response.error) {

                        accept.disabled =
                            false;


                        decline.disabled =
                            false;


                        recommend(
                            response.error.message
                        );

                        return;
                    }


                    row.remove();


                    await Promise.all([

                        loadOwnerRequests(),

                        loadMyCircles(),

                        loadDiscoverGroups()

                    ]);


                    recommend(

                        approve

                            ? "@" +
                              username +
                              " was accepted into " +
                              (
                                  circle?.name ||
                                  "the circle"
                              ) +
                              "."

                            : "@" +
                              username +
                              "'s request was declined."

                    );
                }


                accept.addEventListener(
                    "click",
                    function () {

                        respond(
                            true
                        );
                    }
                );


                decline.addEventListener(
                    "click",
                    function () {

                        respond(
                            false
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


    /* ======================================================
       SEND MESSAGE
       ====================================================== */

    get("send-message-btn")
        ?.addEventListener(
            "click",
            async function () {

                if (!activeCircle) {

                    setText(
                        "feed-message",
                        "Select a circle first."
                    );

                    return;
                }


                const input =
                    get(
                        "circle-message"
                    );


                const message =
                    input?.value
                        .trim();


                if (!message) {
                    return;
                }


                const button =
                    get(
                        "send-message-btn"
                    );


                button.disabled =
                    true;


                button.textContent =
                    "Sending...";


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

                            message

                        });


                button.disabled =
                    false;


                button.textContent =
                    "Send";


                if (result.error) {

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


    function checkInLabel(
        type
    ) {

        const labels = {

            wake:
                "☀️ Woke up",

            breakfast:
                "🍳 Ate breakfast",

            lunch:
                "🥗 Ate lunch",

            rest:
                "😴 Took a rest",

            dinner:
                "🍽 Ate dinner",

            sleep:
                "🌙 Went to sleep",

            focus:
                "💻 Working / Focus"

        };


        return (
            labels[type] ||
            "✓ Check-In"
        );
    }


    /* ======================================================
       CIRCLE FEED
       ====================================================== */

    async function loadCircleFeed() {

        const feed =
            get(
                "circle-feed"
            );


        if (!feed) {
            return;
        }


        if (!activeCircle) {

            feed.innerHTML =
                '<p class="empty-text">Select a circle to view activity.</p>';

            return;
        }


        const [
            messages,
            checks
        ] =
            await Promise.all([

                supabaseClient
                    .from(
                        "circle_message_feed"
                    )
                    .select(
                        "user_id, username, message, created_at"
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
                        "circle_checkin_feed"
                    )
                    .select(
                        "user_id, username, check_in_type, created_at"
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
                    .limit(50)

            ]);


        if (messages.error) {

            console.error(
                "Message feed error:",
                messages.error
            );
        }


        if (checks.error) {

            console.error(
                "Check-in feed error:",
                checks.error
            );
        }


        const items =
            [];


        (
            messages.data ||
            []
        ).forEach(
            function (message) {

                items.push({

                    userId:
                        message.user_id,

                    username:
                        message.username,

                    text:
                        "💬 " +
                        message.message,

                    createdAt:
                        message.created_at

                });
            }
        );


        (
            checks.data ||
            []
        ).forEach(
            function (check) {

                items.push({

                    userId:
                        check.user_id,

                    username:
                        check.username,

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
            function (
                first,
                second
            ) {

                return (

                    new Date(
                        second.createdAt
                    )

                    -

                    new Date(
                        first.createdAt
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


                const username =
                    item.username ||
                    "circlesync_user";


                user.textContent =

                    "@" +
                    username +

                    (
                        item.userId ===
                        currentUser.id

                            ? " (You)"

                            : ""
                    );


                const time =
                    document.createElement(
                        "span"
                    );


                time.textContent =
                    new Date(
                        item.createdAt
                    )
                        .toLocaleString(
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
       REALTIME
       ====================================================== */

    function startRealtime() {

        realtimeChannel =
            supabaseClient
                .channel(
                    "circlesync-v84-2-" +
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
                            "check_ins"

                    },
                    async function () {

                        await refreshRecentCheckIns();


                        updateRoutineDisplays();


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
                            "profiles"

                    },
                    async function () {

                        await Promise.all([

                            loadCircleMembers(),

                            loadCircleFeed(),

                            loadOwnerRequests()

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
       AUDIO UNLOCK
       ====================================================== */

    document.addEventListener(
        "pointerdown",
        async function unlockAudio() {

            try {

                await prepareAudio();


                console.log(
                    "CircleSync audio engine ready."
                );

            } catch (error) {

                console.warn(
                    "Audio unlock:",
                    error
                );
            }
        },
        {
            once:
                true
        }
    );


    /* ======================================================
       INITIAL LOAD
       ====================================================== */

    await Promise.all([

        loadRoutine(),

        loadLatestEnergy()

    ]);


    await refreshRecentCheckIns();


    await loadMyCircles();


    await Promise.all([

        loadDiscoverGroups(),

        loadOwnerRequests(),

        loadCircleFeed()

    ]);


    updateRoutineDisplays();


    startRealtime();


    /* ======================================================
       VISUAL CLOCK
       ====================================================== */

    setInterval(
        function () {

            updateRoutineDisplays();

        },
        1000
    );


    /* ======================================================
       ALARM CHECKER
       ====================================================== */

    setInterval(
        async function () {

            try {

                await checkForDueAlarm();

            } catch (error) {

                console.error(
                    "Alarm engine error:",
                    error
                );
            }

        },
        5000
    );


    await checkForDueAlarm();


    console.log(
        "CircleSync dashboard v84.2 ready."
    );
}
