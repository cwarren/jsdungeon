import { GAME_STATE } from "./gameStateClass.js";
import { DEFAULT_ACTION_COST } from "./entity/entityClass.js";
import { uiPaneMain } from "./ui/ui.js";
import { devTrace } from "./util.js";


/* template for new action map entry:
    ACTION_IDENTIFIER: { name: "Action name", description: "brief description of action", action: functionImplementingAction },
*/

const gameActionsMap = {
    DEV_WIN_GAME: { name: "Win game", description: "(development action) Win the current game", action: DEV_winGame },
    DEV_LOSE_GAME: { name: "Lose game", description: "(development action) Win the current game", action: DEV_loseGame },
    DEV_DUMP_GAME_STATE: { name: "Dump game state", description: "(development action) write the game state to the console", action: DEV_dumpGameState },

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

    ZOOM_IN: { name: "Zoom In", description: "Zoom in", action: zoomIn },
    ZOOM_OUT: { name: "Zoom Out", description: "Zoom out", action: zoomOut },
    ZOOM_RESET: { name: "Zoom Reset", description: "Reset the zoom level to the initial value", action: zoomReset },

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

function DEV_winGame()  { 
    GAME_STATE.winGame();
    return 0;
}
function DEV_loseGame() {
    GAME_STATE.loseGame();
    return 0;
}
function DEV_dumpGameState() {
    console.log("### dump game state", GAME_STATE);
    return 0;
}

function avatarMove(dx,dy) { return GAME_STATE.avatar.tryMove(dx,dy); }
function moveAvatar_UL()   { return avatarMove(-1,-1) }
function moveAvatar_U()    { return avatarMove(0,-1) }
function moveAvatar_UR()   { return avatarMove(1,-1) }
function moveAvatar_L()    { return avatarMove(-1,0) }
function moveAvatar_wait() { return DEFAULT_ACTION_COST; }
function moveAvatar_R()    { return avatarMove(1,0) }
function moveAvatar_DL()   { return avatarMove(-1,1) }
function moveAvatar_D()    { return avatarMove(0,1) }
function moveAvatar_DR()   { return avatarMove(1,1) }

function ascendStairs() {
    devTrace(3,'action - ascend stairs');
    const curCell = GAME_STATE.getAvatarCell();
    const stairsUp = curCell.structure;
    if (stairsUp && stairsUp.type == "STAIRS_UP") {
        console.log("going up stairs");
        curCell.worldLevel.removeEntity(GAME_STATE.avatar);
        GAME_STATE.currentLevel--;
        const newCell = stairsUp.connectsTo.getCell();
        newCell.worldLevel.handleAvatarEnteringLevel(newCell);
    } else {
        console.log("cannot ascend - no stairs up");
    }
    console.log("GAME_STATE after ascending", GAME_STATE);
    return GAME_STATE.avatar.baseActionTime;
}

function descendStairs() {
    devTrace(3,'action - descend stairs');
    const curCell = GAME_STATE.getAvatarCell();
    const stairsDown = curCell.structure;
    if (stairsDown && stairsDown.type == "STAIRS_DOWN") {
        console.log("going down stairs");
        curCell.worldLevel.removeEntity(GAME_STATE.avatar);
        GAME_STATE.currentLevel++;
        const lowerWorldLevel = GAME_STATE.world[GAME_STATE.currentLevel]
        if (! lowerWorldLevel.isGridGenerated()) {
            lowerWorldLevel.generate();
        }
        const newCell = stairsDown.connectsTo.getCell();
        newCell.worldLevel.handleAvatarEnteringLevel(newCell);
    } else {
        console.log("cannot descend - no stairs down");
    }
    console.log("GAME_STATE after descending", GAME_STATE);
    return GAME_STATE.avatar.baseActionTime;
}

function runAvatar(deltas) {
    devTrace(7,`action - run avatar to deltas ${deltas.dx},${deltas.dy}`);
    if (GAME_STATE.avatar.movement.isRunning) return; // Prevent multiple runs

    GAME_STATE.avatar.movement.startRunning(deltas);

    // Perform the first move immediately
    return GAME_STATE.avatar.continueRunning();
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
    // devTrace(3,`${key} - sleep avatar (not yet implemented)`, event);
    GAME_STATE.avatar.startSleeping();
    return GAME_STATE.avatar.continueSleeping();
}

function zoomIn()  { uiPaneMain.zoomIn(); return 0; }
function zoomOut()  { uiPaneMain.zoomOut(); return 0; }
function zoomReset()  { uiPaneMain.zoomReset(); return 0;  }

export { gameActionsMap };
