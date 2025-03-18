import { devTrace } from "../util.js";

class EntityLocation {
  constructor(ofEntity, x, y, z = 0) {
    this.ofEntity = ofEntity;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  getCell() {
    devTrace(6, "getting cell for entity", this.ofEntity);
    return this.ofEntity.gameState.world[this.z].grid[this.x][this.y];
  }
  getCellAtDelta(dx, dy) {
    devTrace(6, `getting cell at delta ${dx},${dy} for entity`, this.ofEntity);
    const currentLevel = this.ofEntity.gameState.world[this.z];
    if (!currentLevel) { return null };
    const newX = this.x + dx;
    const newY = this.y + dy;
    if (newX >= 0 && newX < currentLevel.levelWidth && newY >= 0 && newY < currentLevel.levelHeight) {
      return currentLevel.grid[newX][newY];
    }
    return null;
  }

  getAdjacentCells() {
    devTrace(8, "getting cells adjacent to entity", this.ofEntity);
    return this.getCell().getAdjacentCells();
  }

  placeAt(x, y, z) {
    devTrace(5, `placing at location ${x} ${y} ${z}`, this.ofEntity);
    return this.placeAtCell(this.ofEntity.gameState.world[z ? z : 0].grid[x][y]);
  }

  placeAtCell(targetCell) {
    devTrace(5, `placing at cell ${targetCell.x} ${targetCell.y} ${targetCell.z}`, this.ofEntity, targetCell);
    if (targetCell.entity) {
      console.log(`cannot place entity ${this.ofEntity.name} in occupied cell ${targetCell.x} ${targetCell.y} ${targetCell.z}`);
      return false;
    }
    this.x = targetCell.x;
    this.y = targetCell.y;
    this.z = targetCell.z;
    targetCell.entity = this.ofEntity;
    this.ofEntity.determineVisibleCells();
    return true;
  }

  getWorldLevel() {
    const currentLevel = this.ofEntity.gameState.world[this.z];
    if (!currentLevel) {
      throw new Error(`Entity ${this.ofEntity.type} is not on a valid level`);
    };
    return currentLevel;
  }

  getManhattenDistanceToEntity(otherEntity) {
    return Math.abs(this.x - otherEntity.location.x) + Math.abs(this.y - otherEntity.location.y);
  }

  /**
   * Prepares the location attributes for serialization.
   * @returns {Object} A simple object representing the location attributes.
   */
  forSerializing() {
    return {
      x: this.x,
      y: this.y,
      z: this.z
    };
  }

  /**
   * Serializes the location attributes into a JSON string.
   * @returns {string} The serialized JSON representation.
   */
  serialize() {
    return JSON.stringify(this.forSerializing());
  }

  /**
   * Deserializes a given data object into a new EntityLocation instance.
   * @param {Object} data - The serialized data object.
   * @param {Object} ofEntity - The entity this location belongs to.
   * @returns {EntityLocation} A new instance with restored values.
   */
  static deserialize(data, ofEntity) {
    return new EntityLocation(ofEntity, data.x, data.y, data.z);
  }
}

export { EntityLocation };