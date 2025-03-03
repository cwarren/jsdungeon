import { GameState, GAME_STATE } from "./gameStateClass.js";
import { uiPaneMain } from "./ui/ui.js";

const uiActionsMap = {
    "PUSH_GAME_PLAY": { name: "Play game", description: "The main game-play screen", action: uiGamePlay },
    "PUSH_CHARACTER_SHEET": { name: "Character Sheet", description: "See detailed information about your character", action: uiCharacterSheet } ,
    "PUSH_INVENTORY_SCREEN": { name: "Inventory", description: "Items that you're carrying", action: uiInventory } ,
    "PUSH_EQUIPMENT_SCREEN": { name: "Equipment", description: "Items that you're using", action: uiEquipment } ,
    "PUSH_MAP_SCREEN": { name: "Map", description: "A zoomed out map", action: uiMap } ,
    "PUSH_GAME_META": { name: "Game menu", description: "The main game menu", action: uiGameMeta } ,
    "PUSH_HELP": { name: "Help", description: "Details about the commands available", action: uiHelp } ,
    "POP_UI_STATE": { name: "Exit", description: "Close this screen", action: uiPopState } 
};
function uiGamePlay() { 
    // go to game play if there's an active game, otherwise show the game over screen
    if (GAME_STATE.status == 'ACTIVE') {
        uiPaneMain.pushUIState("GAME_PLAY");
    } else if (GameState.statusesGameOver.includes(GAME_STATE.status)) {
        uiPaneMain.pushUIState("GAME_OVER");
    } else {
        uiPaneMain.resetUIState();
    }
}
function uiCharacterSheet() { uiPaneMain.pushUIState("CHARACTER_SHEET"); }
function uiInventory() { uiPaneMain.pushUIState("INVENTORY"); }
function uiEquipment() { uiPaneMain.pushUIState("EQUIPMENT"); }
function uiMap() { uiPaneMain.pushUIState("MAP_SCREEN"); }
function uiGameMeta() { uiPaneMain.pushUIState("GAME_META"); }
function uiHelp() { uiPaneMain.pushUIState("HELP"); }

function uiPopState() { uiPaneMain.popUIState(); }

export { uiActionsMap };