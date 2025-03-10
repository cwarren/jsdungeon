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
    stairs.connectsTo = data.connectsTo;
    if (data.connectsTo && worldLevel) {
      stairs.reconnect(worldLevel.gameState.structureRepo);
    }

    return stairs;
  }

  reconnect(structureRepo) {
    if (this.connectsTo && typeof this.connectsTo === 'string') {
      const connectionTarget = structureRepo.get(this.connectsTo);
      if (connectionTarget) {
        this.connectsTo = connectionTarget;
        connectionTarget.connectsTo = this;
      }
    }
  }
}

export { Stairs };