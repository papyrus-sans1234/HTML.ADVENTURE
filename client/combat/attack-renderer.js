
import { getAttackAnimation } from "./attack-animations.js";

let activeAnimations = [];
let animationFrame = null;

function createEffectElement(animation) {
    const element = document.createElement("div");

    element.className = `attack-effect attack-${animation.type}`;
    element.style.position = "absolute";
    element.style.pointerEvents = "none";
    element.style.zIndex = "10";
    element.style.left = `${animation.x}%`;
    element.style.top = `${animation.y}%`;
    element.style.transform = "translate(-50%, -50%)";
    element.style.width = `${animation.size || 24}px`;
    element.style.height = `${animation.size || 24}px`;
    element.style.background = animation.color || "#ffffff";
    element.style.borderRadius =
        animation.shape === "circle" || animation.shape === "orb"
            ? "50%"
            : "4px";

    if (animation.shape === "slash") {
        element.style.height = "5px";
        element.style.transform = "translate(-50%, -50%) rotate(-35deg)";
    }

    if (animation.trail) {
        element.style.boxShadow =
            `0 0 12px ${animation.trailColor || animation.color}`;
    }

    return element;
}

function animateEffect(effect) {
    const elapsed = performance.now() - effect.startTime;
    const progress = Math.min(elapsed / effect.duration, 1);

    if (effect.type === "projectile") {
        const x = effect.startX +
            (effect.endX - effect.startX) * progress;

        const y = effect.startY +
            (effect.endY - effect.startY) * progress;

        effect.element.style.left = `${x}%`;
        effect.element.style.top = `${y}%`;
    }

    effect.element.style.opacity = String(1 - progress);

    return progress < 1;
}

function animationLoop() {
    activeAnimations = activeAnimations.filter(effect => {
        const running = animateEffect(effect);

        if (!running) {
            effect.element.remove();
        }

        return running;
    });

    if (activeAnimations.length > 0) {
        animationFrame = requestAnimationFrame(animationLoop);
    } else {
        animationFrame = null;
    }
}

export function playAttackAnimation(data) {
    if (!data || typeof data.abilityId !== "string") return;

    const arena = document.getElementById("battle-arena");
    if (!arena) return;

    const definition = getAttackAnimation(data.abilityId);
    if (!definition) return;

    arena.style.position = "relative";
    arena.style.overflow = "hidden";

    const startX = data.from === "enemy" ? 20 : 80;
    const endX = data.from === "enemy" ? 80 : 20;

    const element = createEffectElement({
        ...definition,
        x: startX,
        y: 50
    });

    arena.appendChild(element);

    const effect = {
        element,
        type: definition.type,
        startTime: performance.now(),
        duration: definition.duration || 500,
        startX,
        endX,
        startY: 50,
        endY: 50
    };

    activeAnimations.push(effect);

    if (animationFrame === null) {
        animationFrame = requestAnimationFrame(animationLoop);
    }
}

export function clearAttackAnimations() {
    for (const effect of activeAnimations) {
        effect.element.remove();
    }

    activeAnimations = [];

    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
}
