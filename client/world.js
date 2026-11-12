
const TILE = 32;

const colors = {
    0: "#477d43",
    1: "#b69a68",
    2: "#367eb8",
    3: "#344b35"
};

export function drawWorld(ctx, room, camera, canvas) {
    ctx.fillStyle = "#263b32";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const map = room.map;

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const tile = map[y][x];

            const screenX = x * TILE - camera.x;
            const screenY = y * TILE - camera.y;

            if (
                screenX < -TILE ||
                screenY < -TILE ||
                screenX > canvas.width ||
                screenY > canvas.height
            ) continue;

            ctx.fillStyle = colors[tile];
            ctx.fillRect(screenX, screenY, TILE, TILE);

            ctx.strokeStyle = "rgba(0,0,0,0.08)";
            ctx.strokeRect(screenX, screenY, TILE, TILE);
        }
    }
}

export { TILE };
