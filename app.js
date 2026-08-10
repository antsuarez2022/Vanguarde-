```javascript
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
// 3. AUTHENTICATION
// ==========================================================

async function getCurrentUser() {

    const { data, error } =
        await supabaseClient.auth.getUser();

    if (error) {

        console.error(
            "Could not get current user:",
            error
        );

        return null;
    }

    currentUser = data.user;

    return currentUser;
}


// ==========================================================
// 4. LOAD ACCOUNTABILITY CIRCLES
// ==========================================================

async function loadMyCircles() {

    if (!currentUser) {
        return [];
    }

    const { data, error } =
        await supabaseClient
            .from("circles")
            .select(`
                id,
                name,
                description,
                created_by,
                created_at
            `)
            .order(
                "created_at",
                { ascending: false }
            );

    if (error) {

        console.error(
            "Could not load circles:",
            error
        );

        return [];
    }

    if (data && data.length > 0) {

        currentCircle = data[0];

    }

    return data || [];
}


// ==========================================================
// 5. CREATE ACCOUNTABILITY CIRCLE
// ==========================================================

async function createCircle(
    name,
    description = ""
) {

    if (!currentUser) {

        alert(
            "Please log in before creating a circle."
        );

        return null;
    }

    const { data, error } =
        await supabaseClient
            .from("circles")
            .insert({
                name: name,
                description: description,
                created_by: currentUser.id
            })
            .select()
            .single();

    if (error) {

        console.error(
            "Could not create circle:",
            error
        );

        return null;
    }

    currentCircle = data;

    console.log(
        "Circle created:",
        data
    );

    return data;
}


// ==========================================================
// 6. LOAD CIRCLE MEMBERS
// ==========================================================

async function loadCircleMembers(
    circleId
) {

    const { data, error } =
        await supabaseClient
            .from("circle_members")
            .select(`
                id,
                user_id,
                role,
                joined_at
            `)
            .eq(
                "circle_id",
                circleId
            );

    if (error) {

        console.error(
            "Could not load circle members:",
            error
        );

        return [];
    }

    return data || [];
}


// ==========================================================
// 7. SAVE CHECK-IN TO SUPABASE
// ==========================================================

async function checkIn(
    type,
    options = {}
) {

    const recommendation =
        document.getElementById(
            "recommendation"
        );

    if (!currentUser) {

        if (recommendation) {

            recommendation.textContent =
                "Please log in before checking in.";

        }

        return;
    }

    const {
        energyLevel = null,
        stressLevel = null,
        sleepHours = null,
        notes = null,
        shareWithCircle = false
    } = options;


    const { data, error } =
        await supabaseClient
            .from("check_ins")
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
                    energyLevel,

                stress_level:
                    stressLevel,

                sleep_hours:
                    sleepHours,

                notes:
                    notes,

                shared_with_circle:
                    shareWithCircle

            })
            .select()
            .single();


    if (error) {

        console.error(
            "Check-in failed:",
            error
        );

        if (recommendation) {

            recommendation.textContent =
                "Your check-in could not be saved.";

        }

        return;
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
// 8. RECOMMENDATION SYSTEM
// ==========================================================

function showRecommendation(
    message
) {

    const recommendation =
        document.getElementById(
            "recommendation"
        );

    if (!recommendation) {
        return;
    }

    recommendation.textContent =
        message;
}


function updateRecommendationAfterCheckIn(
    type
) {

    const messages = {

        breakfast:
            "Breakfast recorded. Start your day fueled.",

        lunch:
            "Lunch recorded. Take a moment before returning to work.",

        dinner:
            "Dinner recorded. Begin thinking about your evening wind-down routine.",

        rest:
            "Rest recorded. Give yourself time to recharge.",

        focus:
            "Focus activity recorded. Check your energy level when you're finished.",

        sleep:
            "Sleep check-in recorded. Time to disconnect and recover.",

        wake:
            "Good morning. Check your energy level before starting your day.",

        energy:
            "Energy level recorded.",

        stress:
            "Stress level recorded."

    };


    showRecommendation(

        messages[type] ||
        "Check-in saved."

    );
}


// ==========================================================
// 9. FOCUS MODE
// ==========================================================

const focusButton =
    document.getElementById(
        "focus-btn"
    );


if (focusButton) {

    focusButton.addEventListener(
        "click",
        handleFocusMode
    );

}


async function handleFocusMode() {

    if (!focusMode) {

        focusMode = true;

        focusStartTime =
            new Date();

        focusButton.textContent =
            "End Focus Session";

        showRecommendation(
            "Focus mode started. Stay locked in, and remember to check your body when you finish."
        );

        await checkIn(
            "focus",
            {
                notes:
                    "Focus session started."
            }
        );

    } else {

        focusMode = false;

        const focusEndTime =
            new Date();

        const minutesFocused =
            Math.max(
                1,
                Math.round(
                    (
                        focusEndTime -
                        focusStartTime
                    )
                    / 60000
                )
            );

        focusButton.textContent =
            "Start Focus Session";

        showRecommendation(
            `Focus session complete: ${minutesFocused} minutes. Check whether you need food, water, or rest.`
        );

        await checkIn(
            "focus",
            {
                notes:
                    `Focus session completed after ${minutesFocused} minutes.`
            }
        );

        focusStartTime = null;
    }
}


// ==========================================================
// 10. LOAD LATEST ENERGY SCORE
// ==========================================================

async function loadLatestEnergy() {

    if (!currentUser) {
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
                { ascending: false }
            )
            .limit(1)
            .maybeSingle();


    if (error) {

        console.error(
            "Could not load energy:",
            error
        );

        return;
    }


    const energyDisplay =
        document.getElementById(
            "energy-score"
        );


    if (!energyDisplay) {
        return;
    }


    if (!data) {

        energyDisplay.textContent =
            "--";

        return;
    }


    energyDisplay.textContent =
        data.energy_level * 10;
}


// ==========================================================
// 11. SAVE ENERGY LEVEL
// ==========================================================

const saveEnergyButton =
    document.getElementById(
        "save-energy"
    );


if (saveEnergyButton) {

    saveEnergyButton.addEventListener(
        "click",
        async () => {

            const energyInput =
                document.getElementById(
                    "energy-input"
                );

            if (!energyInput) {
                return;
            }

            const energyLevel =
                Number(
                    energyInput.value
                );


            await checkIn(
                "energy",
                {
                    energyLevel:
                        energyLevel
                }
            );


            await loadLatestEnergy();

        }
    );

}


// ==========================================================
// 12. APPLICATION STARTUP
// ==========================================================

async function initializeApp() {

    console.log(
        "Starting CircleSync..."
    );

    currentUser =
        await getCurrentUser();


    if (!currentUser) {

        console.log(
            "No authenticated user is currently logged in."
        );

        showRecommendation(
            "Log in to start tracking your routine."
        );

        return;
    }


    console.log(
        "Logged in as:",
        currentUser.email
    );


    await loadMyCircles();

    await loadLatestEnergy();


    console.log(
        "CircleSync is ready."
    );
}


// Start application
initializeApp();
```

