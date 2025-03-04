import { Structure } from './structureClass.js';

class Stairs extends Structure {
  constructor(worldLevel, x, y, z, type, displaySymbol = '?', displayColor = '#fff', connectsTo = null, id = null) {
    super(worldLevel, x, y, z, type, displaySymbol, displayColor, id);
    this.connectsTo = connectsTo;
  }

  forSerializing() {
    let base = super.forSerializing();
    base['connectsTo'] = this.connectsTo.id;
    return base;
  }
}

export { Stairs };