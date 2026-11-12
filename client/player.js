
export function createPlayer(id, x, y, color = "#42a5ff") {
    return {
        id,
        x,
        y,
        speed: 3,
        color,
        size: 18,
        direction: "down"
    };
}

export function updatePlayer(player, dx, dy) {
    player.x += dx * player.speed;
    player.y += dy * player.speed;

    if (dx > 0) player.direction = "right";
    if (dx < 0) player.direction = "left";
    if (dy > 0) player.direction = "down";
    if (dy < 0) player.direction = "up";
}
