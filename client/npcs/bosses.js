
const DEFAULT_INTERACT_DISTANCE = 70;

let bosses = [];
let nearbyBoss = null;

export function setBosses(bossList) {
    if (!Array.isArray(bossList)) return;

    bosses = bossList.map(boss => ({
        ...boss,
        interactDistance:
            boss.interactDistance || DEFAULT_INTERACT_DISTANCE
    }));

    nearbyBoss = null;
}

export function updateBossManager(player, room) {
    nearbyBoss = null;

    if (!player || !room) return null;

    let closestDistance = Infinity;

    for (const boss of bosses) {
        if (boss.room !== room || boss.defeated) continue;

        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        const distance = Math.hypot(dx, dy);

        if (
            distance <= boss.interactDistance &&
            distance < closestDistance
        ) {
            closestDistance = distance;
            nearbyBoss = boss;
        }
    }

    return nearbyBoss;
}

export function getNearbyBoss() {
    return nearbyBoss;
}

export function getBossById(bossId) {
    return bosses.find(boss => boss.id === bossId) || null;
}

export function getBosses() {
    return [...bosses];
}

export function clearNearbyBoss() {
    nearbyBoss = null;
}

export function markBossDefeated(bossId) {
    const boss = bosses.find(item => item.id === bossId);

    if (!boss) return false;

    boss.defeated = true;
    nearbyBoss = null;

    return true;
}

export function getBossPhase(boss) {
    if (!boss || !Array.isArray(boss.phases)) return null;

    const hpPercentage = boss.hp / boss.maxHp;

    return boss.phases.find(
        phase => hpPercentage <= phase.hpThreshold
    ) || boss.phases[0];
}
