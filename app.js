"use strict";

console.log("CircleSync app.js v78 loaded");


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
   AUTH
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
        return;
    }


    function showMessage(
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

            signupTab.classList.remove(
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

            signinTab.classList.remove(
                "active-tab"
            );

        }
    );


    const session =
        await supabaseClient.auth.getSession();


    if (
        session.data &&
        session.data.session
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

                showMessage(
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

                showMessage(
                    "Enter an email.",
                    true
                );

                return;
            }


            if (
                password.length < 6
            ) {

                showMessage(
                    "Password must contain at least 6 characters.",
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

                showMessage(
                    result.error.message,
                    true
                );

                return;
            }


            showMessage(
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


    let countdownTimer =
        null;


    const firedAlerts =
        new Set();


    /* ======================================================
       BASIC HELPERS
       ====================================================== */

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


    function recommend(
        text
    ) {

        setText(
            "recommendation",
            text
        );
    }


    /* ======================================================
       AUTH SESSION
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
       WEB AUDIO
       ====================================================== */

    async function prepareAudio() {

        if (!audioContext) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();
        }


        if (
            audioContext.state ===
            "suspended"
        ) {

            await audioContext.resume();
        }
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


        const masterGain =
            audioContext.createGain();


        masterGain.gain.setValueAtTime(
            0.0001,
            now
        );


        masterGain.gain.exponentialRampToValueAtTime(
            0.13,
            now + 0.08
        );


        masterGain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 2.2
        );


        masterGain.connect(
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
                    audioContext.createOscillator();


                const gain =
                    audioContext.createGain();


                oscillator.type =
                    "sine";


                oscillator.frequency.value =
                    frequency;


                gain.gain.value =
                    0.3;


                oscillator.connect(
                    gain
                );


                gain.connect(
                    masterGain
                );


                oscillator.start(
                    now +
                    index * 0.18
                );


                oscillator.stop(
                    now +
                    1.6 +
                    index * 0.18
                );

            }
        );
    }


    /* ======================================================
       ALARM ON / OFF
       ====================================================== */

    async function enableAlarms() {

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
            "Routine alarms are enabled. The countdown in the top-right corner will alert you 5 minutes before each routine. If you do not complete the matching Quick Check-In, CircleSync will alert you again 40 minutes afterward."
        );
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


        recommend(
            "Routine alarms are off. Your routine and check-ins will still be saved."
        );
    }


    async function toggleAlarms() {

        if (
            alarmsEnabled
        ) {

            disableAlarms();

        } else {

            await enableAlarms();
        }
    }


    function updateAlarmButton() {

        const mainButton =
            get("alarm-settings-btn");


        const widgetButton =
            get("alarm-toggle-btn");


        if (
            alarmsEnabled
        ) {

            if (mainButton) {

                mainButton.textContent =
                    "Disable Routine Alarms";
            }


            if (widgetButton) {

                widgetButton.textContent =
                    "Alarms On";
            }


            setText(
                "alarm-status",
                "Routine alarms are ON. A matching Quick Check-In will stop the alarm and prevent its 40-minute overdue alert."
            );

        } else {

            if (mainButton) {

                mainButton.textContent =
                    "Enable Routine Alarms";
            }


            if (widgetButton) {

                widgetButton.textContent =
                    "Enable Alarms";
            }


            setText(
                "alarm-status",
                "Routine alarms are currently off."
            );
        }
    }


    get("alarm-settings-btn")
        ?.addEventListener(
            "click",
            toggleAlarms
        );


    get("alarm-toggle-btn")
        ?.addEventListener(
            "click",
            toggleAlarms
        );


    updateAlarmButton();


    /* ======================================================
       ALARM ENGINE
       ====================================================== */

    function startAlarm(
        routineType,
        title,
        stage
    ) {

        if (
            !alarmsEnabled
        ) {
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
            get(
                "routine-alarm-widget"
            );


        widget?.classList.add(
            "alarm-active"
        );


        setText(
            "alarm-label",
            stage === "before"
                ? "Routine Starting Soon"
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
                " was scheduled 40 minutes ago and you still have not checked in. Use the matching Quick Check-In when you complete it."
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


        if (
            alarmRepeatTimer
        ) {

            clearInterval(
                alarmRepeatTimer
            );


            alarmRepeatTimer =
                null;
        }


        activeAlarm =
            null;


        const widget =
            get(
                "routine-alarm-widget"
            );


        widget?.classList.remove(
            "alarm-active"
        );
    }


    /* ======================================================
       TIME HELPERS
       ====================================================== */

    function timeToday(
        value
    ) {

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

        if (
            !currentRoutine
        ) {
            return [];
        }


        return [

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

        ]
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


        if (
            hours > 0
        ) {

            return (
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
                    )
            );
        }


        return (
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
                )
        );
    }


    function alertKey(
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
       CHECK TODAY
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


        if (
            result.error
        ) {

            console.error(
                "Check-in query error:",
                result.error
            );


            return new Set();
        }


        return new Set(
            (
                result.data ||
                []
            ).map(
                function (row) {

                    return row.check_in_type;

                }
            )
        );
    }


    /* ======================================================
       COUNTDOWN + 5 MIN / 40 MIN ALARMS
       ====================================================== */

    async function updateAlarmEngine() {

        if (
            !currentRoutine
        ) {

            setText(
                "alarm-label",
                "No Routine"
            );


            setText(
                "alarm-title",
                "Save a routine"
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


        /* --------------------------------------------------
           DETECT ACTIVE ALERTS
           -------------------------------------------------- */

        for (
            const item
            of items
        ) {

            const differenceMs =
                item.scheduled.getTime() -
                now.getTime();


            const differenceMinutes =
                differenceMs /
                60000;


            /*
             * FIVE MINUTES BEFORE.
             *
             * Trigger once between five minutes before
             * and scheduled time.
             */

            if (
                differenceMinutes <= 5 &&
                differenceMinutes > 0
            ) {

                const key =
                    alertKey(
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
                }
            }


            /*
             * FORTY MINUTES AFTER.
             *
             * ONLY when the matching check-in
             * has NOT been completed.
             */

            if (
                differenceMinutes <= -40 &&
                !completed.has(
                    item.type
                )
            ) {

                const key =
                    alertKey(
                        item.type,
                        "overdue"
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
                        "overdue"
                    );
                }
            }
        }


        /* --------------------------------------------------
           SHOW NEXT COUNTDOWN
           -------------------------------------------------- */

        if (
            activeAlarm
        ) {
            return;
        }


        const futureAlerts = [];


        items.forEach(
            function (item) {

                const fiveMinuteAlert =
                    new Date(
                        item.scheduled.getTime() -
                        5 * 60 * 1000
                    );


                if (
                    fiveMinuteAlert >
                    now
                ) {

                    futureAlerts.push({

                        type:
                            item.type,

                        title:
                            item.title,

                        stage:
                            "before",

                        time:
                            fiveMinuteAlert

                    });
                }


                if (
                    !completed.has(
                        item.type
                    )
                ) {

                    const overdueAlert =
                        new Date(
                            item.scheduled.getTime() +
                            40 * 60 * 1000
                        );


                    if (
                        overdueAlert >
                        now
                    ) {

                        futureAlerts.push({

                            type:
                                item.type,

                            title:
                                item.title,

                            stage:
                                "overdue",

                            time:
                                overdueAlert

                        });
                    }
                }

            }
        );


        futureAlerts.sort(
            function (a, b) {

                return (
                    a.time -
                    b.time
                );

            }
        );


        const nextAlert =
            futureAlerts[0];


        if (
            !nextAlert
        ) {

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
                nextAlert.time -
                now
            )
        );
    }


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
                !element
            ) {
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


        if (
            routineElements.goal
        ) {

            routineElements.goal.value =
                currentRoutine.sleep_goal_hours ||
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
                                    routineElements.wake.value ||
                                    null,

                                breakfast_time:
                                    routineElements.breakfast.value ||
                                    null,

                                lunch_time:
                                    routineElements.lunch.value ||
                                    null,

                                dinner_time:
                                    routineElements.dinner.value ||
                                    null,

                                rest_start_time:
                                    routineElements.rest.value ||
                                    null,

                                bedtime:
                                    routineElements.sleep.value ||
                                    null,

                                sleep_goal_hours:
                                    Number(
                                        routineElements.goal.value
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


                firedAlerts.clear();


                setText(
                    "routine-message",
                    "Routine saved. Countdown alarms updated."
                );


                recommend(
                    "Your routine has been updated. The countdown clock in the top-right corner now reflects your new schedule."
                );


                await Promise.all([

                    updateRoutineDisplay(),

                    updateAlarmEngine()

                ]);

            }
        );


    /* ======================================================
       ROUTINE DISPLAY + RECOMMENDATIONS
       ====================================================== */

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
                "Start by entering your wake, meal, rest, and bedtime schedule. CircleSync will then keep your next routine and recommendations near the top of the dashboard."
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
                minutes >= 40
            ) {

                recommend(
                    overdue.title +
                    " is more than 40 minutes past your planned time and there is still no matching Quick Check-In. Complete the activity when you can and tap its check-in button to stop the alarm."
                );

            } else {

                recommend(
                    overdue.title +
                    " is " +
                    minutes +
                    " minutes past your planned time. You still have time before CircleSync's 40-minute follow-up alert."
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
                    next.title +
                    " is approaching. Start creating a natural stopping point in your current task so your routine does not get pushed aside."
                );

            } else if (
                latestEnergy !== null &&
                latestEnergy <= 3
            ) {

                recommend(
                    "Your energy is low. Protect your next scheduled meal or rest period instead of trying to push through everything at once."
                );

            } else {

                recommend(
                    "Your routine is currently on track. The alarm clock in the top-right corner is counting down to your next reminder."
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
            "You have reached the end of today's saved routine. Review what worked and try to repeat the same timing tomorrow."
        );
    }


    /* ======================================================
       SAVE CHECK-IN
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


        /*
         * Matching check-in stops the current alarm.
         */

        stopAlarm(
            type
        );


        recommend(
            message
        );


        await Promise.all([

            loadCircleFeed(),

            updateRoutineDisplay(),

            updateAlarmEngine()

        ]);
    }


    const quickChecks = [

        [
            "breakfast-btn",
            "breakfast",
            "Breakfast recorded. The breakfast alarm has been cleared and there will be no 40-minute breakfast warning today."
        ],

        [
            "lunch-btn",
            "lunch",
            "Lunch recorded. The lunch alarm has been cleared and the 40-minute lunch warning is cancelled."
        ],

        [
            "dinner-btn",
            "dinner",
            "Dinner recorded. The dinner alarm has been cleared. Keep your planned bedtime in view."
        ],

        [
            "rest-btn",
            "rest",
            "Rest recorded. Your rest alarm has been cleared. Use the break to recharge before returning to your responsibilities."
        ],

        [
            "working-btn",
            "focus",
            "Working status recorded. Stay focused, but keep the countdown clock visible."
        ],

        [
            "sleep-btn",
            "sleep",
            "Bedtime recorded. Your bedtime alarm has been cleared for tonight."
        ],

        [
            "wake-btn",
            "wake",
            "Wake-up recorded. Your wake alarm has been cleared. Check your breakfast schedule next."
        ]

    ];


    quickChecks.forEach(
        function (item) {

            get(item[0])
                ?.addEventListener(
                    "click",
                    async function () {

                        await prepareAudio();


                        await saveCheckIn(
                            item[1],
                            item[2]
                        );

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
                        level * 10
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
                        "Your energy is moderate. Protect your next meal or rest period before your energy falls further."
                    );

                } else {

                    recommend(
                        "Your energy is strong. Use it productively, but don't let deep focus override your scheduled routine."
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
            result.data
        ) {

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
    }


    /* ======================================================
       FOCUS MODE
       ====================================================== */

    get("focus-btn")
        ?.addEventListener(
            "click",
            async function () {

                await prepareAudio();


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
                        "Focus Mode is active. The countdown clock will continue tracking your routine while you work."
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
                          " minutes. Check the countdown clock and consider food, water, movement, or rest before another long session."
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

        joinRequestsPanel.hidden =
            false;


        createCirclePanel.hidden =
            true;


        joinRequestsTab.classList.add(
            "active-management-tab"
        );


        createCircleTab.classList.remove(
            "active-management-tab"
        );
    }


    function showCreateCircleTab() {

        joinRequestsPanel.hidden =
            true;


        createCirclePanel.hidden =
            false;


        createCircleTab.classList.add(
            "active-management-tab"
        );


        joinRequestsTab.classList.remove(
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
       CIRCLES
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


        return result.data ||
            [];
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


        return result.data ||
            [];
    }


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
                                currentUser.id ||
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
                                        )?.role ||
                                        "member"
                                    )

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

                    return circle.id ===
                        saved;

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
                get(
                    "leave-circle-btn"
                )
            ) {

                get(
                    "leave-circle-btn"
                ).hidden =
                    true;
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


        get(
            "leave-circle-btn"
        ).hidden =
            activeCircle.role ===
            "owner";


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
            get(
                "circle-list"
            );


        list.innerHTML =
            "";


        (
            result.data ||
            []
        ).forEach(
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

                const name =
                    get(
                        "new-circle-name"
                    )
                    .value
                    .trim();


                const description =
                    get(
                        "new-circle-description"
                    )
                    .value
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


                if (
                    result.error
                ) {

                    setText(
                        "create-circle-message",
                        result.error.message
                    );

                    return;
                }


                get(
                    "new-circle-name"
                ).value =
                    "";


                get(
                    "new-circle-description"
                ).value =
                    "";


                sessionStorage.setItem(
                    "circlesync-active-circle",
                    result.data.id
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

        const [
            circles,
            memberships,
            requests
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


        const container =
            get(
                "discover-groups"
            );


        const membershipIds =
            new Set(
                memberships.map(
                    item =>
                        item.circle_id
                )
            );


        const requestMap =
            new Map();


        (
            requests.data ||
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
                circle =>
                    circle.is_public
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
                            "Open Circle";


                        button.onclick =
                            async function () {

                                activeCircle =
                                    myCircles.find(
                                        item =>
                                            item.id ===
                                            circle.id
                                    );


                                sessionStorage.setItem(
                                    "circlesync-active-circle",
                                    circle.id
                                );


                                renderCircleSwitcher();


                                await renderActiveCircle();
                            };

                    } else if (
                        requestMap.get(
                            circle.id
                        )?.status ===
                        "pending"
                    ) {

                        button.textContent =
                            "Request Pending";


                        button.disabled =
                            true;

                    } else {

                        button.textContent =
                            "Request to Join";


                        button.onclick =
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


                                if (
                                    result.error
                                ) {

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


                                await loadDiscoverGroups();
                            };
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
            get(
                "join-requests-list"
            );


        const owned =
            myCircles.filter(
                circle =>
                    circle.created_by ===
                    currentUser.id
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
                    "circle_join_requests"
                )
                .select(
                    "id, circle_id, requester_id, status"
                )
                .in(
                    "circle_id",
                    owned.map(
                        circle =>
                            circle.id
                    )
                )
                .eq(
                    "status",
                    "pending"
                );


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
                        item =>
                            item.id ===
                            request.circle_id
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


                info.textContent =
                    "A CircleSync user wants to join " +
                    circle.name;


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


                accept.textContent =
                    "Accept";


                const decline =
                    document.createElement(
                        "button"
                    );


                decline.textContent =
                    "Decline";


                decline.className =
                    "danger-outline";


                async function respond(
                    approve
                ) {

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
                }


                accept.onclick =
                    () =>
                        respond(true);


                decline.onclick =
                    () =>
                        respond(false);


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
                    return;
                }


                const input =
                    get(
                        "circle-message"
                    );


                const message =
                    input.value.trim();


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


                if (
                    !result.error
                ) {

                    input.value =
                        "";


                    await loadCircleFeed();
                }

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


        return labels[type] ||
            "✓ Check-In";
    }


    async function loadCircleFeed() {

        const feed =
            get(
                "circle-feed"
            );


        if (
            !activeCircle
        ) {
            return;
        }


        const [
            messages,
            checks
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


        const items = [

            ...(
                messages.data ||
                []
            ).map(
                message => ({

                    userId:
                        message.user_id,

                    text:
                        "💬 " +
                        message.message,

                    time:
                        message.created_at

                })
            ),

            ...(
                checks.data ||
                []
            ).map(
                check => ({

                    userId:
                        check.user_id,

                    text:
                        checkInLabel(
                            check.check_in_type
                        ),

                    time:
                        check.created_at

                })
            )

        ];


        items.sort(
            (
                a,
                b
            ) =>
                new Date(
                    b.time
                )
                -
                new Date(
                    a.time
                )
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


                row.textContent =
                    (
                        item.userId ===
                        currentUser.id
                            ? "You — "
                            : "Circle Member — "
                    )
                    +
                    item.text;


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
                    "circlesync-v78-" +
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

                            loadOwnerRequests()

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


    countdownTimer =
        setInterval(
            async function () {

                await updateAlarmEngine();


                await updateRoutineDisplay();

            },
            1000
        );


    /*
     * Unlock audio after any initial user interaction.
     */

    document.addEventListener(
        "pointerdown",
        async function unlockAudio() {

            try {

                await prepareAudio();

            } catch (error) {

                console.warn(
                    "Audio unlock failed:",
                    error
                );
            }


            document.removeEventListener(
                "pointerdown",
                unlockAudio
            );

        },
        {
            once:
                true
        }
    );


    console.log(
        "CircleSync dashboard v78 ready."
    );
}
