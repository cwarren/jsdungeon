import { gameState } from "./gameplay.js";

class Structure {
    constructor(x, y, z, type, displaySymbol = '?') {
      this.x = x;
      this.y = y;
      this.z = z;
      this.type = type;
      this.displaySymbol = displaySymbol;
    }

    getCell() {
      return gameState.world[this.z].grid[this.x][this.y];
    }
  }
  
  export { Structure };