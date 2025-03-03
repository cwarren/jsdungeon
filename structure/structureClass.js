import { generateId } from "../util.js";

class Structure {
    constructor(worldLevel, x, y, z, type, displaySymbol = '?', displayColor = '#fff', id = null) {
      this.id = id ? id : generateId();
      this.worldLevel = worldLevel;
      this.x = x;
      this.y = y;
      this.z = z;
      this.type = type;
      this.displaySymbol = displaySymbol;
      this.displayColor = displayColor;

      this.worldLevel.gameState.structureRepo.add(this);
    }

    getCell() {
      return this.worldLevel.grid[this.x][this.y];
    }
  }
  
  export { Structure };