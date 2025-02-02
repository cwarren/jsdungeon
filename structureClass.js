// import { gameState } from "./gameStateClass.js";

class Structure {
    constructor(worldLevel, x, y, z, type, displaySymbol = '?', displayColor = '#fff') {
      this.worldLevel = worldLevel;
      this.x = x;
      this.y = y;
      this.z = z;
      this.type = type;
      this.displaySymbol = displaySymbol;
      this.displayColor = displayColor;
    }

    getCell() {
      return this.worldLevel.grid[this.x][this.y];
    }
  }
  
  export { Structure };