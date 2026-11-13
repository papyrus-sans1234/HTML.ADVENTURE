
import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import { setupWorldSync } from "./world-sync.js";
import { setupBattleNetwork } from "./combat/battle-network.js";
import { setupNPCNetwork } from "./npcs/npc-network.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static(root));

app.get("/health", (req, res) => {
    res.json({
        status: "online",
        game: "HTML.ADVENTURE",
        combat: "enabled",
        npcs: "enabled"
    });
});

// Multiplayer world system.
setupWorldSync(io);

// Combat and challenge system.
setupBattleNetwork(io);

// NPC, enemy, and boss data system.
setupNPCNetwork(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Game server running on port ${PORT}`);
});
