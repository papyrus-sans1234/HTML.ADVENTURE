
const TILE = 32;

function createMap(width, height, type) {
    const map = Array.from(
        { length: height },
        () => Array(width).fill(0)
    );

    // Outer walls
    for (let x = 0; x < width; x++) {
        map[0][x] = 3;
        map[height - 1][x] = 3;
    }

    for (let y = 0; y < height; y++) {
        map[y][0] = 3;
        map[y][width - 1] = 3;
    }

    // Main paths
    if (type === "outdoor") {
        for (let x = 1; x < width - 1; x++) {
            map[10][x] = 1;
        }

        for (let y = 1; y < height - 1; y++) {
            map[y][15] = 1;
        }
    }

    if (type === "cave") {
        for (let x = 2; x < width - 2; x++) {
            map[10][x] = 1;
        }

        for (let y = 2; y < height - 2; y++) {
            map[y][15] = 1;
        }
    }

    if (type === "interior") {
        for (let x = 1; x < width - 1; x++) {
            map[height - 4][x] = 1;
        }
    }

    return map;
}

function setDoor(map, x, y) {
    map[y][x] = 4;
}

function makeDoors(definitions) {
    return definitions.map(door => ({
        ...door,
        x: door.tx * TILE + TILE / 2,
        y: door.ty * TILE + TILE / 2
    }));
}

// VILLAGE
const villageMap = createMap(32, 22, "outdoor");

for (let y = 2; y < 8; y++) {
    for (let x = 3; x < 7; x++) villageMap[y][x] = 3;
}

for (let y = 13; y < 18; y++) {
    for (let x = 24; x < 28; x++) villageMap[y][x] = 3;
}

for (let y = 3; y < 7; y++) {
    villageMap[y][10] = 2;
    villageMap[y][11] = 2;
}

const villageDoors = makeDoors([
    {
        id: "village-forest",
        label: "Enter Whispering Forest",
        tx: 30, ty: 10
    },
    {
        id: "village-house",
        label: "Enter Player House",
        tx: 15, ty: 4
    },
    {
        id: "village-shop",
        label: "Enter Village Shop",
        tx: 22, ty: 15
    }
]);

villageDoors.forEach(d => setDoor(villageMap, d.tx, d.ty));

// FOREST
const forestMap = createMap(32, 22, "outdoor");

for (let y = 2; y < 9; y++) {
    for (let x = 3; x < 9; x++) {
        if (!(x === 7 && y === 8)) forestMap[y][x] = 3;
    }
}

for (let y = 13; y < 19; y++) {
    for (let x = 21; x < 29; x++) {
        forestMap[y][x] = 3;
    }
}

for (let y = 2; y < 7; y++) {
    forestMap[y][20] = 2;
}

const forestDoors = makeDoors([
    {
        id: "forest-village",
        label: "Return to Greenfield Village",
        tx: 1, ty: 10
    },
    {
        id: "forest-cave",
        label: "Enter Ancient Cave",
        tx: 15, ty: 20
    }
]);

forestDoors.forEach(d => setDoor(forestMap, d.tx, d.ty));

// CAVE
const caveMap = createMap(32, 22, "cave");

for (let y = 3; y < 8; y++) {
    for (let x = 3; x < 9; x++) caveMap[y][x] = 3;
}

for (let y = 13; y < 19; y++) {
    for (let x = 23; x < 29; x++) caveMap[y][x] = 3;
}

const caveDoors = makeDoors([
    {
        id: "cave-forest",
        label: "Return to Whispering Forest",
        tx: 15, ty: 1
    }
]);

caveDoors.forEach(d => setDoor(caveMap, d.tx, d.ty));

// HOUSE
const houseMap = createMap(18, 16, "interior");

for (let y = 2; y < 6; y++) {
    for (let x = 3; x < 6; x++) houseMap[y][x] = 3;
}

const houseDoors = makeDoors([
    {
        id: "house-exit",
        label: "Exit to Greenfield Village",
        tx: 9, ty: 14
    }
]);

houseDoors.forEach(d => setDoor(houseMap, d.tx, d.ty));

// SHOP
const shopMap = createMap(18, 16, "interior");

for (let y = 3; y < 6; y++) {
    for (let x = 11; x < 15; x++) shopMap[y][x] = 3;
}

const shopDoors = makeDoors([
    {
        id: "shop-exit",
        label: "Exit to Greenfield Village",
        tx: 9, ty: 14
    }
]);

shopDoors.forEach(d => setDoor(shopMap, d.tx, d.ty));

export const rooms = {
    village: {
        name: "Greenfield Village",
        map: villageMap,
        doors: villageDoors
    },

    forest: {
        name: "Whispering Forest",
        map: forestMap,
        doors: forestDoors
    },

    cave: {
        name: "Ancient Cave",
        map: caveMap,
        doors: caveDoors
    },

    house: {
        name: "Player House",
        map: houseMap,
        doors: houseDoors
    },

    shop: {
        name: "Village Shop",
        map: shopMap,
        doors: shopDoors
    }
};

export { TILE };
