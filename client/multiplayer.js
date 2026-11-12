
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
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
});

export function connectMultiplayer(callbacks) {

    socket.on("connect", () => {
        console.log("CONNECTED:", socket.id);
        console.log("DEVICE ID:", deviceId);

        callbacks.onConnect?.(deviceId);
    });

    socket.on("disconnect", (reason) => {
        console.warn("DISCONNECTED:", reason);

        callbacks.onDisconnect?.();
    });

    socket.on("connect_error", (error) => {
        console.error("CONNECTION ERROR:", error.message);
    });

    socket.io.on("reconnect_attempt", (attempt) => {
        console.log("RECONNECT ATTEMPT:", attempt);
    });

    socket.io.on("reconnect", (attempt) => {
        console.log("RECONNECTED after attempts:", attempt);
    });

    socket.io.on("reconnect_error", (error) => {
        console.error("RECONNECTION ERROR:", error.message);
    });

    socket.io.on("reconnect_failed", () => {
        console.error("RECONNECTION FAILED");
    });

    socket.on("players-update", (players) => {
        callbacks.onPlayersUpdate?.(players);
    });

    socket.on("room-changed", (data) => {
        callbacks.onRoomChanged?.(data);
    });

    return {
        move(x, y) {
            if (!socket.connected) {
                console.warn("MOVEMENT NOT SENT: Socket disconnected");
                return;
            }

            socket.emit("player-move", { x, y });
        },

        changeRoom(doorId) {
            if (!socket.connected) {
                console.warn("ROOM CHANGE NOT SENT: Socket disconnected");
                return;
            }

            socket.emit("change-room", doorId);
        }
    };
}
