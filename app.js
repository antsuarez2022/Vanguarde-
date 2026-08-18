"use strict";

console.log(
    "CircleSync app.js v80 loaded"
);


/* ==========================================================
   SUPABASE
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
        sessionResult.data?.session
    ) {

        window.location.replace(
            "./dashboard.html"
        );


        return;
    }


    signinForm?.addEventListener(
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


    signupForm?.addEventListener(
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


            if (
                result.data?.session
            ) {

                window.location.replace(
                    "./dashboard.html"
                );


                return;
            }


            showMessage(
                "Account created. You can now sign in.",
                false
            );

        }
    );
}


/* ==========================================================
   DASHBOARD
   ========================================================== */

async function initDashboardPage() {

    /* ======================================================
       BASIC HELPERS
       ====================================================== */

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
       APP STATE
       ====================================================== */

    let currentUser =
        null;


    let currentRoutine =
        null;


    let currentSchedule =
        [];


    let completedTypes =
        new Set();


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


    let lastCheckInRefresh =
        0;


    /*
     * Alerts that have already sounded.
     *
     * Example:
     *
     * lunch-before
     * lunch-after-1
     * lunch-after-2
     * etc.
     */

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
       AUDIO
       ====================================================== */

    async function prepareAudio() {

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;


        if (
            !AudioContextClass
        ) {

            throw new Error(
                "Web Audio is not supported."
            );
        }


        if (
            !audioContext
        ) {

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
                    index * 0.18
                );


                oscillator.stop(
                    now +
                    1.5 +
                    index * 0.18
                );

            }
        );
    }


    /* ======================================================
       ALARM ENABLE / DISABLE
       ====================================================== */

    function updateAlarmButton() {

        const button =
            get(
                "alarm-settings-btn"
            );


        if (
            !button
        ) {

            return;
        }


        if (
            alarmsEnabled
        ) {

            button.textContent =
                "Disable Routine Alarms";


            button.classList.add(
                "alarm-enabled-button"
            );


            setText(
                "alarm-status",
                "Routine alarms are ON. CircleSync alerts 10 minutes before every routine and every 10 minutes afterward until you complete its Quick Check-In."
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
                "Routine alarms are enabled. CircleSync will alert you 10 minutes before Wake, Breakfast, Lunch, Rest, Dinner and Bedtime. If you do not check in, reminders repeat every 10 minutes afterward."
            );


        } catch (error) {

            console.error(
                "Unable to start audio:",
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
                "CircleSync could not start the alarm sound. Click the page once and try again."
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


        recommend(
            "Routine alarms are off. Your routine and check-ins will still be saved."
        );
    }


    get("alarm-settings-btn")
        ?.addEventListener(
            "click",
            async function () {

                if (
                    alarmsEnabled
                ) {

                    disableAlarms();

                } else {

                    await enableAlarms();
                }

            }
        );


    updateAlarmButton();


    /* ======================================================
       ACTIVE ALARM
       ====================================================== */

    function startAlarm(
        item,
        stageText,
        alarmKey
    ) {

        if (
            !alarmsEnabled
        ) {

            return;
        }


        /*
         * Do not restart the exact same alarm.
         */

        if (
            activeAlarm?.key ===
            alarmKey
        ) {

            return;
        }


        stopAlarm();


        activeAlarm = {

            type:
                item.type,

            title:
                item.title,

            key:
                alarmKey

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
            stageText
        );


        setText(
            "alarm-title",
            item.title
        );


        setText(
            "alarm-countdown",
            "ALARM"
        );


        playSoftChime();


        /*
         * While an alarm is active,
         * repeat the soothing chime every 12 seconds
         * until the user checks in.
         */

        alarmRepeatTimer =
            setInterval(
                playSoftChime,
                12000
            );
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


        get(
            "routine-alarm-widget"
        )
        ?.classList
        .remove(
            "alarm-active"
        );
    }


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
       BUILD A SEQUENTIAL SCHEDULE

       THIS FIXES BEDTIME AFTER MIDNIGHT.

       Example:

       Wake       7:30 AM
       Breakfast  8:00 AM
       Lunch     10:40 AM
       Rest       5:30 PM
       Dinner     9:30 PM
       Bedtime   12:30 AM NEXT DAY
       ====================================================== */

    function buildRoutineSchedule() {

        if (
            !currentRoutine
        ) {

            return [];
        }


        const now =
            new Date();


        let previousTime =
            null;


        let dayOffset =
            0;


        const result =
            [];


        for (
            const definition
            of ROUTINE_ORDER
        ) {

            const value =
                currentRoutine[
                    definition.field
                ];


            if (
                !value
            ) {

                continue;
            }


            const parts =
                value.split(
                    ":"
                );


            let scheduled =
                new Date(

                    now.getFullYear(),

                    now.getMonth(),

                    now.getDate() +
                    dayOffset,

                    Number(
                        parts[0]
                    ),

                    Number(
                        parts[1]
                    ),

                    0,

                    0

                );


            /*
             * If this routine's clock time is earlier
             * than the previous routine, it belongs
             * to the next calendar day.
             *
             * This is what makes 12:30 AM Bedtime
             * correctly follow 9:30 PM Dinner.
             */

            if (
                previousTime &&
                scheduled <=
                previousTime
            ) {

                dayOffset +=
                    1;


                scheduled =
                    new Date(

                        now.getFullYear(),

                        now.getMonth(),

                        now.getDate() +
                        dayOffset,

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


            result.push({

                ...definition,

                time:
                    value,

                scheduled:
                    scheduled

            });


            previousTime =
                scheduled;
        }


        return result;
    }


    /* ======================================================
       FORMAT COUNTDOWN
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


    /* ======================================================
       LOAD TODAY'S CHECK-INS
       ====================================================== */

    async function refreshCompletedCheckIns() {

        const now =
            new Date();


        /*
         * Give ourselves a slightly wider range because
         * Bedtime may occur after midnight.
         */

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


        const end =
            new Date(
                start
            );


        end.setDate(
            end.getDate() +
            2
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
                )
                .lt(
                    "created_at",
                    end.toISOString()
                );


        if (
            result.error
        ) {

            console.error(
                "Check-in refresh error:",
                result.error
            );


            return;
        }


        completedTypes =
            new Set(
                (
                    result.data ||
                    []
                ).map(
                    function (row) {

                        return row.check_in_type;

                    }
                )
            );


        lastCheckInRefresh =
            Date.now();


        /*
         * If a matching check-in now exists,
         * silence the alarm.
         */

        if (
            activeAlarm &&
            completedTypes.has(
                activeAlarm.type
            )
        ) {

            stopAlarm(
                activeAlarm.type
            );
        }
    }


    /* ======================================================
       FIND NEXT ALARM EVENT
       ====================================================== */

    function buildAlarmEvents() {

        const events =
            [];


        currentSchedule.forEach(
            function (item) {

                if (
                    completedTypes.has(
                        item.type
                    )
                ) {

                    return;
                }


                /*
                 * 10 MINUTES BEFORE
                 */

                events.push({

                    item:
                        item,

                    kind:
                        "before",

                    sequence:
                        0,

                    time:
                        new Date(
                            item.scheduled.getTime() -
                            10 *
                            60 *
                            1000
                        )

                });


                /*
                 * EVERY 10 MINUTES AFTER.

                 * Generate reminders for 12 hours.
                 * Once checked in, these are ignored.
                 */

                for (
                    let sequence = 1;
                    sequence <= 72;
                    sequence += 1
                ) {

                    events.push({

                        item:
                            item,

                        kind:
                            "after",

                        sequence:
                            sequence,

                        time:
                            new Date(
                                item.scheduled.getTime() +
                                sequence *
                                10 *
                                60 *
                                1000
                            )

                    });
                }

            }
        );


        events.sort(
            function (
                a,
                b
            ) {

                return (
                    a.time -
                    b.time
                );
            }
        );


        return events;
    }


    /* ======================================================
       ALARM KEY
       ====================================================== */

    function alarmKey(event) {

        return [

            event.item.type,

            event.kind,

            event.sequence,

            event.item.scheduled
                .toISOString()

        ].join(
            "|"
        );
    }


    /* ======================================================
       MAIN ALARM CHECK
       ====================================================== */

    async function checkForDueAlarm() {

        /*
         * Refresh Supabase check-ins every five seconds,
         * not every second.
         */

        if (
            Date.now() -
            lastCheckInRefresh >
            5000
        ) {

            await refreshCompletedCheckIns();
        }


        currentSchedule =
            buildRoutineSchedule();


        const now =
            new Date();


        const events =
            buildAlarmEvents();


        /*
         * Find an alarm that became due within
         * the last 65 seconds.
         *
         * This protects against setInterval being
         * a few seconds late.
         */

        const due =
            events.find(
                function (event) {

                    const difference =
                        now -
                        event.time;


                    return (

                        difference >=
                            0

                        &&

                        difference <=
                            65000

                        &&

                        !firedAlarmKeys.has(
                            alarmKey(
                                event
                            )
                        )

                        &&

                        !completedTypes.has(
                            event.item.type
                        )

                    );
                }
            );


        if (
            due &&
            alarmsEnabled
        ) {

            /*
             * Important:
             * recheck Supabase before EVERY
             * after-time alarm.
             */

            if (
                due.kind ===
                "after"
            ) {

                await refreshCompletedCheckIns();


                if (
                    completedTypes.has(
                        due.item.type
                    )
                ) {

                    return;
                }
            }


            const key =
                alarmKey(
                    due
                );


            firedAlarmKeys.add(
                key
            );


            if (
                due.kind ===
                "before"
            ) {

                startAlarm(

                    due.item,

                    "10 Minutes Before",

                    key

                );


                recommend(
                    due.item.title +
                    " is scheduled in 10 minutes. Start wrapping up what you are doing so your current task does not override your routine."
                );


            } else {

                const minutesLate =
                    due.sequence *
                    10;


                startAlarm(

                    due.item,

                    minutesLate +
                    " Minutes After",

                    key

                );


                recommend(
                    due.item.title +
                    " is now " +
                    minutesLate +
                    " minutes past your scheduled time and CircleSync still does not see its matching Quick Check-In. Complete it when you can and tap the matching button to stop further reminders."
                );
            }
        }
    }


    /* ======================================================
       UPDATE FLOATING CLOCK

       THIS FUNCTION DOES NOT QUERY SUPABASE.

       IT RUNS EVERY SECOND.
       ====================================================== */

    function updateFloatingCountdown() {

        if (
            !currentRoutine
        ) {

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


        /*
         * Don't replace the display while
         * an alarm is actively sounding.
         */

        if (
            activeAlarm
        ) {

            return;
        }


        currentSchedule =
            buildRoutineSchedule();


        const now =
            new Date();


        const events =
            buildAlarmEvents();


        /*
         * Only show events in the future.
         */

        const nextEvent =
            events.find(
                function (event) {

                    return (

                        event.time >
                        now

                        &&

                        !completedTypes.has(
                            event.item.type
                        )

                    );
                }
            );


        if (
            !nextEvent
        ) {

            setText(
                "alarm-label",
                "Routine Complete"
            );


            setText(
                "alarm-title",
                "No more alerts"
            );


            setText(
                "alarm-countdown",
                "✓"
            );


            return;
        }


        if (
            nextEvent.kind ===
            "before"
        ) {

            setText(
                "alarm-label",
                "Next 10-Min Alert"
            );


        } else {

            setText(
                "alarm-label",
                "Next Follow-Up Alert"
            );
        }


        setText(
            "alarm-title",
            nextEvent.item.title
        );


        setText(
            "alarm-countdown",
            formatCountdown(
                nextEvent.time -
                now
            )
        );
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
            result.error
        ) {

            console.error(
                "Routine load error:",
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
                element
            ) {

                element.value =
                    value

                        ? value.substring(
                            0,
                            5
                        )

                        : "";
            }
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


        if (
            routineElements.goal
        ) {

            routineElements.goal.value =
                currentRoutine.sleep_goal_hours ||
                8;
        }


        currentSchedule =
            buildRoutineSchedule();
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

                                rest_start_time:
                                    routineElements
                                        .rest
                                        .value ||
                                    null,

                                dinner_time:
                                    routineElements
                                        .dinner
                                        .value ||
                                    null,

                                bedtime:
                                    routineElements
                                        .bedtime
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


                currentSchedule =
                    buildRoutineSchedule();


                firedAlarmKeys.clear();


                setText(
                    "routine-message",
                    "Routine saved. 10-minute alarms updated."
                );


                recommend(
                    "Your routine has been updated. CircleSync now follows Wake, Breakfast, Lunch, Rest, Dinner and Bedtime in that order."
                );


                updateFloatingCountdown();


                updateNextUp();

            }
        );


    /* ======================================================
       NEXT UP
       ====================================================== */

    function updateNextUp() {

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


            return;
        }


        currentSchedule =
            buildRoutineSchedule();


        const now =
            new Date();


        /*
         * Find earliest scheduled routine that
         * has not been checked in.
         *
         * Schedule is already in the fixed desired order.
         */

        const nextItem =
            currentSchedule.find(
                function (item) {

                    return (

                        item.scheduled >
                            now

                        &&

                        !completedTypes.has(
                            item.type
                        )

                    );
                }
            );


        /*
         * If something earlier is overdue,
         * show that first.
         */

        const overdueItems =
            currentSchedule.filter(
                function (item) {

                    return (

                        item.scheduled <=
                            now

                        &&

                        !completedTypes.has(
                            item.type
                        )

                    );
                }
            );


        if (
            overdueItems.length >
            0
        ) {

            /*
             * Keep the routine order.
             * Earliest uncompleted scheduled action
             * receives attention first.
             */

            const overdue =
                overdueItems[0];


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
                minutes >= 10
            ) {

                recommend(
                    overdue.title +
                    " is overdue and has not been checked in. CircleSync will keep reminding you every 10 minutes until you complete its matching Quick Check-In."
                );
            }


            return;
        }


        if (
            nextItem
        ) {

            const milliseconds =
                nextItem.scheduled -
                now;


            setText(
                "next-up-label",
                "Next Up"
            );


            setText(
                "next-up-title",
                nextItem.title
            );


            setText(
                "next-up-countdown",
                "In " +
                formatCountdown(
                    milliseconds
                )
            );


            return;
        }


        setText(
            "next-up-label",
            "Routine Complete"
        );


        setText(
            "next-up-title",
            "✓ Done for this routine cycle"
        );


        setText(
            "next-up-countdown",
            "Nice work"
        );
    }


    /* ======================================================
       QUICK CHECK-IN
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


            return false;
        }


        completedTypes.add(
            type
        );


        /*
         * Matching check-in immediately silences
         * this routine's alarm.
         */

        stopAlarm(
            type
        );


        recommend(
            message
        );


        updateFloatingCountdown();


        updateNextUp();


        await loadCircleFeed();


        return true;
    }


    const quickChecks = [

        [
            "wake-btn",

            "wake",

            "Wake-up recorded. All remaining wake reminders have been cancelled."
        ],

        [
            "breakfast-btn",

            "breakfast",

            "Breakfast recorded. All remaining breakfast reminders have been cancelled."
        ],

        [
            "lunch-btn",

            "lunch",

            "Lunch recorded. All remaining lunch reminders have been cancelled."
        ],

        [
            "rest-btn",

            "rest",

            "Rest recorded. All remaining rest reminders have been cancelled."
        ],

        [
            "dinner-btn",

            "dinner",

            "Dinner recorded. All remaining dinner reminders have been cancelled."
        ],

        [
            "sleep-btn",

            "sleep",

            "Bedtime recorded. All remaining bedtime reminders have been cancelled."
        ],

        [
            "working-btn",

            "focus",

            "Working status recorded. Keep your routine countdown visible while you focus."
        ]

    ];


    quickChecks.forEach(
        function (configuration) {

            get(
                configuration[0]
            )
            ?.addEventListener(
                "click",
                async function () {

                    try {

                        await prepareAudio();

                    } catch (error) {

                        console.warn(
                            error
                        );
                    }


                    await saveCheckIn(

                        configuration[1],

                        configuration[2]

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
                        level *
                        10
                    )
                );


                if (
                    level <= 3
                ) {

                    recommend(
                        "Your energy is low. Protect your next meal or rest period instead of pushing through the fatigue."
                    );


                } else if (
                    level <= 6
                ) {

                    recommend(
                        "Your energy is moderate. Keep your upcoming routine protected."
                    );


                } else {

                    recommend(
                        "Your energy is strong. Use it productively while keeping your routine schedule visible."
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
            result.data
        ) {

            latestEnergy =
                Number(
                    result.data.energy_level
                );


            energyInput.value =
                latestEnergy;


            setText(
                "energy-value",
                latestEnergy
            );


            setText(
                "energy-score",
                latestEnergy *
                10
            );
        }
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
                        "Focus Mode is active. Your routine countdown will continue running."
                    );


                    return;
                }


                const minutes =
                    Math.max(
                        1,
                        Math.round(
                            (
                                Date.now() -
                                focusStartedAt
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
                    "Focus session complete. Check your Next Up routine before beginning another task."
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


    function showCreateCircle() {

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
            showJoinRequests
        );


    createCircleTab
        ?.addEventListener(
            "click",
            showCreateCircle
        );


    /* ======================================================
       CIRCLE HELPERS
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


        return (
            result.data ||
            []
        );
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


        if (
            !container
        ) {

            return;
        }


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


            get(
                "leave-circle-btn"
            ).hidden =
                true;


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


        const members =
            result.data ||
            [];


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

    get(
        "leave-circle-btn"
    )
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

    get(
        "create-circle-btn"
    )
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
                nameInput.value.trim();


            if (
                !name
            ) {

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
                function (circle) {

                    return (
                        circle.is_public ===
                        true
                    );
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


                                if (
                                    selected
                                ) {

                                    activeCircle =
                                        selected;


                                    sessionStorage.setItem(
                                        "circlesync-active-circle",
                                        selected.id
                                    );


                                    renderCircleSwitcher();


                                    await renderActiveCircle();
                                }

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


                                recommend(
                                    "Request sent to the circle creator."
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


    get(
        "refresh-groups-btn"
    )
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
                function (circle) {

                    return (
                        circle.created_by ===
                        currentUser.id
                    );
                }
            );


        if (
            owned.length ===
            0
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
                        function (circle) {

                            return circle.id;

                        }
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
            requests.length ===
            0
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
                    function () {

                        respond(
                            true
                        );
                    };


                decline.onclick =
                    function () {

                        respond(
                            false
                        );
                    };


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
       CIRCLE MESSAGES
       ====================================================== */

    get(
        "send-message-btn"
    )
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


            if (
                !message
            ) {

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


    async function loadCircleFeed() {

        const feed =
            get(
                "circle-feed"
            );


        if (
            !feed
        ) {

            return;
        }


        if (
            !activeCircle
        ) {

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
                    .limit(
                        50
                    ),

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
                    .limit(
                        50
                    )

            ]);


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
                a,
                b
            ) {

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


    get(
        "refresh-feed-btn"
    )
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
                    "circlesync-v80-" +
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

                        await refreshCompletedCheckIns();


                        updateFloatingCountdown();


                        updateNextUp();


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


    await refreshCompletedCheckIns();


    currentSchedule =
        buildRoutineSchedule();


    await loadMyCircles();


    await Promise.all([

        loadDiscoverGroups(),

        loadOwnerRequests(),

        loadCircleFeed()

    ]);


    updateFloatingCountdown();


    updateNextUp();


    startRealtime();


    /* ======================================================
       VISUAL CLOCK

       Updates EVERY SECOND.
       No database request here.
       ====================================================== */

    setInterval(
        function () {

            updateFloatingCountdown();


            updateNextUp();

        },
        1000
    );


    /* ======================================================
       ALARM CHECK

       Checks for actual alarms every 5 seconds.
       ====================================================== */

    setInterval(
        async function () {

            await checkForDueAlarm();

        },
        5000
    );


    /*
     * Check immediately too.
     */

    await checkForDueAlarm();


    console.log(
        "CircleSync dashboard v80 ready."
    );
}
