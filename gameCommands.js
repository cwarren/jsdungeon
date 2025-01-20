import { moveAvatar_UL, moveAvatar_U, moveAvatar_UR, moveAvatar_L, moveAvatar_wait, moveAvatar_R, moveAvatar_DL, moveAvatar_D, moveAvatar_DR } from "./gameActions.js";
import { gameState } from "./gameplay.js";

const actionsMap = {
    MOVE_UL: { name: "Move Up-Left", description: "Move diagonally up-left", action: moveAvatar_UL },
    MOVE_U: { name: "Move Up", description: "Move up", action: moveAvatar_U },
    MOVE_UR: { name: "Move Up-Right", description: "Move diagonally up-right", action: moveAvatar_UR },
    MOVE_L: { name: "Move Left", description: "Move left", action: moveAvatar_L },
    MOVE_WAIT: { name: "Wait", description: "Stay in place", action: moveAvatar_wait },
    MOVE_R: { name: "Move Right", description: "Move right", action: moveAvatar_R },
    MOVE_DL: { name: "Move Down-Left", description: "Move diagonally down-left", action: moveAvatar_DL },
    MOVE_D: { name: "Move Down", description: "Move down", action: moveAvatar_D },
    MOVE_DR: { name: "Move Down-Right", description: "Move diagonally down-right", action: moveAvatar_DR },
};

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
};

function executeCommand(key) {
    const actionKey = keyBinding[key];
    if (actionKey && actionsMap[actionKey]) {
        console.log(`Executing action: ${actionsMap[actionKey].name}`);
        actionsMap[actionKey].action();
    } else {
        console.log(`No action bound for key: ${key}`);
    }
}

export { executeCommand, actionsMap, keyBinding };