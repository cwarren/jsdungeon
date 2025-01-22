import { gameState, getAvatarCell } from "./gameplay.js";
import { DEFAULT_ACTION_TIME } from "./entityClass.js";
import {initializeTurnSystem_mobsOnly} from "./gameTime.js";

const gameActionsMap = {
    MOVE_UL: { name: "Move Up-Left", description: "Move diagonally up-left", action: moveAvatar_UL },
    MOVE_U: { name: "Move Up", description: "Move up", action: moveAvatar_U },
    MOVE_UR: { name: "Move Up-Right", description: "Move diagonally up-right", action: moveAvatar_UR },
    MOVE_L: { name: "Move Left", description: "Move left", action: moveAvatar_L },
    MOVE_WAIT: { name: "Wait", description: "Stay in place", action: moveAvatar_wait },
    MOVE_R: { name: "Move Right", description: "Move right", action: moveAvatar_R },
    MOVE_DL: { name: "Move Down-Left", description: "Move diagonally down-left", action: moveAvatar_DL },
    MOVE_D: { name: "Move Down", description: "Move down", action: moveAvatar_D },
    MOVE_DR: { name: "Move Down-Right", description: "Move diagonally down-right", action: moveAvatar_DR },

    TAKE_STAIRS_UP: { name: "Take stairs up", description: "Move to a higher level", action: ascendStairs },
    TAKE_STAIRS_DOWN: { name: "Take stairs down", description: "Move to a lower level", action: descendStairs },
};

// IMPORTANT!!!!
// action functions should return the time cost of the action!

function avatarMove(dx,dy) { return gameState.avatar.tryMove(dx,dy); }
function moveAvatar_UL()   { return avatarMove(-1,-1) }
function moveAvatar_U()    { return avatarMove(0,-1) }
function moveAvatar_UR()   { return avatarMove(1,-1) }
function moveAvatar_L()    { return avatarMove(-1,0) }
function moveAvatar_wait() { return DEFAULT_ACTION_TIME; }
function moveAvatar_R()    { return avatarMove(1,0) }
function moveAvatar_DL()   { return avatarMove(-1,1) }
function moveAvatar_D()    { return avatarMove(0,1) }
function moveAvatar_DR()   { return avatarMove(1,1) }

function ascendStairs() {
    const curCell = getAvatarCell();
    const stairsUp = curCell.structure;
    if (stairsUp && stairsUp.type == "STAIRS_UP") {
        gameState.currentLevel--;
        curCell.worldLevel.removeEntity(gameState.avatar);
        const newCell = stairsUp.connectsTo.getCell();
        gameState.avatar.placeAtCell(newCell);
        newCell.worldLevel.addEntity(gameState.avatar);
        initializeTurnSystem_mobsOnly();
    } else {
        console.log("cannot ascend - no stairs up");
    }
    console.log("gameState after ascending", gameState);
    return 0;
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
        initializeTurnSystem_mobsOnly();
    } else {
        console.log("cannot descend - no stairs down");
    }
    console.log("gameState after descending", gameState);
    return 0;
}


export { gameActionsMap, moveAvatar_UL, moveAvatar_U, moveAvatar_UR, moveAvatar_L, moveAvatar_wait, moveAvatar_R, moveAvatar_DL, moveAvatar_D, moveAvatar_DR,
         ascendStairs, descendStairs };
