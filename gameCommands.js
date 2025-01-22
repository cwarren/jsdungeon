import { gameActionsMap } from "./gameActions.js";
// import { gameActionsMap, moveAvatar_UL, moveAvatar_U, moveAvatar_UR, moveAvatar_L, moveAvatar_wait, moveAvatar_R, moveAvatar_DL, moveAvatar_D, moveAvatar_DR, ascendStairs, descendStairs } from "./gameActions.js";
// import { gameState } from "./gameplay.js";
import { pushUIState, popUIState, setUIState, getCurrentUIState } from "./ui.js";
import {handlePlayerActionTime} from "./gameTime.js";


// const gameActionsMap = {
//     MOVE_UL: { name: "Move Up-Left", description: "Move diagonally up-left", action: moveAvatar_UL },
//     MOVE_U: { name: "Move Up", description: "Move up", action: moveAvatar_U },
//     MOVE_UR: { name: "Move Up-Right", description: "Move diagonally up-right", action: moveAvatar_UR },
//     MOVE_L: { name: "Move Left", description: "Move left", action: moveAvatar_L },
//     MOVE_WAIT: { name: "Wait", description: "Stay in place", action: moveAvatar_wait },
//     MOVE_R: { name: "Move Right", description: "Move right", action: moveAvatar_R },
//     MOVE_DL: { name: "Move Down-Left", description: "Move diagonally down-left", action: moveAvatar_DL },
//     MOVE_D: { name: "Move Down", description: "Move down", action: moveAvatar_D },
//     MOVE_DR: { name: "Move Down-Right", description: "Move diagonally down-right", action: moveAvatar_DR },

//     TAKE_STAIRS_UP: { name: "Take stairs up", description: "Move to a higher level", action: ascendStairs },
//     TAKE_STAIRS_DOWN: { name: "Take stairs down", description: "Move to a lower level", action: descendStairs },
// };

const keyBinding = {
    "7": "MOVE_UL",
    "8": "MOVE_U",
    "9": "MOVE_UR",
    "4": "MOVE_L",
    "5": "MOVE_WAIT",
    "6": "MOVE_R",
    "1": "MOVE_DL",
    "2": "MOVE_D",
    "3": "MOVE_DR",

    "<": "TAKE_STAIRS_UP",
    ">": "TAKE_STAIRS_DOWN",

    "C": "PUSH_CHARACTER_SHEET", 
    "I": "PUSH_INVENTORY_SCREEN",
    "E": "PUSH_EQUIPMENT_SCREEN",
    "M": "PUSH_MAP_SCREEN",
    "G": "PUSH_GAME_META",
    "Escape": "POP_UI_STATE",  // Close the current UI screen
};

function executeGameCommand(key) {
    const actionKey = keyBinding[key];
    if (actionKey && gameActionsMap[actionKey]) {
        console.log(`Executing action: ${gameActionsMap[actionKey].name}`);
        const actionTimeCost = gameActionsMap[actionKey].action();
        handlePlayerActionTime(actionTimeCost);
    } else if (actionKey) {
        switch (actionKey) {
            case "PUSH_CHARACTER_SHEET":
                pushUIState("CHARACTER_SHEET");
                break;
            case "PUSH_INVENTORY_SCREEN":
                pushUIState("INVENTORY");
                break;
            case "PUSH_EQUIPMENT_SCREEN":
                pushUIState("EQUIPMENT");
                break;
            case "PUSH_MAP_SCREEN":
                pushUIState("MAP_SCREEN");
                break;
            case "PUSH_GAME_META":
                pushUIState("GAME_META");
                break;
            case "POP_UI_STATE":
                popUIState();
                break;
        }
    } else {
        console.log(`No action bound for key: ${key}`);
    }
}

export { executeGameCommand as executeGameCommand, gameActionsMap, keyBinding };