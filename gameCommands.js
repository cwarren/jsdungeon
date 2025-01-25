import { GameState, gameState } from "./gameStateClass.js";
import { gameActionsMap } from "./gameActions.js";
import { gameMetaActionsMap } from "./gameMetaActions.js";
import { textActionsMap } from "./textActions.js";
import { uiActionsMap } from "./uiActions.js";
import { pushUIState, popUIState, setUIState, resetUIState, getCurrentUIState } from "./ui.js";
// import { handlePlayerActionTime } from "./gameTime.js";

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
        "%": "DEV_DUMP_GAME_STATE",

        "C": "PUSH_CHARACTER_SHEET",
        "I": "PUSH_INVENTORY_SCREEN",
        "E": "PUSH_EQUIPMENT_SCREEN",
        "M": "PUSH_MAP_SCREEN",
        "G": "POP_UI_STATE", // GAME_META is the base game state, so from game play popping state gets you back to game meta
        "Escape": "POP_UI_STATE",
        "?": "PUSH_HELP",
    },
    "CHARACTER_SHEET": {
        "Escape": "POP_UI_STATE",
        "?": "PUSH_HELP",
    },
    "INVENTORY": {
        "Escape": "POP_UI_STATE",
        "?": "PUSH_HELP",
    },
    "EQUIPMENT": {
        "Escape": "POP_UI_STATE",
        "?": "PUSH_HELP",
    },
    "MAP_SCREEN": {
        "Escape": "POP_UI_STATE",
        "?": "PUSH_HELP",
    },
    "GAME_META": {
        "N": "NEW_GAME",
        "A": "ABANDON_GAME",
        "Escape": "PUSH_GAMEPLAY",
        "?": "PUSH_HELP",
    },
    "GAME_OVER": {
        "Escape": "POP_UI_STATE",
    },
    "HELP": {
        "ArrowUp": "LINE_UP",
        "ArrowDown": "LINE_DOWN",
        "PageUp": "SCROLL_UP",
        "PageDown": "SCROLL_DOWN",
        "Escape": "POP_UI_STATE",
        "?": "PUSH_HELP",
    },
};

const actionMaps = {
    "GAMEPLAY": gameActionsMap,
    "GAME_META": gameMetaActionsMap,
    "HELP": textActionsMap,
};

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

    // UI control actions are special and also take priority
    if (uiActionsMap[actionKey]) {
        uiActionsMap[actionKey].action();
        return;
    }

    const actionMap = actionMaps[uiState];
    const actionDef = actionMap[actionKey];
    console.log(`Executing action: ${actionDef.name}`);
    const actionTimeCost = actionDef.action(key, event);
    if (uiState == "GAMEPLAY") {
        gameState.handlePlayerActionTime(actionTimeCost);
    }
}

export { executeGameCommand as executeGameCommand, gameActionsMap, keyBinding, actionMaps };