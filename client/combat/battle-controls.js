
const keys = new Set();

const controls = {
    left: false,
    right: false,
    up: false,
    down: false
};

const keyMap = {
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right",
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down"
};

let enabled = false;

function updateControls() {
    for (const direction of Object.keys(controls)) {
        controls[direction] = keys.has(direction);
    }
}

window.addEventListener("keydown", event => {
    if (!enabled) return;

    const direction = keyMap[event.key.toLowerCase()];

    if (direction) {
        event.preventDefault();
        keys.add(direction);
        updateControls();
    }
});

window.addEventListener("keyup", event => {
    const direction = keyMap[event.key.toLowerCase()];

    if (direction) {
        keys.delete(direction);
        updateControls();
    }
});

window.addEventListener("blur", () => {
    keys.clear();
    updateControls();
});

export function enableBattleControls() {
    enabled = true;
    keys.clear();
    updateControls();
}

export function disableBattleControls() {
    enabled = false;
    keys.clear();
    updateControls();
}

export function getBattleControls() {
    return { ...controls };
}

export function setBattleTouchControl(direction, pressed) {
    if (!Object.hasOwn(controls, direction)) return;

    if (pressed) {
        keys.add(direction);
    } else {
        keys.delete(direction);
    }

    updateControls();
}
