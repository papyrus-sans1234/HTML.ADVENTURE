
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

    socket.on("player-joined", player => {
        callbacks.onPlayerJoined?.(player);
    });

    socket.on("player-left", id => {
        callbacks.onPlayerLeft?.(id);
    });

    return {
        move(x, y) {
            if (socket.connected) {
                socket.emit("player-move", { x, y });
            }
        }
    };
}
