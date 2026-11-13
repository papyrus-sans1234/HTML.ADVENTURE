
export const NPC_DATA = {
    village_guard: {
        id: "village_guard",
        name: "Village Guard",
        room: "village",
        x: 320,
        y: 320,
        type: "friendly",
        dialogue: [
            "Welcome to Greenfield Village!",
            "The forest can be dangerous. Stay alert."
        ],
        interactDistance: 55
    },

    village_merchant: {
        id: "village_merchant",
        name: "Merchant",
        room: "village",
        x: 704,
        y: 480,
        type: "merchant",
        dialogue: [
            "Welcome to my shop!",
            "Maybe I will have something useful for you later."
        ],
        interactDistance: 55
    },

    forest_guide: {
        id: "forest_guide",
        name: "Forest Guide",
        room: "forest",
        x: 480,
        y: 320,
        type: "friendly",
        dialogue: [
            "You made it into the forest.",
            "Keep an eye out for unusual creatures."
        ],
        interactDistance: 55
    }
};

export function getNPC(npcId) {
    return NPC_DATA[npcId] || null;
}

export function getNPCsInRoom(room) {
    return Object.values(NPC_DATA).filter(
        npc => npc.room === room
    );
}
