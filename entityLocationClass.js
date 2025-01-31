import { devTrace } from "./util.js";
import { gameState } from "./gameStateClass.js";


class EntityLocation {
  constructor(ofEntity, x, y, z = 0) {
    this.ofEntity = ofEntity;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  getCell() {
    devTrace(6, "getting cell for entity", this.ofEntity);
    return gameState.world[this.z].grid[this.x][this.y];
  }
  getCellAtDelta(dx, dy) {
    devTrace(6, `getting cell at delta ${dx},${dy} for entity`, this.ofEntity);
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
    devTrace(8, "getting cells adjacent to entity", this.ofEntity);
    return this.getCell().getAdjacentCells();
  }

  placeAt(x, y, z) {
    devTrace(5, `placing at location ${x} ${y} ${z}`, this.ofEntity);
    return this.placeAtCell(gameState.world[z ? z : 0].grid[x][y]);
  }

  placeAtCell(targetCell) {
    devTrace(5, `placing at cell ${targetCell.x} ${targetCell.y} ${targetCell.z}`, this.ofEntity, targetCell);
    if (targetCell.entity) {
      console.log("cannot place entity in occupied cell", this.ofEntity, targetCell);
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
    const currentLevel = gameState.world[this.z];
    if (!currentLevel) {
      throw new Error(`Entity ${this.ofEntity.type} is not on a valid level`);
    };
    return currentLevel;
  }
}

export { EntityLocation };