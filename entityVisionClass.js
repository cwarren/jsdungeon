import { devTrace } from "./util.js";
import { computeBresenhamLine } from './gridUtils.js';

const DEFAULT_VIEW_RADIUS = 1;

class EntityVision {
  constructor(ofEntity, viewRadius = DEFAULT_VIEW_RADIUS) {
    this.ofEntity = ofEntity;
    this.location = ofEntity.location;
    this.viewRadius = viewRadius;
    this.visibleCells = new Set();
    this.seenCells = new Set();
  }

  isVisibleToEntity(otherEntity) {
    devTrace(7, `checking if ${this.ofEntity.type} is visible to other entity ${otherEntity.type}`, this.ofEntity, otherEntity);
    return otherEntity.canSeeEntity(this.ofEntity);
  }

  canSeeEntity(otherEntity) {
    devTrace(7, `checking if ${this.ofEntity.type} can see other entity ${otherEntity.type}`, this.ofEntity, otherEntity);
    return this.visibleCells.has(otherEntity.getCell());
  }

  determineVisibleCells() {
    devTrace(7, `determine visible cells for ${this.ofEntity.type}`, this.ofEntity);
    this.determineVisibleCellsInGrid(this.location.getWorldLevel().grid);
  }

  /**
    * Determines visible cells within the grid using line-of-sight and view radius.
    * Uses Bresenham’s line algorithm for visibility checking.
    * @param {Array} grid - The grid representing the world level.
    */
  determineVisibleCellsInGrid(grid) {
    devTrace(8, `determine visible cells in grid`, this, grid);
    this.visibleCells = new Set();
    const worldWidth = grid.length;
    const worldHeight = grid[0].length;

    for (let dx = -this.viewRadius; dx <= this.viewRadius; dx++) {
      for (let dy = -this.viewRadius; dy <= this.viewRadius; dy++) {
        let targetX = this.location.x + dx;
        let targetY = this.location.y + dy;

        if (targetX < 0 || targetX >= worldWidth || targetY < 0 || targetY >= worldHeight) {
          continue; // Skip out-of-bounds cells
        }

        let distanceSquared = dx * dx + dy * dy;
        if (distanceSquared > this.viewRadius * this.viewRadius) {
          continue; // Skip cells outside the circular view radius
        }

        let linePoints = computeBresenhamLine(this.location.x, this.location.y, targetX, targetY);
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

export { EntityVision, DEFAULT_VIEW_RADIUS };