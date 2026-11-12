
import { getMovement } from "./controls.js";
import { updatePlayer } from "./player.js";
import { TILE } from "./world.js";

export function updateGame(player, room, network) {
    const { dx, dy } = getMovement();

    const nextX = player.x + dx * player.speed;
    const nextY = player.y + dy * player.speed;

    const radius = player.size / 2;

    function isBlocked(x, y) {
        const tileX = Math.floor(x / TILE);
        const tileY = Math.floor(y / TILE);

        const tile = room.map[tileY]?.[tileX];

        return tile === undefined || tile === 2 || tile === 3;
    }

    if (!isBlocked(nextX - radius, player.y) &&
        !isBlocked(nextX + radius, player.y)) {
        updatePlayer(player, dx, 0);
    }

    if (!isBlocked(player.x, nextY - radius) &&
        !isBlocked(player.x, nextY + radius)) {
        updatePlayer(player, 0, dy);
    }

    if (dx !== 0 || dy !== 0) {
        network.move(player.x, player.y);
    }
}
