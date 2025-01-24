import { GameState, gameState } from "./gameStateClass.js";
import { pushUIState, popUIState, setUIState, resetUIState, getCurrentUIState } from "./ui.js";

const uiActionsMap = {
    "PUSH_GAMEPLAY": { name: "Play game", description: "The main game-play screen", action: uiGamePlay },
    "PUSH_CHARACTER_SHEET": { name: "Character Sheet", description: "See detailed information about your character", action: uiCharacterSheet } ,
    "PUSH_INVENTORY_SCREEN": { name: "Inventory", description: "Items that you're carrying", action: uiInventory } ,
    "PUSH_EQUIPMENT_SCREEN": { name: "Equipment", description: "Items that you're using", action: uiEquipment } ,
    "PUSH_MAP_SCREEN": { name: "Map", description: "A zoomed out map", action: uiMap } ,
    "PUSH_GAME_META": { name: "Game menu", description: "The main game menu", action: uiGameMeta } ,
    "PUSH_HELP": { name: "Help", description: "Details about the commands available", action: uiHelp } ,
    "POP_UI_STATE": { name: "Exit", description: "Close this screen", action: popUIState } 
};
function uiGamePlay() { 
    // go to game play if there's an active game, otherwise show the game over screen
    if (gameState.status == 'ACTIVE') {
        pushUIState("GAMEPLAY");
    } else if (GameState.statusesGameOver.includes(gameState.status)) {
        pushUIState("GAME_OVER");
    } else {
        resetUIState();
    }
}
function uiCharacterSheet() { pushUIState("CHARACTER_SHEET"); }
function uiInventory() { pushUIState("INVENTORY"); }
function uiEquipment() { pushUIState("EQUIPMENT"); }
function uiMap() { pushUIState("MAP_SCREEN"); }
function uiGameMeta() { pushUIState("GAME_META"); }
function uiHelp() { pushUIState("HELP"); }

export { uiActionsMap };