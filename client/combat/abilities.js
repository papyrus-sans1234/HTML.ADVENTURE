
export const ABILITIES = {
    basic_strike: {
        id: "basic_strike",
        name: "Basic Strike",
        description: "A simple, reliable attack,as the design is KINDA human.",
        category: "ATTACK",
        animation: "basic_strike"
    },

    energy_bolt: {
        id: "energy_bolt",
        name: "Energy Bolt",
        description: "Launch a glowing energy orb,the design is very human.",
        category: "ATTACK",
        animation: "energy_bolt"
    },

    guard: {
        id: "guard",
        name: "Guard",
        description: "Reduce the damage of the next incoming attack.",
        category: "DEFENSE",
        animation: "guard"
    }
};

export function getAbilityInfo(abilityId) {
    return ABILITIES[abilityId] || null;
}

export function getAbilityList(abilityIds = []) {
    return abilityIds
        .map(id => ABILITIES[id])
        .filter(Boolean);
}

export function isAbilityOnCooldown(cooldowns, abilityId, round) {
    if (!cooldowns) return false;

    const readyAtRound = cooldowns[abilityId] ?? 0;

    return round < readyAtRound;
}
