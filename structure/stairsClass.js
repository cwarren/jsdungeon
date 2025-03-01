import { Structure } from './structureClass.js';

class Stairs extends Structure {
  constructor(worldLevel, x, y, z, type, displaySymbol = '?', displayColor = '#fff', connectsTo = null, id = null) {
    super(worldLevel, x, y, z, type, displaySymbol, displayColor, id);
    this.connectsTo = connectsTo;
  }
}

export { Stairs };