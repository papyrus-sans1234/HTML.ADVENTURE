
const DEFAULT_INTERACT_DISTANCE = 55;

let enemies = [];
let nearbyEnemy = null;

export function setEnemies(enemyList) {
    if (!Array.isArray(enemyList)) return;

    enemies = enemyList.map(enemy => ({
        ...enemy,
        interactDistance:
            enemy.interactDistance || DEFAULT_INTERACT_DISTANCE
    }));

    nearbyEnemy = null;
}

export function updateEnemyManager(player, room) {
    nearbyEnemy = null;

    if (!player || !room) return null;

    let closestDistance = Infinity;

    for (const enemy of enemies) {
        if (enemy.room !== room || enemy.defeated) continue;

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.hypot(dx, dy);

        if (
            distance <= enemy.interactDistance &&
            distance < closestDistance
        ) {
            closestDistance = distance;
            nearbyEnemy = enemy;
        }
    }

    return nearbyEnemy;
}

export function getNearbyEnemy() {
    return nearbyEnemy;
}

export function getEnemyById(enemyId) {
    return enemies.find(enemy => enemy.id === enemyId) || null;
}

export function getEnemies() {
    return [...enemies];
}

export function clearNearbyEnemy() {
    nearbyEnemy = null;
}

export function markEnemyDefeated(enemyId) {
    const enemy = enemies.find(item => item.id === enemyId);

    if (!enemy) return false;

    enemy.defeated = true;
    nearbyEnemy = null;

    return true;
}
