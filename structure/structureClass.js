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
    if (this.worldLevel) {
      this.worldLevel.gameState.structureRepo.add(this);
    }
  }

  getCell() {
    return this.worldLevel.grid[this.x][this.y];
  }

  setWorldLevel(worldLevel) {
    this.worldLevel = worldLevel;
  }

  forSerializing() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      z: this.z,
      type: this.type,
      displaySymbol: this.displaySymbol,
      displayColor: this.displayColor,
    };
  }

  serialize() {
    return JSON.stringify(this.forSerializing());
  }

  static deserialize(data, worldLevel) {
    return new Structure(
      worldLevel,
      data.x,
      data.y,
      data.z,
      data.type,
      data.displaySymbol,
      data.displayColor,
      data.id
    );
  }
}

export { Structure };