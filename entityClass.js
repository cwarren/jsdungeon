import { gameState } from "./gameStateClass.js";
import { Damage } from "./damageClass.js";
import { constrainValue } from "./util.js";

const DEFAULT_ACTION_TIME = 100;

class Entity {

  constructor(type) {
    this.type = type;
    this.displaySymbol = Entity.ENTITIES[type].displaySymbol;
    this.displayColor = Entity.ENTITIES[type].displayColor;
    this.viewRadius = Entity.ENTITIES[type].viewRadius;
    this.visibleCells = new Set();
    this.seenCells = new Set();

    this.isRunning = false;
    this.runDelta = null;

    this.initialHealth = 10;
    this.health = 10;
    this.damagedBy = []; // array of {damageSource, damage}

    this.baseKillPoints = 10; // worth this many advancement points when killed
    this.currentAdvancementPoints = 0;
  }


  //======================================================================
  // INSPECTION & INFORMATION

  getCell() {
    return gameState.world[this.z].grid[this.x][this.y];
  }
  getCellAtDelta(dx, dy) {
    const currentLevel = gameState.world[this.z];
    if (!currentLevel) { return null };
    const newX = this.x + dx;
    const newY = this.y + dy;
    if (newX >= 0 && newX < currentLevel.levelWidth && newY >= 0 && newY < currentLevel.levelHeight) {
      return currentLevel.grid[newX][newY];
    }
    return null;
  }

  static RELATIONSHIPS = ["TAMED_BY", "FRIENDLY_TO", "NEUTRAL_TO", "HOSTILE_TO", "VIOLENT_TO"];
  getRelationshipTo(otherEntity) {
    return "HOSTILE_TO"; // defaults to "murderhobo" (at least for development)
  }

  getDefaultActionFor(otherEntity) {
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

  //======================================================================
  // VISION

  isVisibleTo(otherEntity) {
    return otherEntity.visibleCells.has(gameState.world[this.z].grid[this.x][this.y]);
  }

  determineVisibleCells() {
    // console.log("gameState", gameState);
    this.determineVisibleCellsInGrid(gameState.world[this.z].grid);
  }

  /**
    * Determines visible cells within the grid using line-of-sight and view radius.
    * Uses Bresenham’s line algorithm for visibility checking.
    * @param {Array} grid - The grid representing the world level.
    */
  determineVisibleCellsInGrid(grid) {
    this.visibleCells = new Set();
    const worldWidth = grid.length;
    const worldHeight = grid[0].length;

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
    console.log(`${this.type} receiving ${points} advancement points`);
    this.currentAdvancementPoints += points;
  }


  //======================================================================
  // AI

  takeTurn() {
    if (this.type == "AVATAR") {
      // console.log("Player's turn! Awaiting input...");
      return 0; // The game waits for player input
    } else {
      console.log(`${this.type} acts!`);
      let actionTime = DEFAULT_ACTION_TIME;

      // AI logic or automatic actions go here...

      return actionTime;
    }
  }


  //======================================================================
  // ACTIONS
  // IMPORTANT!!!!
  // action functions should return the time cost of the action!

  // ------------------
  // ACTIONS - MOVEMENT & LOCATION

  tryMove(dx, dy) {
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
        return this.attack(targetCell.entity);
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
    placeAtCell(gameState.world[z ? z : 0].grid[x][y]);
  }

  placeAtCell(cell) {
    // console.log("placing entity at cell", this, cell);
    this.x = cell.x;
    this.y = cell.y;
    this.z = cell.z;
    cell.entity = this;
    this.determineVisibleCells();
  }

  canMoveToCell(cell) {
    return cell.isTraversible && !cell.entity;
  }
  canMoveToDeltas(dx, dy) {
    const currentLevel = gameState.world[this.z];
    if (!currentLevel) return false;
    const targetCell = this.getCellAtDelta(dx, dy);
    if (!targetCell) { return false; }
    return this.canMoveToCell(targetCell);
  }

  confirmMove(newCell) {
    const oldCell = this.getCell();
    oldCell.entity = undefined;
    this.placeAtCell(newCell);
    return DEFAULT_ACTION_TIME;
  }
  confirmMoveDeltas(dx, dy) {
    const oldCell = this.getCell();
    oldCell.entity = undefined;
    this.placeAtCell(this.getCellAtDelta(dx, dy));
    return DEFAULT_ACTION_TIME;
  }

  startRunning(deltas) {
    this.isRunning = true;
    this.runDelta = deltas;
  }
  stopRunning() {
    this.isRunning = false;
    this.runDelta = null;
  }
  canRunToDeltas(dx, dy) { // similar to canMoveTo, but more things will stop running
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
    if (!this.isRunning) return 0;
    // console.log('running entity', this);
    if (!this.canRunToDeltas(this.runDelta.dx, this.runDelta.dy)) {
      this.stopRunning();
      return 0;
    }
    return this.confirmMoveDeltas(this.runDelta.dx, this.runDelta.dy); // confirmMoveDeltas actually does the move and returns the action cost
  }

  // ------------------
  // ACTIONS - COMBAT & HEALTH

  attack(otherEntity) {
    console.log(`${this.type} attacking ${otherEntity.type}`);
    otherEntity.takeDamageFrom(this.getAttackDamage(), this);
    console.log("attacker", this);
    console.log("defender", otherEntity);
    return DEFAULT_ACTION_TIME;
  }

  getAttackDamage() {
    return new Damage(2);
  }

  takeDamageFrom(dam, otherEntity) {
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
    console.log(`${this.type} has died.`);

    const killCredits = this.getDeathCredits();
    killCredits.forEach(entry => {
      if (entry.damageSource && typeof entry.damageSource.receiveAdvancementPoints === "function") {
        const advancementPoints = Math.floor(this.baseKillPoints * entry.proportionalDamage);
        entry.damageSource.receiveAdvancementPoints(advancementPoints);
      }
    });

    gameState.world[this.z].removeEntity(this);
    gameState.turnQueue.removeEntity(this);

    this.damagedBy = [];
    this.visibleCells.clear();
    this.seenCells.clear();
  }

  // get proportional responsibility for damage dealt to this entity
  getDeathCredits() {
    let totalDamage = this.damagedBy.reduce((sum, entry) => sum + entry.damage.amount, 0);
    if (totalDamage === 0) {
      return []; // No damage dealt, return an empty array
    }
    return this.damagedBy.map(entry => ({
      damageSource: entry.damageSource,
      proportionalDamage: entry.damage.amount / totalDamage
    }));
  }

  //================================================
  //================================================
  //================================================
  // ENTITY DEFINITIONS

  static ENTITIES_LIST = [
    { type: "AVATAR", name: "Player", displaySymbol: "@", displayColor: "#fff", viewRadius: 16 },
    { type: "MOLD_PALE", name: "Pale Mold", displaySymbol: "m", displayColor: "#ddd", viewRadius: 2 },
  ];

  static ENTITIES = {};
  static initializeEntitiesFromList() {
    Entity.ENTITIES_LIST.forEach((ent) => { Entity.ENTITIES[ent.type] = ent; })
  }
}

Entity.initializeEntitiesFromList();

export { Entity, DEFAULT_ACTION_TIME };