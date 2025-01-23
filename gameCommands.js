import { gameActionsMap } from "./gameActions.js";
import { gameMetaActionsMap } from "./gameMetaActions.js";
import { pushUIState, popUIState, setUIState, getCurrentUIState } from "./ui.js";
import { handlePlayerActionTime } from "./gameTime.js";

const keyBinding = {
    "GAMEPLAY":
    {
        "7": "MOVE_UL",
        "8": "MOVE_U",
        "9": "MOVE_UR",
        "4": "MOVE_L",
        "5": "MOVE_WAIT",
        "6": "MOVE_R",
        "1": "MOVE_DL",
        "2": "MOVE_D",
        "3": "MOVE_DR",

        "CTRL-7": "RUN_UL",
        "CTRL-8": "RUN_U",
        "CTRL-9": "RUN_UR",
        "CTRL-4": "RUN_L",
        "CTRL-5": "SLEEP",
        "CTRL-6": "RUN_R",
        "CTRL-1": "RUN_DL",
        "CTRL-2": "RUN_D",
        "CTRL-3": "RUN_DR",

        "<": "TAKE_STAIRS_UP",
        ">": "TAKE_STAIRS_DOWN",

        "l": "DEV_LOSE_GAME",
        "w": "DEV_WIN_GAME",

        "C": "PUSH_CHARACTER_SHEET",
        "I": "PUSH_INVENTORY_SCREEN",
        "E": "PUSH_EQUIPMENT_SCREEN",
        "M": "PUSH_MAP_SCREEN",
        "G": "POP_UI_STATE", // GAME_META is the base game state, so from game play popping state gets you back to game meta
        "Escape": "POP_UI_STATE",
    },
    "CHARACTER_SHEET": {
        "Escape": "POP_UI_STATE",
    },
    "INVENTORY": {
        "Escape": "POP_UI_STATE",
    },
    "EQUIPMENT": {
        "Escape": "POP_UI_STATE",
    },
    "MAP_SCREEN": {
        "Escape": "POP_UI_STATE",
    },
    "GAME_META": {
        "N": "NEW_GAME",
        "A": "ABANDON_GAME",
        "Escape": "PUSH_GAMEPLAY",
    },
};

const actionMaps = {
    "GAMEPLAY": gameActionsMap,
    "GAME_META": gameMetaActionsMap,
};

// TODO: pull these into a separate file
const uiActionsMap = {
    "PUSH_GAMEPLAY": uiGamePlay,
    "PUSH_CHARACTER_SHEET": uiCharacterSheet,
    "PUSH_INVENTORY_SCREEN": uiInventory,
    "PUSH_EQUIPMENT_SCREEN": uiEquipment,
    "PUSH_MAP_SCREEN": uiMap,
    "PUSH_GAME_META": uiGameMeta,
    "POP_UI_STATE": popUIState
};
function uiGamePlay() { pushUIState("GAMEPLAY"); } // TODO: add more logic here - game play requires an active game
function uiCharacterSheet() { pushUIState("CHARACTER_SHEET"); }
function uiInventory() { pushUIState("INVENTORY"); }
function uiEquipment() { pushUIState("EQUIPMENT"); }
function uiMap() { pushUIState("MAP_SCREEN"); }
function uiGameMeta() { pushUIState("GAME_META"); }

function executeGameCommand(key, event) {
    let lookupKey = key;
    if (key != "Control" && event.ctrlKey) {
        lookupKey = 'CTRL-' + key;
    }
    const uiState = getCurrentUIState();
    const actionKey = keyBinding[uiState][lookupKey];
    if (!actionKey) {
        console.log(`No action bound for key: ${uiState} ${lookupKey}`);
        return;
    }

    // UI control actions take priority
    if (uiActionsMap[actionKey]) {
        uiActionsMap[actionKey]();
        return;
    }

    const actionMap = actionMaps[uiState];
    const actionDef = actionMap[actionKey];
    console.log(`Executing action: ${actionDef.name}`);
    const actionTimeCost = actionDef.action(key, event);
    if (uiState == "GAMEPLAY") {
        handlePlayerActionTime(actionTimeCost);
    }
}

export { executeGameCommand as executeGameCommand, gameActionsMap, keyBinding };