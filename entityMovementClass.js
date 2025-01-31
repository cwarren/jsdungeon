import { devTrace } from "./util.js";
// import { gameState } from "./gameStateClass.js";
// import { determineCheapestMovementPath } from "./gridUtils.js";

const DEFAULT_MOVEMENT_ACTION_COST = 100;
const DEFAULT_MOVEMENT_SPEC = { movementType: "STATIONARY", actionCost: DEFAULT_MOVEMENT_ACTION_COST };

class EntityMovement {
    constructor(ofEntity, movementSpec = DEFAULT_MOVEMENT_SPEC) {
        this.ofEntity = ofEntity;
        this.location = ofEntity.location;
        this.isRunning = false;
        this.runDelta = null;
        this.movementSpec = movementSpec;
    }

    // MOVEMENT METHODS

    tryMove(dx, dy) {
        devTrace(6, `${this.ofEntity.type} trying to move ${dx},${dy}`, this.ofEntity);
        const targetCell = this.location.getCellAtDelta(dx, dy);
        if (!targetCell) { return 0; }
        if (this.canMoveToCell(targetCell)) {
            return this.confirmMove(targetCell);
        }
        if (targetCell.entity) {
            return this.ofEntity.handleAttemptedMoveIntoOccupiedCell(targetCell);
        } else {
            console.log("move prevented because target cell is not traversable", targetCell);
            return 0;
        }
    }

    tryMoveToCell(targetCell) {
        const targetDeltas = this.location.getCell().getDeltaToOtherCell(targetCell);
        return this.tryMove(targetDeltas.dx, targetDeltas.dy);
    }

    canMoveToCell(targetCell) {
        devTrace(7, "checking if entity can move to cell", this.ofEntity, targetCell);
        return targetCell.isTraversible && !targetCell.entity;
    }
    canMoveToDeltas(dx, dy) {
        devTrace(7, `checking if entity can move to deltas ${dx},${dy}`, this);
        const targetCell = this.location.getCellAtDelta(dx, dy);
        if (!targetCell) { return false; }
        return this.canMoveToCell(targetCell);
    }

    confirmMove(targetCell) {
        devTrace(6, "confirming move to cell", this.ofEntity, targetCell);
        const oldCell = this.location.getCell();
        oldCell.entity = undefined;
        this.location.placeAtCell(targetCell);
        return this.movementSpec.actionCost;
    }
    confirmMoveDeltas(dx, dy) {
        devTrace(6, `confirming move to deltas ${dx},${dy}`, this);
        const oldCell = this.location.getCell();
        oldCell.entity = undefined;
        this.location.placeAtCell(this.location.getCellAtDelta(dx, dy));
        return this.movementSpec.actionCost;
    }

    // RUNNING METHODS

    canRunToDeltas(dx, dy) { // similar to canMoveTo, but more things will stop running
        devTrace(7, `checking run to deltas ${dx},${dy}`, this);
        const targetCell = this.location.getCellAtDelta(dx, dy);
        if (!targetCell) { return false; }
        if (!this.canMoveToCell(targetCell)) { return false; }

        // if the destination can be moved to, there are still other conditions that may interrupt running
        // NOTE: taking damage will also stop running, though that's handled in the damage taking method
        const adjacentCells = this.location.getCell().getAdjacentCells();
        const hasAdjacentInterrupt = adjacentCells.some(cell =>
            !(cell.structure === undefined || cell.structure == null) ||  // stop if adjacent to a structure
            !(cell.entity === undefined || cell.entity == null) // stop if adjacent to a mob
        );
        if (hasAdjacentInterrupt) { return false; }

        // TODO: add check to stop running when at a corner

        // TODO: add check to stop running when a mob is newly visible

        return true;
    }
    continueRunning() {
        devTrace(7, 'continue running entity', this);
        if (!this.isRunning) return 0;
        if (!this.canRunToDeltas(this.runDelta.dx, this.runDelta.dy)) {
            this.stopRunning();
            return 0;
        }
        return this.confirmMoveDeltas(this.runDelta.dx, this.runDelta.dy); // confirmMoveDeltas actually does the move and returns the action cost
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

    // INSPECTION

    getMovementStatus() {
        return {
            isRunning: this.isRunning,
            runDelta: this.runDelta,
            movementSpec: this.movementSpec,
        };
    }
}

export { EntityMovement, DEFAULT_MOVEMENT_ACTION_COST, DEFAULT_MOVEMENT_SPEC };