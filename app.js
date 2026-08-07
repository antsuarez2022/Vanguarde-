let focusMode = false;

const focusButton = document.getElementById("focus-btn");

focusButton.addEventListener("click", () => {

    focusMode = !focusMode;

    focusButton.textContent = focusMode

        ? "End Focus Session"

        : "Start Focus Session";

});

function checkIn(type) {

    const recommendation = document.getElementById(

        "recommendation"

    );

    if (type === "eat") {

        recommendation.textContent =

            "Great job! Stay hydrated.";

    }

    if (type === "rest") {

        recommendation.textContent =

            "Nice! You are recharging.";

    }

    if (type === "focus") {

        recommendation.textContent =

            "Stay focused. Take a break in 45 minutes.";

    }

}
