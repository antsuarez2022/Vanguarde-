"use strict";

console.log("CircleSync app.js v79 loaded");


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


/* ==========================================================
   START APPLICATION
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
        !signinForm ||
        !signupForm
    ) {

        console.error(
            "CircleSync authentication HTML is incomplete."
        );

        return;
    }


    function showAuthMessage(
        text,
        isError
    ) {

        if (!authMessage) {

            return;
        }


        authMessage.textContent =
            text;


        authMessage.className =
            isError

                ? "status error-message"

                : "status success-message";
    }


    signinTab?.addEventListener(
        "click",
        function () {

            signinSection.hidden =
                false;

            signupSection.hidden =
                true;


            signinTab.classList.add(
                "active-tab"
            );


            signupTab?.classList.remove(
                "active-tab"
            );

        }
    );


    signupTab?.addEventListener(
        "click",
        function () {

            signinSection.hidden =
                true;

            signupSection.hidden =
                false;


            signupTab.classList.add(
                "active-tab"
            );


            signinTab?.classList.remove(
                "active-tab"
            );

        }
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


            try {

                const result =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email:
                                email,

                            password:
                                password

                        });


                if (result.error) {

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

                button.disabled =
                    false;


                button.textContent =
                    "Sign In";
            }

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
                    "Enter an email address.",
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


                if (result.error) {

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
                    "Account created. If email confirmation is enabled, check your email. Otherwise you can sign in now.",
                    false
                );


            } catch (error) {

                console.error(
                    "Sign-up error:",
                    error
                );


                showAuthMessage(
                    "Unable to create your account.",
                    true
                );


            } finally {

                button.disabled =
                    false;


                button.textContent =
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


    function setText(
        id,
        text
    ) {

        const element =
            get(id);


        if (element) {

            element.textContent =
                text;
        }
    }


    function recommend(text) {

        setText(
            "recommendation",
            text
        );
    }


    /* ======================================================
       STATE
       ====================================================== */

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


    let monitorBusy =
        false;


    const firedAlerts =
        new Set();


    /* ======================================================
       SESSION
       ====================================================== */

    const sessionResult =
        await supabaseClient.auth
            .getSession();


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
       AUDIO
       ====================================================== */

    async function prepareAudio() {

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContextClass) {

            throw new Error(
                "This browser does not support Web Audio."
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


        master.gain.setValueAtTime(
            0.0001,
            now
        );


        master.gain.exponentialRampToValueAtTime(
            0.14,
            now + 0.08
        );


        master.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 2.5
        );


        master.connect(
            audioContext.destination
        );


        const frequencies = [

            523.25,

            659.25,

            783.99

        ];


        frequencies.forEach(
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
                    index * 0.20
                );


                oscillator.stop(
                    now +
                    1.5 +
                    index * 0.20
                );

            }
        );
    }


    /* ======================================================
       ALARM CONTROL BUTTON
       ====================================================== */

    function updateAlarmControlUI() {

        const button =
            get("alarm-settings-btn");


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
                "Routine alarms are ON. CircleSync alerts you 5 minutes before your routine and again 40 minutes afterward only if the matching Quick Check-In has not been completed."
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


    async function enableRoutineAlarms() {

        const button =
            get("alarm-settings-btn");


        if (!button) {

            return;
        }


        button.disabled =
            true;


        button.textContent =
            "Starting Routine Alarms...";


        try {

            const started =
                await prepareAudio();


            if (!started) {

                throw new Error(
                    "Audio did not start."
                );
            }


            alarmsEnabled =
                true;


            localStorage.setItem(
                "circlesync-alarms-enabled",
                "true"
            );


            updateAlarmControlUI();


            /*
             * Confirmation tone so the user knows
             * the button actually worked.
             */

            playSoftChime();


            recommend(
                "Routine alarms are now enabled. The countdown clock in the top-right corner is tracking your next alert. A matching Quick Check-In will stop its alarm and prevent its 40-minute follow-up."
            );


            await updateAlarmEngine();


        } catch (error) {

            console.error(
                "Enable alarm error:",
                error
            );


            alarmsEnabled =
                false;


            localStorage.setItem(
                "circlesync-alarms-enabled",
                "false"
            );


            setText(
                "alarm-status",
                "CircleSync could not activate the alarm sound. Click somewhere on the page, then try Enable Routine Alarms again."
            );


            recommend(
                "The alarm sound could not start. Interact with the page once and then press Enable Routine Alarms again."
            );


        } finally {

            button.disabled =
                false;


            updateAlarmControlUI();
        }
    }


    function disableRoutineAlarms() {

        alarmsEnabled =
            false;


        localStorage.setItem(
            "circlesync-alarms-enabled",
            "false"
        );


        stopAlarm();


        updateAlarmControlUI();


        recommend(
            "Routine alarms are off. Your routine and check-ins will still be saved in CircleSync."
        );
    }


    get("alarm-settings-btn")
        ?.addEventListener(
            "click",
            async function () {

                console.log(
                    "CircleSync alarm button pressed."
                );


                if (alarmsEnabled) {

                    disableRoutineAlarms();

                } else {

                    await enableRoutineAlarms();
                }

            }
        );


    updateAlarmControlUI();


    /* ======================================================
       ACTIVE ALARM
       ====================================================== */

    function startAlarm(
        routineType,
        title,
        stage
    ) {

        if (!alarmsEnabled) {

            return;
        }


        if (
            activeAlarm &&
            activeAlarm.type ===
                routineType &&
            activeAlarm.stage ===
                stage
        ) {

            return;
        }


        stopAlarm();


        activeAlarm = {

            type:
                routineType,

            title:
                title,

            stage:
                stage

        };


        const widget =
            get("routine-alarm-widget");


        widget?.classList.add(
            "alarm-active"
        );


        setText(
            "alarm-label",
            stage === "before"

                ? "Starting Soon"

                : "Check-In Needed"
        );


        setText(
            "alarm-title",
            title
        );


        setText(
            "alarm-countdown",
            stage === "before"

                ? "5 MINUTES"

                : "40 MINUTES OVERDUE"
        );


        playSoftChime();


        alarmRepeatTimer =
            setInterval(
                function () {

                    playSoftChime();

                },
                12000
            );


        if (
            stage === "before"
        ) {

            recommend(
                title +
                " is coming up in about 5 minutes. Start creating a stopping point so your current task does not override your routine."
            );


        } else {

            recommend(
                title +
                " was scheduled at least 40 minutes ago and CircleSync still does not see the matching Quick Check-In. Complete it when you can and use its check-in button to silence this alarm."
            );
        }
    }


    function stopAlarm(
        routineType = null
    ) {

        if (
            routineType &&
            activeAlarm &&
            activeAlarm.type !==
                routineType
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


        get("routine-alarm-widget")
            ?.classList
            .remove(
                "alarm-active"
            );
    }


    /* ======================================================
       ROUTINE TIME HELPERS
       ====================================================== */

    function timeToday(value) {

        if (!value) {

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

        if (!currentRoutine) {

            return [];
        }


        const items = [

            {
                type:
                    "wake",

                title:
                    "☀️ Wake Up",

                time:
                    currentRoutine.wake_time
            },

            {
                type:
                    "breakfast",

                title:
                    "🍳 Breakfast",

                time:
                    currentRoutine.breakfast_time
            },

            {
                type:
                    "lunch",

                title:
                    "🥗 Lunch",

                time:
                    currentRoutine.lunch_time
            },

            {
                type:
                    "rest",

                title:
                    "😴 Rest",

                time:
                    currentRoutine.rest_start_time
            },

            {
                type:
                    "dinner",

                title:
                    "🍽 Dinner",

                time:
                    currentRoutine.dinner_time
            },

            {
                type:
                    "sleep",

                title:
                    "🌙 Bedtime",

                time:
                    currentRoutine.bedtime
            }

        ];


        return items

            .filter(
                function (item) {

                    return Boolean(
                        item.time
                    );
                }
            )

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
            );
    }


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


        const hours =
            Math.floor(
                totalSeconds /
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


        if (hours > 0) {

            return (

                String(hours)
                    .padStart(2, "0")

                +

                ":"

                +

                String(minutes)
                    .padStart(2, "0")

                +

                ":"

                +

                String(seconds)
                    .padStart(2, "0")

            );
        }


        return (

            String(minutes)
                .padStart(2, "0")

            +

            ":"

            +

            String(seconds)
                .padStart(2, "0")

        );
    }


    function todayAlertKey(
        type,
        stage
    ) {

        const now =
            new Date();


        return [

            now.getFullYear(),

            now.getMonth(),

            now.getDate(),

            type,

            stage

        ].join("-");
    }


    /* ======================================================
       TODAY'S CHECK-INS
       ====================================================== */

    async function completedToday() {

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


        if (result.error) {

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
       ALARM ENGINE

       5 MINUTES BEFORE

       40 MINUTES AFTER ONLY WHEN THERE IS
       NO MATCHING SUPABASE CHECK-IN
       ====================================================== */

    async function updateAlarmEngine() {

        if (monitorBusy) {

            return;
        }


        monitorBusy =
            true;


        try {

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


            /*
             * If the user checked in from another tab/device,
             * stop the corresponding alarm too.
             */

            if (
                activeAlarm &&
                completed.has(
                    activeAlarm.type
                )
            ) {

                stopAlarm(
                    activeAlarm.type
                );
            }


            /*
             * FIRE ALERTS.
             */

            if (alarmsEnabled) {

                for (
                    const item
                    of items
                ) {

                    /*
                     * This is the key protection for the
                     * 40-minute requirement.
                     *
                     * If the matching check-in exists,
                     * CircleSync skips BOTH alarm checks.
                     */

                    if (
                        completed.has(
                            item.type
                        )
                    ) {

                        continue;
                    }


                    const minutesUntil =
                        (
                            item.scheduled.getTime() -
                            now.getTime()
                        ) /
                        60000;


                    /* ======================================
                       FIVE-MINUTE ALERT
                       ====================================== */

                    if (
                        minutesUntil <= 5 &&
                        minutesUntil > 0
                    ) {

                        const key =
                            todayAlertKey(
                                item.type,
                                "before"
                            );


                        if (
                            !firedAlerts.has(
                                key
                            )
                        ) {

                            firedAlerts.add(
                                key
                            );


                            startAlarm(
                                item.type,
                                item.title,
                                "before"
                            );


                            break;
                        }
                    }


                    /* ======================================
                       40-MINUTE ALERT

                       ONLY reaches this code if the user
                       has NOT checked in.
                       ====================================== */

                    if (
                        minutesUntil <= -40
                    ) {

                        const key =
                            todayAlertKey(
                                item.type,
                                "overdue"
                            );


                        if (
                            !firedAlerts.has(
                                key
                            )
                        ) {

                            /*
                             * Recheck Supabase directly
                             * immediately before sounding.
                             */

                            const latestCompleted =
                                await completedToday();


                            if (
                                latestCompleted.has(
                                    item.type
                                )
                            ) {

                                continue;
                            }


                            firedAlerts.add(
                                key
                            );


                            startAlarm(
                                item.type,
                                item.title,
                                "overdue"
                            );


                            break;
                        }
                    }
                }
            }


            /*
             * Active alarm owns the floating display.
             */

            if (activeAlarm) {

                return;
            }


            /* ==============================================
               FIND NEXT ALERT FOR COUNTDOWN DISPLAY
               ============================================== */

            const possibleAlerts =
                [];


            items.forEach(
                function (item) {

                    if (
                        completed.has(
                            item.type
                        )
                    ) {

                        return;
                    }


                    const beforeAlert =
                        new Date(
                            item.scheduled
                                .getTime()
                            -
                            5 *
                            60 *
                            1000
                        );


                    const overdueAlert =
                        new Date(
                            item.scheduled
                                .getTime()
                            +
                            40 *
                            60 *
                            1000
                        );


                    if (
                        beforeAlert >
                        now
                    ) {

                        possibleAlerts.push({

                            title:
                                item.title,

                            stage:
                                "before",

                            alertTime:
                                beforeAlert

                        });


                    } else if (
                        overdueAlert >
                        now
                    ) {

                        possibleAlerts.push({

                            title:
                                item.title,

                            stage:
                                "overdue",

                            alertTime:
                                overdueAlert

                        });
                    }

                }
            );


            possibleAlerts.sort(
                function (a, b) {

                    return (
                        a.alertTime -
                        b.alertTime
                    );
                }
            );


            const nextAlert =
                possibleAlerts[0];


            if (!nextAlert) {

                setText(
                    "alarm-label",
                    "Routine Complete"
                );


                setText(
                    "alarm-title",
                    "No more alerts today"
                );


                setText(
                    "alarm-countdown",
                    "✓"
                );


                return;
            }


            setText(
                "alarm-label",
                nextAlert.stage ===
                    "before"

                    ? "Next 5-Min Alert"

                    : "Potential 40-Min Alert"
            );


            setText(
                "alarm-title",
                nextAlert.title
            );


            setText(
                "alarm-countdown",
                formatCountdown(
                    nextAlert.alertTime -
                    now
                )
            );


        } catch (error) {

            console.error(
                "Alarm engine error:",
                error
            );


        } finally {

            monitorBusy =
                false;
        }
    }


    /* ======================================================
       ROUTINE FORM
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


        if (result.error) {

            console.error(
                "Routine load error:",
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


        if (routineElements.goal) {

            routineElements.goal.value =
                currentRoutine
                    .sleep_goal_hours ||
                8;
        }
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


                if (result.error) {

                    setText(
                        "routine-message",
                        result.error.message
                    );


                    return;
                }


                currentRoutine =
                    result.data;


                firedAlerts.clear();


                setText(
                    "routine-message",
                    "Routine saved. Countdown alarms updated."
                );


                recommend(
                    "Your schedule has been updated. The floating countdown now reflects your new routine."
                );


                await Promise.all([

                    updateRoutineDisplay(),

                    updateAlarmEngine()

                ]);

            }
        );


    /* ======================================================
       NEXT UP + RECOMMENDATIONS
       ====================================================== */

    async function updateRoutineDisplay() {

        if (!currentRoutine) {

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
                                now &&
                            !completed.has(
                                item.type
                            )
                        );
                    }
                )
                .pop();


        if (overdue) {

            const minutes =
                Math.max(
                    0,
                    Math.floor(
                        (
                            now -
                            overdue.scheduled
                        ) /
                        60000
                    )
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
                minutes >= 40
            ) {

                recommend(
                    overdue.title +
                    " is " +
                    minutes +
                    " minutes past your planned time and you still have not checked in. Complete it when you can and press its Quick Check-In button to clear the alert."
                );


            } else {

                recommend(
                    overdue.title +
                    " is " +
                    minutes +
                    " minutes past your planned time. CircleSync will only sound the 40-minute follow-up if the matching Quick Check-In is still missing."
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


        if (next) {

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


            if (
                minutes < 60
            ) {

                setText(
                    "next-up-countdown",
                    "In " +
                    minutes +
                    " minutes"
                );


            } else {

                setText(
                    "next-up-countdown",
                    "In " +
                    Math.floor(
                        minutes /
                        60
                    ) +
                    "h " +
                    (
                        minutes %
                        60
                    ) +
                    "m"
                );
            }


            if (
                minutes <= 15
            ) {

                recommend(
                    next.title +
                    " is approaching. Start creating a stopping point now so your current responsibility does not push your routine aside."
                );


            } else if (
                latestEnergy !== null &&
                latestEnergy <= 3
            ) {

                recommend(
                    "Your latest energy check-in is low. Protect your next meal or rest period instead of simply pushing through the fatigue."
                );


            } else {

                recommend(
                    "Your routine is currently on track. The floating countdown clock is tracking your next alarm."
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
            "You have reached the end of today's routine. Review what worked and try to repeat the timing tomorrow."
        );
    }


    /* ======================================================
       QUICK CHECK-INS
       ====================================================== */

    async function saveCheckIn(
        type,
        successMessage
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


        if (result.error) {

            recommend(
                "Check-in failed: " +
                result.error.message
            );


            return false;
        }


        /*
         * Matching check-in immediately stops
         * its active alarm.
         */

        stopAlarm(type);


        recommend(
            successMessage
        );


        await Promise.all([

            updateRoutineDisplay(),

            updateAlarmEngine(),

            loadCircleFeed()

        ]);


        return true;
    }


    const quickChecks = [

        [
            "breakfast-btn",

            "breakfast",

            "Breakfast recorded. Its alarm is cleared and today's 40-minute breakfast follow-up is cancelled."
        ],

        [
            "lunch-btn",

            "lunch",

            "Lunch recorded. Its alarm is cleared and today's 40-minute lunch follow-up is cancelled."
        ],

        [
            "dinner-btn",

            "dinner",

            "Dinner recorded. Its alarm is cleared and today's 40-minute dinner follow-up is cancelled."
        ],

        [
            "rest-btn",

            "rest",

            "Rest recorded. Its alarm is cleared and today's 40-minute rest follow-up is cancelled."
        ],

        [
            "working-btn",

            "focus",

            "Working status recorded. Stay focused, but keep the countdown clock visible."
        ],

        [
            "sleep-btn",

            "sleep",

            "Bedtime recorded. Your bedtime alarm is cleared for tonight."
        ],

        [
            "wake-btn",

            "wake",

            "Wake-up recorded. Your wake alarm is cleared. Check your breakfast schedule next."
        ]

    ];


    quickChecks.forEach(
        function (configuration) {

            const button =
                get(
                    configuration[0]
                );


            if (!button) {

                return;
            }


            button.addEventListener(
                "click",
                async function () {

                    /*
                     * User interaction also makes sure
                     * Chrome allows audio.
                     */

                    try {

                        await prepareAudio();

                    } catch (error) {

                        console.warn(
                            "Audio preparation:",
                            error
                        );
                    }


                    button.disabled =
                        true;


                    await saveCheckIn(
                        configuration[1],
                        configuration[2]
                    );


                    button.disabled =
                        false;

                }
            );

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
                        level *
                        10
                    )
                );


                if (
                    level <= 3
                ) {

                    recommend(
                        "Your energy is low. Check whether food, rest, or sleep should become your next priority."
                    );


                } else if (
                    level <= 6
                ) {

                    recommend(
                        "Your energy is moderate. Protect your next meal or rest period before your energy drops further."
                    );


                } else {

                    recommend(
                        "Your energy is strong. Use it productively, but do not let deep focus override your scheduled routine."
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
                latestEnergy *
                10
            )
        );
    }


    /* ======================================================
       FOCUS MODE
       ====================================================== */

    get("focus-btn")
        ?.addEventListener(
            "click",
            async function () {

                const button =
                    get("focus-btn");


                try {

                    await prepareAudio();

                } catch (error) {

                    console.warn(
                        error
                    );
                }


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
                        "Focus Mode is active. The floating countdown will keep tracking your routine while you work."
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
                          " minutes. Before another long session, check the countdown and consider food, water, movement, or rest."

                        : "Focus session complete. Check Next Up before beginning another task."
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


    function showCreateCircleTab() {

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
            showJoinRequestsTab
        );


    createCircleTab
        ?.addEventListener(
            "click",
            showCreateCircleTab
        );


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


        if (result.error) {

            console.error(
                "Membership query:",
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


        if (result.error) {

            console.error(
                "Circle query:",
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


        if (activeCircle) {

            sessionStorage.setItem(
                "circlesync-active-circle",
                activeCircle.id
            );
        }


        renderCircleSwitcher();


        await renderActiveCircle();
    }


    function renderCircleSwitcher() {

        const container =
            get("my-circles-scroll");


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
                    activeCircle &&
                    activeCircle.id ===
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
            get("leave-circle-btn");


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


            const memberList =
                get("circle-list");


            if (memberList) {

                memberList.innerHTML =
                    "<li>No members loaded.</li>";
            }


            const feed =
                get("circle-feed");


            if (feed) {

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


    async function loadCircleMembers() {

        if (!activeCircle) {

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


        if (!list) {

            return;
        }


        list.innerHTML =
            "";


        if (result.error) {

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


                const confirmed =
                    window.confirm(
                        "Leave " +
                        activeCircle.name +
                        "?"
                    );


                if (!confirmed) {

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
                    nameInput
                        .value
                        .trim();


                const description =
                    descriptionInput
                        .value
                        .trim();


                if (!name) {

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
                                description,

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


                if (result.error) {

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
                    " has been created. Other CircleSync users can now request to join."
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


        if (!container) {

            return;
        }


        container.innerHTML =
            '<p class="empty-text">Loading available groups...</p>';


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
            requestResult.data ||
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


                const isOwner =
                    circle.created_by ===
                    currentUser.id;


                const isMember =
                    membershipIds.has(
                        circle.id
                    );


                const request =
                    requestMap.get(
                        circle.id
                    );


                if (isOwner) {

                    button.textContent =
                        "Your Circle ✓";


                    button.disabled =
                        true;


                } else if (isMember) {

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


                            if (result.error) {

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


                            recommend(
                                "Your request to join " +
                                circle.name +
                                " was sent to its creator."
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
            get("join-requests-list");


        if (!container) {

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


        if (result.error) {

            container.innerHTML =
                '<p class="error-message">Unable to load join requests.</p>';


            console.error(
                result.error
            );


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


                const information =
                    document.createElement(
                        "div"
                    );


                information.textContent =
                    "A CircleSync user wants to join " +
                    (
                        circle
                            ? circle.name
                            : "your circle"
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


                    /*
                     * Remove only this request row.
                     * Circle-management section stays.
                     */

                    row.remove();


                    recommend(
                        approve

                            ? "Join request accepted. The user is now a member of the circle."

                            : "Join request declined."
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
                    information,
                    actions
                );


                container.appendChild(
                    row
                );

            }
        );
    }


    /* ======================================================
       CIRCLE MESSAGES
       ====================================================== */

    get("send-message-btn")
        ?.addEventListener(
            "click",
            async function () {

                if (!activeCircle) {

                    setText(
                        "feed-message",
                        "Select a circle before sending a message."
                    );


                    return;
                }


                const input =
                    get("circle-message");


                const message =
                    input
                        .value
                        .trim();


                if (!message) {

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


        if (!feed) {

            return;
        }


        if (!activeCircle) {

            feed.innerHTML =
                '<p class="empty-text">Select a circle to view activity.</p>';


            return;
        }


        const [
            messagesResult,
            checkResult
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


        const items =
            [];


        (
            messagesResult.data ||
            []
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
            checkResult.data ||
            []
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
       REALTIME
       ====================================================== */

    function startRealtime() {

        realtimeChannel =
            supabaseClient
                .channel(
                    "circlesync-v79-" +
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
                            "check_ins"

                    },
                    async function () {

                        await Promise.all([

                            loadCircleFeed(),

                            updateRoutineDisplay(),

                            updateAlarmEngine()

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

       Chrome requires user interaction before audio.
       First click/tap anywhere prepares the AudioContext.
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


    await loadMyCircles();


    await Promise.all([

        loadDiscoverGroups(),

        loadOwnerRequests(),

        updateRoutineDisplay(),

        updateAlarmEngine()

    ]);


    startRealtime();


    /*
     * Alarm countdown:
     *
     * once per second for the visual timer.
     *
     * monitorBusy prevents overlapping Supabase queries.
     */

    setInterval(
        async function () {

            await updateAlarmEngine();

        },
        1000
    );


    /*
     * Recommendations / Next Up do not need
     * to refresh every second.
     */

    setInterval(
        async function () {

            await updateRoutineDisplay();

        },
        30000
    );


    console.log(
        "CircleSync dashboard v79 ready."
    );
}
