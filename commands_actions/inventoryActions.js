import { uiPaneMain, uiPaneMessages, uiPaneInfo } from "../ui/ui.js";
import { devTrace } from "../util.js";


/* template for new action map entry:
    ACTION_IDENTIFIER: { name: "Action name", description: "brief description of action", action: functionImplementingAction, actionResolver: functionResolvingMultipartAction },
*/

const inventoryActionsMap = {
    INVENTORY_LINE_DOWN: { name: "Down", description: "Scroll the inventory list one line towards the end", action: lineDown },
    INVENTORY_LINE_UP: { name: "Up", description: "Scroll the inventory list one line towards the beginning", action: lineUp },

    INVENTORY_DROP: { name: "Drop", description: "Drop something that's in your inventory", action: dropItemInitiate, actionResolver: dropItemResolve },
    INVENTORY_EXAMINE: { name: "Examine", description: "See details about something that's in your inventory", action: examineItemInitiate, actionResolver: examineItemResolve },
    INVENTORY_PUT: { name: "Put", description: "Put something from in your inventory into a container in your space", action: putItemInitiate, actionResolver: putItemResolve },
    INVENTORY_EQUIP: { name: "Equip", description: "Wear/wield something that's in your inventory", action: equipItemInitiate, actionResolver: equipItemResolve },
};

function validatorForInventoryItemSelection(gameState, inputKey) {
    const selectionKey = inputKey.toLowerCase();
    return uiPaneMain.renderers["INVENTORY"].isValidSelection(selectionKey);
}

function getSelectedItem(gameState, inputKey) {
    const inventory = gameState.avatar.inventory;
    const selectionOffset = uiPaneMain.renderers["INVENTORY"].getListOffset();
    const selectionIndex = uiPaneMain.renderers["INVENTORY"].getListItemLabels().indexOf(inputKey);
    const itemIndex = selectionIndex + selectionOffset;
    const selectedItem = inventory.getItems()[itemIndex];
 
    return selectedItem ? selectedItem : null;
}

// IMPORTANT!!!!
// action functions should return the time cost of the action!

function lineUp(gameState, key, event) {
    uiPaneMain.renderers["INVENTORY"].scrollUp();
    return 0;
}

function lineDown(gameState, key, event) {
    uiPaneMain.renderers["INVENTORY"].scrollDown();
    return 0;
}


// NOTE: dropping items can also be done as a list-based game action, but this lets
// the user do it directly from the inventory screen, which streamlines the game play experience
function dropItemInitiate(gameState, key, event) {
    uiPaneMain.eventHandler.startTwoStageInput(
        "Drop which item?",
        validatorForInventoryItemSelection,
        inventoryActionsMap.INVENTORY_DROP.actionResolver);
    return 0;
}
function dropItemResolve(gameState, inputKey) {
    const selectionKey = inputKey.toLowerCase();
    const selectedItem = getSelectedItem(gameState, selectionKey)
    if (!selectedItem) {
        uiPaneMessages.addMessage("No such item in inventory");
        return 0;
    }
    const isBulkDrop = selectionKey != inputKey; // uppercase input means bulk drop
    gameState.avatar.dropItem(selectedItem, isBulkDrop);
    gameState.avatar.updateMiniChar();
    uiPaneMain.renderers["INVENTORY"].draw(); // draw needs to be called here since this is executed as a callback; the normal draw-after-action doesn't happen
}


function examineItemInitiate(gameState, key, event) {
    uiPaneMain.eventHandler.startTwoStageInput(
        "Examine which item?",
        validatorForInventoryItemSelection,
        inventoryActionsMap.INVENTORY_EXAMINE.actionResolver);
    return 0;
}
function examineItemResolve(gameState, inputKey) {
    const selectedItem = getSelectedItem(gameState, inputKey)
    if (!selectedItem) {
        uiPaneMessages.addMessage("No such item in inventory");
        return 0;
    }
    // NOTE: can't set uiPaneInfo directly because on resolution the info is reset to what it was before the inventory command, so instead need to update what it's restored from
    uiPaneMain.eventHandler.priorInfo = selectedItem.getRichInfo();
    // no draw call needed since this doesn't change the inventory
}


function putItemInitiate(gameState, key, event) {
    console.log("STUBBED called putItemInitiate");
    uiPaneMain.eventHandler.startTwoStageInput(
        "Put which item into the container?",
        () => { console.log("STUBBED called putItem input validator"); return true; } ,
        inventoryActionsMap.INVENTORY_PUT.actionResolver);
    return 0;
}
function putItemResolve(gameState, inputKey) {
    console.log("STUBBED called putItemResolve");
    // needs avatar inventory
    // needs the structure in the avatar's current cell (avatar.getCell().structure)
    // needs listOffset in uiPaneMainRendererInventory
    // NOTE: this will remain stubbed until I tackle containers
    console.log(gameState, inputKey);
    gameState.avatar.updateMiniChar();
    uiPaneMain.renderers["INVENTORY"].draw(); // draw needs to be called here since this is executed as a callback; the normal draw-after-action doesn't happen
}


function equipItemInitiate(gameState, key, event) {
    console.log("STUBBED called equipItemInitiate");
    uiPaneMain.eventHandler.startTwoStageInput(
        "Wear/wield which item?",
        () => { console.log("STUBBED called equipItem input validator"); return true; } ,
        inventoryActionsMap.INVENTORY_EQUIP.actionResolver);
    return 0;
}
function equipItemResolve(gameState, inputKey) {
    console.log("STUBBED called equipItemResolve");
    // needs avatar inventory
    // needs listOffset in uiPaneMainRendererInventory
    // NOTE: this will remain stubbed until I tackle equipment
    console.log(gameState, inputKey);
    uiPaneMain.renderers["INVENTORY"].draw(); // draw needs to be called here since this is executed as a callback; the normal draw-after-action doesn't happen
}


export { inventoryActionsMap, validatorForInventoryItemSelection, getSelectedItem };
