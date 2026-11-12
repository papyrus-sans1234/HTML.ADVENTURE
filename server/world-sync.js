
import {
    addPlayer,
    removePlayer,
    movePlayer,
    getPlayers
} from "./players.js";

export function setupWorldSync(io) {
    io.on("connection", socket => {
        addPlayer(socket.id);

        socket.emit("players-update", getPlayers());

        socket.broadcast.emit("player-joined", getPlayers()[socket.id]);

        socket.on("player-move", data => {
            if (!data) return;

            movePlayer(socket.id, data.x, data.y);

            io.emit("players-update", getPlayers());
        });

        socket.on("disconnect", () => {
            removePlayer(socket.id);

            io.emit("player-left", socket.id);
            io.emit("players-update", getPlayers());
        });
    });
}
