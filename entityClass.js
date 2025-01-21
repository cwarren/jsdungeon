import { gameState } from "./gameplay.js";

class Entity {
    constructor(x, y, z, type, displaySymbol = '?') {
      this.x = x;
      this.y = y;
      this.z = z;
      this.type = type;
      this.displaySymbol = displaySymbol;
      this.viewRadius = 12;
      this.visibleCells = new Set();
      this.seenCells = new Set();
    }

    getCell() {
      return gameState.world[this.z].grid[this.x][this.y];
    }

    determineVisibleCells() {
      console.log(gameState);
      this.determineVisibleCellsInGrid(gameState.world[this.z].grid);
    }

  tryMove(dx, dy) {
    const currentLevel = gameState.world.find(level => level.levelNumber === this.z);
    if (!currentLevel) return;

    const newX = this.x + dx;
    const newY = this.y + dy;

    if (newX >= 0 && newX < currentLevel.levelWidth && newY >= 0 && newY < currentLevel.levelHeight) {
      const targetCell = currentLevel.grid[newX][newY];
      if (targetCell.isTraversible) {
        this.x = newX;
        this.y = newY;
      } else {
        console.log("move prevented because target is not traversable", targetCell);
      }
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
}
  
export { Entity };