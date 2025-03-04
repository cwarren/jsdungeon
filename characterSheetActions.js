import { GameState, GAME_STATE, initializeGameWorld } from "./gameStateClass.js";
import { uiPaneMain, uiPaneMessages } from "./ui/ui.js";

//=====================

const characterSheetActionsMap = {
    NAME_AVATAR: { name: "Name", description: "Set the name for your avatar", action: setName },
};

function setName() {
    uiPaneMain.eventHandler.startTextInput("AVATAR_NAME", (newName) => {
        GAME_STATE.avatar.name = newName;
        GAME_STATE.avatar.updateMiniChar();
        uiPaneMain.drawUI();
        uiPaneMessages.ageMessages();
        uiPaneMessages.addMessage(`Character name set to: ${newName}`);

    });
    return 0;
}


//=====================

//=====================

//=====================


export { characterSheetActionsMap };
