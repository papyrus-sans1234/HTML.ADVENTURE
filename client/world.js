
import { TILE } from "./rooms.js";

const colors = {
    0: "#477d43",
    1: "#b69a68",
    2: "#367eb8",
    3: "#344b35",
    4: "#76502f"
};

export function drawWorld(ctx, room, camera, canvas) {
    ctx.fillStyle = "#17271e";
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

            if (tile === 0) {
                ctx.fillStyle = "rgba(0,0,0,0.07)";
                ctx.fillRect(screenX + 5, screenY + 7, 3, 3);
                ctx.fillRect(screenX + 23, screenY + 20, 3, 3);
            }

            if (tile === 2) {
                ctx.fillStyle = "rgba(255,255,255,0.2)";
                ctx.fillRect(screenX + 5, screenY + 10, 13, 2);
            }

            if (tile === 3) {
                ctx.fillStyle = "#263b2a";
                ctx.fillRect(screenX + 4, screenY + 4, 24, 24);
                ctx.fillStyle = "#526b42";
                ctx.fillRect(screenX + 7, screenY + 6, 18, 7);
            }

            if (tile === 4) {
                ctx.fillStyle = "#38251a";
                ctx.fillRect(screenX + 5, screenY + 3, 22, 29);

                ctx.fillStyle = "#b77a3e";
                ctx.fillRect(screenX + 8, screenY + 7, 16, 25);

                ctx.fillStyle = "#f3cf79";
                ctx.fillRect(screenX + 19, screenY + 19, 3, 3);
            }

            ctx.strokeStyle = "rgba(0,0,0,0.07)";
            ctx.strokeRect(screenX, screenY, TILE, TILE);
        }
    }
}

export { TILE };
