import { GameState, GAME_STATE, initializeGameWorld } from "./gameStateClass.js";
import { uiPaneMain, uiPaneMessages } from "./ui/ui.js";


//=====================

const gameMetaActionsMap = {
    NEW_GAME: { name: "New Game", description: "Start a new game (current game must not be active)", action: startNewGame },
    ABANDON_GAME: { name: "Abandon Game", description: "Abandon the current game", action: abandonCurrentGame },
};

function startNewGame() {
    console.log("startNewGame", GAME_STATE);
    if (GameState.statusesGameOver.includes(GAME_STATE.status)) {
        GAME_STATE.reset();
        initializeGameWorld();
        uiPaneMain.resetUIState();
        uiPaneMain.pushUIState("GAME_PLAY");
    } else {
        console.log("Cannot start a new game because there's a game in progress.");
    }
    return 0;
}

function abandonCurrentGame() {
    console.log("abandonCurrentGame", GAME_STATE);
    if (GAME_STATE.status == 'ACTIVE') {
        GAME_STATE.abandonGame();
        uiPaneMain.resetUIState();
        uiPaneMain.pushUIState("GAME_OVER");
    } else {
        console.log("Cannot abandon a game that's already over")
    }
    return 0;
}

//=====================

//=====================

//=====================


export { gameMetaActionsMap };
