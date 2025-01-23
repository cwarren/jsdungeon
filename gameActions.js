import { gameState } from "./gameStateClass.js";
import { DEFAULT_ACTION_TIME } from "./entityClass.js";
import {initializeTurnSystem_mobsOnly} from "./gameTime.js";

/* template for new action map entry:
    ACTION_IDENTIFIER: { name: "Action name", description: "brief description of action", action: functionImplementingAction },
*/

const gameActionsMap = {
    DEV_WIN_GAME: { name: "Win game", description: "(development action) Win the current game", action: DEV_winGame },
    DEV_LOSE_GAME: { name: "Lose game", description: "(development action) Win the current game", action: DEV_loseGame },

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

    RUN_UL: { name: "Run UL", description: "Move repeatedly, starting in the given direction", action: runAvatar_UL },
    RUN_U: { name: "Run U", description: "Move repeatedly, starting in the given direction", action: runAvatar_U },
    RUN_UR: { name: "Run UR", description: "Move repeatedly, starting in the given direction", action: runAvatar_UR },
    RUN_L: { name: "Run L", description: "Move repeatedly, starting in the given direction", action: runAvatar_L },
    RUN_R: { name: "Run R", description: "Move repeatedly, starting in the given direction", action: runAvatar_R },
    RUN_DL: { name: "Run DL", description: "Move repeatedly, starting in the given direction", action: runAvatar_DL },
    RUN_D: { name: "Run D", description: "Move repeatedly, starting in the given direction", action: runAvatar_D },
    RUN_DR: { name: "Run DR", description: "Move repeatedly, starting in the given direction", action: runAvatar_DR },

    SLEEP: { name: "Sleep", description: "Stay in the same space doing nothing until something happens or enough time has passed", action: sleepAvatar },
};

const DIRECTION_DELTAS = {
    "UL": {dx: -1, dy: -1},
    "U": {dx: 0, dy: -1},
    "UR": {dx: 1, dy: -1},
    "L": {dx: -1, dy: 0},
    "R": {dx: 1, dy: 0},
    "DL": {dx: -1, dy: 1},
    "D": {dx: 0, dy: 1},
    "DR": {dx: 1, dy: 1},
};

// IMPORTANT!!!!
// action functions should return the time cost of the action!

function DEV_winGame()  { gameState.winGame(); return 0; }
function DEV_loseGame() { gameState.loseGame(); return 0; }

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
    const curCell = gameState.getAvatarCell();
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
    const curCell = gameState.getAvatarCell();
    const stairsDown = curCell.structure;
    if (stairsDown && stairsDown.type == "STAIRS_DOWN") {
        gameState.currentLevel++;
        const lowerWorldLevel = gameState.world[gameState.currentLevel]
        if (! lowerWorldLevel.isGenerated()) {
            lowerWorldLevel.generate();
        }
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

function runAvatar(deltas) {
    // console.log("run avatar", deltas);
    if (gameState.avatar.isRunning) return; // Prevent multiple runs

    gameState.avatar.startRunning(deltas);

    // gameState.avatar.isRunning = true;
    // gameState.avatar.runningDirection = deltas;

    // Perform the first move immediately
    return gameState.avatar.continueRunning();
}
function runAvatar_UL()   { return runAvatar(DIRECTION_DELTAS["UL"]) }
function runAvatar_U()    { return runAvatar(DIRECTION_DELTAS["U"]) }
function runAvatar_UR()   { return runAvatar(DIRECTION_DELTAS["UR"]) }
function runAvatar_L()    { return runAvatar(DIRECTION_DELTAS["L"]) }
function runAvatar_R()    { return runAvatar(DIRECTION_DELTAS["R"]) }
function runAvatar_DL()   { return runAvatar(DIRECTION_DELTAS["DL"]) }
function runAvatar_D()    { return runAvatar(DIRECTION_DELTAS["D"]) }
function runAvatar_DR()   { return runAvatar(DIRECTION_DELTAS["DR"]) }

function sleepAvatar(key, event) {
    console.log(`${key} - sleep avatar (not yet implemented)`, event);    
}

export { gameActionsMap };
