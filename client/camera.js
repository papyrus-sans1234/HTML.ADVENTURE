
export function updateCamera(camera, player, canvas) {
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;
}
