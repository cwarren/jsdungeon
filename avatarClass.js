import { Entity, DEFAULT_ACTION_COST } from "./entityClass.js";
import { gameState } from "./gameStateClass.js";
import { devTrace, rollDice } from "./util.js";
import { Damage } from "./damageClass.js";


class Avatar extends Entity {
  constructor() {
    super("AVATAR");
    this.timeOnLevel = 0;
    this.meleeAttack = true;
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
    this.healNaturally(this.actionStartingTime);
    return 0; // Player actions are handled through input, not automatic turns
  }

  die() {
    devTrace(1,"Avatar has died.");
    gameState.loseGame();
    super.die();
  }

  getMeleeAttackDamage() {
    devTrace(6,"getting melee attack damage for avatar", this);
    return new Damage(rollDice("1d4"));
  }

  getMeleeAttackActionCost() {
    devTrace(6,"getting melee attack action cost for avatar", this);
    if (this.baseActionCost) return this.baseActionCost;
    return DEFAULT_ACTION_COST;
  }
}

export { Avatar };
