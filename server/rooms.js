
const TILE = 32;

function door(id, tx, ty, targetRoom, spawnTX, spawnTY) {
    return {
        id,
        x: tx * TILE + 16,
        y: ty * TILE + 16,
        targetRoom,
        spawnX: spawnTX * TILE + 16,
        spawnY: spawnTY * TILE + 16
    };
}

export const roomConfig = {
    village: {
        width: 1024,
        height: 704,
        doors: {
            "village-forest": door(
                "village-forest", 30, 10,
                "forest", 2, 10
            ),

            "village-house": door(
                "village-house", 15, 4,
                "house", 9, 12
            ),

            "village-shop": door(
                "village-shop", 22, 15,
                "shop", 9, 12
            )
        }
    },

    forest: {
        width: 1024,
        height: 704,
        doors: {
            "forest-village": door(
                "forest-village", 1, 10,
                "village", 29, 10
            ),

            "forest-cave": door(
                "forest-cave", 15, 20,
                "cave", 15, 2
            )
        }
    },

    cave: {
        width: 1024,
        height: 704,
        doors: {
            "cave-forest": door(
                "cave-forest", 15, 1,
                "forest", 15, 19
            )
        }
    },

    house: {
        width: 576,
        height: 512,
        doors: {
            "house-exit": door(
                "house-exit", 9, 14,
                "village", 15, 5
            )
        }
    },

    shop: {
        width: 576,
        height: 512,
        doors: {
            "shop-exit": door(
                "shop-exit", 9, 14,
                "village", 22, 14
            )
        }
    }
};
