
const keys = {};

let controlMode = (
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches
) ? "mobile" : "desktop";

let joystickX = 0;
let joystickY = 0;
let activePointer = null;

const joystickZone = document.getElementById("joystick-zone");
const joystickBase = document.getElementById("joystick-base");
const joystickKnob = document.getElementById("joystick-knob");

// Try to enter fullscreen landscape mode.
async function requestLandscape() {
    try {
        if (!document.fullscreenElement &&
            document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        }

        if (screen.orientation?.lock) {
            await screen.orientation.lock("landscape");
        }
    } catch (error) {
        // Some browsers do not support orientation locking.
        console.log("Landscape lock unavailable:", error.message);
    }
}

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
    resetJoystick();
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
            ? "Joystick — Move | INTERACT — Use doors"
            : "WASD / Arrow Keys — Move | E — Interact";

    Object.keys(keys).forEach(key => keys[key] = false);
    resetJoystick();

    if (mode === "mobile") {
        requestLandscape();
    } else if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
}

document.getElementById("desktop-mode")
    .addEventListener("click", () => setMode("desktop"));

document.getElementById("mobile-mode")
    .addEventListener("click", () => setMode("mobile"));

// Allow tapping the rotation message to retry landscape mode.
document.getElementById("rotate-overlay")
    .addEventListener("click", requestLandscape);

// Joystick controls
function moveJoystick(event) {
    const rect = joystickBase.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const maxDistance = 34;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxDistance) {
        dx = (dx / distance) * maxDistance;
        dy = (dy / distance) * maxDistance;
    }

    joystickKnob.style.left =
        `calc(50% + ${dx}px)`;

    joystickKnob.style.top =
        `calc(50% + ${dy}px)`;

    const magnitude = Math.sqrt(dx * dx + dy * dy);

    if (magnitude < 5) {
        joystickX = 0;
        joystickY = 0;
        return;
    }

    joystickX = dx / maxDistance;
    joystickY = dy / maxDistance;
}

function resetJoystick() {
    joystickX = 0;
    joystickY = 0;
    activePointer = null;

    if (joystickKnob) {
        joystickKnob.style.left = "50%";
        joystickKnob.style.top = "50%";
    }
}

joystickZone.addEventListener("pointerdown", event => {
    if (controlMode !== "mobile") return;
    if (activePointer !== null) return;

    event.preventDefault();

    requestLandscape();

    activePointer = event.pointerId;
    joystickZone.setPointerCapture(event.pointerId);

    moveJoystick(event);
});

joystickZone.addEventListener("pointermove", event => {
    if (event.pointerId !== activePointer) return;

    event.preventDefault();
    moveJoystick(event);
});

function releaseJoystick(event) {
    if (event.pointerId !== activePointer) return;

    resetJoystick();
}

joystickZone.addEventListener("pointerup", releaseJoystick);
joystickZone.addEventListener("pointercancel", releaseJoystick);
joystickZone.addEventListener("lostpointercapture", releaseJoystick);

joystickZone.addEventListener("contextmenu", event => {
    event.preventDefault();
});

// Interact button
document.getElementById("interact-button")
    .addEventListener("contextmenu", event => {
        event.preventDefault();
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
        dx = joystickX;
        dy = joystickY;
    }

    // Normalize keyboard diagonal movement.
    if (controlMode === "desktop" && dx && dy) {
        dx *= Math.SQRT1_2;
        dy *= Math.SQRT1_2;
    }

    return { dx, dy };
}
