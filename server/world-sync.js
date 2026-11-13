
import {
    addPlayer,
    removePlayer,
    movePlayer,
    changePlayerRoom,
    getPlayersInRoom,
    getPlayer
} from "./players.js";

import { roomConfig } from "./rooms.js";

// One active socket per device.
const activeDevices = new Map();

export function setupWorldSync(io) {
    io.on("connection", socket => {
        const deviceId = socket.handshake.auth?.deviceId;

        // Reject missing or invalid device IDs.
        if (
            typeof deviceId !== "string" ||
            deviceId.length < 10 ||
            deviceId.length > 100
        ) {
            socket.disconnect(true);
            return;
        }

        // Remember this device's new active connection.
        const previousSocketId = activeDevices.get(deviceId);
        activeDevices.set(deviceId, socket.id);

        // Disconnect an older tab using the same device ID.
        if (previousSocketId && previousSocketId !== socket.id) {
            const previousSocket =
                io.sockets.sockets.get(previousSocketId);

            if (previousSocket) {
                previousSocket.disconnect(true);
            }
        }

        socket.data.deviceId = deviceId;

        const player = addPlayer(deviceId);
        const currentRoom = player.room;

        socket.join(`room:${currentRoom}`);

        socket.emit("room-changed", {
            room: currentRoom,
            x: player.x,
            y: player.y
        });

        io.to(`room:${currentRoom}`).emit(
            "players-update",
            getPlayersInRoom(currentRoom)
        );

        // WORLD MOVEMENT

        socket.on("player-move", data => {
            if (!data) return;

            // Ignore messages from an old connection.
            if (activeDevices.get(deviceId) !== socket.id) return;

            movePlayer(deviceId, data.x, data.y);

            const currentPlayer = getPlayer(deviceId);

            if (!currentPlayer) return;

            io.to(`room:${currentPlayer.room}`).emit(
                "players-update",
                getPlayersInRoom(currentPlayer.room)
            );
        });

        // ROOM TRANSITIONS

        socket.on("change-room", doorId => {
            if (activeDevices.get(deviceId) !== socket.id) return;

            const currentPlayer = getPlayer(deviceId);

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

            const changed = changePlayerRoom(
                deviceId,
                destination,
                selectedDoor.spawnX,
                selectedDoor.spawnY
            );

            if (!changed) return;

            socket.leave(`room:${currentRoom}`);

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

        // DISCONNECTION

        socket.on("disconnect", () => {
            // An older tab must not remove the newer tab's player.
            if (activeDevices.get(deviceId) !== socket.id) return;

            const currentPlayer = getPlayer(deviceId);
            const room = currentPlayer?.room;

            activeDevices.delete(deviceId);
            removePlayer(deviceId);

            if (room) {
                io.to(`room:${room}`).emit(
                    "players-update",
                    getPlayersInRoom(room)
                );
            }
        });
    });
}
