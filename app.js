"use strict";

console.log("CircleSync app.js v81 loaded");


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
   START
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
                !email
            ) {

                showMessage(
                    "Enter an email address.",
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

    function get(id) {

        return document.getElementById(id);
    }


    function setText(
        id,
        value
    ) {

        const element =
            get(id);


        if (
            element
        ) {

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


    /*
     * These are actual check-in rows with timestamps.
     *
     * We DO NOT simply store:
     *
     * breakfast = completed
     *
     * because tomorrow has another breakfast.
     */

    let recentCheckIns =
        [];


    let lastCheckInRefresh =
        0;


    /* ======================================================
       ROUTINE DEFINITION

       NEVER change the order here unless you intentionally
       want to change the entire CircleSync routine.
       ====================================================== */

    const ROUTINE_ORDER = [

        {
            type:
                "wake",

            title:
                "☀️ Wake Up",

            shortTitle:
                "Wake",

            field:
                "wake_time"
        },

        {
            type:
                "breakfast",

            title:
                "🍳 Breakfast",

            shortTitle:
                "Breakfast",

            field:
                "breakfast_time"
        },

        {
            type:
                "lunch",

            title:
                "🥗 Lunch",

            shortTitle:
                "Lunch",

            field:
                "lunch_time"
        },

        {
            type:
                "rest",

            title:
                "😴 Rest",

            shortTitle:
                "Rest",

            field:
                "rest_start_time"
        },

        {
            type:
                "dinner",

            title:
                "🍽 Dinner",

            shortTitle:
                "Dinner",

            field:
                "dinner_time"
        },

        {
            type:
                "sleep",

            title:
                "🌙 Bedtime",

            shortTitle:
                "Bedtime",

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


    /*
     * Alarm events already triggered in this browser session.
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
                "This browser does not support Web Audio."
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


        master.gain.setValueAtTime(
            0.0001,
            now
        );


        master.gain.exponentialRampToValueAtTime(
            0.13,
            now + 0.08
        );


        master.gain.exponentialRampToValueAtTime(
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
       ENABLE / DISABLE ALARMS
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
                "Routine alarms are ON 24/7. CircleSync alerts 10 minutes before Wake, Breakfast, Lunch, Rest, Dinner and Bedtime. If a matching check-in is missing, a follow-up sounds every 10 minutes."
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
                "Routine alarms are enabled 24/7. CircleSync will continuously cycle through Wake, Breakfast, Lunch, Rest, Dinner, Bedtime and then the next day's Wake."
            );


        } catch (error) {

            console.error(
                "Unable to start alarm audio:",
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
                "CircleSync could not start the alarm sound. Interact with the page once and press Enable Routine Alarms again."
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
            "Routine alarms are off. Your schedule and check-ins are still saved."
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
        occurrence,
        label,
        alarmKey
    ) {

        if (
            !alarmsEnabled
        ) {

            return;
        }


        if (
            activeAlarm?.key ===
            alarmKey
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
                alarmKey

        };


        get("routine-alarm-widget")
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


        /*
         * Keep gently reminding every 12 seconds
         * while the current alert is actively sounding.
         */

        alarmRepeatTimer =
            setInterval(
                playSoftChime,
                12000
            );
    }


    function stopAlarm(
        type = null
    ) {

        if (
            type &&
            activeAlarm &&
            activeAlarm.type !==
                type
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


        get("routine-alarm-widget")
            ?.classList
            .remove(
                "alarm-active"
            );
    }


    /* ======================================================
       DATE HELPERS
       ====================================================== */

    function startOfDay(
        date
    ) {

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
            new Date(
                date
            );


        result.setDate(
            result.getDate() +
            days
        );


        return result;
    }


    function parseClock(
        clock
    ) {

        if (
            !clock
        ) {

            return null;
        }


        const parts =
            clock.split(
                ":"
            );


        return {

            hours:
                Number(
                    parts[0]
                ),

            minutes:
                Number(
                    parts[1]
                )

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


        if (
            !parsed
        ) {

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


    function formatDateKey(
        date
    ) {

        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() +
                1
            )
            .padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            )
            .padStart(
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
       BUILD ONE ROUTINE CYCLE

       baseDate is the date assigned to WAKE.

       The six events are always generated IN ORDER.

       If a later clock time rolls backward, such as:

       Dinner 9:30 PM
       Bedtime 12:30 AM

       Bedtime automatically moves to the following date.
       ====================================================== */

    function buildCycle(
        baseDate
    ) {

        if (
            !currentRoutine
        ) {

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


            if (
                !clock
            ) {

                continue;
            }


            let scheduled =
                dateAtClock(
                    workingDate,
                    clock
                );


            /*
             * Clock went backward.
             *
             * Example:
             *
             * Dinner 21:30
             * Bedtime 00:30
             *
             * 00:30 belongs to tomorrow.
             */

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

                scheduled:
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


    /* ======================================================
       BUILD CONTINUOUS 24/7 TIMELINE

       Yesterday
       Today
       Tomorrow
       Day after tomorrow

       This prevents the app from ever reaching
       a permanent "routine complete" state.
       ====================================================== */

    function buildContinuousSchedule() {

        if (
            !currentRoutine
        ) {

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
            offset <= 3;
            offset += 1
        ) {

            const cycleDate =
                addDays(
                    today,
                    offset
                );


            schedule.push(
                ...buildCycle(
                    cycleDate
                )
            );
        }


        /*
         * Sort by ACTUAL timestamp.
         *
         * Because each individual cycle was generated in
         * Wake → Breakfast → Lunch → Rest → Dinner → Bedtime
         * order, this still respects the sequence while
         * correctly handling midnight.
         */

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
       CHECK-INS FROM SUPABASE
       ====================================================== */

    async function refreshRecentCheckIns() {

        const now =
            new Date();


        const start =
            addDays(
                startOfDay(
                    now
                ),
                -2
            );


        const end =
            addDays(
                startOfDay(
                    now
                ),
                3
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


        /*
         * Also stop a currently sounding alarm
         * when its occurrence is now complete.
         */

        if (
            activeAlarm
        ) {

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


    /* ======================================================
       COMPLETION WINDOW

       A check-in only counts for the appropriate occurrence.

       It does NOT mean:
       "The user checked Lunch once, therefore every Lunch
       forever is complete."

       Window:
       10 minutes before scheduled occurrence
       until immediately before the NEXT occurrence
       of the same routine type.
       ====================================================== */

    function getNextOccurrenceOfType(
        occurrence,
        schedule
    ) {

        return schedule.find(
            function (candidate) {

                return (

                    candidate.type ===
                        occurrence.type

                    &&

                    candidate.scheduled >
                        occurrence.scheduled

                );
            }
        ) || null;
    }


    function isOccurrenceCompleted(
        occurrence,
        schedule
    ) {

        const windowStart =
            new Date(
                occurrence.scheduled.getTime() -
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
                    nextSameType.scheduled.getTime() -
                    10 *
                    60 *
                    1000
                )

                : new Date(
                    occurrence.scheduled.getTime() +
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


        if (
            days > 0
        ) {

            return (

                days +
                "d " +

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


    function formatScheduledTime(
        date
    ) {

        const now =
            new Date();


        const tomorrow =
            addDays(
                startOfDay(
                    now
                ),
                1
            );


        let dayText =
            "";


        if (
            date >= tomorrow &&
            date <
            addDays(
                tomorrow,
                1
            )
        ) {

            dayText =
                "Tomorrow at ";

        } else if (
            formatDateKey(
                date
            ) !==
            formatDateKey(
                now
            )
        ) {

            dayText =
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
                " at ";
        }


        return (

            dayText

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


    /* ======================================================
       NEXT ROUTINE OCCURRENCE

       This always looks FORWARD indefinitely through the
       generated daily cycles.
       ====================================================== */

    function getNextScheduledOccurrence() {

        const schedule =
            buildContinuousSchedule();


        const now =
            new Date();


        return (
            schedule.find(
                function (occurrence) {

                    return (
                        occurrence.scheduled >
                        now
                    );
                }
            )
            ||
            null
        );
    }


    /* ======================================================
       NEXT UNCOMPLETED OVERDUE OCCURRENCE

       Only look back a limited amount so that an old missed
       event doesn't permanently block the entire app.
       ====================================================== */

    function getImportantOverdueOccurrence() {

        const schedule =
            buildContinuousSchedule();


        const now =
            new Date();


        const maximumAge =
            6 *
            60 *
            60 *
            1000;


        const overdue =
            schedule.filter(
                function (occurrence) {

                    const age =
                        now -
                        occurrence.scheduled;


                    return (

                        age >= 0

                        &&

                        age <= maximumAge

                        &&

                        !isOccurrenceCompleted(
                            occurrence,
                            schedule
                        )

                    );
                }
            );


        return (
            overdue[0] ||
            null
        );
    }


    /* ======================================================
       ALARM EVENTS

       For EVERY occurrence:

       -10 minutes
       +10
       +20
       +30
       +40
       +50...
       until next day's same routine occurrence.

       Follow-ups only remain eligible while that occurrence
       has no matching check-in.
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

                occurrence:
                    occurrence,

                kind:
                    "before",

                sequence:
                    0,

                time:
                    new Date(
                        occurrence.scheduled.getTime() -
                        10 *
                        60 *
                        1000
                    )

            });


            /*
             * Find next same type so reminders don't overlap
             * forever into the following day's occurrence.
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
                        occurrence.scheduled.getTime() +
                        24 *
                        60 *
                        60 *
                        1000
                    );


            let sequence =
                1;


            let reminderTime =
                new Date(
                    occurrence.scheduled.getTime() +
                    10 *
                    60 *
                    1000
                );


            while (
                reminderTime <
                stopAt
            ) {

                events.push({

                    occurrence:
                        occurrence,

                    kind:
                        "after",

                    sequence:
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
                        occurrence.scheduled.getTime() +
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
       24/7 FLOATING CLOCK

       IMPORTANT:
       This NEVER displays "Routine Complete."

       After Bedtime it moves to tomorrow's Wake.
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


        if (
            activeAlarm
        ) {

            return;
        }


        const events =
            buildAlarmEvents();


        const schedule =
            buildContinuousSchedule();


        const now =
            new Date();


        /*
         * Skip future AFTER-reminders whose occurrence is
         * already completed.
         */

        const nextEvent =
            events.find(
                function (event) {

                    if (
                        event.time <=
                        now
                    ) {

                        return false;
                    }


                    if (
                        event.kind ===
                        "after" &&
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


        if (
            !nextEvent
        ) {

            /*
             * Defensive fallback.
             *
             * Normally impossible because several future
             * routine cycles are generated.
             */

            const nextOccurrence =
                getNextScheduledOccurrence();


            if (
                nextOccurrence
            ) {

                setText(
                    "alarm-label",
                    "Next Routine"
                );


                setText(
                    "alarm-title",
                    nextOccurrence.title
                );


                setText(
                    "alarm-countdown",
                    formatCountdown(
                        nextOccurrence.scheduled -
                        now
                    )
                );
            }


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
                "Next Follow-Up"
            );
        }


        setText(
            "alarm-title",
            nextEvent.occurrence.title
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
       CHECK FOR ACTUAL ALARM
       ====================================================== */

    async function checkForDueAlarm() {

        /*
         * Refresh check-ins periodically so the alarm knows
         * whether another tab/device completed a routine.
         */

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


        /*
         * A one-minute tolerance means the browser does not
         * have to execute at the exact millisecond.
         */

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
                            alarmKey(
                                event
                            )
                        )
                    ) {

                        return false;
                    }


                    /*
                     * BEFORE alert can happen even if the
                     * occurrence isn't completed yet.
                     *
                     * AFTER alert ONLY happens when the
                     * matching occurrence remains incomplete.
                     */

                    if (
                        event.kind ===
                        "after" &&
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


        if (
            !dueEvent
        ) {

            return;
        }


        /*
         * Recheck Supabase immediately before an AFTER alert.
         */

        if (
            dueEvent.kind ===
            "after"
        ) {

            await refreshRecentCheckIns();


            if (
                isOccurrenceCompleted(
                    dueEvent.occurrence,
                    buildContinuousSchedule()
                )
            ) {

                return;
            }
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
                " is coming up in 10 minutes. Begin wrapping up your current activity so you can follow the routine you planned."
            );


        } else {

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
                " minutes past its scheduled time and its matching Quick Check-In is still missing. Check in when you complete it to stop further reminders."
            );
        }
    }


    /* ======================================================
       NEXT UP CARD
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


            recommend(
                "Save Wake, Breakfast, Lunch, Rest, Dinner and Bedtime so CircleSync can create your continuous 24/7 routine."
            );


            return;
        }


        const now =
            new Date();


        const schedule =
            buildContinuousSchedule();


        const overdue =
            getImportantOverdueOccurrence();


        if (
            overdue
        ) {

            const minutesLate =
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
                minutesLate +
                " minutes overdue"
            );


            setText(
                "next-up-time",
                "Scheduled " +
                formatScheduledTime(
                    overdue.scheduled
                )
            );


            if (
                minutesLate >= 10
            ) {

                recommend(
                    overdue.title +
                    " has not been checked in yet. If routine alarms are enabled, CircleSync will continue reminding you every 10 minutes."
                );
            }


            return;
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


        if (
            !next
        ) {

            return;
        }


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
            "In " +
            formatCountdown(
                next.scheduled -
                now
            )
        );


        setText(
            "next-up-time",
            formatScheduledTime(
                next.scheduled
            )
        );


        const minutesUntil =
            (
                next.scheduled -
                now
            ) /
            60000;


        if (
            minutesUntil <= 20
        ) {

            recommend(
                next.title +
                " is approaching. Start creating a natural stopping point so your current activity does not push your routine aside."
            );


        } else if (
            latestEnergy !== null &&
            latestEnergy <= 3
        ) {

            recommend(
                "Your latest energy check-in is low. Protect your next scheduled meal or rest period."
            );
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


                button.disabled =
                    false;


                button.textContent =
                    "Save Routine";


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


                firedAlarmKeys.clear();


                setText(
                    "routine-message",
                    "Routine saved. Your 24/7 alarm timeline has been updated."
                );


                recommend(
                    "Your schedule is updated. CircleSync will continuously cycle through Wake, Breakfast, Lunch, Rest, Dinner, Bedtime and then tomorrow's Wake."
                );


                updateFloatingCountdown();


                updateNextUp();

            }
        );


    /* ======================================================
       FIND OCCURRENCE TO COMPLETE

       When the user presses a Quick Check-In button,
       determine which scheduled occurrence that button
       belongs to.

       Preference:
       1. Most recent occurrence of this type
       2. If it hasn't happened yet, the next occurrence
       ====================================================== */

    function findCheckInOccurrence(
        type
    ) {

        const schedule =
            buildContinuousSchedule();


        const now =
            new Date();


        const matching =
            schedule.filter(
                function (occurrence) {

                    return (
                        occurrence.type ===
                        type
                    );
                }
            );


        const past =
            matching.filter(
                function (occurrence) {

                    return (
                        occurrence.scheduled <=
                        now
                    );
                }
            );


        if (
            past.length > 0
        ) {

            return (
                past[
                    past.length -
                    1
                ]
            );
        }


        return (
            matching[0] ||
            null
        );
    }


    /* ======================================================
       QUICK CHECK-IN
       ====================================================== */

    async function saveCheckIn(
        type,
        successMessage
    ) {

        const occurrence =
            findCheckInOccurrence(
                type
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


        /*
         * Update locally immediately instead of waiting
         * for the next Supabase request.
         */

        recentCheckIns.push({

            check_in_type:
                type,

            created_at:
                new Date()
                    .toISOString()

        });


        stopAlarm(
            type
        );


        recommend(
            successMessage
        );


        updateFloatingCountdown();


        updateNextUp();


        await loadCircleFeed();


        /*
         * Refresh database copy too.
         */

        await refreshRecentCheckIns();


        return true;
    }


    const quickChecks = [

        [
            "wake-btn",
            "wake",
            "Wake-up recorded. The wake alarm for this routine cycle has been cleared."
        ],

        [
            "breakfast-btn",
            "breakfast",
            "Breakfast recorded. Breakfast reminders for this routine cycle have been cleared."
        ],

        [
            "lunch-btn",
            "lunch",
            "Lunch recorded. Lunch reminders for this routine cycle have been cleared."
        ],

        [
            "rest-btn",
            "rest",
            "Rest recorded. Rest reminders for this routine cycle have been cleared."
        ],

        [
            "dinner-btn",
            "dinner",
            "Dinner recorded. Dinner reminders for this routine cycle have been cleared."
        ],

        [
            "sleep-btn",
            "sleep",
            "Bedtime recorded. Bedtime reminders are cleared and CircleSync will continue toward your next Wake alarm."
        ],

        [
            "working-btn",
            "focus",
            "Working status recorded. Your 24/7 routine clock will continue running while you focus."
        ]

    ];


    quickChecks.forEach(
        function (configuration) {

            const button =
                get(
                    configuration[0]
                );


            button?.addEventListener(
                "click",
                async function () {

                    try {

                        await prepareAudio();

                    } catch (error) {

                        console.warn(
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
                        "Your energy is low. Protect your next meal, rest period, or sleep opportunity."
                    );


                } else if (
                    level <= 6
                ) {

                    recommend(
                        "Your energy is moderate. Keep your next routine event protected."
                    );


                } else {

                    recommend(
                        "Your energy is strong. Use it productively while keeping your routine clock visible."
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
            !result.data
        ) {

            return;
        }


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
            latestEnergy *
            10
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
                    get(
                        "focus-btn"
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


                    setText(
                        "focus-status",
                        "Focus session active."
                    );


                    recommend(
                        "Focus Mode is active. Your routine clock will continue running while you work."
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
                    "Focus session complete. Check your Next Up routine before starting another long task."
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


        if (
            result.error
        ) {

            console.error(
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


        if (
            result.error
        ) {

            console.error(
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


        if (
            !container
        ) {

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
                leaveButton
            ) {

                leaveButton.hidden =
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


        if (
            leaveButton
        ) {

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


        if (
            !list
        ) {

            return;
        }


        list.innerHTML =
            "";


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


                if (
                    result.error
                ) {

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
                    nameInput
                        .value
                        .trim();


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


        if (
            !container
        ) {

            return;
        }


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

                        return (
                            item.circle_id
                        );
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


                            if (
                                !selected
                            ) {

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


        if (
            !container
        ) {

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
                    "circle_join_requests"
                )
                .select(
                    "id, circle_id, requester_id, status"
                )
                .in(
                    "circle_id",
                    owned.map(
                        function (circle) {

                            return (
                                circle.id
                            );
                        }
                    )
                )
                .eq(
                    "status",
                    "pending"
                );


        if (
            result.error
        ) {

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


                info.textContent =
                    "A CircleSync user wants to join " +
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


                    if (
                        response.error
                    ) {

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

                if (
                    !activeCircle
                ) {

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
                    input
                        .value
                        .trim();


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
                    result.error
                ) {

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
                    "circlesync-v81-" +
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


    await refreshRecentCheckIns();


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
       VISUAL 24/7 CLOCK

       Pure client-side update every second.
       ====================================================== */

    setInterval(
        function () {

            updateFloatingCountdown();


            updateNextUp();

        },
        1000
    );


    /* ======================================================
       ALARM ENGINE

       Check every five seconds.
       ====================================================== */

    setInterval(
        async function () {

            await checkForDueAlarm();

        },
        5000
    );


    await checkForDueAlarm();


    console.log(
        "CircleSync dashboard v81 ready."
    );
}
