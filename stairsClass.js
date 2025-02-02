import { Structure } from './structureClass.js';

class Stairs extends Structure {
  constructor(x, y, z, type, displaySymbol = '?', displayColor = '#fff', connectsTo = null) {
    super(x, y, z, type, displaySymbol, displayColor);
    this.connectsTo = connectsTo;
  }
}

export { Stairs };