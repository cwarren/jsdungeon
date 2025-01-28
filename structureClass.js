import { gameState } from "./gameStateClass.js";

class Structure {
    constructor(x, y, z, type, displaySymbol = '?', displayColor = '#fff') {
      this.x = x;
      this.y = y;
      this.z = z;
      this.type = type;
      this.displaySymbol = displaySymbol;
      this.displayColor = displayColor;
    }

    getCell() {
      return gameState.world[this.z].grid[this.x][this.y];
    }
  }
  
  export { Structure };