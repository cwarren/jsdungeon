import { Entity, DEFAULT_ACTION_TIME } from "./entityClass.js";
import { gameState } from "./gameStateClass.js";
import { devTrace } from "./util.js";


class Avatar extends Entity {
  constructor() {
    super("AVATAR");
    this.timeOnLevel = 0;
  }

  resetTimeOnLevel() {
    devTrace(5, "resetting avatar time on level");
    this.timeOnLevel = 0;
  }
  addTimeOnLevel(someTime) {
    devTrace(6, `adding ${someTime} to avatar time on level`);
    this.timeOnLevel += someTime;
  }

  // Override takeTurn to allow UI interaction
  takeTurn() {
    devTrace(2,"Avatar's turn - waiting for player input.");
    return 0; // Player actions are handled through input, not automatic turns
  }

  die() {
    devTrace(1,"Avatar has died.");
    gameState.loseGame();
    super.die();
  }
}

export { Avatar };
