import { uiPaneMain, uiPaneMessages } from "../ui/ui.js";

//=====================

const characterSheetActionsMap = {
    NAME_AVATAR: { name: "Name", description: "Set the name for your avatar", action: setName },
};

function setName(gameState, key, event) {
    uiPaneMain.eventHandler.startTextInput("AVATAR_NAME", "New name", (newName) => {
        gameState.avatar.name = newName;
        gameState.avatar.updateMiniChar();
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
