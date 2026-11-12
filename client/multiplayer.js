
function getDeviceId() {
    let deviceId = localStorage.getItem("html-adventure-device-id");

    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("html-adventure-device-id", deviceId);
    }

    return deviceId;
}

const deviceId = getDeviceId();

const socket = window.io({
    auth: {
        deviceId
    }
});

export function connectMultiplayer(callbacks) {
    socket.on("connect", () => {
        callbacks.onConnect?.(deviceId);
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
