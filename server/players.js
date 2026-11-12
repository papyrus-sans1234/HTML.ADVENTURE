
import { roomConfig } from "./rooms.js";

const players = {};

export function addPlayer(id) {
    players[id] = {
        id,
        x: 160,
        y: 160,
        room: "village"
    };

    return players[id];
}

export function removePlayer(id) {
    delete players[id];
}

export function movePlayer(id, x, y) {
    const player = players[id];

    if (!player) return;

    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    const config = roomConfig[player.room];

    if (!config) return;

    // Prevent implausibly large position jumps.
    if (
        Math.abs(x - player.x) > 100 ||
        Math.abs(y - player.y) > 100
    ) return;

    player.x = Math.max(16, Math.min(config.width - 16, x));
    player.y = Math.max(16, Math.min(config.height - 16, y));
}

export function changePlayerRoom(id, room, x, y) {
    const player = players[id];

    if (!player || !roomConfig[room]) return false;

    player.room = room;
    player.x = x;
    player.y = y;

    return true;
}

export function getPlayersInRoom(room) {
    const result = {};

    for (const id in players) {
        if (players[id].room === room) {
            result[id] = players[id];
        }
    }

    return result;
}

export function getPlayer(id) {
    return players[id];
}
