"use strict";

console.log("CircleSync app.js v50 loaded");


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
        sessionResult.data &&
        sessionResult.data.session
    ) {

        window.location.replace(
            "dashboard.html"
        );

        return;
    }



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

                    setMessage(
                        result.error.message,
                        true
                    );

                    return;
                }



                window.location.replace(
                    "dashboard.html"
                );


            } catch (error) {


                console.error(
                    "Sign in error:",
                    error
                );


                setMessage(
                    "Unable to sign in.",
                    true
                );


            } finally {


                setBusy(false);

            }

        }
    );



    signupButton.addEventListener(
        "click",
        async function () {


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;



            if (!email) {

                setMessage(
                    "Enter your email.",
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
                "Creating account...",
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

                    window.location.replace(
                        "dashboard.html"
                    );

                    return;
                }



                setMessage(
                    "Account created. Check your email to confirm it.",
                    false
                );


            } catch (error) {


                console.error(
                    "Sign up error:",
                    error
                );


                setMessage(
                    "Unable to create account.",
                    true
                );


            } finally {


                setBusy(false);

            }

        }
    );

}



// ==========================================================
// DASHBOARD
// ==========================================================

async function initDashboardPage() {


    let currentCircle =
        null;


    let focusActive =
        false;


    let focusStartedAt =
        null;



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


    const recommendation =
        document.getElementById(
            "recommendation"
        );


    userEmail.textContent =
        currentUser.email;



    function showRecommendation(
        text
    ) {

        recommendation.textContent =
            text;
    }



    // ======================================================
    // LOGOUT
    // ======================================================


    document
        .getElementById(
            "logout-btn"
        )
        .addEventListener(
            "click",
            async function () {


                await supabaseClient.auth
                    .signOut();


                window.location.replace(
                    "index.html"
                );

            }
        );



    // ======================================================
    // MEMBERSHIP IDS
    // ======================================================


    async function getMyCircleIds() {


        const result =
            await supabaseClient
                .from(
                    "circle_members"
                )
                .select(
                    "circle_id"
                )
                .eq(
                    "user_id",
                    currentUser.id
                );



        if (
            result.error
        ) {

            console.error(
                "Membership error:",
                result.error
            );

            return [];
        }



        return result.data.map(
            function (membership) {

                return membership.circle_id;

            }
        );

    }



    // ======================================================
    // LOAD MY CIRCLE
    // ======================================================


    async function loadMyCircles() {


        const circleIds =
            await getMyCircleIds();



        if (
            circleIds.length === 0
        ) {


            currentCircle =
                null;


            document.getElementById(
                "circle-name"
            ).textContent =
                "No Circle Selected";


            document.getElementById(
                "circle-description"
            ).textContent =
                "Create or join an accountability circle.";


            document.getElementById(
                "circle-list"
            ).innerHTML =
                "<li>No members loaded yet.</li>";


            return;

        }



        const result =
            await supabaseClient
                .from(
                    "circles"
                )
                .select(
                    "id, name, description, created_by"
                )
                .in(
                    "id",
                    circleIds
                )
                .order(
                    "created_at",
                    {

                        ascending:
                            false
                    }
                );



        if (
            result.error ||
            !result.data ||
            result.data.length === 0
        ) {

            return;
        }



        currentCircle =
            result.data[0];



        document.getElementById(
            "circle-name"
        ).textContent =
            currentCircle.name;



        document.getElementById(
            "circle-description"
        ).textContent =
            currentCircle.description ||
            "No description provided.";



        await loadCircleMembers();

    }



    // ======================================================
    // MEMBERS
    // ======================================================


    async function loadCircleMembers() {


        const circleList =
            document.getElementById(
                "circle-list"
            );



        if (
            !currentCircle
        ) {

            circleList.innerHTML =
                "<li>No members yet.</li>";

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
                    currentCircle.id
                );



        if (
            result.error
        ) {

            circleList.innerHTML =
                "<li>Unable to load members.</li>";

            return;
        }



        circleList.innerHTML =
            "";



        result.data.forEach(
            function (member) {


                const item =
                    document.createElement(
                        "li"
                    );


                if (
                    member.user_id ===
                    currentUser.id
                ) {

                    item.textContent =
                        "You — " +
                        member.role;

                } else {

                    item.textContent =
                        "Circle Member — " +
                        member.role;
                }


                circleList.appendChild(
                    item
                );

            }
        );

    }



    // ======================================================
    // DISCOVER PUBLIC GROUPS
    // ======================================================


    async function loadDiscoverGroups() {


        const container =
            document.getElementById(
                "discover-groups"
            );


        container.innerHTML =
            "<p>Loading groups...</p>";



        const myCircleIds =
            await getMyCircleIds();



        const result =
            await supabaseClient
                .from(
                    "circles"
                )
                .select(
                    "id, name, description, created_by, is_public, created_at"
                )
                .eq(
                    "is_public",
                    true
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
                "Group discovery error:",
                result.error
            );


            container.innerHTML =
                "<p>Unable to load groups.</p>";


            return;

        }



        const availableGroups =
            result.data.filter(
                function (circle) {


                    return !myCircleIds.includes(
                        circle.id
                    );

                }
            );



        container.innerHTML =
            "";



        if (
            availableGroups.length === 0
        ) {


            container.innerHTML =
                "<p>No new public groups are available right now.</p>";


            return;

        }



        availableGroups.forEach(
            function (circle) {


                const groupCard =
                    document.createElement(
                        "div"
                    );


                groupCard.className =
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



                const joinButton =
                    document.createElement(
                        "button"
                    );


                joinButton.type =
                    "button";


                joinButton.textContent =
                    "Join Group";


                joinButton.className =
                    "join-group-btn";



                joinButton.addEventListener(
                    "click",
                    async function () {


                        joinButton.disabled =
                            true;


                        joinButton.textContent =
                            "Joining...";



                        const joined =
                            await joinCircle(
                                circle
                            );



                        if (!joined) {


                            joinButton.disabled =
                                false;


                            joinButton.textContent =
                                "Join Group";

                        }

                    }
                );



                groupCard.appendChild(
                    title
                );


                groupCard.appendChild(
                    description
                );


                groupCard.appendChild(
                    joinButton
                );


                container.appendChild(
                    groupCard
                );

            }
        );

    }



    // ======================================================
    // JOIN GROUP
    // ======================================================


    async function joinCircle(
        circle
    ) {


        const result =
            await supabaseClient
                .from(
                    "circle_members"
                )
                .insert({

                    circle_id:
                        circle.id,

                    user_id:
                        currentUser.id,

                    role:
                        "member"

                });



        if (
            result.error
        ) {


            console.error(
                "Join group error:",
                result.error
            );



            if (
                result.error.code ===
                "23505"
            ) {

                showRecommendation(
                    "You already belong to that group."
                );

            } else {

                showRecommendation(
                    "Unable to join group: " +
                    result.error.message
                );
            }


            return false;

        }



        currentCircle =
            circle;



        showRecommendation(
            "You joined " +
            circle.name +
            "."
        );



        await loadMyCircles();


        await loadDiscoverGroups();


        return true;

    }



    // ======================================================
    // REFRESH GROUPS
    // ======================================================


    document
        .getElementById(
            "refresh-groups-btn"
        )
        .addEventListener(
            "click",
            loadDiscoverGroups
        );



    // ======================================================
    // CREATE GROUP
    // ======================================================


    document
        .getElementById(
            "create-circle-btn"
        )
        .addEventListener(
            "click",
            async function () {


                const nameInput =
                    document.getElementById(
                        "new-circle-name"
                    );


                const descriptionInput =
                    document.getElementById(
                        "new-circle-description"
                    );


                const name =
                    nameInput.value.trim();


                const description =
                    descriptionInput.value.trim();



                if (!name) {


                    showRecommendation(
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


                    console.error(
                        "Create group error:",
                        result.error
                    );


                    showRecommendation(
                        "Unable to create circle: " +
                        result.error.message
                    );


                    return;

                }



                nameInput.value =
                    "";


                descriptionInput.value =
                    "";



                showRecommendation(
                    "Your new accountability circle was created."
                );



                await loadMyCircles();


                await loadDiscoverGroups();

            }
        );



    // ======================================================
    // CHECK INS
    // ======================================================


    async function saveCheckIn(
        type,
        options
    ) {


        const data =
            options || {};



        const result =
            await supabaseClient
                .from(
                    "check_ins"
                )
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
                        data.energy_level !==
                        undefined
                            ? data.energy_level
                            : null,

                    stress_level:
                        null,

                    sleep_hours:
                        null,

                    notes:
                        data.notes ||
                        null,

                    shared_with_circle:
                        false

                });



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



    energyInput.addEventListener(
        "input",
        function () {


            energyValue.textContent =
                energyInput.value;

        }
    );



    document
        .getElementById(
            "save-energy"
        )
        .addEventListener(
            "click",
            async function () {


                const level =
                    Number(
                        energyInput.value
                    );



                const saved =
                    await saveCheckIn(
                        "energy",
                        {

                            energy_level:
                                level

                        }
                    );



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



    // ======================================================
    // QUICK CHECK-IN BUTTONS
    // ======================================================


    const checkIns = [

        [
            "breakfast-btn",
            "breakfast",
            "Breakfast recorded."
        ],

        [
            "lunch-btn",
            "lunch",
            "Lunch recorded."
        ],

        [
            "dinner-btn",
            "dinner",
            "Dinner recorded."
        ],

        [
            "rest-btn",
            "rest",
            "Rest recorded."
        ],

        [
            "working-btn",
            "focus",
            "Working status recorded."
        ],

        [
            "sleep-btn",
            "sleep",
            "Sleep check-in recorded."
        ],

        [
            "wake-btn",
            "wake",
            "Wake check-in recorded."
        ]

    ];



    checkIns.forEach(
        function (item) {


            document
                .getElementById(
                    item[0]
                )
                .addEventListener(
                    "click",
                    async function () {


                        const saved =
                            await saveCheckIn(
                                item[1]
                            );



                        if (saved) {


                            showRecommendation(
                                item[2]
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


                return;

            }



            const endTime =
                new Date();



            const minutes =
                Math.max(
                    1,
                    Math.round(
                        (
                            endTime.getTime() -
                            focusStartedAt.getTime()
                        ) / 60000
                    )
                );



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



            showRecommendation(
                "Focus session complete. Check whether you need food, water, movement, or rest."
            );

        }
    );



    // ======================================================
    // ROUTINE
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


    const routineMessage =
        document.getElementById(
            "routine-message"
        );



    function getTime(
        element
    ) {


        return element.value
            ? element.value
            : null;

    }



    document
        .getElementById(
            "save-routine-btn"
        )
        .addEventListener(
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
                                    Number(
                                        sleepGoal.value
                                    )

                            },
                            {

                                onConflict:
                                    "user_id"

                            }
                        );



                if (
                    result.error
                ) {


                    routineMessage.textContent =
                        result.error.message;


                    return;

                }



                routineMessage.textContent =
                    "Routine saved successfully.";

            }
        );



    // ======================================================
    // INITIAL LOAD
    // ======================================================


    await loadMyCircles();


    await loadDiscoverGroups();



    showRecommendation(
        "Welcome back. Create a circle or discover an existing group."
    );


    console.log(
        "CircleSync dashboard v50 ready."
    );

}
