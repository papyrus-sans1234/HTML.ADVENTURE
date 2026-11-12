
const socket = window.io();

export function connectMultiplayer(callbacks) {
    socket.on("connect", () => {
        callbacks.onConnect?.(socket.id);
    });

    socket.on("disconnect", () => {
        callbacks.onDisconnect?.();
    });

    socket.on("players-update", players => {
        callbacks.onPlayersUpdate?.(players);
    });

    socket.on("room-changed", data => {
        callbacks.onRoomChanged?.(data);
    });

    return {
        move(x, y) {
            if (socket.connected) {
                socket.emit("player-move", { x, y });
            }
        },

        changeRoom(doorId) {
            if (socket.connected) {
                socket.emit("change-room", doorId);
            }
        }
    };
}
