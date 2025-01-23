import { gameState } from "./gameStateClass.js";

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
    }

    placeAt(x,y,z) {
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

    getCell() {
      return gameState.world[this.z].grid[this.x][this.y];
    }
    getCellAtDelta(dx,dy) {
      const currentLevel = gameState.world[this.z];
      if (!currentLevel) { return null };
      const newX = this.x + dx;
      const newY = this.y + dy;
      if (newX >= 0 && newX < currentLevel.levelWidth && newY >= 0 && newY < currentLevel.levelHeight) {
        return currentLevel.grid[newX][newY];
      }
      return null;
    }

    isVisibleTo(otherEntity) {
      return otherEntity.visibleCells.has(gameState.world[this.z].grid[this.x][this.y]);
    }

    determineVisibleCells() {
      // console.log("gameState", gameState);
      this.determineVisibleCellsInGrid(gameState.world[this.z].grid);
    }

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

  // IMPORTANT!!!!
  // action functions should return the time cost of the action!

  tryMove(dx, dy) {
    const currentLevel = gameState.world[this.z];
    if (!currentLevel) return;

    const targetCell = this.getCellAtDelta(dx,dy);
    if (!targetCell) { return 0; }
    if (this.canMoveToCell(targetCell)) {
      return this.confirmMove(targetCell);
    }
    if (targetCell.entity) {
      console.log("move prevented because target cell is already occupied", targetCell);
      return 0;
    } else {
      console.log("move prevented because target cell is not traversable", targetCell);
      return 0;
    }
  }

  canMoveToCell(cell) {
    return cell.isTraversible && !cell.entity;
  }
  canMoveToDeltas(dx,dy) {
    const currentLevel = gameState.world[this.z];
    if (!currentLevel) return false;
    const targetCell = this.getCellAtDelta(dx,dy);
    if (!targetCell) { return false; }
    return this.canMoveToCell(targetCell);
  }

  confirmMove(newCell) {
      const oldCell = this.getCell();
      oldCell.entity = undefined;
      this.placeAtCell(newCell);
      return DEFAULT_ACTION_TIME;
  }
  confirmMoveDeltas(dx,dy) {
    const oldCell = this.getCell();
    oldCell.entity = undefined;
    this.placeAtCell(this.getCellAtDelta(dx,dy));
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
  canRunToDeltas(dx,dy) { // similar to canMoveTo, but more things will stop running
    const targetCell = this.getCellAtDelta(dx,dy);
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
    if (! this.canRunToDeltas(this.runDelta.dx, this.runDelta.dy)) {
      this.stopRunning();
      return 0;
    }
    return this.confirmMoveDeltas(this.runDelta.dx, this.runDelta.dy); // confirmMoveDeltas actually does the move and returns the action cost
  }

  //================================================
  // ENTITY DEFINITIONS

  static ENTITIES_LIST = [
    {type: "AVATAR", name: "Player", displaySymbol: "@", displayColor: "#fff", viewRadius: 16},
    {type: "MOLD_PALE", name: "Pale Mold", displaySymbol: "m", displayColor: "#ddd", viewRadius: 2},
  ];

  static ENTITIES = {};
  static initializeEntitiesFromList() {
    Entity.ENTITIES_LIST.forEach((ent) => { Entity.ENTITIES[ent.type] = ent; })
  }
}

Entity.initializeEntitiesFromList();
  
export { Entity, DEFAULT_ACTION_TIME };