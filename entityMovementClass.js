import { devTrace } from "./util.js";
import { gameState } from "./gameStateClass.js";
import { determineCheapestMovementPath } from "./gridUtils.js";

const DEFAULT_MOVEMENT_SPEC = { movementType: "STATIONARY", actionCost: DEFAULT_ACTION_COST };

class EntityMovement {
  constructor(ofEntity, movementSpec = DEFAULT_MOVEMENT_SPEC) {
    this.ofEntity = ofEntity;
    this.location = ofEntity.location;
    this.isRunning = false;
    this.runDelta = null;
    this.movementSpec = movementSpec;
    this.destinationCell = null;
    this.movementPath = [];
  }

  startRunning(deltas) {
    devTrace(8, "starting running", this);
    this.isRunning = true;
    this.runDelta = deltas;
  }
  stopRunning() {
    devTrace(8, "stopping running", this);
    this.isRunning = false;
    this.runDelta = null;
  }
  continueRunning() {
    devTrace(7, 'continue running entity', this);
    if (!this.isRunning) return 0;
    if (!this.ofEntity.canRunToDeltas(this.runDelta.dx, this.runDelta.dy)) {
      this.stopRunning();
      return 0;
    }
    return this.ofEntity.confirmMoveDeltas(this.runDelta.dx, this.runDelta.dy); // confirmMoveDeltas actually does the move and returns the action cost
  }

  setDestinationCell(cell) {
    this.destinationCell = cell;
    this.movementPath = determineCheapestMovementPath(this.entity.getCell(), cell, gameState.world[this.entity.z]);
  }

  clearDestination() {
    this.destinationCell = null;
    this.movementPath = [];
  }

  moveToNextCell() {
    if (this.movementPath.length > 0) {
      const nextCell = this.movementPath.shift();
      this.ofEntity.location.x = nextCell.x;
      this.ofEntity.location.y = nextCell.y;
    }
  }

  getMovementStatus() {
    return {
      isRunning: this.isRunning,
      runDelta: this.runDelta,
      movement: this.movement,
      destinationCell: this.destinationCell,
      movementPath: this.movementPath,
    };
  }
}

export { EntityMovement };