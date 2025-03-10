import { GameState, GAME_STATE, initializeGameWorld } from "./gameStateClass.js";
import { uiPaneMain, uiPaneMessages, uiPaneList } from "./ui/ui.js";
import { PersistLocalStorage } from "./persist/persistLocalStorageClass.js";
import { SaveSlot } from "./persist/saveSlotClass.js";

let PERSIST = null; // this is set to new PersistLocalStorage(uiPaneMessages) on initial use - this avoids "Uncaught ReferenceError: Cannot access 'uiPaneMessages' before initialization"

//=====================

const gameMetaActionsMap = {
    NEW_GAME: { name: "New Game", description: "Start a new game (current game must not be active)", action: startNewGame },
    ABANDON_GAME: { name: "Abandon Game", description: "Abandon the current game", action: abandonCurrentGame },
    SAVE_GAME: { name: "Save Game", description: "Save the current game", action: saveGame },
    LOAD_GAME: { name: "Load Game", description: "Load a saved game", action: loadGame },
};

function startNewGame() {
    if (GameState.statusesGameOver.includes(GAME_STATE.status)) {
        GAME_STATE.reset();
        initializeGameWorld();
        uiPaneMain.resetUIState();
        uiPaneMain.pushUIState("GAME_PLAY");
    } else {
        uiPaneMessages.ageMessages();
        uiPaneMessages.addMessage("Cannot start a new game because there's a game in progress.");
    }
    return 0;
}

function abandonCurrentGame() {
    if (GAME_STATE.status == 'ACTIVE') {
        GAME_STATE.abandonGame();
        uiPaneMain.resetUIState();
        uiPaneMain.pushUIState("GAME_OVER");
    } else {
        uiPaneMessages.ageMessages();
        uiPaneMessages.addMessage("Cannot abandon a game that's already over.");
    }
    return 0;
}

function saveGame() {
    console.log("CALLED saveGame");
    if (!PERSIST) { PERSIST = new PersistLocalStorage(uiPaneMessages); }
    if (GAME_STATE.status == 'ACTIVE') {
        const slotName = GAME_STATE.avatar.name;
        if (slotName == 'Avatar') {
            uiPaneMessages.ageMessages();
            uiPaneMessages.addMessage('GAME NOT SAVED! Name your character to something other than Avatar before saving.');
            return 0;
        }
        const saveSlot = new SaveSlot(slotName, GAME_STATE);
        saveSlot.serializedData = 'junk data for dev';
        PERSIST.saveGame(saveSlot);
    } else {
        uiPaneMessages.ageMessages();
        uiPaneMessages.addMessage('There is no active game to save.');
    }

    return 0;
}

function loadGame() {
    console.log("CALLED loadGame");
    if (!PERSIST) { PERSIST = new PersistLocalStorage(uiPaneMessages); }

    if (GAME_STATE.status == 'ACTIVE') {
        uiPaneMessages.ageMessages();
        uiPaneMessages.addMessage("Cannot load a game because there's currently a game in progress.");
        return 0;
    }

    const existingSaves = PERSIST.getSaveSlots();
    console.log('existing saves: ', existingSaves);
    if (!existingSaves || existingSaves.length < 1) {
        uiPaneMessages.ageMessages();
        uiPaneMessages.addMessage('There are no saved games to load.');
        return 0;
    }

    uiPaneList.setList('Saved Games', existingSaves.map(es => { return { displayText: es.name }; }));
    uiPaneMain.eventHandler.startTextInput(
        "GAME_TO_LOAD", "Name of game to load",
        (slotName) => {
            uiPaneList.clearList();
            const [saveSlot] = existingSaves.filter(slot => slot.name === slotName);

            if (!saveSlot) {
                uiPaneMessages.ageMessages();
                uiPaneMessages.addMessage(`NO GAME LOADED - No saved game named '${slotName}' was found.`);
                return 0;
            }
            PERSIST.loadGame(saveSlot);
            console.log('saveSlot post-load: ', saveSlot);
        },
        () => {
            uiPaneList.clearList();
            uiPaneMessages.ageMessages();
            uiPaneMessages.addMessage(`NO GAME LOADED - game load cancelled.`);
        }
    );

    return 0;
}

//=====================

//=====================

//=====================


export { gameMetaActionsMap };
