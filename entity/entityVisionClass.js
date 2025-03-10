import { devTrace, constrainValue } from "../util.js";
import { computeBresenhamLine } from '../world/gridUtils.js';

const DEFAULT_VIEW_RADIUS = 1;

class EntityVision {
  constructor(ofEntity, viewRadius = DEFAULT_VIEW_RADIUS) {
    this.ofEntity = ofEntity;
    this.location = ofEntity.location;
    this.viewRadius = viewRadius;
    this.visibleCells = new Set(); // a set of references to cells that are visible to the entity
    this.seenCells = new Set(); // a set of string-based 3-tuples of the x,y,z coordinates of cells that have been seen
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

  getVisibleEntityInfo() {
    const visibleEntities = Array.from(this.visibleCells)
      .map((cell) => cell.entity)
      .filter((entity) => entity !== null && entity !== undefined && entity !== this.ofEntity);

    return visibleEntities.map((entity) => {
      return {
        entity,
        relation: this.ofEntity.getRelationshipTo(entity),
        manhattenDistance: this.location.getManhattenDistanceToEntity(entity)
      };
    });
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

    for (let dx = Math.floor(-this.viewRadius); dx <= Math.ceil(this.viewRadius); dx++) {
      for (let dy = Math.floor(-this.viewRadius); dy <= Math.ceil(this.viewRadius); dy++) {
        let targetX = this.location.x + dx;
        let targetY = this.location.y + dy;

        if (targetX < 0 || targetX >= worldWidth || targetY < 0 || targetY >= worldHeight) {
          continue; // Skip out-of-bounds cells
        }

        let distanceSquared = dx * dx + dy * dy;
        if (distanceSquared > this.viewRadius * this.viewRadius) {
          continue; // Skip cells outside the circular view radius
        }

        let linePoints = computeBresenhamLine(Math.floor(this.location.x), Math.floor(this.location.y), Math.floor(targetX), Math.floor(targetY));
        let obstructed = false;

        for (let [lx, ly] of linePoints) {
          if (lx < 0 || lx >= grid.length || ly < 0 || ly >= grid[0].length) { continue; } // Skip out-of-bounds cells
          let cell = grid[lx][ly];
          this.visibleCells.add(cell);
          this.seenCells.add(`${cell.x},${cell.y},${cell.z}`);
          if (cell.isOpaque) {
            obstructed = true;
            break; // Stop tracing further along this line
          }
        }
      }
    }
  }

  forSerializing() {
    return {
      viewRadius: this.viewRadius,
      seenCells: Array.from(this.seenCells), // Convert Set to array for serialization
    };
  }

  serialize() {
    return JSON.stringify(this.forSerializing());
  }

  static deserialize(data, ofEntity) {
    const entityVision = new EntityVision(ofEntity, data.viewRadius);
    entityVision.seenCells = new Set(data.seenCells); // Convert array back to Set
    return entityVision;
  }

}

export { EntityVision, DEFAULT_VIEW_RADIUS };