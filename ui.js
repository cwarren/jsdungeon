import { gameState, WORLD_LEVEL_SPECS_FOR_DEV } from "./gameStateClass.js";
import { UIPaneMain } from "./uiPaneMainClass.js";

// On page load, initialize the game state, then draw it, then start game turns

function initializeGameWorld() { // this is a hack until I pull this stuff out to a better location
  gameState.initialize(WORLD_LEVEL_SPECS_FOR_DEV);
}
initializeGameWorld();

const uiPaneMain = new UIPaneMain(gameState);

gameState.advanceGameTime();

export {
  uiPaneMain, initializeGameWorld,
};
