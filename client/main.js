
import { createPlayer } from "./player.js";
import { updateGame } from "./logic.js";
import { drawWorld } from "./world.js";
import { updateCamera } from "./camera.js";
import { rooms } from "./rooms.js";
import { connectMultiplayer } from "./multiplayer.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const room = rooms.village;
const camera = { x: 0, y: 0 };

const player = createPlayer("local", 160, 160, "#42a5ff");

const otherPlayers = {};

const connection = document.getElementById("connection");
const playerCount = document.getElementById("player-count");

const network = connectMultiplayer({
    onConnect(id) {
        player.id = id;
        connection.textContent = "ONLINE";
        connection.style.color = "#4ade80";
    },

    onDisconnect() {
        connection.textContent = "DISCONNECTED";
        connection.style.color = "#f87171";
    },

    onPlayersUpdate(players) {
        for (const id in otherPlayers) {
            if (!players[id]) delete otherPlayers[id];
        }

        for (const id in players) {
            if (id !== player.id) {
                if (!otherPlayers[id]) {
                    otherPlayers[id] = createPlayer(
                        id, players[id].x, players[id].y, "#ffb347"
                    );
                }

                otherPlayers[id].x = players[id].x;
                otherPlayers[id].y = players[id].y;
            }
        }

        playerCount.textContent =
            "Players: " + Object.keys(players).length;
    }
});

function drawPlayer(p) {
    const x = p.x - camera.x;
    const y = p.y - camera.y;

    ctx.fillStyle = "#00000055";
    ctx.fillRect(x - 9, y + 7, 20, 7);

    ctx.fillStyle = p.color;
    ctx.fillRect(x - 9, y - 9, 18, 18);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 5, y - 4, 3, 3);
    ctx.fillRect(x + 3, y - 4, 3, 3);
}

function gameLoop() {
    updateGame(player, room, network);

    updateCamera(camera, player, canvas);

    drawWorld(ctx, room, camera, canvas);

    for (const id in otherPlayers) {
        drawPlayer(otherPlayers[id]);
    }

    drawPlayer(player);

    requestAnimationFrame(gameLoop);
}

gameLoop();
