
export function findNearbyDoor(player, room) {
    if (!room || !room.doors) return null;

    for (const door of room.doors) {
        const dx = player.x - door.x;
        const dy = player.y - door.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 58) {
            return door;
        }
    }

    return null;
}
