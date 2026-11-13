
import { NPC_DATA } from "./npc-data.js";
import { ENEMY_DATA } from "./enemy-data.js";
import { BOSS_DATA } from "./boss-data.js";

export function setupNPCNetwork(io) {
    io.on("connection", socket => {
        const deviceId = socket.handshake.auth?.deviceId;

        if (typeof deviceId !== "string") return;

        socket.emit("world-characters", {
            npcs: Object.values(NPC_DATA),
            enemies: Object.values(ENEMY_DATA),
            bosses: Object.values(BOSS_DATA)
        });
    });
}
