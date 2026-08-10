```javascript
"use strict";


// ==========================================================
// CIRCLESYNC - COMPLETE APP.JS
// ==========================================================


// ==========================================================
// 1. SUPABASE CONFIGURATION
// ==========================================================

const SUPABASE_URL =
    "https://mkecbhmkvrtwltejwzua.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_hWxse_7flC8kSKS_xlVkYw_BRUwJ2d8-";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ==========================================================
// 2. APPLICATION STATE
// ==========================================================

let currentUser = null;
let currentCircle = null;

let focusMode = false;
let focusStartTime = null;


// ==========================================================
// 3. HTML ELEMENTS
// ==========================================================

// Authentication

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("login-btn");

const signupButton =
    document.getElementById("signup-btn");

const logoutButton =
    document.getElementById("logout-btn");

const authMessage =
    document.getElementById("auth-message");


// Energy

const energyScore =
    document.getElementById("energy-score");

const energyInput =
    document.getElementById("energy-input");

const energyValue =
    document.getElementById("energy-value");

const saveEnergyButton =
    document.getElementById("save-energy");


// Focus

const focusButton =
    document.getElementById("focus-btn");

const focusStatus =
    document.getElementById("focus-status");


// Check-in buttons

const breakfastButton =
    document.getElementById("breakfast-btn");

const lunchButton =
    document.getElementById("lunch-btn");

const dinnerButton =
    document.getElementById("dinner-btn");

const restButton =
    document.getElementById("rest-btn");

const workingButton =
    document.getElementById("working-btn");

const sleepButton =
    document.getElementById("sleep-btn");

const wakeButton =
    document.getElementById("wake-btn");


// Circle

const circleNameDisplay =
    document.getElementById("circle-name");

const circleDescriptionDisplay =
    document.getElementById("circle-description");

const circleList =
    document.getElementById("circle-list");

const newCircleName =
    document.getElementById("new-circle-name");

const newCircleDescription =
    document.getElementById(
        "new-circle-description"
    );

const createCircleButton =
    document.getElementById(
        "create-circle-btn"
    );


// Routine

const wakeTime =
    document.getElementById("wake-time");

const breakfastTime =
    document.getElementById("breakfast-time");

const lunchTime =
    document.getElementById("lunch-time");

const dinnerTime =
    document.getElementById("dinner-time");

const restTime =
    document.getElementById("rest-time");

const bedtime =
    document.getElementById("bedtime");

const sleepGoal =
    document.getElementById("sleep-goal");

const saveRoutineButton =
    document.getElementById(
        "save-routine-btn"
    );

const routineMessage =
    document.getElementById(
        "routine-message"
    );


// Recommendation

const recommendation =
    document.getElementById(
        "recommendation"
    );


// ==========================================================
// 4. GENERAL UI HELPERS
// ==========================================================

function showAuthMessage(
    message,
    isError
) {

    if (!authMessage) {
        return;
    }

    authMessage.textContent =
        message;

    if (isError === true) {

        authMessage.style.color =
            "#b91c1c";

    } else {

        authMessage.style.color =
            "#166534";
    }
}


function showRoutineMessage(
    message,
    isError
) {

    if (!routineMessage) {
        return;
    }

    routineMessage.textContent =
        message;

    if (isError === true) {

        routineMessage.style.color =
            "#b91c1c";

    } else {

        routineMessage.style.color =
            "#166534";
    }
}


function showRecommendation(
    message
) {

    if (!recommendation) {
        return;
    }

    recommendation.textContent =
        message;
}


function updateAuthenticationUI() {

    const loggedIn =
        currentUser !== null;


    if (loginButton) {

        loginButton.hidden =
            loggedIn;
    }


    if (signupButton) {

        signupButton.hidden =
            loggedIn;
    }


    if (logoutButton) {

        logoutButton.hidden =
            !loggedIn;
    }


    if (emailInput) {

        emailInput.disabled =
            loggedIn;
    }


    if (passwordInput) {

        passwordInput.disabled =
            loggedIn;
    }


    if (loggedIn) {

        showAuthMessage(
            "Logged in as " +
            currentUser.email,
            false
        );

    } else {

        showAuthMessage(
            "You are not currently logged in.",
            false
        );
    }
}


function disableAuthButtons(
    disabled
) {

    if (loginButton) {

        loginButton.disabled =
            disabled;
    }


    if (signupButton) {

        signupButton.disabled =
            disabled;
    }
}


// ==========================================================
// 5. AUTHENTICATION
// ==========================================================

async function loadSession() {

    const result =
        await supabaseClient.auth.getSession();


    if (result.error) {

        console.error(
            "Session error:",
            result.error
        );

        currentUser = null;

        return;
    }


    if (
        result.data &&
        result.data.session
    ) {

        currentUser =
            result.data.session.user;

    } else {

        currentUser = null;
    }
}


async function signUp() {

    const email =
        emailInput
            ? emailInput.value.trim()
            : "";


    const password =
        passwordInput
            ? passwordInput.value
            : "";


    if (email === "") {

        showAuthMessage(
            "Please enter your email address.",
            true
        );

        return;
    }


    if (password.length < 6) {

        showAuthMessage(
            "Password must contain at least 6 characters.",
            true
        );

        return;
    }


    disableAuthButtons(true);


    showAuthMessage(
        "Creating your account...",
        false
    );


    const result =
        await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

                emailRedirectTo:
                    window.location.origin +
                    window.location.pathname
            }
        });


    disableAuthButtons(false);


    if (result.error) {

        console.error(
            "Signup error:",
            result.error
        );

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

        currentUser =
            result.data.user;


        updateAuthenticationUI();


        showAuthMessage(
            "Account created and signed in.",
            false
        );


        await loadApplicationData();

        return;
    }


    showAuthMessage(
        "Account created. Check your email for the confirmation link, then return here and log in.",
        false
    );
}


async function signIn() {

    const email =
        emailInput
            ? emailInput.value.trim()
            : "";


    const password =
        passwordInput
            ? passwordInput.value
            : "";


    if (email === "") {

        showAuthMessage(
            "Please enter your email address.",
            true
        );

        return;
    }


    if (password === "") {

        showAuthMessage(
            "Please enter your password.",
            true
        );

        return;
    }


    disableAuthButtons(true);


    showAuthMessage(
        "Signing in...",
        false
    );


    const result =
        await supabaseClient.auth
            .signInWithPassword({

                email: email,

                password: password
            });


    disableAuthButtons(false);


    if (result.error) {

        console.error(
            "Login error:",
            result.error
        );

        showAuthMessage(
            result.error.message,
            true
        );

        return;
    }


    currentUser =
        result.data.user;


    if (passwordInput) {

        passwordInput.value =
            "";
    }


    updateAuthenticationUI();


    showAuthMessage(
        "Signed in successfully.",
        false
    );


    showRecommendation(
        "Welcome back. Check your energy, review your routine, or start a focus session."
    );


    await loadApplicationData();
}


async function signOut() {

    const result =
        await supabaseClient.auth.signOut();


    if (result.error) {

        console.error(
            "Logout error:",
            result.error
        );

        showAuthMessage(
            result.error.message,
            true
        );

        return;
    }


    currentUser = null;
    currentCircle = null;

    focusMode = false;
    focusStartTime = null;


    clearPrivateUI();

    updateAuthenticationUI();


    showRecommendation(
        "Log in or create an account to start building your healthier routine."
    );
}


// ==========================================================
// 6. CLEAR PRIVATE UI
// ==========================================================

function clearPrivateUI() {

    if (energyScore) {

        energyScore.textContent =
            "--";
    }


    if (circleNameDisplay) {

        circleNameDisplay.textContent =
            "No Circle Selected";
    }


    if (circleDescriptionDisplay) {

        circleDescriptionDisplay.textContent =
            "Create an accountability circle to get started.";
    }


    if (circleList) {

        circleList.innerHTML =
            "<li>No members loaded yet.</li>";
    }


    if (focusButton) {

        focusButton.textContent =
            "Start Focus Session";
    }


    if (focusStatus) {

        focusStatus.textContent =
            "No focus session active.";
    }


    if (wakeTime) {
        wakeTime.value = "";
    }

    if (breakfastTime) {
        breakfastTime.value = "";
    }

    if (lunchTime) {
        lunchTime.value = "";
    }

    if (dinnerTime) {
        dinnerTime.value = "";
    }

    if (restTime) {
        restTime.value = "";
    }

    if (bedtime) {
        bedtime.value = "";
    }

    if (sleepGoal) {
        sleepGoal.value = "8";
    }
}


// ==========================================================
// 7. CIRCLES
// ==========================================================

async function loadMyCircles() {

    if (!currentUser) {
        return;
    }


    const result =
        await supabaseClient
            .from("circles")
            .select(
                "id, name, description, created_by, created_at"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (result.error) {

        console.error(
            "Load circles error:",
            result.error
        );

        return;
    }


    const circles =
        result.data || [];


    if (circles.length === 0) {

        currentCircle = null;

        displayNoCircle();

        return;
    }


    currentCircle =
        circles[0];


    displayCurrentCircle();


    await loadCircleMembers(
        currentCircle.id
    );
}


function displayCurrentCircle() {

    if (!currentCircle) {

        displayNoCircle();

        return;
    }


    if (circleNameDisplay) {

        circleNameDisplay.textContent =
            currentCircle.name;
    }


    if (circleDescriptionDisplay) {

        if (currentCircle.description) {

            circleDescriptionDisplay.textContent =
                currentCircle.description;

        } else {

            circleDescriptionDisplay.textContent =
                "No description provided.";
        }
    }
}


function displayNoCircle() {

    if (circleNameDisplay) {

        circleNameDisplay.textContent =
            "No Circle Selected";
    }


    if (circleDescriptionDisplay) {

        circleDescriptionDisplay.textContent =
            "Create an accountability circle to get started.";
    }


    if (circleList) {

        circleList.innerHTML =
            "<li>No members loaded yet.</li>";
    }
}


async function createCircle() {

    if (!currentUser) {

        showRecommendation(
            "Please sign in before creating an accountability circle."
        );

        return;
    }


    const name =
        newCircleName
            ? newCircleName.value.trim()
            : "";


    const description =
        newCircleDescription
            ? newCircleDescription.value.trim()
            : "";


    if (name === "") {

        showRecommendation(
            "Enter a name for your accountability circle."
        );

        return;
    }


    if (createCircleButton) {

        createCircleButton.disabled =
            true;

        createCircleButton.textContent =
            "Creating...";
    }


    const result =
        await supabaseClient
            .from("circles")
            .insert({

                name: name,

                description:
                    description,

                created_by:
                    currentUser.id
            })
            .select()
            .single();


    if (createCircleButton) {

        createCircleButton.disabled =
            false;

        createCircleButton.textContent =
            "Create Circle";
    }


    if (result.error) {

        console.error(
            "Create circle error:",
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


    if (newCircleName) {

        newCircleName.value =
            "";
    }


    if (newCircleDescription) {

        newCircleDescription.value =
            "";
    }


    displayCurrentCircle();


    await loadCircleMembers(
        currentCircle.id
    );


    showRecommendation(
        "Accountability circle created successfully."
    );
}


async function loadCircleMembers(
    circleId
) {

    if (!circleId) {
        return;
    }


    const result =
        await supabaseClient
            .from("circle_members")
            .select(
                "id, user_id, role, joined_at"
            )
            .eq(
                "circle_id",
                circleId
            )
            .order(
                "joined_at",
                {
                    ascending: true
                }
            );


    if (result.error) {

        console.error(
            "Load members error:",
            result.error
        );


        if (circleList) {

            circleList.innerHTML =
                "<li>Members could not be loaded.</li>";
        }

        return;
    }


    renderCircleMembers(
        result.data || []
    );
}


function renderCircleMembers(
    members
) {

    if (!circleList) {
        return;
    }


    circleList.innerHTML =
        "";


    if (members.length === 0) {

        circleList.innerHTML =
            "<li>No members yet.</li>";

        return;
    }


    members.forEach(
        function (member) {

            const item =
                document.createElement(
                    "li"
                );


            let name =
                "Member";


            if (
                currentUser &&
                member.user_id ===
                currentUser.id
            ) {

                name =
                    "You";

            } else {

                name =
                    "Member " +
                    member.user_id.substring(
                        0,
                        8
                    );
            }


            item.textContent =
                name +
                " — " +
                capitalize(
                    member.role
                );


            circleList.appendChild(
                item
            );
        }
    );
}


function capitalize(
    value
) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}


// ==========================================================
// 8. CHECK-INS
// ==========================================================

async function saveCheckIn(
    type,
    options
) {

    if (!currentUser) {

        showRecommendation(
            "Please sign in before recording a check-in."
        );

        return null;
    }


    const settings =
        options || {};


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
            settings.energyLevel !== undefined
                ? settings.energyLevel
                : null,

        stress_level:
            settings.stressLevel !== undefined
                ? settings.stressLevel
                : null,

        sleep_hours:
            settings.sleepHours !== undefined
                ? settings.sleepHours
                : null,

        notes:
            settings.notes !== undefined
                ? settings.notes
                : null,

        shared_with_circle:
            settings.shareWithCircle === true
    };


    const result =
        await supabaseClient
            .from("check_ins")
            .insert(
                record
            )
            .select()
            .single();


    if (result.error) {

        console.error(
            "Check-in error:",
            result.error
        );


        showRecommendation(
            "Your check-in could not be saved: " +
            result.error.message
        );


        return null;
    }


    return result.data;
}


async function recordBreakfast() {

    const result =
        await saveCheckIn(
            "breakfast"
        );


    if (result) {

        showRecommendation(
            "Breakfast recorded. Starting your day fueled can help prevent the rushed, low-energy cycle."
        );
    }
}


async function recordLunch() {

    const result =
        await saveCheckIn(
            "lunch"
        );


    if (result) {

        showRecommendation(
            "Lunch recorded. Take a moment to recharge before locking back in."
        );
    }
}


async function recordDinner() {

    const result =
        await saveCheckIn(
            "dinner"
        );


    if (result) {

        showRecommendation(
            "Dinner recorded. Give yourself enough time to digest before your planned bedtime."
        );
    }
}


async function recordRest() {

    const result =
        await saveCheckIn(
            "rest"
        );


    if (result) {

        showRecommendation(
            "Rest recorded. Recovery is part of staying productive."
        );
    }
}


async function recordWorking() {

    const result =
        await saveCheckIn(
            "focus",
            {
                notes:
                    "User manually checked in as working."
            }
        );


    if (result) {

        showRecommendation(
            "Work check-in recorded. Remember to reassess hunger, hydration, and energy afterward."
        );
    }
}


async function recordSleep() {

    const result =
        await saveCheckIn(
            "sleep"
        );


    if (result) {

        showRecommendation(
            "Sleep check-in recorded. Give yourself time to disconnect and recover."
        );
    }
}


async function recordWake() {

    const result =
        await saveCheckIn(
            "wake"
        );


    if (result) {

        showRecommendation(
            "Wake check-in recorded. Check your energy and make time for breakfast before your schedule takes over."
        );
    }
}


// ==========================================================
// 9. ENERGY
// ==========================================================

function updateEnergySliderDisplay() {

    if (
        energyInput &&
        energyValue
    ) {

        energyValue.textContent =
            energyInput.value;
    }
}


async function saveEnergy() {

    if (!currentUser) {

        showRecommendation(
            "Please sign in before saving your energy level."
        );

        return;
    }


    const level =
        Number(
            energyInput
                ? energyInput.value
                : 0
        );


    if (
        level < 1 ||
        level > 10
    ) {

        showRecommendation(
            "Choose an energy level between 1 and 10."
        );

        return;
    }


    if (saveEnergyButton) {

        saveEnergyButton.disabled =
            true;

        saveEnergyButton.textContent =
            "Saving...";
    }


    const result =
        await saveCheckIn(
            "energy",
            {
                energyLevel:
                    level
            }
        );


    if (saveEnergyButton) {

        saveEnergyButton.disabled =
            false;

        saveEnergyButton.textContent =
            "Save Energy Level";
    }


    if (result) {

        await loadLatestEnergy();


        showRecommendation(
            "Energy level saved."
        );
    }
}


async function loadLatestEnergy() {

    if (!currentUser) {

        if (energyScore) {

            energyScore.textContent =
                "--";
        }

        return;
    }


    const result =
        await supabaseClient
            .from("check_ins")
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


    if (result.error) {

        console.error(
            "Load energy error:",
            result.error
        );

        return;
    }


    if (!energyScore) {
        return;
    }


    if (!result.data) {

        energyScore.textContent =
            "--";

        return;
    }


    energyScore.textContent =
        String(
            result.data.energy_level *
            10
        );
}


// ==========================================================
// 10. FOCUS MODE
// ==========================================================

async function handleFocusMode() {

    if (!currentUser) {

        showRecommendation(
            "Please sign in before starting Focus Mode."
        );

        return;
    }


    if (focusMode === false) {

        focusMode =
            true;

        focusStartTime =
            new Date();


        if (focusButton) {

            focusButton.textContent =
                "End Focus Session";
        }


        if (focusStatus) {

            focusStatus.textContent =
                "Focus session active.";
        }


        showRecommendation(
            "Focus mode started. Lock in now; reassess food, water, movement, and rest when you finish."
        );

        return;
    }


    focusMode =
        false;


    const focusEndTime =
        new Date();


    let minutesFocused =
        1;


    if (focusStartTime) {

        minutesFocused =
            Math.max(
                1,
                Math.round(
                    (
                        focusEndTime -
                        focusStartTime
                    ) / 60000
                )
            );
    }


    await saveCheckIn(
        "focus",
        {
            notes:
                "Completed focus session lasting " +
                minutesFocused +
                " minutes."
        }
    );


    if (focusButton) {

        focusButton.textContent =
            "Start Focus Session";
    }


    if (focusStatus) {

        focusStatus.textContent =
            "Last focus session: " +
            minutesFocused +
            " minutes.";
    }


    showRecommendation(
        "Focus session complete. Before locking back in, check whether you need food, water, movement, or rest."
    );


    focusStartTime =
        null;
}


// ==========================================================
// 11. ROUTINE
// ==========================================================

async function saveRoutine() {

    if (!currentUser) {

        showRoutineMessage(
            "Please sign in before saving your routine.",
            true
        );

        return;
    }


    const goal =
        Number(
            sleepGoal
                ? sleepGoal.value
                : 8
        );


    if (
        goal < 1 ||
        goal > 24
    ) {

        showRoutineMessage(
            "Sleep goal must be between 1 and 24 hours.",
            true
        );

        return;
    }


    if (saveRoutineButton) {

        saveRoutineButton.disabled =
            true;

        saveRoutineButton.textContent =
            "Saving...";
    }


    const routineData = {

        user_id:
            currentUser.id,

        wake_time:
            getTimeValue(
                wakeTime
            ),

        breakfast_time:
            getTimeValue(
                breakfastTime
            ),

        lunch_time:
            getTimeValue(
                lunchTime
            ),

        dinner_time:
            getTimeValue(
                dinnerTime
            ),

        rest_start_time:
            getTimeValue(
                restTime
            ),

        bedtime:
            getTimeValue(
                bedtime
            ),

        sleep_goal_hours:
            goal
    };


    const result =
        await supabaseClient
            .from("routines")
            .upsert(
                routineData,
                {
                    onConflict:
                        "user_id"
                }
            )
            .select()
            .single();


    if (saveRoutineButton) {

        saveRoutineButton.disabled =
            false;

        saveRoutineButton.textContent =
            "Save Routine";
    }


    if (result.error) {

        console.error(
            "Routine save error:",
            result.error
        );


        showRoutineMessage(
            "Routine could not be saved: " +
            result.error.message,
            true
        );


        return;
    }


    showRoutineMessage(
        "Your daily routine was saved.",
        false
    );


    showRecommendation(
        "Routine saved. CircleSync can now compare your intended schedule with your actual check-ins."
    );
}


function getTimeValue(
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


async function loadRoutine() {

    if (!currentUser) {
        return;
    }


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


    if (result.error) {

        console.error(
            "Routine load error:",
            result.error
        );

        return;
    }


    if (!result.data) {
        return;
    }


    setTimeInput(
        wakeTime,
        result.data.wake_time
    );


    setTimeInput(
        breakfastTime,
        result.data.breakfast_time
    );


    setTimeInput(
        lunchTime,
        result.data.lunch_time
    );


    setTimeInput(
        dinnerTime,
        result.data.dinner_time
    );


    setTimeInput(
        restTime,
        result.data.rest_start_time
    );


    setTimeInput(
        bedtime,
        result.data.bedtime
    );


    if (sleepGoal) {

        sleepGoal.value =
            result.data.sleep_goal_hours ||
            8;
    }
}


function setTimeInput(
    element,
    value
) {

    if (!element) {
        return;
    }


    if (!value) {

        element.value =
            "";

        return;
    }


    element.value =
        value.substring(
            0,
            5
        );
}


// ==========================================================
// 12. LOAD APPLICATION DATA
// ==========================================================

async function loadApplicationData() {

    if (!currentUser) {
        return;
    }


    await loadLatestEnergy();

    await loadRoutine();

    await loadMyCircles();
}


// ==========================================================
// 13. EVENT LISTENERS
// ==========================================================

if (signupButton) {

    signupButton.addEventListener(
        "click",
        signUp
    );
}


if (loginButton) {

    loginButton.addEventListener(
        "click",
        signIn
    );
}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        signOut
    );
}


if (energyInput) {

    energyInput.addEventListener(
        "input",
        updateEnergySliderDisplay
    );
}


if (saveEnergyButton) {

    saveEnergyButton.addEventListener(
        "click",
        saveEnergy
    );
}


if (focusButton) {

    focusButton.addEventListener(
        "click",
        handleFocusMode
    );
}


if (createCircleButton) {

    createCircleButton.addEventListener(
        "click",
        createCircle
    );
}


if (saveRoutineButton) {

    saveRoutineButton.addEventListener(
        "click",
        saveRoutine
    );
}


if (breakfastButton) {

    breakfastButton.addEventListener(
        "click",
        recordBreakfast
    );
}


if (lunchButton) {

    lunchButton.addEventListener(
        "click",
        recordLunch
    );
}


if (dinnerButton) {

    dinnerButton.addEventListener(
        "click",
        recordDinner
    );
}


if (restButton) {

    restButton.addEventListener(
        "click",
        recordRest
    );
}


if (workingButton) {

    workingButton.addEventListener(
        "click",
        recordWorking
    );
}


if (sleepButton) {

    sleepButton.addEventListener(
        "click",
        recordSleep
    );
}


if (wakeButton) {

    wakeButton.addEventListener(
        "click",
        recordWake
    );
}


if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                currentUser === null
            ) {

                signIn();
            }
        }
    );
}


// ==========================================================
// 14. AUTH STATE LISTENER
// ==========================================================

supabaseClient.auth.onAuthStateChange(
    function (
        event,
        session
    ) {

        if (
            session &&
            session.user
        ) {

            currentUser =
                session.user;

        } else {

            currentUser =
                null;
        }


        updateAuthenticationUI();


        if (
            event === "SIGNED_IN"
        ) {

            window.setTimeout(
                function () {

                    loadApplicationData();

                },
                0
            );
        }


        if (
            event === "SIGNED_OUT"
        ) {

            currentCircle =
                null;

            clearPrivateUI();
        }
    }
);


// ==========================================================
// 15. INITIALIZE
// ==========================================================

async function initializeApp() {

    console.log(
        "CircleSync app.js version 4 loaded."
    );


    updateEnergySliderDisplay();


    await loadSession();


    updateAuthenticationUI();


    if (!currentUser) {

        clearPrivateUI();


        showRecommendation(
            "Log in or create an account to start building your healthier routine."
        );


        console.log(
            "No user currently signed in."
        );


        return;
    }


    await loadApplicationData();


    showRecommendation(
        "Welcome back. Check your energy, review your routine, or begin a focus session."
    );


    console.log(
        "CircleSync ready."
    );
}


// ==========================================================
// 16. START APPLICATION
// ==========================================================

initializeApp();
```
