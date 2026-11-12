
import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { setupWorldSync } from "./world-sync.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.use(express.static(root));

app.get("/health", (req, res) => {
    res.json({ status: "online" });
});

setupWorldSync(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Game server running on port ${PORT}`);
});
