import { gameActionsMap } from "./gameActions.js";
import { gameMetaActionsMap } from "./gameMetaActions.js";
import { textActionsMap } from "./textActions.js";
import { characterSheetActionsMap } from "./characterSheetActions.js";
import { uiActionsMap } from "./uiActions.js";
import { uiPaneMain } from "../ui/ui.js";
import { devTrace } from "../util.js";

const keyBinding = {
    "GAME_PLAY":
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

        "+": "ZOOM_IN",
        "-": "ZOOM_OUT",
        "=": "ZOOM_RESET",

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
        "N": "NAME_AVATAR",
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
        "S": "SAVE_GAME",
        "L": "LOAD_GAME",
        "Escape": "PUSH_GAME_PLAY",
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
    "GAME_PLAY": gameActionsMap,
    "GAME_META": gameMetaActionsMap,
    "CHARACTER_SHEET": characterSheetActionsMap,
    "HELP": textActionsMap,
};

function getLookupKey(key, event) {
    if (key !== "Control" && event.ctrlKey) {
        return 'CTRL-' + key;
    }
    return key;
}

function getActionKey(uiState, lookupKey) {
    devTrace(8, 'getActionKey: keybinding, uiState, lookupKey', keyBinding, uiState, lookupKey);
    return keyBinding[uiState][lookupKey];
}

function executeUIAction(gameState, actionKey) {
    if (uiActionsMap[actionKey]) {
        uiActionsMap[actionKey].action(gameState);
        return true;
    }
    return false;
}

function executeGameAction(gameState, actionDef, key, event) {
    devTrace(3, `Executing action: ${actionDef.name}`);
    const actionTimeCost = actionDef.action(gameState, key, event);
    gameState.handlePlayerActionTime(actionTimeCost);
}

function executeGameCommand(gameState, key, event) {
    gameState.avatar.interruptOngoingActions();
    const lookupKey = getLookupKey(key, event);
    const uiState = uiPaneMain.getCurrentUIState();
    const actionKey = getActionKey(uiState, lookupKey);

    if (!actionKey) {
        console.log(`No action bound for key: ${uiState} ${lookupKey}`);
        return;
    }

    if (executeUIAction(gameState, actionKey)) {
        return;
    }

    const actionMap = actionMaps[uiState];
    const actionDef = actionMap[actionKey];
    executeGameAction(gameState, actionDef, key, event);
}

export { executeGameCommand, getLookupKey, getActionKey, executeUIAction, executeGameAction, gameActionsMap, keyBinding, actionMaps };
