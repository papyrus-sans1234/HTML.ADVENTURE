
import { randomUUID } from "node:crypto";

const battles = new Map();

const VALID_TYPES = ["pvp", "pve", "boss"];

function createParticipant(data) {
    if (!data || typeof data.id !== "string" || !data.id) {
        throw new Error("Invalid battle participant.");
    }

    const maxHp = Number.isFinite(data.maxHp)
        ? Math.max(1, Math.floor(data.maxHp))
        : 100;

    const hp = Number.isFinite(data.hp)
        ? Math.max(0, Math.min(maxHp, Math.floor(data.hp)))
        : maxHp;

    return {
        id: data.id,
        name: data.name || "Unknown",
        kind: data.kind || "player",

        hp,
        maxHp,

        abilities: Array.isArray(data.abilities)
            ? [...data.abilities]
            : [],

        cooldowns: {},

        defeated: hp <= 0
    };
}

export function createBattle({
    type,
    room,
    participants,
    turnOrder,
    metadata = {}
}) {
    if (!VALID_TYPES.includes(type)) {
        throw new Error("Invalid battle type.");
    }

    if (!Array.isArray(participants) || participants.length < 2) {
        throw new Error("A battle requires at least two participants.");
    }

    const participantMap = {};

    for (const data of participants) {
        const participant = createParticipant(data);

        if (participantMap[participant.id]) {
            throw new Error("Duplicate battle participant.");
        }

        if (participant.defeated) {
            throw new Error("A defeated participant cannot enter a battle.");
        }

        participantMap[participant.id] = participant;
    }

    const ids = Object.keys(participantMap);

    const selectedTurnOrder = turnOrder || ids;

    if (
        !Array.isArray(selectedTurnOrder) ||
        selectedTurnOrder.length !== ids.length ||
        new Set(selectedTurnOrder).size !== ids.length ||
        selectedTurnOrder.some(id => !participantMap[id])
    ) {
        throw new Error("Invalid battle turn order.");
    }

    const battleId = randomUUID();

    const battle = {
        id: battleId,

        type,
        room: room || "village",

        status: "active",

        round: 1,
        turnIndex: 0,
        currentTurn: selectedTurnOrder[0],

        turnOrder: [...selectedTurnOrder],

        participants: participantMap,

        metadata: { ...metadata },

        result: null,

        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    battles.set(battleId, battle);

    return battle;
}

export function getBattle(battleId) {
    return battles.get(battleId) || null;
}

export function getBattleForParticipant(participantId) {
    for (const battle of battles.values()) {
        if (
            battle.status === "active" &&
            battle.participants[participantId]
        ) {
            return battle;
        }
    }

    return null;
}

export function getActiveBattles() {
    return [...battles.values()].filter(
        battle => battle.status === "active"
    );
}

export function isParticipantInBattle(participantId) {
    return Boolean(getBattleForParticipant(participantId));
}

export function updateParticipant(battleId, participantId, changes) {
    const battle = getBattle(battleId);

    if (!battle || battle.status !== "active") {
        return false;
    }

    const participant = battle.participants[participantId];

    if (!participant || !changes) {
        return false;
    }

    if (Number.isFinite(changes.hp)) {
        participant.hp = Math.max(
            0,
            Math.min(participant.maxHp, Math.floor(changes.hp))
        );

        participant.defeated = participant.hp <= 0;
    }

    if (Array.isArray(changes.abilities)) {
        participant.abilities = [...changes.abilities];
    }

    if (changes.cooldowns && typeof changes.cooldowns === "object") {
        participant.cooldowns = { ...changes.cooldowns };
    }

    battle.updatedAt = Date.now();

    return true;
}

export function advanceTurn(battleId) {
    const battle = getBattle(battleId);

    if (!battle || battle.status !== "active") {
        return null;
    }

    const order = battle.turnOrder;

    for (let i = 0; i < order.length; i++) {
        battle.turnIndex++;

        if (battle.turnIndex >= order.length) {
            battle.turnIndex = 0;
            battle.round++;
        }

        const nextId = order[battle.turnIndex];
        const nextParticipant = battle.participants[nextId];

        if (nextParticipant && !nextParticipant.defeated) {
            battle.currentTurn = nextId;
            battle.updatedAt = Date.now();

            return battle;
        }
    }

    return null;
}

export function endBattle(battleId, {
    winnerId = null,
    reason = "completed"
} = {}) {
    const battle = getBattle(battleId);

    if (!battle || battle.status !== "active") {
        return null;
    }

    if (winnerId && !battle.participants[winnerId]) {
        return null;
    }

    battle.status = "finished";

    battle.result = {
        winnerId,
        reason,
        finishedAt: Date.now()
    };

    battle.updatedAt = Date.now();

    return battle;
}

export function removeBattle(battleId) {
    return battles.delete(battleId);
}
