
import {
    addPlayer,
    removePlayer,
    movePlayer,
    changePlayerRoom,
    getPlayersInRoom,
    getPlayer
} from "./players.js";

import { roomConfig } from "./rooms.js";

export function setupWorldSync(io) {
    io.on("connection", socket => {
        const player = addPlayer(socket.id);

        socket.join("room:village");

        socket.emit("room-changed", {
            room: "village",
            x: player.x,
            y: player.y
        });

        io.to("room:village").emit(
            "players-update",
            getPlayersInRoom("village")
        );

        socket.on("player-move", data => {
            if (!data) return;

            movePlayer(socket.id, data.x, data.y);

            const currentPlayer = getPlayer(socket.id);

            if (!currentPlayer) return;

            io.to(`room:${currentPlayer.room}`).emit(
                "players-update",
                getPlayersInRoom(currentPlayer.room)
            );
        });

        socket.on("change-room", doorId => {
            const currentPlayer = getPlayer(socket.id);

            if (!currentPlayer) return;
            if (typeof doorId !== "string") return;

            const currentRoom = currentPlayer.room;
            const config = roomConfig[currentRoom];

            if (!config) return;

            const selectedDoor = config.doors[doorId];

            if (!selectedDoor) return;

            // Verify that the player is actually near the door.
            const dx = currentPlayer.x - selectedDoor.x;
            const dy = currentPlayer.y - selectedDoor.y;

            if (Math.sqrt(dx * dx + dy * dy) > 65) return;

            const destination = selectedDoor.targetRoom;

            if (!roomConfig[destination]) return;

            socket.leave(`room:${currentRoom}`);

            changePlayerRoom(
                socket.id,
                destination,
                selectedDoor.spawnX,
                selectedDoor.spawnY
            );

            socket.join(`room:${destination}`);

            io.to(`room:${currentRoom}`).emit(
                "players-update",
                getPlayersInRoom(currentRoom)
            );

            socket.emit("room-changed", {
                room: destination,
                x: selectedDoor.spawnX,
                y: selectedDoor.spawnY
            });

            io.to(`room:${destination}`).emit(
                "players-update",
                getPlayersInRoom(destination)
            );
        });

        socket.on("disconnect", () => {
            const currentPlayer = getPlayer(socket.id);

            const room = currentPlayer?.room;

            removePlayer(socket.id);

            if (room) {
                io.to(`room:${room}`).emit(
                    "players-update",
                    getPlayersInRoom(room)
                );
            }
        });
    });
}
