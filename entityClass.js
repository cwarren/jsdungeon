import { gameState } from "./gameStateClass.js";
import { Damage } from "./damageClass.js";
import { Damager } from "./damagerClass.js";
import { rollDice, getRandomListItem, constrainValue, devTrace } from "./util.js";

const DEFAULT_ACTION_COST = 100;
const DEFAULT_NATURAL_HEALING_TICKS = 250;

class Entity {

  constructor(type) {
    this.type = type;
    this.displaySymbol = Entity.ENTITIES[type].displaySymbol;
    this.displayColor = Entity.ENTITIES[type].displayColor;
    this.viewRadius = Entity.ENTITIES[type].viewRadius;
    this.visibleCells = new Set();
    this.seenCells = new Set();

    this.baseActionCost = Entity.ENTITIES[type].baseActionCost || DEFAULT_ACTION_COST;
    this.meleeAttack = Entity.ENTITIES[type].meleeAttack;

    this.isRunning = false;
    this.runDelta = null;

    this.initialHealth = rollDice(Entity.ENTITIES[type].initialHealthRoll);
    this.health = this.initialHealth;
    this.naturalHealingRate = Entity.ENTITIES[type].naturalHealingRate;
    this.naturalHealingTicks = Entity.ENTITIES[type].naturalHealingTicks ? Entity.ENTITIES[type].naturalHealingTicks : DEFAULT_NATURAL_HEALING_TICKS;
    this.damagedBy = []; // array of {damageSource, damage}

    this.baseKillPoints = 10; // worth this many advancement points when killed
    this.currentAdvancementPoints = 0;

    this.actionStartingTime = 0;
    this.lastNaturalHealTime = 0;
  }


  //======================================================================
  // INSPECTION & INFORMATION

  getCell() {
    devTrace(6,"getting cell for entity", this);
    return gameState.world[this.z].grid[this.x][this.y];
  }
  getCellAtDelta(dx, dy) {
    devTrace(6,`getting cell at delta ${dx},${dy} for entity`, this);
    const currentLevel = gameState.world[this.z];
    if (!currentLevel) { return null };
    const newX = this.x + dx;
    const newY = this.y + dy;
    if (newX >= 0 && newX < currentLevel.levelWidth && newY >= 0 && newY < currentLevel.levelHeight) {
      return currentLevel.grid[newX][newY];
    }
    return null;
  }

  getAdjacentCells() {
    devTrace(8,"getting cells adjacent to entity", this);
    return this.getCell().getAdjacentCells();
  }

  getAdjacentEntities() {
    devTrace(7,"getting entities adjacent to entity", this);
    const adjCells = this.getAdjacentCells();
    const adjEntities = [];
    adjCells.forEach( cell => { if (cell.entity) { adjEntities.push(cell.entity); } }); 
    devTrace(5,"other entities adjacent to this entity", this, adjEntities);
    return adjEntities;
  }

  //======================================================================
  // VISION

  isVisibleTo(otherEntity) {
    devTrace(7,"checking if this is visible to entity", this, otherEntity);
    return otherEntity.visibleCells.has(gameState.world[this.z].grid[this.x][this.y]);
  }

  determineVisibleCells() {
    devTrace(7,`determine visible cells for ${this.type}`);
    this.determineVisibleCellsInGrid(gameState.world[this.z].grid);
  }

  /**
    * Determines visible cells within the grid using line-of-sight and view radius.
    * Uses Bresenham’s line algorithm for visibility checking.
    * @param {Array} grid - The grid representing the world level.
    */
  determineVisibleCellsInGrid(grid) {
    devTrace(7,`determine visible cells in grid`, this, grid);
    this.visibleCells = new Set();
    const worldWidth = grid.length;
    const worldHeight = grid[0].length;

    // TODO: pull this into a library
    function computeBresenhamLine(x0, y0, x1, y1) {
      let points = [];
      let dx = Math.abs(x1 - x0);
      let dy = Math.abs(y1 - y0);
      let sx = (x0 < x1) ? 1 : -1;
      let sy = (y0 < y1) ? 1 : -1;
      let err = dx - dy;

      while (true) {
        points.push([x0, y0]);
        if (x0 === x1 && y0 === y1) break;
        let e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
      }
      return points;
    }

    for (let dx = -this.viewRadius; dx <= this.viewRadius; dx++) {
      for (let dy = -this.viewRadius; dy <= this.viewRadius; dy++) {
        let targetX = this.x + dx;
        let targetY = this.y + dy;

        if (targetX < 0 || targetX >= worldWidth || targetY < 0 || targetY >= worldHeight) {
          continue; // Skip out-of-bounds cells
        }

        let distanceSquared = dx * dx + dy * dy;
        if (distanceSquared > this.viewRadius * this.viewRadius) {
          continue; // Skip cells outside the circular view radius
        }

        let linePoints = computeBresenhamLine(this.x, this.y, targetX, targetY);
        let obstructed = false;

        for (let [lx, ly] of linePoints) {
          let cell = grid[lx][ly];
          this.visibleCells.add(cell);
          this.seenCells.add(cell);
          if (cell.isOpaque) {
            obstructed = true;
            break; // Stop tracing further along this line
          }
        }
      }
    }
  }

  //======================================================================
  // ADVANCEMENT

  receiveAdvancementPoints(points) {
    devTrace(2,`${this.type} receiving ${points} advancement points`);
    this.currentAdvancementPoints += points;
  }


  //======================================================================
  // AI

  takeTurn() {
      devTrace(2,`${this.type} acts at ${this.actionStartingTime}`, this);
      let actionTime = this.baseActionCost;
      this.healNaturally(this.actionStartingTime);

      // AI logic or automatic actions go here...
      const adjacentsCost = this.dealWithAdjacentEntities();
      if (adjacentsCost > 0) { return adjacentsCost; }

      return actionTime;
  }

  static RELATIONSHIPS = ["TAMED_BY", "FRIENDLY_TO", "NEUTRAL_TO", "HOSTILE_TO", "VIOLENT_TO"];
  getRelationshipTo(otherEntity) {
    devTrace(6, "getting entity relationship",this,otherEntity);
    return "HOSTILE_TO"; // defaults to "murderhobo" (at least for development)
  }

  getDefaultActionFor(otherEntity) {
    devTrace(5, "getting default action",this,otherEntity);
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
    devTrace(6,`${this.type} trying to move ${dx},${dy}`, this);
    const currentLevel = gameState.world[this.z];
    if (!currentLevel) return;

    const targetCell = this.getCellAtDelta(dx, dy);
    if (!targetCell) { return 0; }
    if (this.canMoveToCell(targetCell)) {
      return this.confirmMove(targetCell);
    }
    if (targetCell.entity) {
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
    } else {
      console.log("move prevented because target cell is not traversable", targetCell);
      return 0;
    }
  }

  placeAt(x, y, z) {
    devTrace(5,`placing at location ${x} ${y} ${z}`, this);
    return placeAtCell(gameState.world[z ? z : 0].grid[x][y]);
  }

  placeAtCell(cell) {
    devTrace(5,`placing at cell ${cell.x} ${cell.y} ${cell.z}`, this, cell);
    if (cell.entity) {
      console.log("cannot place entity in occupied cell", this, cell);
      return false;
    } 
    this.x = cell.x;
    this.y = cell.y;
    this.z = cell.z;
    cell.entity = this;
    this.determineVisibleCells();
    return true;
  }

  canMoveToCell(cell) {
    devTrace(7,"checking if entity can move to cell", this, cell);
    return cell.isTraversible && !cell.entity;
  }
  canMoveToDeltas(dx, dy) {
    devTrace(7,`checking if entity can move to deltas ${dx},${dy}`, this);
    const currentLevel = gameState.world[this.z];
    if (!currentLevel) return false;
    const targetCell = this.getCellAtDelta(dx, dy);
    if (!targetCell) { return false; }
    return this.canMoveToCell(targetCell);
  }

  confirmMove(newCell) {
    devTrace(6,"confirming move to cell", this, newCell);
    const oldCell = this.getCell();
    oldCell.entity = undefined;
    this.placeAtCell(newCell);
    return DEFAULT_ACTION_COST;
  }
  confirmMoveDeltas(dx, dy) {
    devTrace(6,`confirming move to deltas ${dx},${dy}`, this);
    const oldCell = this.getCell();
    oldCell.entity = undefined;
    this.placeAtCell(this.getCellAtDelta(dx, dy));
    return DEFAULT_ACTION_COST;
  }

  startRunning(deltas) {
    devTrace(8,"starting running", this);
    this.isRunning = true;
    this.runDelta = deltas;
  }
  stopRunning() {
    devTrace(8,"stopping running", this);
    this.isRunning = false;
    this.runDelta = null;
  }
  canRunToDeltas(dx, dy) { // similar to canMoveTo, but more things will stop running
    devTrace(7,`checking run to deltas ${dx},${dy}`, this);
    const targetCell = this.getCellAtDelta(dx, dy);
    if (!targetCell) { return false; }
    if (!this.canMoveToCell(targetCell)) { return false; }

    // if the destination can be moved to, there are still other conditions that may interrupt running
    // NOTE: taking damage will also stop running, though that's handled in the damage taking method
    const curCell = this.getCell();
    const adjCells = curCell.getAdjacentCells();

    const hasAdjacentInterrupt = adjCells.some(cell =>
      !(cell.structure === undefined || cell.structure == null) ||  // stop if adjacent to a structure
      !(cell.entity === undefined || cell.entity == null) // stop if adjacent to a mob
    );
    if (hasAdjacentInterrupt) { return false; }

    // TODO: add check to stop running when at a corner

    // TODO: add check to stop running when a mob is newly visible

    return true;
  }
  continueRunning() {
    devTrace(7,'continue running entity', this);
    if (!this.isRunning) return 0;
    if (!this.canRunToDeltas(this.runDelta.dx, this.runDelta.dy)) {
      this.stopRunning();
      return 0;
    }
    return this.confirmMoveDeltas(this.runDelta.dx, this.runDelta.dy); // confirmMoveDeltas actually does the move and returns the action cost
  }

  // ------------------
  // ACTIONS - COMBAT & HEALTH

  attack(otherEntity) {
    devTrace(3,`${this.type} attacking ${otherEntity.type}`);
    otherEntity.takeDamageFrom(this.getAttackDamage(), this);
    console.log("attacker", this);
    console.log("defender", otherEntity);
    return DEFAULT_ACTION_COST;
  }

  getAttackDamage() {
    devTrace(6,"getting attack damage for entity", this);
    return new Damage(2);
  }

  doMeleeAttackOn(otherEntity) {
    devTrace(3,`${this.type} doing melee attack on ${otherEntity.type}`, this, otherEntity);
    if (this.meleeAttack) {
      otherEntity.takeDamageFrom(this.getMeleeAttackDamage(), this);
      return this.getMeleeAttackActionCost(); 
    }
    devTrace(4,`${this.type} has no melee attack`);
    return 0;
  }

  getMeleeAttackDamage() {
    devTrace(6,"getting melee attack damage for entity", this);
    if (this.meleeAttack) { return this.meleeAttack.damager.getDamage(); }
    return new Damage(0);
  }

  getMeleeAttackActionCost() {
    devTrace(6,"getting melee attack action cost for entity", this);
    if (this.meleeAttack) { return this.meleeAttack.actionCost; }
    return DEFAULT_ACTION_COST;
  }

  takeDamageFrom(dam, otherEntity) {
    devTrace(4,"taking attack damage from entity", this, dam, otherEntity);
    dam.amount = constrainValue(dam.amount, 0, this.health + 1);
    this.health -= dam.amount;

    let existingEntry = this.damagedBy.find(entry => entry.damageSource === otherEntity);
    if (existingEntry) {
      existingEntry.damage.amount += dam.amount;
    } else {
      this.damagedBy.push({ "damageSource": otherEntity, "damage": dam });
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  // assign death credits, remove this entity from the game
  die() {
    devTrace(2,`${this.type} has died.`, this);

    const killCredits = this.getDeathCredits();
    killCredits.forEach(entry => {
      if (entry.damageSource && typeof entry.damageSource.receiveAdvancementPoints === "function") {
        const advancementPoints = Math.floor(this.baseKillPoints * entry.proportionalDamage);
        entry.damageSource.receiveAdvancementPoints(advancementPoints);
      }
    });

    gameState.world[this.z].removeEntity(this);

    this.damagedBy = [];
    this.visibleCells.clear();
    this.seenCells.clear();
  }

  // get proportional responsibility for damage dealt to this entity
  getDeathCredits() {
    devTrace(6,"determining death credits for entity", this);
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
    devTrace(6,"healNaturally for entity", this);
    const enoughTimePassed = (currentTime - this.lastNaturalHealTime) >= this.naturalHealingTicks;
    const anythingToHeal = this.health < this.initialHealth;
    const healingCount = Math.floor( (currentTime - this.lastNaturalHealTime) / this.naturalHealingTicks);
    if (enoughTimePassed && anythingToHeal) {
      const healAmt = healingCount * (this.naturalHealingRate * this.initialHealth);
      devTrace(5,`natural healing occurs for ${this.type} at ${currentTime} based on last natural healing time ${this.lastNaturalHealTime}, heal count of ${healingCount} restoring ${healAmt}`, this);
      this.health = constrainValue(this.health + healAmt, 0, this.initialHealth);
    }
    if (enoughTimePassed) {
      this.lastNaturalHealTime += healingCount * this.naturalHealingTicks;
    }
  }

  //================================================
  //================================================
  //================================================
  // ENTITY DEFINITIONS

  static ENTITIES_LIST = [
    { type: "AVATAR", name: "Player", displaySymbol: "@", displayColor: "#fff", 
      viewRadius: 16, initialHealthRoll: "150", baseActionCost: 100, naturalHealingRate: .001 },
    { type: "MOLD_PALE", name: "Pale Mold", displaySymbol: "m", displayColor: "#ddd",
      viewRadius: 2, initialHealthRoll: "2d6+40", baseActionCost: 210, naturalHealingRate: .002,
      meleeAttack: {damager: new Damager("1d4-1",[],0), actionCost: 80}
    },
  ];

  static ENTITIES = {};
  static initializeEntitiesFromList() {
    Entity.ENTITIES_LIST.forEach((ent) => { Entity.ENTITIES[ent.type] = ent; })
  }
}

Entity.initializeEntitiesFromList();

export { Entity, DEFAULT_ACTION_COST };