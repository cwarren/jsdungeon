import { gameState } from "./gameStateClass.js";
import { Damage } from "./damageClass.js";
// import { Damager } from "./damagerClass.js";
import { rollDice, getRandomListItem, constrainValue, devTrace, formatNumberForMessage } from "./util.js";
// import { GridCell } from "./gridCellClass.js";
// import { getRandomCellOfTerrainInGrid, determineCheapestMovementPath, computeBresenhamLine } from "./gridUtils.js";
import { ENTITIES_DEFINITIONS } from "./entityDefinitions.js";
import { addMessage } from "./uiUtil.js";
import { EntityHealth } from "./entityHealthClass.js";
import { EntityLocation } from "./entityLocationClass.js";
import { EntityMovement } from "./entityMovementClass.js";
import { EntityVision } from "./entityVisionClass.js";

const DEFAULT_ACTION_COST = 100;

class Entity {

  constructor(type) {
    this.type = type;
    this.name = Entity.ENTITIES[type].name;
    this.displaySymbol = Entity.ENTITIES[type].displaySymbol;
    this.displayColor = Entity.ENTITIES[type].displayColor;

    this.baseActionCost = Entity.ENTITIES[type].baseActionCost || DEFAULT_ACTION_COST;

    this.location = new EntityLocation(this, -1, -1, -1); // placeholder values for initial location
    this.vision = new EntityVision(this, Entity.ENTITIES[type].viewRadius);
    this.movement =  new EntityMovement(this, Entity.ENTITIES[type].movementSpec);
    this.health = new EntityHealth(
      this,
      rollDice(Entity.ENTITIES[type].initialHealthRoll),
      Entity.ENTITIES[type].naturalHealingRate,
      Entity.ENTITIES[type].naturalHealingTicks
    );

    this.meleeAttack = Entity.ENTITIES[type].meleeAttack;

    // used in combat AI and for relationship stuff
    this.damagedBy = []; // array of {damageSource, damage}

    this.baseKillPoints = 10; // worth this many advancement points when killed
    this.currentAdvancementPoints = 0;

    this.actionStartingTime = 0;
  }

  //======================================================================
  // INSPECTION & INFORMATION

  getCell() {
    return this.location.getCell();
  }
  getCellAtDelta(dx, dy) {
    return this.location.getCellAtDelta(dx, dy);
  }
  getAdjacentCells() {
    return this.location.getAdjacentCells();
  }

  getAdjacentEntities() {
    devTrace(7, "getting entities adjacent to entity", this);
    const adjCells = this.location.getAdjacentCells();
    const adjEntities = [];
    adjCells.forEach(cell => { if (cell.entity) { adjEntities.push(cell.entity); } });
    devTrace(6, "other entities adjacent to this entity", this, adjEntities);
    return adjEntities;
  }

  //======================================================================
  // VISION

  isVisibleTo(otherEntity) {
    return this.vision.isVisibleToEntity(otherEntity);
  }

  canSeeEntity(otherEntity) {
    return this.vision.canSeeEntity(otherEntity);
  }

  determineVisibleCells() {
    return this.vision.determineVisibleCells();
  }

  //======================================================================
  // ADVANCEMENT

  receiveAdvancementPoints(points) {
    devTrace(2, `${this.type} receiving ${points} advancement points`);
    this.currentAdvancementPoints += points;
  }


  //======================================================================
  // AI

  takeTurn() {
    devTrace(2, `${this.type} acts at ${this.actionStartingTime}`, this);
    let actionTime = this.baseActionCost;
    this.healNaturally(this.actionStartingTime);

    // AI logic or automatic actions go here...
    const adjacentsCost = this.dealWithAdjacentEntities();
    if (adjacentsCost > 0) { return adjacentsCost; }

    if (this.movement.type == 'STATIONARY') { return this.movement.actionCost; }
    if (this.movement.type == 'STEP_AIMLESS') { return this.movement.moveStepAimless(); }
    if (this.movement.type == 'WANDER_AIMLESS') { return this.movement.moveWanderAimless(); }
    if (this.movement.type == 'WANDER_AGGRESSIVE') { return this.movement.moveWanderAggressive(); }

    return actionTime;
  }

  static RELATIONSHIPS = ["TAMED_BY", "FRIENDLY_TO", "NEUTRAL_TO", "HOSTILE_TO", "VIOLENT_TO"];
  getRelationshipTo(otherEntity) {
    devTrace(6, "getting entity relationship", this, otherEntity);
    return "HOSTILE_TO"; // defaults to "murderhobo" (at least for development)
  }

  getDefaultActionFor(otherEntity) {
    devTrace(5, "getting default action", this, otherEntity);
    const relationship = this.getRelationshipTo(otherEntity);
    if (["HOSTILE_TO", "VIOLENT_TO"].includes(relationship)) {
      return "ATTACK"
    }
    if (["FRIENDLY_TO", "NEUTRAL_TO"].includes(relationship)) {
      return "BUMP";
    }
    if (["TAMED_BY"].includes(relationship)) {
      return "SWAP";
    }
    return "ATTACK";
  }

  getEntitiesThatDamagedMe() {
    return this.damagedBy.map(damBy => damBy.damageSource);
  }

  dealWithAdjacentEntities() {
    const hostiles = [];
    const superHostiles = [];
    const toRetaliate = this.getEntitiesThatDamagedMe();
    this.getAdjacentEntities().forEach(adjEnt => {
      if (toRetaliate.includes(adjEnt)) { superHostiles.push(adjEnt); }
      else if (["HOSTILE_TO", "VIOLENT_TO"].includes(this.getRelationshipTo(adjEnt))) { hostiles.push(adjEnt); }
    });
    let entityToAttack = null;
    if (superHostiles.length > 0) {
      entityToAttack = getRandomListItem(superHostiles);
    } else if (hostiles.length > 0) {
      // check to see if any of them have damaged this entity before - prioritize those, in order of damage done to me, breaking ties at random
      entityToAttack = getRandomListItem(hostiles);
    }
    if (entityToAttack) { return this.doMeleeAttackOn(entityToAttack); }
    return 0;
  }

  handleAttemptedMoveIntoOccupiedCell(targetCell) {
    devTrace(6, `${this.type} trying to move into occupied cell`, targetCell);
    const defaultAction = this.getDefaultActionFor(targetCell.entity);
    if (defaultAction == 'ATTACK') {
      return this.doMeleeAttackOn(targetCell.entity);
    }
    if (defaultAction == 'BUMP') {
      console.log("move prevented because target cell is already occupied", targetCell);
      return 0;
    }
    if (defaultAction == 'SWAP') {
      console.log("SWAP ACTION NOT YET IMPLEMENTED", targetCell);
      return 0;
    }
    console.log(`unknown action ${defaultAction}, doing nothing`);
    return 0;
  }

  //======================================================================
  // ACTIONS
  // IMPORTANT!!!!
  // action functions should return the time cost of the action!

  setActionStartingTime(actionStartingTime) {
    this.actionStartingTime = actionStartingTime;
  }

  // ------------------
  // ACTIONS - MOVEMENT & LOCATION

  tryMove(dx, dy) {
    return this.movement.tryMove(dx, dy);
  }

  tryMoveToCell(targetCell) {
    return this.movement.tryMoveToCell(targetCell);
  }

  placeAt(x, y, z) {
    return this.location.placeAt(x, y, z);
  }

  placeAtCell(cell) {
    return this.location.placeAtCell(cell);
  }

  canMoveToCell(cell) {
    return this.movement.canMoveToCell(cell);
  }
  canMoveToDeltas(dx, dy) {
    return this.movement.canMoveToDeltas(dx, dy);
  }

  confirmMove(newCell) {
    return this.movement.confirmMove(newCell);
  }
  confirmMoveDeltas(dx, dy) {
    return this.movement.confirmMoveDeltas(dx, dy);
  }

  startRunning(deltas) {
    this.movement.startRunning(deltas);
  }
 
  stopRunning() {
    this.movement.stopRunning();
  }
  canRunToDeltas(dx, dy) { // similar to canMoveTo, but more things will stop running
    return this.movement.canRunToDeltas(dx, dy);
  }
  continueRunning() {
    return this.movement.continueRunning();
  }

  // ------------------
  // ACTIONS - COMBAT & HEALTH

  attack(otherEntity) {
    devTrace(3, `${this.type} attacking ${otherEntity.type}`, this, otherEntity);
    otherEntity.takeDamageFrom(this.getAttackDamage(), this);
    addMessage(`${this.name} attacks ${otherEntity.name}`);
    return DEFAULT_ACTION_COST;
  }

  getAttackDamage() {
    devTrace(6, "getting attack damage for entity", this);
    return new Damage(2);
  }

  doMeleeAttackOn(otherEntity) {
    devTrace(3, `${this.type} doing melee attack on ${otherEntity.type}`, this, otherEntity);
    if (this.meleeAttack) {
      otherEntity.takeDamageFrom(this.getMeleeAttackDamage(), this);
      return this.getMeleeAttackActionCost();
    }
    devTrace(4, `${this.type} has no melee attack`);
    return 0;
  }

  getMeleeAttackDamage() {
    devTrace(6, "getting melee attack damage for entity", this);
    if (this.meleeAttack) { return this.meleeAttack.damager.getDamage(); }
    return new Damage(0);
  }

  getMeleeAttackActionCost() {
    devTrace(6, "getting melee attack action cost for entity", this);
    if (this.meleeAttack) { return this.meleeAttack.actionCost; }
    return DEFAULT_ACTION_COST;
  }

  takeDamageFrom(dam, otherEntity) {
    devTrace(4, "taking attack damage from entity", this, dam, otherEntity);
    dam.amount = constrainValue(dam.amount, 0, this.health.curHealth + 1);
    this.health.takeDamage(dam.amount);

    let existingEntry = this.damagedBy.find(entry => entry.damageSource === otherEntity);
    if (existingEntry) {
      existingEntry.damage.amount += dam.amount;
    } else {
      this.damagedBy.push({ "damageSource": otherEntity, "damage": dam });
    }

    addMessage(`${this.name} takes ${formatNumberForMessage(dam.amount)} damage from ${otherEntity.name}`);

    // Reset movement plans on damage
    this.movement.interruptOngoingMovement();

    if (! this.health.isAlive()) {
      this.die();
    }
  }

  // assign death credits, remove this entity from the game
  die() {
    devTrace(2, `${this.type} has died.`, this);

    const killCredits = this.getDeathCredits();
    killCredits.forEach(entry => {
      if (entry.damageSource && typeof entry.damageSource.receiveAdvancementPoints === "function") {
        const advancementPoints = Math.floor(this.baseKillPoints * entry.proportionalDamage);
        entry.damageSource.receiveAdvancementPoints(advancementPoints);
      }
    });

    gameState.world[this.location.z].removeEntity(this);
    addMessage(`${this.name} dies`);

    this.damagedBy = [];
    this.vision.visibleCells.clear();
    this.vision.seenCells.clear();
  }

  // get proportional responsibility for damage dealt to this entity
  getDeathCredits() {
    devTrace(6, "determining death credits for entity", this);
    let totalDamage = this.damagedBy.reduce((sum, entry) => sum + entry.damage.amount, 0);
    if (totalDamage === 0) {
      return []; // No damage dealt, return an empty array
    }
    return this.damagedBy.map(entry => ({
      damageSource: entry.damageSource,
      proportionalDamage: entry.damage.amount / totalDamage
    }));
  }

  healNaturally(currentTime) {
    this.health.healNaturally(currentTime);
  }

  // ------------------
  // PLAYER COMMUNICATION
  showNaturalHealingMessage(message) {
    // by default, entities don't show messages for natural healing, though some may (such as the avatar)
  }

  //================================================
  //================================================
  //================================================
  // ENTITY SET UP

  static ENTITIES = {};
  static initializeEntitiesFromList() {
    ENTITIES_DEFINITIONS.forEach((ent) => { Entity.ENTITIES[ent.type] = ent; })
  }
}

Entity.initializeEntitiesFromList();

export { Entity, DEFAULT_ACTION_COST };