
import {
    getBattle,
    getBattleForParticipant
} from "./battles.js";

const activeBattleSockets = new Map();

export function registerBattleSocket(io, participantId, socket) {
    activeBattleSockets.set(participantId, socket.id);

    const battle = getBattleForParticipant(participantId);

    if (battle) {
        socket.join(`battle:${battle.id}`);

        socket.emit("battle-start", {
            battle: getPublicBattle(battle),
            participantId
        });
    }
}

export function unregisterBattleSocket(participantId, socketId) {
    if (activeBattleSockets.get(participantId) !== socketId) {
        return;
    }

    activeBattleSockets.delete(participantId);
}

export function sendBattleUpdate(io, battleId) {
    const battle = getBattle(battleId);

    if (!battle) return;

    io.to(`battle:${battleId}`).emit(
        "battle-update",
        getPublicBattle(battle)
    );
}

export function sendBattleStart(io, battle) {
    if (!battle) return;

    io.to(`battle:${battle.id}`).emit("battle-start", {
        battle: getPublicBattle(battle)
    });
}

export function sendBattleEnd(io, battle) {
    if (!battle) return;

    io.to(`battle:${battle.id}`).emit("battle-end", {
        battleId: battle.id,
        result: battle.result
    });
}

export function getPublicBattle(battle) {
    const participants = {};

    for (const id of battle.turnOrder) {
        const participant = battle.participants[id];

        if (!participant) continue;

        participants[id] = {
            id: participant.id,
            name: participant.name,
            kind: participant.kind,
            hp: participant.hp,
            maxHp: participant.maxHp,
            abilities: [...participant.abilities],
            cooldowns: { ...participant.cooldowns },
            defeated: participant.defeated
        };
    }

    return {
        id: battle.id,
        type: battle.type,
        room: battle.room,
        status: battle.status,
        round: battle.round,
        currentTurn: battle.currentTurn,
        turnOrder: [...battle.turnOrder],
        participants,
        result: battle.result
    };
}
