import { gameState } from "./gameplay.js";

function move(entity, dx, dy) {
    const currentLevel = gameState.world.find(level => level.levelNumber === entity.z);
    if (!currentLevel) return;

    const newX = entity.x + dx;
    const newY = entity.y + dy;

    if (newX >= 0 && newX < currentLevel.levelWidth && newY >= 0 && newY < currentLevel.levelHeight) {
        const targetCell = currentLevel.grid[newX][newY];
        if (targetCell.isTraversible) {
            entity.x = newX;
            entity.y = newY;
        } else {
            console.log("move prevented because target is not traversable", targetCell);
        }
    }
}

function move_UL(entity) { move(entity, -1, -1); }
function move_U(entity) { move(entity, 0, -1);  console.log(`moving entity ${entity.type} U`); }
function move_UR(entity) { move(entity, 1, -1); }
function move_L(entity) { move(entity, -1, 0); }
function move_wait(entity) { /* No movement */ }
function move_R(entity) { move(entity, 1, 0); }
function move_DL(entity) { move(entity, -1, 1); }
function move_D(entity) { move(entity, 0, 1); }
function move_DR(entity) { move(entity, 1, 1); }

function moveAvatar_UL() { move_UL(gameState.avatar); }
function moveAvatar_U() { move_U(gameState.avatar); console.log("moving avatar U"); }
function moveAvatar_UR() { move_UR(gameState.avatar); }
function moveAvatar_L() { move_L(gameState.avatar); }
function moveAvatar_wait() { move_wait(gameState.avatar); }
function moveAvatar_R() { move_R(gameState.avatar); }
function moveAvatar_DL() { move_DL(gameState.avatar); }
function moveAvatar_D() { move_D(gameState.avatar); }
function moveAvatar_DR() { move_DR(gameState.avatar); }

export { move, move_UL, move_U, move_UR, move_L, move_wait, move_R, move_DL, move_D, move_DR,
         moveAvatar_UL, moveAvatar_U, moveAvatar_UR, moveAvatar_L, moveAvatar_wait, moveAvatar_R, moveAvatar_DL, moveAvatar_D, moveAvatar_DR };
