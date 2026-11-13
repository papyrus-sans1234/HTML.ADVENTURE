
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
    auth: { deviceId },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
});

export function connectMultiplayer(callbacks) {

    // CONNECTION EVENTS

    socket.on("connect", () => {
        console.log("CONNECTED:", socket.id);
        console.log("DEVICE ID:", deviceId);

        callbacks.onConnect?.(deviceId);
    });

    socket.on("disconnect", reason => {
        console.warn("DISCONNECTED:", reason);
        callbacks.onDisconnect?.();
    });

    socket.on("connect_error", error => {
        console.error("CONNECTION ERROR:", error.message);
    });

    socket.io.on("reconnect_attempt", attempt => {
        console.log("RECONNECT ATTEMPT:", attempt);
    });

    socket.io.on("reconnect", attempt => {
        console.log("RECONNECTED after attempts:", attempt);
    });

    socket.io.on("reconnect_error", error => {
        console.error("RECONNECTION ERROR:", error.message);
    });

    socket.io.on("reconnect_failed", () => {
        console.error("RECONNECTION FAILED");
    });


    // WORLD EVENTS

    socket.on("players-update", players => {
        callbacks.onPlayersUpdate?.(players);
    });

    socket.on("room-changed", data => {
        callbacks.onRoomChanged?.(data);
    });

    socket.on("world-characters", data => {
        callbacks.onWorldCharacters?.(data);
    });


    // BATTLE EVENTS

    socket.on("battle-start", data => {
        callbacks.onBattleStart?.(data);
    });

    socket.on("battle-update", data => {
        callbacks.onBattleUpdate?.(data);
    });

    socket.on("battle-end", data => {
        callbacks.onBattleEnd?.(data);
    });

    socket.on("battle-action", action => {
        callbacks.onBattleAction?.(action);
    });

    socket.on("battle-challenge-request", data => {
        callbacks.onBattleChallengeRequest?.(data);
    });

    socket.on("battle-challenge-rejected", data => {
        callbacks.onBattleChallengeRejected?.(data);
    });

    socket.on("battle-action-error", data => {
        callbacks.onBattleActionError?.(data);
    });


    // NETWORK ACTIONS

    return {

        // WORLD

        move(x, y) {
            if (!socket.connected) return;
            socket.emit("player-move", { x, y });
        },

        changeRoom(doorId) {
            if (!socket.connected) return;
            socket.emit("change-room", doorId);
        },


        // PLAYER CHALLENGES

        challengePlayer(targetId) {
            if (!socket.connected) return;
            socket.emit("battle-challenge", targetId);
        },

        respondToChallenge(from, accepted) {
            if (!socket.connected) return;

            socket.emit("battle-challenge-response", {
                from,
                accepted
            });
        },


        // NPC AND BOSS CHALLENGES

        challengeEnemy(enemyId) {
            if (!socket.connected) return;
            socket.emit("challenge-enemy", enemyId);
        },

        challengeBoss(bossId) {
            if (!socket.connected) return;
            socket.emit("challenge-boss", bossId);
        },


        // BATTLE ACTIONS

        battleAction(abilityId) {
            if (!socket.connected) return;
            socket.emit("battle-action", abilityId);
        }
    };
}
