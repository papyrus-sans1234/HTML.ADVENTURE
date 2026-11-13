
import { roomConfig } from "./rooms.js";
import { getStarterAbilities } from "./combat/ability-system.js";

const players = {};

export function addPlayer(id) {
    if (!players[id]) {
        players[id] = {
            id,
            x: 480,
            y: 480,
            room: "village",

            // Player progression
            name: "Adventurer",
            level: 1,
            xp: 0,

            // Combat stats
            hp: 100,
            maxHp: 100,
            abilities: getStarterAbilities(),
            collectibles: [],

            // Battle state
            battleId: null
        };
    }

    return players[id];
}

export function removePlayer(id) {
    delete players[id];
}

export function movePlayer(id, x, y) {
    const player = players[id];

    if (!player || player.battleId) return;

    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    const config = roomConfig[player.room];

    if (!config) return;

    if (
        Math.abs(x - player.x) > 100 ||
        Math.abs(y - player.y) > 100
    ) {
        return;
    }

    player.x = Math.max(
        16,
        Math.min(config.width - 16, x)
    );

    player.y = Math.max(
        16,
        Math.min(config.height - 16, y)
    );
}

export function changePlayerRoom(id, room, x, y) {
    const player = players[id];

    if (!player || player.battleId || !roomConfig[room]) {
        return false;
    }

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return false;
    }

    player.room = room;
    player.x = Math.max(16, Math.min(roomConfig[room].width - 16, x));
    player.y = Math.max(16, Math.min(roomConfig[room].height - 16, y));

    return true;
}

export function getPlayersInRoom(room) {
    const result = {};

    for (const id in players) {
        if (
            players[id].room === room &&
            !players[id].battleId
        ) {
            result[id] = players[id];
        }
    }

    return result;
}

export function getPlayer(id) {
    return players[id] || null;
}

export function setPlayerBattle(id, battleId) {
    const player = players[id];

    if (!player) return false;

    player.battleId = battleId;
    return true;
}

export function clearPlayerBattle(id) {
    const player = players[id];

    if (!player) return false;

    player.battleId = null;
    return true;
}

export function awardPlayerXP(id, amount) {
    const player = players[id];

    if (!player || !Number.isFinite(amount) || amount <= 0) {
        return false;
    }

    player.xp += Math.floor(amount);

    while (player.xp >= player.level * 100) {
        player.xp -= player.level * 100;
        player.level++;
        player.maxHp += 10;
        player.hp = player.maxHp;
    }

    return true;
}

export function addPlayerCollectible(id, collectibleId) {
    const player = players[id];

    if (!player || typeof collectibleId !== "string") {
        return false;
    }

    if (!player.collectibles.includes(collectibleId)) {
        player.collectibles.push(collectibleId);
    }

    return true;
}
