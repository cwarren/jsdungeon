import { Entity, DEFAULT_ACTION_COST } from "./entityClass.js";
import { GAME_STATE } from "../gameStateClass.js";
import { devTrace, rollDice } from "../util.js";
import { EffDamage } from "../effect/effDamageClass.js";
import { EffGenDamage } from "../effect/effGenDamageClass.js";
import { uiPaneMessages } from "../ui/ui.js";


class Avatar extends Entity {
  constructor() {
    super("AVATAR");
    this.timeOnLevel = 0;
    this.meleeAttack = true;
    this.paneMiniChar = null;
  }

  getCharSheetInfo() {
    return {
      name: this.name,
      type: this.type,
      maxHealth: this.health.maxHealth,
      curHealth: this.health.curHealth,
      maxAdvancementPoints: this.currentAdvancementPoints,
      curAdvancementPoints: this.currentAdvancementPoints,
      naturalHealAmount: this.health.getHealAmountPerInterval(),
      naturalHealInterval: this.health.naturalHealingTicks,
      timeOnLevel: this.timeOnLevel,
    };
  }

  registerPaneMiniChar(paneMiniChar) {
    this.paneMiniChar = paneMiniChar;
    this.paneMiniChar.avatar = this;
    this.updateMiniChar();
  }
  unregisterPaneMiniChar() {
    this.paneMiniChar.clearMiniChar();
    this.paneMiniChar.avatar = null;
    this.paneMiniChar = null;
  }

  updateMiniChar() {
    if (this.paneMiniChar != null) {
      this.paneMiniChar.refreshMiniChar(this.getCharSheetInfo());
    }
  }

  resetTimeOnLevel() {
    devTrace(5, "resetting avatar time on level");
    this.timeOnLevel = 0;
    this.updateMiniChar();
  }

  addTimeOnLevel(someTime) {
    devTrace(5, `adding ${someTime} to avatar time on level`);
    this.timeOnLevel += someTime;
    this.updateMiniChar();
  }

  // Override takeTurn to allow UI interaction
  takeTurn() {
    devTrace(2, `Avatar's turn at time ${this.actionStartingTime}, waiting for player input.`);
    this.healNaturally();
    return 0; // Player actions are handled through input, not automatic turns
  }

  die() {
    devTrace(1, "Avatar has died.");
    GAME_STATE.loseGame();
    super.die();
  }

  // NOTE: override this in Avatar
  getMeleeHitEffectGenerators() {
    return [new EffGenDamage("1d4")];
  }

  getMeleeAttackActionCost() {
    devTrace(6, "getting melee attack action cost for avatar", this);
    if (this.baseActionTime) return this.baseActionTime;
    return DEFAULT_ACTION_COST;
  }

  showNaturalHealingMessage(message) {
    // suppressing these for now - they're getting a bit annoying - in the future there should be a settings flag to control whether or not these are shown
    // uiPaneMessages.addMessage(message);
  }

  showAttackMessages(atk, messagePane) {
    // TODO: figure out how to get attack messages for all entities that are visible
    atk.sendMessageAboutAttackOutcome(messagePane);
  }

  // -----------
  /// overides for minichar updates

  receiveAdvancementPoints(points) {
    super.receiveAdvancementPoints(points);
    this.updateMiniChar();
  }

  takeDamageFrom(dam, otherEntity) {
    super.takeDamageFrom(dam, otherEntity);
    this.updateMiniChar();
  }

  healNaturally() {
    super.healNaturally();
    this.updateMiniChar();
  }
}

export { Avatar };
