```javascript
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
// 3. ELEMENT REFERENCES
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


// Circles
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
    document.getElementById("save-routine-btn");

const routineMessage =
    document.getElementById("routine-message");


// Recommendation
const recommendation =
    document.getElementById("recommendation");


// ==========================================================
// 4. GENERAL UI HELPERS
// ==========================================================

function showAuthMessage(
    message,
    isError = false
) {

    if (!authMessage) {
        return;
    }

    authMessage.textContent = message;

    authMessage.style.color =
        isError
            ? "#b91c1c"
            : "#166534";
}


function showRoutineMessage(
    message,
    isError = false
) {

    if (!routineMessage) {
        return;
    }

    routineMessage.textContent = message;

    routineMessage.style.color =
        isError
            ? "#b91c1c"
            : "#166534";
}


function showRecommendation(message) {

    if (!recommendation) {
        return;
    }

    recommendation.textContent =
        message;
}


function updateAuthenticationUI() {

    const loggedIn =
        Boolean(currentUser);

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
            `Logged in as ${currentUser.email}`
        );

    } else {

        showAuthMessage(
            "You are not currently logged in."
        );
    }
}


// ==========================================================
// 5. AUTHENTICATION - CURRENT USER
// ==========================================================

async function getCurrentUser() {

    try {

        const { data, error } =
            await supabaseClient.auth.getUser();

        if (error) {

            console.error(
                "Get user error:",
                error
            );

            currentUser = null;

            return null;
        }

        currentUser =
            data.user || null;

        return currentUser;

    } catch (error) {

        console.error(
            "Unexpected get user error:",
            error
        );

        currentUser = null;

        return null;
    }
}


// ==========================================================
// 6. SIGN UP
// ==========================================================

async function signUp() {

    const email =
        emailInput?.value.trim();

    const password =
        passwordInput?.value;


    if (!email || !password) {

        showAuthMessage(
            "Enter an email and password.",
            true
        );

        return;
    }


    if (password.length < 6) {

        showAuthMessage(
            "Your password must be at least 6 characters.",
            true
        );

        return;
    }


    showAuthMessage(
        "Creating your account..."
    );


    const { data, error } =
        await supabaseClient.auth.signUp({
            email,
            password
        });


    if (error) {

        console.error(
            "Signup error:",
            error
        );

        showAuthMessage(
            error.message,
            true
        );

        return;
    }


    if (data.session) {

        currentUser =
            data.user;

        showAuthMessage(
            "Account created successfully."
        );

        updateAuthenticationUI();

        await loadApplicationData();

    } else {

        showAuthMessage(
            "Account created. Check your email to confirm your account before logging in."
        );
    }
}


// ==========================================================
// 7. LOGIN
// ==========================================================

async function login() {

    const email =
        emailInput?.value.trim();

    const password =
        passwordInput?.value;


    if (!email || !password) {

        showAuthMessage(
            "Enter your email and password.",
            true
        );

        return;
    }


    showAuthMessage(
        "Logging in..."
    );


    const { data, error } =
        await supabaseClient.auth
            .signInWithPassword({
                email,
                password
            });


    if (error) {

        console.error(
            "Login error:",
            error
        );

        showAuthMessage(
            error.message,
            true
        );

        return;
    }


    currentUser =
        data.user;


    showAuthMessage(
        `Welcome back, ${currentUser.email}`
    );


    if (passwordInput) {
        passwordInput.value = "";
    }


    updateAuthenticationUI();

    await loadApplicationData();
}


// ==========================================================
// 8. LOGOUT
// ==========================================================

async function logout() {

    const { error } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            "Logout error:",
            error
        );

        showAuthMessage(
            error.message,
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
        "Log in to start tracking your routine."
    );
}


// ==========================================================
// 9. CLEAR USER-SPECIFIC UI
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
            "Create or join an accountability circle to get started.";
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
// 10. LOAD ACCOUNTABILITY CIRCLES
// ==========================================================

async function loadMyCircles() {

    if (!currentUser) {

        currentCircle = null;

        return [];
    }


    const { data, error } =
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


    if (error) {

        console.error(
            "Load circles error:",
            error
        );

        return [];
    }


    if (data && data.length > 0) {

        currentCircle =
            data[0];

        displayCurrentCircle();

        await loadCircleMembers(
            currentCircle.id
        );

    } else {

        currentCircle = null;

        displayNoCircle();
    }


    return data || [];
}


// ==========================================================
// 11. DISPLAY CURRENT CIRCLE
// ==========================================================

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

        circleDescriptionDisplay.textContent =
            currentCircle.description ||
            "No description provided.";
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


// ==========================================================
// 12. CREATE CIRCLE
// ==========================================================

async function createCircle() {

    if (!currentUser) {

        showRecommendation(
            "Log in before creating an accountability circle."
        );

        return;
    }


    const name =
        newCircleName?.value.trim();

    const description =
        newCircleDescription?.value.trim()
        || "";


    if (!name) {

        showRecommendation(
            "Enter a name for your accountability circle."
        );

        newCircleName?.focus();

        return;
    }


    if (createCircleButton) {

        createCircleButton.disabled =
            true;

        createCircleButton.textContent =
            "Creating...";
    }


    const { data, error } =
        await supabaseClient
            .from("circles")
            .insert({
                name,
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


    if (error) {

        console.error(
            "Create circle error:",
            error
        );

        showRecommendation(
            `Circle could not be created: ${error.message}`
        );

        return;
    }


    currentCircle = data;


    if (newCircleName) {
        newCircleName.value = "";
    }

    if (newCircleDescription) {
        newCircleDescription.value = "";
    }


    displayCurrentCircle();


    await loadCircleMembers(
        currentCircle.id
    );


    showRecommendation(
        `Your accountability circle "${currentCircle.name}" was created.`
    );
}


// ==========================================================
// 13. LOAD CIRCLE MEMBERS
// ==========================================================

async function loadCircleMembers(
    circleId
) {

    if (!circleId) {
        return [];
    }


    const { data, error } =
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


    if (error) {

        console.error(
            "Load members error:",
            error
        );


        if (circleList) {

            circleList.innerHTML =
                "<li>Members could not be loaded.</li>";
        }

        return [];
    }


    renderCircleMembers(
        data || []
    );


    return data || [];
}


// ==========================================================
// 14. DISPLAY CIRCLE MEMBERS
// ==========================================================

function renderCircleMembers(
    members
) {

    if (!circleList) {
        return;
    }


    circleList.innerHTML = "";


    if (!members.length) {

        circleList.innerHTML =
            "<li>No members yet.</li>";

        return;
    }


    members.forEach(
        member => {

            const item =
                document.createElement("li");


            const isCurrentUser =
                member.user_id ===
                currentUser?.id;


            const memberName =
                isCurrentUser
                    ? "You"
                    : `Member ${member.user_id.substring(0, 8)}`;


            item.textContent =
                `${memberName} — ${capitalize(member.role)}`;


            circleList.appendChild(
                item
            );
        }
    );
}


// ==========================================================
// 15. HELPER - CAPITALIZE TEXT
// ==========================================================

function capitalize(value) {

    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase()
        +
        value.slice(1)
    );
}


// ==========================================================
// 16. CHECK-IN
// ==========================================================

async function checkIn(
    type,
    options = {}
) {

    if (!currentUser) {

        showRecommendation(
            "Please log in before recording a check-in."
        );

        return null;
    }


    const allowedTypes = [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "rest",
        "sleep",
        "wake",
        "focus",
        "energy",
        "stress",
        "general"
    ];


    if (!allowedTypes.includes(type)) {

        console.error(
            "Invalid check-in type:",
            type
        );

        showRecommendation(
            "That check-in type is not supported."
        );

        return null;
    }


    const {
        energyLevel = null,
        stressLevel = null,
        sleepHours = null,
        notes = null,
        shareWithCircle = false
    } = options;


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
            energyLevel,

        stress_level:
            stressLevel,

        sleep_hours:
            sleepHours,

        notes:
            notes,

        shared_with_circle:
            Boolean(
                shareWithCircle
            )
    };


    const { data, error } =
        await supabaseClient
            .from("check_ins")
            .insert(record)
            .select()
            .single();


    if (error) {

        console.error(
            "Check-in error:",
            error
        );

        showRecommendation(
            `Your check-in could not be saved: ${error.message}`
        );

        return null;
    }


    console.log(
        "Check-in saved:",
        data
    );


    updateRecommendationAfterCheckIn(
        type
    );


    return data;
}


// ==========================================================
// 17. CHECK-IN RECOMMENDATIONS
// ==========================================================

function updateRecommendationAfterCheckIn(
    type
) {

    const messages = {

        breakfast:
            "Breakfast recorded. You are starting the day with fuel instead of skipping your first meal.",

        lunch:
            "Lunch recorded. Take a moment to recharge before locking back in.",

        dinner:
            "Dinner recorded. Give yourself enough time to digest and begin winding down before bed.",

        snack:
            "Snack recorded. Continue paying attention to your hunger and energy.",

        rest:
            "Rest recorded. Recovery is part of staying productive.",

        focus:
            "Focus activity recorded. Remember to check whether you need food, water, movement, or rest afterward.",

        sleep:
            "Sleep check-in recorded. Give yourself space to disconnect and recover.",

        wake:
            "Good morning. Check your energy level and give yourself enough time for breakfast.",

        energy:
            "Energy level saved. CircleSync can use these check-ins to help you recognize patterns.",

        stress:
            "Stress check-in saved. Consider whether food, rest, or a break would help right now.",

        general:
            "Check-in saved."
    };


    showRecommendation(
        messages[type]
        ||
        "Check-in saved."
    );
}


// ==========================================================
// 18. ENERGY SLIDER DISPLAY
// ==========================================================

function updateEnergySliderDisplay() {

    if (
        energyInput
        &&
        energyValue
    ) {

        energyValue.textContent =
            energyInput.value;
    }
}


// ==========================================================
// 19. SAVE ENERGY
// ==========================================================

async function saveEnergy() {

    if (!currentUser) {

        showRecommendation(
            "Log in before saving your energy level."
        );

        return;
    }


    const level =
        Number(
            energyInput?.value
        );


    if (
        !Number.isInteger(level)
        ||
        level < 1
        ||
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
        await checkIn(
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
    }
}


// ==========================================================
// 20. LOAD LATEST ENERGY
// ==========================================================

async function loadLatestEnergy() {

    if (!currentUser) {

        if (energyScore) {
            energyScore.textContent =
                "--";
        }

        return;
    }


    const { data, error } =
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


    if (error) {

        console.error(
            "Load energy error:",
            error
        );

        return;
    }


    if (!energyScore) {
        return;
    }


    if (!data) {

        energyScore.textContent =
            "--";

        return;
    }


    // Database stores energy from 1-10.
    // UI displays it as a score out of 100.

    const percentage =
        data.energy_level * 10;


    energyScore.textContent =
        percentage;
}


// ==========================================================
// 21. FOCUS MODE
// ==========================================================

async function handleFocusMode() {

    if (!currentUser) {

        showRecommendation(
            "Log in before starting Focus Mode."
        );

        return;
    }


    if (!focusMode) {

        focusMode = true;

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
            "Focus mode started. Lock in on your task. When you finish, CircleSync will remind you to check whether you need food, water, or rest."
        );


        await checkIn(
            "focus",
            {
                notes:
                    "Focus session started."
            }
        );


        return;
    }


    focusMode = false;


    const focusEndTime =
        new Date();


    let minutesFocused = 0;


    if (focusStartTime) {

        minutesFocused =
            Math.max(
                1,
                Math.round(
                    (
                        focusEndTime
                        -
                        focusStartTime
                    )
                    /
                    60000
                )
            );
    }


    if (focusButton) {

        focusButton.textContent =
            "Start Focus Session";
    }


    if (focusStatus) {

        focusStatus.textContent =
            `Last focus session: ${minutesFocused} minute${minutesFocused === 1 ? "" : "s"}.`;
    }


    await checkIn(
        "focus",
        {
            notes:
                `Focus session completed after ${minutesFocused} minutes.`
        }
    );


    showRecommendation(
        `You focused for ${minutesFocused} minute${minutesFocused === 1 ? "" : "s"}. Before locking back in, check whether you need food, water, movement, or a short rest.`
    );


    focusStartTime = null;
}


// ==========================================================
// 22. SAVE DAILY ROUTINE
// ==========================================================

async function saveRoutine() {

    if (!currentUser) {

        showRoutineMessage(
            "Log in before saving your routine.",
            true
        );

        return;
    }


    const goal =
        Number(
            sleepGoal?.value || 8
        );


    if (
        goal < 1
        ||
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

        breakfast_time:
            breakfastTime?.value
            || null,

        lunch_time:
            lunchTime?.value
            || null,

        dinner_time:
            dinnerTime?.value
            || null,

        rest_start_time:
            restTime?.value
            || null,

        bedtime:
            bedtime?.value
            || null,

        wake_time:
            wakeTime?.value
            || null,

        sleep_goal_hours:
            goal
    };


    const { data, error } =
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


    if (error) {

        console.error(
            "Save routine error:",
            error
        );

        showRoutineMessage(
            `Routine could not be saved: ${error.message}`,
            true
        );

        return;
    }


    console.log(
        "Routine saved:",
        data
    );


    showRoutineMessage(
        "Your daily routine was saved successfully."
    );


    showRecommendation(
        "Your routine is saved. CircleSync can now compare your check-ins against the times you want to eat, rest, sleep, and wake."
    );
}


// ==========================================================
// 23. LOAD DAILY ROUTINE
// ==========================================================

async function loadRoutine() {

    if (!currentUser) {
        return;
    }


    const { data, error } =
        await supabaseClient
            .from("routines")
            .select(`
                breakfast_time,
                lunch_time,
                dinner_time,
                rest_start_time,
                bedtime,
                wake_time,
                sleep_goal_hours
            `)
            .eq(
                "user_id",
                currentUser.id
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Load routine error:",
            error
        );

        return;
    }


    if (!data) {
        return;
    }


    if (breakfastTime) {

        breakfastTime.value =
            formatTimeForInput(
                data.breakfast_time
            );
    }


    if (lunchTime) {

        lunchTime.value =
            formatTimeForInput(
                data.lunch_time
            );
    }


    if (dinnerTime) {

        dinnerTime.value =
            formatTimeForInput(
                data.dinner_time
            );
    }


    if (restTime) {

        restTime.value =
            formatTimeForInput(
                data.rest_start_time
            );
    }


    if (bedtime) {

        bedtime.value =
            formatTimeForInput(
                data.bedtime
            );
    }


    if (wakeTime) {

        wakeTime.value =
            formatTimeForInput(
                data.wake_time
            );
    }


    if (sleepGoal) {

        sleepGoal.value =
            data.sleep_goal_hours
            ??
            8;
    }
}


// ==========================================================
// 24. FORMAT SUPABASE TIME FOR HTML TIME INPUT
// ==========================================================

function formatTimeForInput(
    value
) {

    if (!value) {
        return "";
    }


    // Supabase/Postgres may return:
    // 08:30:00
    //
    // HTML time input wants:
    // 08:30

    return value.substring(
        0,
        5
    );
}


// ==========================================================
// 25. LOAD ALL APPLICATION DATA
// ==========================================================

async function loadApplicationData() {

    if (!currentUser) {
        return;
    }


    await Promise.all([
        loadLatestEnergy(),
        loadRoutine()
    ]);


    await loadMyCircles();
}


// ==========================================================
// 26. EVENT LISTENERS
// ==========================================================


// Sign Up
if (signupButton) {

    signupButton.addEventListener(
        "click",
        signUp
    );
}


// Login
if (loginButton) {

    loginButton.addEventListener(
        "click",
        login
    );
}


// Logout
if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );
}


// Energy Slider
if (energyInput) {

    energyInput.addEventListener(
        "input",
        updateEnergySliderDisplay
    );
}


// Save Energy
if (saveEnergyButton) {

    saveEnergyButton.addEventListener(
        "click",
        saveEnergy
    );
}


// Focus Mode
if (focusButton) {

    focusButton.addEventListener(
        "click",
        handleFocusMode
    );
}


// Create Circle
if (createCircleButton) {

    createCircleButton.addEventListener(
        "click",
        createCircle
    );
}


// Save Routine
if (saveRoutineButton) {

    saveRoutineButton.addEventListener(
        "click",
        saveRoutine
    );
}


// Login by pressing Enter in password field
if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
                &&
                !currentUser
            ) {

                login();
            }
        }
    );
}


// ==========================================================
// 27. AUTH STATE LISTENER
// ==========================================================

supabaseClient.auth.onAuthStateChange(
    async (
        event,
        session
    ) => {

        console.log(
            "Authentication event:",
            event
        );


        currentUser =
            session?.user || null;


        updateAuthenticationUI();


        if (
            event === "SIGNED_IN"
            &&
            currentUser
        ) {

            // Delay prevents doing heavier Supabase requests
            // directly inside the auth callback.

            setTimeout(
                () => {
                    loadApplicationData();
                },
                0
            );
        }


        if (
            event === "SIGNED_OUT"
        ) {

            currentCircle = null;

            clearPrivateUI();
        }
    }
);


// ==========================================================
// 28. INITIALIZE APPLICATION
// ==========================================================

async function initializeApp() {

    console.log(
        "Starting CircleSync..."
    );


    updateEnergySliderDisplay();


    currentUser =
        await getCurrentUser();


    updateAuthenticationUI();


    if (!currentUser) {

        clearPrivateUI();

        showRecommendation(
            "Log in or create an account to start building your healthier routine."
        );


        console.log(
            "CircleSync loaded without an authenticated user."
        );

        return;
    }


    console.log(
        "Authenticated user:",
        currentUser.email
    );


    await loadApplicationData();


    showRecommendation(
        "Welcome back. Check your energy, review your routine, or start a focus session."
    );


    console.log(
        "CircleSync is ready."
    );
}


// ==========================================================
// 29. START CIRCLESYNC
// ==========================================================

initializeApp();
```
