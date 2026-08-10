```javascript
// ==========================================================
// CIRCLESYNC - COMPLETE APP.JS
// ==========================================================


// ==========================================================
// 1. SUPABASE CONFIGURATION
// ==========================================================

const SUPABASE_URL = "https://mkecbhmkvrtwltejwzua.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_hWxse_7flC8kSKS_xlVkYw_BRUwJ2d8-";

const supabaseClient = window.supabase.createClient(
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
    document.getElementById("new-circle-description");

const createCircleButton =
    document.getElementById("create-circle-btn");


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
// 4. GENERAL UI FUNCTIONS
// ==========================================================

function showAuthMessage(message, isError = false) {

    if (!authMessage) {
        return;
    }

    authMessage.textContent = message;

    authMessage.style.color =
        isError ? "#b91c1c" : "#166534";
}


function showRoutineMessage(message, isError = false) {

    if (!routineMessage) {
        return;
    }

    routineMessage.textContent = message;

    routineMessage.style.color =
        isError ? "#b91c1c" : "#166534";
}


function showRecommendation(message) {

    if (!recommendation) {
        return;
    }

    recommendation.textContent = message;
}


function updateAuthenticationUI() {

    const loggedIn = Boolean(currentUser);

    if (loginButton) {
        loginButton.hidden = loggedIn;
    }

    if (signupButton) {
        signupButton.hidden = loggedIn;
    }

    if (logoutButton) {
        logoutButton.hidden = !loggedIn;
    }

    if (emailInput) {
        emailInput.disabled = loggedIn;
    }

    if (passwordInput) {
        passwordInput.disabled = loggedIn;
    }

    if (loggedIn) {

        showAuthMessage(
            "Logged in as " + currentUser.email
        );

    } else {

        showAuthMessage(
            "You are not currently logged in."
        );
    }
}


// ==========================================================
// 5. GET CURRENT USER
// ==========================================================

async function getCurrentUser() {

    try {

        const response =
            await supabaseClient.auth.getUser();

        if (response.error) {

            console.error(
                "Get user error:",
                response.error
            );

            currentUser = null;

            return null;
        }

        currentUser =
            response.data.user || null;

        return currentUser;

    } catch (error) {

        console.error(
            "Unexpected user error:",
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
        emailInput ? emailInput.value.trim() : "";

    const password =
        passwordInput ? passwordInput.value : "";


    if (!email || !password) {

        showAuthMessage(
            "Please enter an email and password.",
            true
        );

        return;
    }


    if (password.length < 6) {

        showAuthMessage(
            "Password must be at least 6 characters.",
            true
        );

        return;
    }


    showAuthMessage(
        "Creating your account..."
    );


    const response =
        await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

                emailRedirectTo:
                    window.location.origin +
                    window.location.pathname
            }
        });


    if (response.error) {

        console.error(
            "Signup error:",
            response.error
        );

        showAuthMessage(
            response.error.message,
            true
        );

        return;
    }


    if (response.data.session) {

        currentUser =
            response.data.user;

        showAuthMessage(
            "Account created successfully."
        );

        updateAuthenticationUI();

        await loadApplicationData();

    } else {

        showAuthMessage(
            "Account created. Check your email to confirm your account."
        );
    }
}


// ==========================================================
// 7. LOGIN
// ==========================================================

async function login() {

    const email =
        emailInput ? emailInput.value.trim() : "";

    const password =
        passwordInput ? passwordInput.value : "";


    if (!email || !password) {

        showAuthMessage(
            "Please enter your email and password.",
            true
        );

        return;
    }


    showAuthMessage(
        "Logging in..."
    );


    const response =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password
        });


    if (response.error) {

        console.error(
            "Login error:",
            response.error
        );

        showAuthMessage(
            response.error.message,
            true
        );

        return;
    }


    currentUser =
        response.data.user;


    if (passwordInput) {

        passwordInput.value = "";
    }


    updateAuthenticationUI();

    showAuthMessage(
        "Welcome back, " +
        currentUser.email
    );


    await loadApplicationData();
}


// ==========================================================
// 8. LOGOUT
// ==========================================================

async function logout() {

    const response =
        await supabaseClient.auth.signOut();


    if (response.error) {

        console.error(
            "Logout error:",
            response.error
        );

        showAuthMessage(
            response.error.message,
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
// 9. CLEAR PRIVATE UI
// ==========================================================

function clearPrivateUI() {

    if (energyScore) {
        energyScore.textContent = "--";
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
// 10. LOAD CIRCLES
// ==========================================================

async function loadMyCircles() {

    if (!currentUser) {

        currentCircle = null;

        return [];
    }


    const response =
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


    if (response.error) {

        console.error(
            "Load circles error:",
            response.error
        );

        return [];
    }


    const circles =
        response.data || [];


    if (circles.length > 0) {

        currentCircle =
            circles[0];

        displayCurrentCircle();

        await loadCircleMembers(
            currentCircle.id
        );

    } else {

        currentCircle = null;

        displayNoCircle();
    }


    return circles;
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
        newCircleName
            ? newCircleName.value.trim()
            : "";


    const description =
        newCircleDescription
            ? newCircleDescription.value.trim()
            : "";


    if (!name) {

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


    const response =
        await supabaseClient
            .from("circles")
            .insert({

                name: name,

                description: description,

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


    if (response.error) {

        console.error(
            "Create circle error:",
            response.error
        );

        showRecommendation(
            "Circle could not be created: " +
            response.error.message
        );

        return;
    }


    currentCircle =
        response.data;


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
        "Your accountability circle \"" +
        currentCircle.name +
        "\" was created."
    );
}


// ==========================================================
// 13. LOAD CIRCLE MEMBERS
// ==========================================================

async function loadCircleMembers(circleId) {

    if (!circleId) {
        return [];
    }


    const response =
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


    if (response.error) {

        console.error(
            "Load members error:",
            response.error
        );


        if (circleList) {

            circleList.innerHTML =
                "<li>Members could not be loaded.</li>";
        }

        return [];
    }


    const members =
        response.data || [];


    renderCircleMembers(
        members
    );


    return members;
}


// ==========================================================
// 14. RENDER CIRCLE MEMBERS
// ==========================================================

function renderCircleMembers(members) {

    if (!circleList) {
        return;
    }


    circleList.innerHTML = "";


    if (members.length === 0) {

        circleList.innerHTML =
            "<li>No members yet.</li>";

        return;
    }


    members.forEach(function (member) {

        const item =
            document.createElement("li");


        const isCurrentUser =
            currentUser &&
            member.user_id === currentUser.id;


        let memberName;


        if (isCurrentUser) {

            memberName = "You";

        } else {

            memberName =
                "Member " +
                member.user_id.substring(
                    0,
                    8
                );
        }


        item.textContent =
            memberName +
            " — " +
            capitalize(member.role);


        circleList.appendChild(
            item
        );
    });
}


// ==========================================================
// 15. CAPITALIZE HELPER
// ==========================================================

function capitalize(value) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
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


    const energyLevel =
        options.energyLevel !== undefined
            ? options.energyLevel
            : null;


    const stressLevel =
        options.stressLevel !== undefined
            ? options.stressLevel
            : null;


    const sleepHours =
        options.sleepHours !== undefined
            ? options.sleepHours
            : null;


    const notes =
        options.notes !== undefined
            ? options.notes
            : null;


    const shareWithCircle =
        options.shareWithCircle === true;


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
            shareWithCircle
    };


    const response =
        await supabaseClient
            .from("check_ins")
            .insert(record)
            .select()
            .single();


    if (response.error) {

        console.error(
            "Check-in error:",
            response.error
        );

        showRecommendation(
            "Your check-in could not be saved: " +
            response.error.message
        );

        return null;
    }


    console.log(
        "Check-in saved:",
        response.data
    );


    updateRecommendationAfterCheckIn(
        type
    );


    return response.data;
}


// ==========================================================
// 17. CHECK-IN RECOMMENDATIONS
// ==========================================================

function updateRecommendationAfterCheckIn(type) {

    const messages = {

        breakfast:
            "Breakfast recorded. You are starting your day with fuel.",

        lunch:
            "Lunch recorded. Take a moment to recharge before locking back in.",

        dinner:
            "Dinner recorded. Give yourself enough time to digest before bed.",

        snack:
            "Snack recorded. Continue paying attention to your hunger and energy.",

        rest:
            "Rest recorded. Recovery is part of staying productive.",

        focus:
            "Focus activity recorded. Remember to check whether you need food, water, or rest afterward.",

        sleep:
            "Sleep check-in recorded. Give yourself time to disconnect and recover.",

        wake:
            "Good morning. Check your energy and give yourself enough time for breakfast.",

        energy:
            "Energy level saved.",

        stress:
            "Stress check-in saved.",

        general:
            "Check-in saved."
    };


    if (messages[type]) {

        showRecommendation(
            messages[type]
        );

    } else {

        showRecommendation(
            "Check-in saved."
        );
    }
}


// ==========================================================
// 18. ENERGY SLIDER
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
        await checkIn(
            "energy",
            {
                energyLevel: level
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
            energyScore.textContent = "--";
        }

        return;
    }


    const response =
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


    if (response.error) {

        console.error(
            "Load energy error:",
            response.error
        );

        return;
    }


    if (!energyScore) {
        return;
    }


    if (!response.data) {

        energyScore.textContent =
            "--";

        return;
    }


    const percentage =
        response.data.energy_level * 10;


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
            "Focus mode started. Lock in on your task. When you finish, check whether you need food, water, or rest."
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
                        focusEndTime -
                        focusStartTime
                    ) / 60000
                )
            );
    }


    if (focusButton) {

        focusButton.textContent =
            "Start Focus Session";
    }


    if (focusStatus) {

        focusStatus.textContent =
            "Last focus session: " +
            minutesFocused +
            " minute" +
            (
                minutesFocused === 1
                    ? "."
                    : "s."
            );
    }


    await checkIn(
        "focus",
        {
            notes:
                "Focus session completed after " +
                minutesFocused +
                " minutes."
        }
    );


    showRecommendation(
        "You focused for " +
        minutesFocused +
        " minute" +
        (
            minutesFocused === 1
                ? ""
                : "s"
        ) +
        ". Before locking back in, check whether you need food, water, movement, or rest."
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

        breakfast_time:
            breakfastTime &&
            breakfastTime.value
                ? breakfastTime.value
                : null,

        lunch_time:
            lunchTime &&
            lunchTime.value
                ? lunchTime.value
                : null,

        dinner_time:
            dinnerTime &&
            dinnerTime.value
                ? dinnerTime.value
                : null,

        rest_start_time:
            restTime &&
            restTime.value
                ? restTime.value
                : null,

        bedtime:
            bedtime &&
            bedtime.value
                ? bedtime.value
                : null,

        wake_time:
            wakeTime &&
            wakeTime.value
                ? wakeTime.value
                : null,

        sleep_goal_hours:
            goal
    };


    const response =
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


    if (response.error) {

        console.error(
            "Save routine error:",
            response.error
        );

        showRoutineMessage(
            "Routine could not be saved: " +
            response.error.message,
            true
        );

        return;
    }


    showRoutineMessage(
        "Your daily routine was saved successfully."
    );


    showRecommendation(
        "Your routine is saved. CircleSync can now compare your check-ins with the times you want to eat, rest, sleep, and wake."
    );
}


// ==========================================================
// 23. LOAD ROUTINE
// ==========================================================

async function loadRoutine() {

    if (!currentUser) {
        return;
    }


    const response =
        await supabaseClient
            .from("routines")
            .select(
                "breakfast_time, lunch_time, dinner_time, rest_start_time, bedtime, wake_time, sleep_goal_hours"
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .maybeSingle();


    if (response.error) {

        console.error(
            "Load routine error:",
            response.error
        );

        return;
    }


    const data =
        response.data;


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
            data.sleep_goal_hours || 8;
    }
}


// ==========================================================
// 24. FORMAT DATABASE TIME
// ==========================================================

function formatTimeForInput(value) {

    if (!value) {
        return "";
    }


    return value.substring(
        0,
        5
    );
}


// ==========================================================
// 25. LOAD ALL USER DATA
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
// 26. EVENT LISTENERS
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
        login
    );
}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
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


if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !currentUser
            ) {

                login();
            }
        }
    );
}


// ==========================================================
// 27. SUPABASE AUTH STATE CHANGES
// ==========================================================

supabaseClient.auth.onAuthStateChange(
    function (event, session) {

        console.log(
            "Authentication event:",
            event
        );


        currentUser =
            session
                ? session.user
                : null;


        updateAuthenticationUI();


        if (
            event === "SIGNED_IN" &&
            currentUser
        ) {

            setTimeout(
                function () {

                    loadApplicationData();

                },
                0
            );
        }


        if (event === "SIGNED_OUT") {

            currentCircle = null;

            clearPrivateUI();
        }
    }
);


// ==========================================================
// 28. INITIALIZE CIRCLESYNC
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
// 29. START APPLICATION
// ==========================================================

initializeApp();
```

