
export const ABILITIES = {
    basic_strike: {
        id: "basic_strike",
        name: "Basic Strike",
        description: "A simple, reliable attack.",
        type: "attack",
        damage: 12,
        cooldownRounds: 0,
        target: "opponent"
    },

    energy_bolt: {
        id: "energy_bolt",
        name: "Energy Bolt",
        description: "Launches a small bolt of energy.",
        type: "attack",
        damage: 20,
        cooldownRounds: 1,
        target: "opponent"
    },

    guard: {
        id: "guard",
        name: "Guard",
        description: "Reduces the damage of the next incoming attack.",
        type: "defense",
        damage: 0,
        damageReduction: 10,
        cooldownRounds: 1,
        target: "self"
    }
};

// Abilities every new player starts with.
export const STARTER_ABILITIES = [
    "basic_strike",
    "energy_bolt",
    "guard"
];

export function getAbility(abilityId) {
    return ABILITIES[abilityId] || null;
}

export function getStarterAbilities() {
    return [...STARTER_ABILITIES];
}

export function canUseAbility(participant, abilityId, currentRound) {
    if (!participant || !Array.isArray(participant.abilities)) {
        return false;
    }

    const ability = getAbility(abilityId);

    if (!ability || !participant.abilities.includes(abilityId)) {
        return false;
    }

    const readyAtRound = participant.cooldowns?.[abilityId] ?? 0;

    return currentRound >= readyAtRound;
}

export function markAbilityUsed(participant, abilityId, currentRound) {
    const ability = getAbility(abilityId);

    if (!ability || !participant) {
        return false;
    }

    if (!canUseAbility(participant, abilityId, currentRound)) {
        return false;
    }

    if (!participant.cooldowns) {
        participant.cooldowns = {};
    }

    // A cooldown of one means the ability is unavailable
    // for one complete round after being used.
    participant.cooldowns[abilityId] =
        currentRound + ability.cooldownRounds + 1;

    return true;
}
