
export const ATTACK_ANIMATIONS = {
    basic_strike: {
        type: "projectile",
        shape: "slash",
        color: "#ffffff",
        size: 24,
        duration: 250,
        speed: 12,
        trail: false
    },

    energy_bolt: {
        type: "projectile",
        shape: "orb",
        color: "#38bdf8",
        size: 16,
        duration: 600,
        speed: 8,
        trail: true,
        trailColor: "#7dd3fc"
    },

    guard: {
        type: "shield",
        shape: "circle",
        color: "#60a5fa",
        size: 48,
        duration: 500,
        speed: 0,
        trail: false
    },

    single: {
        type: "pattern",
        shape: "warning-line",
        color: "#facc15",
        duration: 900
    },

    spread: {
        type: "pattern",
        shape: "spread-projectiles",
        color: "#fb923c",
        duration: 1200
    },

    burst: {
        type: "pattern",
        shape: "radial-burst",
        color: "#f87171",
        duration: 1500
    }
};

export function getAttackAnimation(animationId) {
    return ATTACK_ANIMATIONS[animationId] || null;
}
