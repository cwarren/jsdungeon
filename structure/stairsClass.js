import { Structure } from './structureClass.js';

class Stairs extends Structure {
  constructor(worldLevel, x, y, z, type, displaySymbol = '?', displayColor = '#fff', connectsTo = null, id = null) {
    super(worldLevel, x, y, z, type, displaySymbol, displayColor, id);
    this.connectsTo = connectsTo;
  }

  forSerializing() {
    let base = super.forSerializing();
    base['connectsTo'] = this.connectsTo ? this.connectsTo.id : null;
    return base;
  }

  static deserialize(data, worldLevel) {
    const stairs = new Stairs(
      worldLevel,
      data.x,
      data.y,
      data.z,
      data.type,
      data.displaySymbol,
      data.displayColor,
      null,  // connectsTo will be resolved later
      data.id
    );

    // If connectsTo is defined, resolve it using structureRepo
    if (data.connectsTo && worldLevel) {
      stairs.connectsTo = worldLevel.gameState.structureRepo.get(data.connectsTo);
      
      // if the other half hasn't been connected back yet, do so (for a pair of stairs, the first one will be left unconnected, and then when the second is deserialized it will hook the first up to it)
      if (stairs.connectsTo && ! stairs.connectsTo.connectsTo) {
        stairs.connectsTo.connectsTo = stairs;
      }
    }

    return stairs;
  }
}

export { Stairs };