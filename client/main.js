
import { createPlayer } from "./player.js";
import { updateGame } from "./logic.js";
import { drawWorld } from "./world.js";
import { updateCamera } from "./camera.js";
import { rooms } from "./rooms.js";
import { connectMultiplayer } from "./multiplayer.js";
import { findNearbyDoor } from "./transitions.js";

import {
    setNPCs,
    updateNPCManager,
    getNearbyNPC
} from "./npcs/npc-manager.js";

import {
    openDialogue,
    closeDialogue,
    isDialogueOpen
} from "./npcs/npc-dialogue.js";

import {
    setEnemies,
    updateEnemyManager,
    getNearbyEnemy
} from "./npcs/enemies.js";

import {
    setBosses,
    updateBossManager,
    getNearbyBoss
} from "./npcs/bosses.js";

import {
    initializeBattle,
    startBattle,
    receiveBattleUpdate,
    finishBattle,
    isInBattle,
    useSelectedAbility
} from "./combat/battle.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const camera = { x: 0, y: 0 };
const player = createPlayer("local", 160, 160, "#42a5ff");

let currentRoom = "village";
let otherPlayers = {};
let nearbyDoor = null;
let nearbyNPC = null;
let nearbyEnemy = null;
let nearbyBoss = null;

const connection = document.getElementById("connection");
const playerCount = document.getElementById("player-count");
const roomInfo = document.getElementById("room-info");
const interactionHint = document.getElementById("interaction-hint");

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
    if (isInBattle() || isDialogueOpen()) return;

    if (nearbyNPC) {
        openDialogue(nearbyNPC);
        return;
    }

    if (nearbyEnemy) {
        network.challengeEnemy(nearbyEnemy.id);
        interactionHint.textContent = "Starting battle...";
        return;
    }

    if (nearbyBoss) {
        network.challengeBoss(nearbyBoss.id);
        interactionHint.textContent = "Challenging boss...";
        return;
    }

    if (nearbyDoor) {
        network.changeRoom(nearbyDoor.id);
        interactionHint.textContent = "Opening door...";
    }
}

window.addEventListener("keydown", event => {
    if (event.key.toLowerCase() === "e" && !event.repeat) {
        interact();
    }
});

document
    .getElementById("interact-button")
    .addEventListener("click", interact);

const network = connectMultiplayer({
    onConnect(id) {
        player.id = id;

        initializeBattle(id, abilityId => {
            network.battleAction(abilityId);
        });

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
        nearbyNPC = null;
        nearbyEnemy = null;
        nearbyBoss = null;

        roomInfo.textContent =
            rooms[currentRoom].name.toUpperCase();

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
    },

    onWorldCharacters(data) {
        setNPCs(data.npcs || []);
        setEnemies(data.enemies || []);
        setBosses(data.bosses || []);

        console.log("World characters loaded:", data);
    },

    onBattleStart(data) {
        startBattle(data);
        interactionHint.textContent = "";
    },

    onBattleUpdate(battle) {
        receiveBattleUpdate(battle);
    },

    onBattleEnd(result) {
        finishBattle(result);
    },

    onBattleAction(action) {
        console.log("Battle action:", action);
    },

    onBattleChallengeRequest(data) {
        const accepted = window.confirm(
            data.name + " challenged you to a battle. Accept?"
        );

        network.respondToChallenge(data.from, accepted);
    },

    onBattleChallengeRejected() {
        interactionHint.textContent = "Challenge rejected.";
    },

    onBattleActionError(reason) {
        console.warn("Battle action error:", reason);
    }
});

function gameLoop() {
    const room = rooms[currentRoom];

    if (!room) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (!isInBattle() && !isDialogueOpen()) {
        updateGame(player, room, network);
    }

    updateCamera(camera, player, canvas);
    drawWorld(ctx, room, camera, canvas);

    for (const id in otherPlayers) {
        drawPlayer(otherPlayers[id]);
    }

    drawPlayer(player);

    if (!isInBattle() && !isDialogueOpen()) {
        nearbyNPC = updateNPCManager(player, currentRoom);
        nearbyEnemy = updateEnemyManager(player, currentRoom);
        nearbyBoss = updateBossManager(player, currentRoom);

        nearbyDoor = findNearbyDoor(player, room);

        if (nearbyNPC) {
            interactionHint.textContent =
                "Press E / INTERACT — " + nearbyNPC.name;
        } else if (nearbyEnemy) {
            interactionHint.textContent =
                "Press E / FIGHT — " + nearbyEnemy.name;
        } else if (nearbyBoss) {
            interactionHint.textContent =
                "Press E / CHALLENGE — " + nearbyBoss.name;
        } else if (nearbyDoor) {
            interactionHint.textContent =
                "Press E / INTERACT — " + nearbyDoor.label;
        } else {
            interactionHint.textContent = "";
        }
    } else {
        nearbyNPC = null;
        nearbyEnemy = null;
        nearbyBoss = null;
        nearbyDoor = null;
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
