
import { createPlayer } from "./player.js";
import { updateGame } from "./logic.js";
import { drawWorld } from "./world.js";
import { updateCamera } from "./camera.js";
import { rooms } from "./rooms.js";
import { connectMultiplayer } from "./multiplayer.js";
import { findNearbyDoor } from "./transitions.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const camera = { x: 0, y: 0 };

const player = createPlayer("local", 160, 160, "#42a5ff");

let currentRoom = "village";
let otherPlayers = {};
let nearbyDoor = null;

const connection = document.getElementById("connection");
const playerCount = document.getElementById("player-count");
const roomInfo = document.getElementById("room-info");
const interactionHint = document.getElementById("interaction-hint");

const network = connectMultiplayer({
    onConnect(id) {
        player.id = id;

        connection.textContent = "ONLINE";
        connection.style.color = "#4ade80";
    },

    onDisconnect() {
        connection.textContent = "DISCONNECTED";
        connection.style.color = "#f87171";

        otherPlayers = {};
        updatePlayerCount();
    },

    onRoomChanged(data) {
        currentRoom = data.room;

        player.x = data.x;
        player.y = data.y;

        otherPlayers = {};
        nearbyDoor = null;

        roomInfo.textContent = rooms[currentRoom].name.toUpperCase();

        interactionHint.textContent = "";
        updatePlayerCount();
    },

    onPlayersUpdate(players) {
        otherPlayers = {};

        for (const id in players) {
            if (id === player.id) continue;

            otherPlayers[id] = createPlayer(
                id,
                players[id].x,
                players[id].y,
                "#ffb347"
            );
        }

        updatePlayerCount();
    }
});

function updatePlayerCount() {
    playerCount.textContent =
        "Players: " + (1 + Object.keys(otherPlayers).length);
}

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

function interact() {
    if (!nearbyDoor) return;

    network.changeRoom(nearbyDoor.id);

    interactionHint.textContent = "Opening door...";
}

// Desktop interaction
window.addEventListener("keydown", event => {
    if (event.key.toLowerCase() === "e" && !event.repeat) {
        interact();
    }
});

// Mobile interaction
document.getElementById("interact-button")
    .addEventListener("click", interact);

function gameLoop() {
    const room = rooms[currentRoom];

    updateGame(player, room, network);

    updateCamera(camera, player, canvas);

    drawWorld(ctx, room, camera, canvas);

    for (const id in otherPlayers) {
        drawPlayer(otherPlayers[id]);
    }

    drawPlayer(player);

    nearbyDoor = findNearbyDoor(player, room);

    if (nearbyDoor) {
        interactionHint.textContent =
            "Press E / INTERACT — " + nearbyDoor.label;
    } else {
        interactionHint.textContent = "";
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
