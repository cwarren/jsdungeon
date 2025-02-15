import { Structure } from './structureClass.js';

class Stairs extends Structure {
  constructor(worldLevel, x, y, z, type, displaySymbol = '?', displayColor = '#fff', connectsTo = null) {
    super(worldLevel, x, y, z, type, displaySymbol, displayColor);
    this.connectsTo = connectsTo;
  }
}

export { Stairs };