
export const ARENA_WIDTH = 600;
export const ARENA_HEIGHT = 260;

export function createDodgePlayer() {
    return {
        x: ARENA_WIDTH / 2,
        y: ARENA_HEIGHT / 2,
        size: 12,
        speed: 4,
        invulnerable: false
    };
}

export function moveDodgePlayer(player, controls) {
    let dx = 0;
    let dy = 0;

    if (controls.left) dx--;
    if (controls.right) dx++;
    if (controls.up) dy--;
    if (controls.down) dy++;

    // Normalize diagonal movement.
    if (dx !== 0 && dy !== 0) {
        dx *= Math.SQRT1_2;
        dy *= Math.SQRT1_2;
    }

    player.x += dx * player.speed;
    player.y += dy * player.speed;

    player.x = Math.max(
        player.size,
        Math.min(ARENA_WIDTH - player.size, player.x)
    );

    player.y = Math.max(
        player.size,
        Math.min(ARENA_HEIGHT - player.size, player.y)
    );
}

export function checkAttackCollision(player, attacks) {
    if (player.invulnerable) return [];

    const hits = [];

    for (const attack of attacks) {
        if (attack.type === "circle") {
            const dx = player.x - attack.x;
            const dy = player.y - attack.y;
            const distance = Math.hypot(dx, dy);

            if (distance < player.size + attack.radius) {
                hits.push(attack);
            }
        }

        if (attack.type === "rectangle") {
            const overlaps =
                player.x + player.size > attack.x &&
                player.x - player.size < attack.x + attack.width &&
                player.y + player.size > attack.y &&
                player.y - player.size < attack.y + attack.height;

            if (overlaps) {
                hits.push(attack);
            }
        }
    }

    return hits;
}

export function createAttackPattern(pattern, arenaWidth = ARENA_WIDTH, arenaHeight = ARENA_HEIGHT) {
    if (pattern === "single") {
        return [{
            type: "rectangle",
            x: arenaWidth * 0.1,
            y: arenaHeight * 0.45,
            width: arenaWidth * 0.8,
            height: 20,
            damage: 10
        }];
    }

    if (pattern === "spread") {
        return [
            { type: "circle", x: arenaWidth * 0.25, y: arenaHeight * 0.5, radius: 18, damage: 12 },
            { type: "circle", x: arenaWidth * 0.5, y: arenaHeight * 0.5, radius: 18, damage: 12 },
            { type: "circle", x: arenaWidth * 0.75, y: arenaHeight * 0.5, radius: 18, damage: 12 }
        ];
    }

    if (pattern === "burst") {
        const attacks = [];
        const centerX = arenaWidth / 2;
        const centerY = arenaHeight / 2;

        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;

            attacks.push({
                type: "circle",
                x: centerX + Math.cos(angle) * 100,
                y: centerY + Math.sin(angle) * 75,
                radius: 20,
                damage: 15
            });
        }

        return attacks;
    }

    return [];
}
