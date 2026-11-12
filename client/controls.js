
const keys = {};
const touchKeys = new Set();

let controlMode = (
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches
) ? "mobile" : "desktop";

// Keyboard controls
window.addEventListener("keydown", event => {
    if (controlMode !== "desktop") return;

    const key = event.key.toLowerCase();

    if ([
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        " "
    ].includes(key)) {
        event.preventDefault();
    }

    keys[key] = true;
});

window.addEventListener("keyup", event => {
    keys[event.key.toLowerCase()] = false;
});

window.addEventListener("blur", () => {
    Object.keys(keys).forEach(key => keys[key] = false);
    touchKeys.clear();
});

// Device selection
function setMode(mode) {
    controlMode = mode;

    document.body.dataset.controlMode = mode;

    document.getElementById("desktop-mode")
        .classList.toggle("active", mode === "desktop");

    document.getElementById("mobile-mode")
        .classList.toggle("active", mode === "mobile");

    document.getElementById("control-hint").textContent =
        mode === "mobile"
            ? "Touch D-Pad — Move"
            : "WASD / Arrow Keys — Move";

    Object.keys(keys).forEach(key => keys[key] = false);
    touchKeys.clear();
}

document.getElementById("desktop-mode")
    .addEventListener("click", () => setMode("desktop"));

document.getElementById("mobile-mode")
    .addEventListener("click", () => setMode("mobile"));

// Touch controls
document.querySelectorAll("[data-dir]").forEach(button => {
    const direction = button.dataset.dir;

    button.addEventListener("pointerdown", event => {
        if (controlMode !== "mobile") return;

        event.preventDefault();

        button.setPointerCapture(event.pointerId);

        touchKeys.add(direction);
        button.classList.add("pressed");
    });

    function release() {
        touchKeys.delete(direction);
        button.classList.remove("pressed");
    }

    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
    button.addEventListener("contextmenu", event => {
        event.preventDefault();
    });
});

setMode(controlMode);

// Movement calculation
export function getMovement() {
    let dx = 0;
    let dy = 0;

    if (controlMode === "desktop") {
        if (keys["w"] || keys["arrowup"]) dy--;
        if (keys["s"] || keys["arrowdown"]) dy++;
        if (keys["a"] || keys["arrowleft"]) dx--;
        if (keys["d"] || keys["arrowright"]) dx++;
    }

    if (controlMode === "mobile") {
        if (touchKeys.has("up")) dy--;
        if (touchKeys.has("down")) dy++;
        if (touchKeys.has("left")) dx--;
        if (touchKeys.has("right")) dx++;
    }

    if (dx && dy) {
        dx *= Math.SQRT1_2;
        dy *= Math.SQRT1_2;
    }

    return { dx, dy };
}
