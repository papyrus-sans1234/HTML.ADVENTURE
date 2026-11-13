
const NPC_INTERACT_DISTANCE = 55;

let npcs = [];
let nearbyNPC = null;

export function setNPCs(npcList) {
    if (!Array.isArray(npcList)) return;

    npcs = npcList.map(npc => ({
        ...npc,
        interactDistance: npc.interactDistance || NPC_INTERACT_DISTANCE
    }));

    nearbyNPC = null;
}

export function updateNPCManager(player, room) {
    nearbyNPC = null;

    if (!player || !room) return null;

    let closestDistance = Infinity;

    for (const npc of npcs) {
        if (npc.room !== room) continue;

        const dx = player.x - npc.x;
        const dy = player.y - npc.y;
        const distance = Math.hypot(dx, dy);

        if (
            distance <= npc.interactDistance &&
            distance < closestDistance
        ) {
            closestDistance = distance;
            nearbyNPC = npc;
        }
    }

    return nearbyNPC;
}

export function getNearbyNPC() {
    return nearbyNPC;
}

export function getNPCById(npcId) {
    return npcs.find(npc => npc.id === npcId) || null;
}

export function getNPCs() {
    return [...npcs];
}

export function clearNearbyNPC() {
    nearbyNPC = null;
}
