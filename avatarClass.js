import { Entity, DEFAULT_ACTION_TIME } from "./entityClass.js";
import { gameState } from "./gameStateClass.js";

class Avatar extends Entity {
  constructor() {
    super("AVATAR");
  }

  // Override takeTurn to allow UI interaction
  takeTurn() {
    console.log("Avatar's turn - waiting for player input.");
    return 0; // Player actions are handled through input, not automatic turns
  }

  die() {
    console.log("Avatar has died.");
    gameState.loseGame();
    super.die();
  }
}

export { Avatar };
