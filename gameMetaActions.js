import { gameState } from "./gameStateClass.js";

const gameMetaActionsMap = {
    NEW_GAME: { name: "New Game", description: "Start a new game (current game must not be active)", action: startNewGame },
    ABANDON_GAME: { name: "Abandon Game", description: "Abandon the current game", action: abandonCurrentGame },
};

function startNewGame() {
    console.log("startNewGame", gameState);
    // TODO: implement this
    return 0;
}


function abandonCurrentGame() {
    console.log("abandonCurrentGame", gameState);
    // TODO: implement this
    return 0;
}


export { gameMetaActionsMap };
