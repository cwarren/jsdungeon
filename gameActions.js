import { gameState, getAvatarCell } from "./gameplay.js";

function avatarMove(dx,dy) { gameState.avatar.tryMove(dx,dy); }
function moveAvatar_UL()   { avatarMove(-1,-1) }
function moveAvatar_U()    { avatarMove(0,-1) }
function moveAvatar_UR()   { avatarMove(1,-1) }
function moveAvatar_L()    { avatarMove(-1,0) }
function moveAvatar_wait() { ; }
function moveAvatar_R()    { avatarMove(1,0) }
function moveAvatar_DL()   { avatarMove(-1,1) }
function moveAvatar_D()    { avatarMove(0,1) }
function moveAvatar_DR()   { avatarMove(1,1) }

function ascendStairs() {
    const curCell = getAvatarCell();
    const stairsUp = curCell.structure;
    if (stairsUp && stairsUp.type == "STAIRS_UP") {
        gameState.currentLevel--;
        curCell.worldLevel.removeEntity(gameState.avatar);
        const newCell = stairsUp.connectsTo.getCell();
        gameState.avatar.placeAtCell(newCell);
        newCell.worldLevel.addEntity(gameState.avatar);
    } else {
        console.log("cannot ascend - no stairs up");
    }
    console.log("gameState after ascending", gameState);
}

// if needed, dynamically adds connecting stairs back up on the lower level, and
// another stairs down on that lower level if it's not the deepest
function descendStairs() {
    const curCell = getAvatarCell();
    const stairsDown = curCell.structure;
    if (stairsDown && stairsDown.type == "STAIRS_DOWN") {
        gameState.currentLevel++;
        const lowerWorldLevel = gameState.world[gameState.currentLevel]
        if (! stairsDown.connectsTo) {
            lowerWorldLevel.addStairsUpTo(stairsDown);
            if (gameState.currentLevel < gameState.world.length -1) {
                lowerWorldLevel.addStairsDown();
            }
        }
        curCell.worldLevel.removeEntity(gameState.avatar);
        const newCell = stairsDown.connectsTo.getCell()
        gameState.avatar.placeAtCell(newCell);
        newCell.worldLevel.addEntity(gameState.avatar);
    } else {
        console.log("cannot descend - no stairs down");
    }
    console.log("gameState after descending", gameState);
}


export { moveAvatar_UL, moveAvatar_U, moveAvatar_UR, moveAvatar_L, moveAvatar_wait, moveAvatar_R, moveAvatar_DL, moveAvatar_D, moveAvatar_DR,
         ascendStairs, descendStairs };
