
import {
    createBattle,
    getBattle,
    getBattleForParticipant
} from "./battles.js";

import {
    performBattleAction
} from "./battle-actions.js";

import {
    performEnemyTurn
} from "./battle-ai.js";

import {
    sendBattleStart,
    sendBattleUpdate,
    sendBattleEnd,
    getPublicBattle
} from "./battle-sync.js";

import {
    getPlayer,
    setPlayerBattle
} from "../players.js";

import { ENEMY_DATA } from "../npcs/enemy-data.js";
import { BOSS_DATA } from "../npcs/boss-data.js";

const challenges = new Map();
const connectedSockets = new Map();

function distanceBetween(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function canChallenge(playerA, playerB) {
    return Boolean(
        playerA &&
        playerB &&
        playerA.id !== playerB.id &&
        !playerA.battleId &&
        !playerB.battleId &&
        playerA.room === playerB.room &&
        distanceBetween(playerA, playerB) <= 100
    );
}

function joinBattle(io, battle) {
    for (const id of battle.turnOrder) {
        const socketId = connectedSockets.get(id);

        if (!socketId) continue;

        const socket = io.sockets.sockets.get(socketId);

        if (socket) {
            socket.join(`battle:${battle.id}`);
        }
    }

    sendBattleStart(io, battle);
}

function startPlayerBattle(io, playerA, playerB) {
    const battle = createBattle({
        type: "pvp",
        room: playerA.room,
        participants: [
            {
                id: playerA.id,
                name: playerA.name,
                hp: playerA.hp,
                maxHp: playerA.maxHp,
                abilities: playerA.abilities
            },
            {
                id: playerB.id,
                name: playerB.name,
                hp: playerB.hp,
                maxHp: playerB.maxHp,
                abilities: playerB.abilities
            }
        ],
        metadata: {
            returnPositions: {
                [playerA.id]: { x: playerA.x, y: playerA.y },
                [playerB.id]: { x: playerB.x, y: playerB.y }
            }
        }
    });

    setPlayerBattle(playerA.id, battle.id);
    setPlayerBattle(playerB.id, battle.id);

    joinBattle(io, battle);
}

function startNPCBattle(io, player, npc, type) {
    const npcId = `npc:${npc.id}`;

    const battle = createBattle({
        type,
        room: player.room,
        participants: [
            {
                id: player.id,
                name: player.name,
                hp: player.hp,
                maxHp: player.maxHp,
                abilities: player.abilities
            },
            {
                id: npcId,
                name: npc.name,
                kind: type === "boss" ? "boss" : "enemy",
                hp: npc.hp,
                maxHp: npc.maxHp,
                abilities: npc.abilities
            }
        ],
        turnOrder: [player.id, npcId],
        metadata: {
            npcId: npc.id,
            returnPositions: {
                [player.id]: { x: player.x, y: player.y }
            }
        }
    });

    setPlayerBattle(player.id, battle.id);

    joinBattle(io, battle);
}

function finishBattle(io, battle) {
    if (!battle || battle.status !== "finished") return;

    for (const id of battle.turnOrder) {
        const player = getPlayer(id);

        if (!player) continue;

        player.battleId = null;

        const savedPosition =
            battle.metadata.returnPositions?.[id];

        if (savedPosition) {
            player.x = savedPosition.x;
            player.y = savedPosition.y;
        }
    }

    sendBattleEnd(io, battle);
}

function broadcastBattleAction(io, battle, action) {
    if (!action) return;

    io.to(`battle:${battle.id}`).emit("battle-action", {
        ...action,
        actorId: action.participantId
    });
}

function processAction(io, socket, deviceId, abilityId) {
    const battle = getBattleForParticipant(deviceId);

    if (!battle) return;

    const result = performBattleAction(
        battle.id,
        deviceId,
        abilityId
    );

    if (!result.success) {
        socket.emit("battle-action-error", result.reason);
        return;
    }

    // Broadcast the player's successful attack.
    broadcastBattleAction(io, battle, result.action);

    // Perform the enemy's turn when applicable.
    if (battle.status === "active") {
        const current = battle.participants[battle.currentTurn];

        if (
            current?.kind === "enemy" ||
            current?.kind === "boss"
        ) {
            const enemyResult = performEnemyTurn(
                battle.id,
                current.id
            );

            if (enemyResult.success) {
                // Broadcast the enemy's successful attack.
                broadcastBattleAction(
                    io,
                    battle,
                    enemyResult.action
                );
            }
        }
    }

    sendBattleUpdate(io, battle.id);

    if (battle.status === "finished") {
        finishBattle(io, battle);
    }
}

export function setupBattleNetwork(io) {
    io.on("connection", socket => {
        const deviceId = socket.handshake.auth?.deviceId;

        if (typeof deviceId !== "string") return;

        connectedSockets.set(deviceId, socket.id);

        socket.on("battle-challenge", targetId => {
            if (typeof targetId !== "string") return;

            const player = getPlayer(deviceId);
            const target = getPlayer(targetId);

            if (!canChallenge(player, target)) return;

            const challengeId = `${deviceId}:${targetId}`;

            challenges.set(challengeId, {
                from: deviceId,
                to: targetId
            });

            const targetSocketId = connectedSockets.get(targetId);
            const targetSocket = io.sockets.sockets.get(targetSocketId);

            targetSocket?.emit("battle-challenge-request", {
                from: deviceId,
                name: player.name
            });
        });

        socket.on("battle-challenge-response", data => {
            if (!data || typeof data.from !== "string") return;

            const challengeId = `${data.from}:${deviceId}`;
            const challenge = challenges.get(challengeId);

            if (!challenge) return;

            challenges.delete(challengeId);

            if (data.accepted !== true) {
                const senderSocketId =
                    connectedSockets.get(data.from);

                if (senderSocketId) {
                    io.to(senderSocketId).emit(
                        "battle-challenge-rejected"
                    );
                }

                return;
            }

            const playerA = getPlayer(challenge.from);
            const playerB = getPlayer(challenge.to);

            if (!canChallenge(playerA, playerB)) return;

            startPlayerBattle(io, playerA, playerB);
        });

        socket.on("challenge-enemy", enemyId => {
            if (typeof enemyId !== "string") return;

            const player = getPlayer(deviceId);

            if (!player || player.battleId) return;

            const enemy = ENEMY_DATA[enemyId];

            if (
                !enemy ||
                enemy.room !== player.room ||
                distanceBetween(player, enemy) > enemy.interactDistance
            ) {
                return;
            }

            startNPCBattle(io, player, enemy, "pve");
        });

        socket.on("challenge-boss", bossId => {
            if (typeof bossId !== "string") return;

            const player = getPlayer(deviceId);

            if (!player || player.battleId) return;

            const boss = BOSS_DATA[bossId];

            if (
                !boss ||
                boss.room !== player.room ||
                distanceBetween(player, boss) > boss.interactDistance
            ) {
                return;
            }

            startNPCBattle(io, player, boss, "boss");
        });

        socket.on("battle-action", abilityId => {
            if (typeof abilityId !== "string") return;

            processAction(io, socket, deviceId, abilityId);
        });

        socket.on("disconnect", () => {
            if (connectedSockets.get(deviceId) === socket.id) {
                connectedSockets.delete(deviceId);
            }

            for (const [id, challenge] of challenges) {
                if (
                    challenge.from === deviceId ||
                    challenge.to === deviceId
                ) {
                    challenges.delete(id);
                }
            }
        });
    });
}
