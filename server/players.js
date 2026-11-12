
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

    player.x = Math.max(0, Math.min(640, x));
    player.y = Math.max(0, Math.min(384, y));
}

export function getPlayers() {
    return players;
}
