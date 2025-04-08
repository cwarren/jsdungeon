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
    console.log("STUBBED called validatorForInventoryItemSelection");
    // needs avatar inventory
    // needs listOffset in uiPaneMainRendererInventory
    // needs itemRepo
    // return true if inputKey is a valid item selection
    // return false if inputKey is not a valid item selection
    console.log(gameState, inputKey);
    return true;
}


// IMPORTANT!!!!
// action functions should return the time cost of the action!

function lineUp(gameState, key, event) {
    console.log("STUBBED called inventory lineUp");
    // needs avatar inventory
    // needs listOffset in uiPaneMainRendererInventory
    // needs MAX_ITEM_LIST_COUNT from uiPaneMainRendererInventory
    // alters listOffset in uiPaneMainRendererInventory
    return 0;
}

function lineDown(gameState, key, event) {
    console.log("STUBBED called inventory lineDown");
    // needs avatar inventory
    // needs listOffset in uiPaneMainRendererInventory
    // needs MAX_ITEM_LIST_COUNT from uiPaneMainRendererInventory
    // alters listOffset in uiPaneMainRendererInventory
    return 0;
}


function dropItemInitiate(gameState, key, event) {
    console.log("STUBBED called dropItemInitiate");
    uiPaneMain.eventHandler.startTwoStageInput(
        "Drop which item?",
        () => { console.log("STUBBED called dropItem input validator"); return true; } ,
        inventoryActionsMap.INVENTORY_DROP.actionResolver);
    return 0;
}
function dropItemResolve(gameState, inputKey) {
    console.log("STUBBED called dropItemResolve");
    // needs avatar inventory
    // needs listOffset in uiPaneMainRendererInventory
    // see dropItemResolve in gameActions.js
    console.log(gameState, inputKey);
}


function examineItemInitiate(gameState, key, event) {
    console.log("STUBBED called examineItemInitiate");
    uiPaneMain.eventHandler.startTwoStageInput(
        "Examine which item?",
        () => { console.log("STUBBED called examineItem input validator"); return true; } ,
        inventoryActionsMap.INVENTORY_DROP.actionResolver);
    return 0;
}
function examineItemResolve(gameState, inputKey) {
    console.log("STUBBED called examineItemResolve");
    // needs avatar inventory
    // needs listOffset in uiPaneMainRendererInventory
    // see showInventoryResolve in gameActions.js
    console.log(gameState, inputKey);
}


function putItemInitiate(gameState, key, event) {
    console.log("STUBBED called putItemInitiate");
    uiPaneMain.eventHandler.startTwoStageInput(
        "Put which item into the container?",
        () => { console.log("STUBBED called putItem input validator"); return true; } ,
        inventoryActionsMap.INVENTORY_DROP.actionResolver);
    return 0;
}
function putItemResolve(gameState, inputKey) {
    console.log("STUBBED called putItemResolve");
    // needs avatar inventory
    // needs the structure in the avatar's current cell (avatar.getCell().structure)
    // needs listOffset in uiPaneMainRendererInventory
    // NOTE: this will remain stubbed until I tackle containers
    console.log(gameState, inputKey);
}


function equipItemInitiate(gameState, key, event) {
    console.log("STUBBED called equipItemInitiate");
    uiPaneMain.eventHandler.startTwoStageInput(
        "Wear/wield which item?",
        () => { console.log("STUBBED called equipItem input validator"); return true; } ,
        inventoryActionsMap.INVENTORY_DROP.actionResolver);
    return 0;
}
function equipItemResolve(gameState, inputKey) {
    console.log("STUBBED called equipItemResolve");
    // needs avatar inventory
    // needs listOffset in uiPaneMainRendererInventory
    // NOTE: this will remain stubbed until I tackle equipment
    console.log(gameState, inputKey);
}


export { inventoryActionsMap, validatorForInventoryItemSelection };
