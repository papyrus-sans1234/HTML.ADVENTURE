
export const ENEMY_DATA = {
    forest_slime: {
        id: "forest_slime",
        name: "Forest Slime",
        room: "forest",
        x: 320,
        y: 320,
        level: 1,
        maxHp: 60,
        hp: 60,
        abilities: [
            "basic_strike",
            "energy_bolt"
        ],
        xpReward: 25,
        collectibleReward: "slime_core",
        interactDistance: 55,
        respawn: true
    },

    cave_bat: {
        id: "cave_bat",
        name: "Cave Bat",
        room: "cave",
        x: 480,
        y: 320,
        level: 2,
        maxHp: 90,
        hp: 90,
        abilities: [
            "basic_strike",
            "energy_bolt"
        ],
        xpReward: 45,
        collectibleReward: "bat_wing",
        interactDistance: 55,
        respawn: true
    }
};

export function getEnemy(enemyId) {
    return ENEMY_DATA[enemyId] || null;
}

export function getEnemiesInRoom(room) {
    return Object.values(ENEMY_DATA).filter(
        enemy => enemy.room === room
    );
}
