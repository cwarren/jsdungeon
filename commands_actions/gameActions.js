import { uiPaneMain, uiPaneMessages, uiPaneInfo } from "../ui/ui.js";
import { devTrace } from "../util.js";


/* template for new action map entry:
    ACTION_IDENTIFIER: { name: "Action name", description: "brief description of action", action: functionImplementingAction, actionResolver: functionResolvingMultipartAction },
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

    GET_SINGLE_ITEM: { name: "Get an item", description: "Pick up a single item from the current location", action: getOneItem },
    GET_ALL_ITEMS: { name: "Get all items", description: "Pick up as many items as you can from the current location", action: getAllItems },

    INVENTORY_SHOW: { name: "Inventory", description: "See what's in your inventory", action: showInventoryInitiate, actionResolver: showInventoryResolve, actionCancellation: showInventoryCancel },
    INVENTORY_DROP: { name: "Drop", description: "Drop something that's in your inventory", action: dropItemInitiate, actionResolver: dropItemResolve },


    ZOOM_IN: { name: "Zoom In", description: "Zoom in", action: zoomIn },
    ZOOM_OUT: { name: "Zoom Out", description: "Zoom out", action: zoomOut },
    ZOOM_RESET: { name: "Zoom Reset", description: "Reset the zoom level to the initial value", action: zoomReset },

};

const DIRECTION_DELTAS = {
    "UL": { dx: -1, dy: -1 },
    "U": { dx: 0, dy: -1 },
    "UR": { dx: 1, dy: -1 },
    "L": { dx: -1, dy: 0 },
    "R": { dx: 1, dy: 0 },
    "DL": { dx: -1, dy: 1 },
    "D": { dx: 0, dy: 1 },
    "DR": { dx: 1, dy: 1 },
};

// IMPORTANT!!!!
// action functions should return the time cost of the action!

function DEV_winGame(gameState, key, event) {
    gameState.winGame();
    return 0;
}
function DEV_loseGame(gameState, key, event) {
    gameState.loseGame();
    return 0;
}
function DEV_dumpGameState(gameState, key, event) {
    console.log("### dump game state", gameState);
    return 0;
}

function avatarMove(gameState, dx, dy) { return gameState.avatar.tryMove(dx, dy); }
function moveAvatar_UL(gameState, key, event) { return avatarMove(gameState, -1, -1) }
function moveAvatar_U(gameState, key, event) { return avatarMove(gameState, 0, -1) }
function moveAvatar_UR(gameState, key, event) { return avatarMove(gameState, 1, -1) }
function moveAvatar_L(gameState, key, event) { return avatarMove(gameState, -1, 0) }
function moveAvatar_wait(gameState, key, event) { return gameState.avatar.baseActionTime; }
function moveAvatar_R(gameState, key, event) { return avatarMove(gameState, 1, 0) }
function moveAvatar_DL(gameState, key, event) { return avatarMove(gameState, -1, 1) }
function moveAvatar_D(gameState, key, event) { return avatarMove(gameState, 0, 1) }
function moveAvatar_DR(gameState, key, event) { return avatarMove(gameState, 1, 1) }

function ascendStairs(gameState, key, event) {
    devTrace(3, 'action - ascend stairs');
    const curCell = gameState.getAvatarCell();
    const stairsUp = curCell.structure;
    if (stairsUp && stairsUp.type == "STAIRS_UP") {
        curCell.worldLevel.removeEntity(gameState.avatar);
        gameState.currentLevel--;
        const newCell = stairsUp.connectsTo.getCell();
        newCell.worldLevel.handleAvatarEnteringLevel(newCell);
    } else {
        uiPaneMessages.addMessage("Cannot ascend - no stairs up here");
        return 0;
    }
    return gameState.avatar.baseActionTime;
}

function descendStairs(gameState, key, event) {
    devTrace(3, 'action - descend stairs');
    const curCell = gameState.getAvatarCell();
    const stairsDown = curCell.structure;
    if (stairsDown && stairsDown.type == "STAIRS_DOWN") {
        curCell.worldLevel.removeEntity(gameState.avatar);
        gameState.currentLevel++;
        const lowerWorldLevel = gameState.world[gameState.currentLevel]
        if (!lowerWorldLevel.isGridGenerated()) {
            lowerWorldLevel.generate();
        }
        const newCell = stairsDown.connectsTo.getCell();
        newCell.worldLevel.handleAvatarEnteringLevel(newCell);
    } else {
        uiPaneMessages.addMessage("Cannot descend - no stairs down here");
        return 0;
    }
    return gameState.avatar.baseActionTime;
}

function runAvatar(gameState, deltas) {
    devTrace(7, `action - run avatar to deltas ${deltas.dx},${deltas.dy}`);
    if (gameState.avatar.movement.isRunning) return; // Prevent multiple runs

    gameState.avatar.movement.startRunning(deltas);

    // Perform the first move immediately
    return gameState.avatar.continueRunning();
}
function runAvatar_UL(gameState, key, event) { return runAvatar(gameState, DIRECTION_DELTAS["UL"]) }
function runAvatar_U(gameState, key, event) { return runAvatar(gameState, DIRECTION_DELTAS["U"]) }
function runAvatar_UR(gameState, key, event) { return runAvatar(gameState, DIRECTION_DELTAS["UR"]) }
function runAvatar_L(gameState, key, event) { return runAvatar(gameState, DIRECTION_DELTAS["L"]) }
function runAvatar_R(gameState, key, event) { return runAvatar(gameState, DIRECTION_DELTAS["R"]) }
function runAvatar_DL(gameState, key, event) { return runAvatar(gameState, DIRECTION_DELTAS["DL"]) }
function runAvatar_D(gameState, key, event) { return runAvatar(gameState, DIRECTION_DELTAS["D"]) }
function runAvatar_DR(gameState, key, event) { return runAvatar(gameState, DIRECTION_DELTAS["DR"]) }

function sleepAvatar(gameState, key, event) {
    // devTrace(3,`${key} - sleep avatar (not yet implemented)`, event);
    gameState.avatar.startSleeping();
    return gameState.avatar.continueSleeping();
}


function getOneItem(gameState, key, event) {
    const targetCell = gameState.avatar.getCell();
    if (!targetCell.inventory) {
        uiPaneMessages.addMessage("Nothing to get here");
        return 0;
    }
    gameState.avatar.takeSingleItemFromCell(targetCell);
    return gameState.avatar.baseActionTime;
}
function getAllItems(gameState, key, event) {
    const targetCell = gameState.avatar.getCell();
    if (!targetCell.inventory) {
        uiPaneMessages.addMessage("Nothing to get here");
        return 0;
    }
    if (targetCell.inventory.count() == 1) {
        return getOneItem(gameState, key, event);
    }
    gameState.avatar.takeAllItemsFromCell(targetCell);
    return gameState.avatar.baseActionTime * 2;
}

function showInventoryInitiate(gameState, key, event) {
    console.log("called showInventoryInitiate");
    uiPaneMain.eventHandler.startListBasedInput("INVENTORY_SHOW",
        gameState.avatar.inventory.getItems(gameState.itemRepo),
        "Here's what you're carrying",
        gameActionsMap.INVENTORY_SHOW.actionResolver,
        gameActionsMap.INVENTORY_SHOW.actionCancellation
    );
    return 0;
}
function showInventoryResolve(gameState, listForInput, selectionIdx) {
    console.log("called showInventoryResolve");
    console.log(gameState, listForInput, selectionIdx);
    const selectedItem = listForInput[selectionIdx];
    // NOTE: can't set uiPaneInfo directly because on resolution the info is reset to what it was before the inventory command, so instead need to update what it's restored from
    uiPaneMain.eventHandler.priorInfo = `${selectedItem.name}<br/>${selectedItem.description}`;
}
function showInventoryCancel() {
    uiPaneMain.eventHandler.priorInfo = '';
}

function dropItemInitiate(gameState, key, event) {
    console.log("called dropItemInitiate");
    uiPaneMain.eventHandler.startListBasedInput("INVENTORY_DROP",
        gameState.avatar.inventory.getItems(gameState.itemRepo),
        "Choose which item to drop",
        gameActionsMap.INVENTORY_DROP.actionResolver);
    return 0;
}
function dropItemResolve(gameState, listForInput, selectionIdx) {
    console.log("called dropItemResolve");
    console.log(gameState, listForInput, selectionIdx);
    const selectedItem = listForInput[selectionIdx];
    // TODO: transfer selected item from avatar inventory to current cell
    uiPaneMessages.addMessage(`You drop the ${selectedItem.name}`);
}

function zoomIn(gameState, key, event) { uiPaneMain.zoomIn(); return 0; }
function zoomOut(gameState, key, event) { uiPaneMain.zoomOut(); return 0; }
function zoomReset(gameState, key, event) { uiPaneMain.zoomReset(); return 0; }

export { gameActionsMap };
