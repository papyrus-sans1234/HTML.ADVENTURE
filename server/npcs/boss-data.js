
export const BOSS_DATA = {
    forest_guardian: {
        id: "forest_guardian",
        name: "Forest Guardian",
        room: "forest",
        x: 800,
        y: 320,
        level: 5,
        maxHp: 500,
        hp: 500,

        abilities: [
            "basic_strike",
            "energy_bolt",
            "guard"
        ],

        phases: [
            {
                name: "Awakening",
                hpThreshold: 1,
                attackPattern: "single"
            },
            {
                name: "Enraged",
                hpThreshold: 0.5,
                attackPattern: "spread"
            },
            {
                name: "Final Stand",
                hpThreshold: 0.2,
                attackPattern: "burst"
            }
        ],

        xpReward: 250,
        collectibleReward: "guardian_heart",
        interactDistance: 70,
        respawn: true
    },

    cave_overlord: {
        id: "cave_overlord",
        name: "Cave Overlord",
        room: "cave",
        x: 800,
        y: 320,
        level: 10,
        maxHp: 1000,
        hp: 1000,

        abilities: [
            "basic_strike",
            "energy_bolt",
            "guard"
        ],

        phases: [
            {
                name: "Dormant",
                hpThreshold: 1,
                attackPattern: "single"
            },
            {
                name: "Awakened",
                hpThreshold: 0.6,
                attackPattern: "spread"
            },
            {
                name: "Overdrive",
                hpThreshold: 0.25,
                attackPattern: "burst"
            }
        ],

        xpReward: 600,
        collectibleReward: "overlord_core",
        interactDistance: 70,
        respawn: true
    }
};

export function getBoss(bossId) {
    return BOSS_DATA[bossId] || null;
}

export function getBossesInRoom(room) {
    return Object.values(BOSS_DATA).filter(
        boss => boss.room === room
    );
}
