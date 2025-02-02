import { devTrace, getRandomListItem } from "./util.js";
import { GridCell } from "./gridCellClass.js";
import { getRandomCellOfTerrainInGrid, determineCheapestMovementPath, computeBresenhamLine } from "./gridUtils.js";

const DEFAULT_MOVEMENT_ACTION_COST = 100;
const DEFAULT_MOVEMENT_SPEC = { movementType: "STATIONARY", actionCost: DEFAULT_MOVEMENT_ACTION_COST };

class EntityMovement {
    constructor(ofEntity, movementSpec = DEFAULT_MOVEMENT_SPEC) {
        this.ofEntity = ofEntity;
        this.location = ofEntity.location;
        this.isRunning = false;
        this.runDelta = null;
        this.type = movementSpec.movementType;
        this.actionCost = movementSpec.actionCost;
        this.destinationCell = null;
        this.movementPath = [];
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
        // console.log("confirmMove", targetCell);
        devTrace(6, "confirming move to cell", this.ofEntity, targetCell);
        const oldCell = this.location.getCell();
        oldCell.entity = undefined;
        this.location.placeAtCell(targetCell);
        return this.actionCost;
    }
    confirmMoveDeltas(dx, dy) {
        devTrace(6, `confirming move to deltas ${dx},${dy}`, this.ofEntity);
        const oldCell = this.location.getCell();
        oldCell.entity = undefined;
        this.location.placeAtCell(this.location.getCellAtDelta(dx, dy));
        return this.actionCost;
    }

    // RUNNING METHODS

    canRunToDeltas(dx, dy) { // similar to canMoveTo, but more things will stop running
        devTrace(8, `checking run to deltas ${dx},${dy}`, this.ofEntity);
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
        devTrace(7, 'continue running entity', this.ofEntity);
        if (!this.isRunning) return 0;
        if (!this.canRunToDeltas(this.runDelta.dx, this.runDelta.dy)) {
            this.stopRunning();
            return 0;
        }
        return this.confirmMoveDeltas(this.runDelta.dx, this.runDelta.dy); // confirmMoveDeltas actually does the move and returns the action cost
    }
    startRunning(deltas) {
        devTrace(5, "starting running", this);
        this.isRunning = true;
        this.runDelta = deltas;
    }
    stopRunning() {
        devTrace(5, "stopping running", this);
        this.isRunning = false;
        this.runDelta = null;
    }

    interruptOngoingMovement() {
        this.destinationCell = null;
        this.movementPath = [];
        this.stopRunning();
    }

    // INSPECTION

    getMovementStatus() {
        return {
            isRunning: this.isRunning,
            runDelta: this.runDelta,
            movementSpec: this.movementSpec,
        };
    }

    // MOVEMENT AI SUPPORT

    setPathToDestination() {
        if (!this.destinationCell) {
            this.movementPath = [];
            return;
        }
        this.movementPath = determineCheapestMovementPath(
            this.location.getCell(),
            this.destinationCell,
            this.location.getWorldLevel());
        if (this.movementPath.length > 0) {
            this.movementPath.shift(); // Remove starting cell to avoid stepping on self
        }
    }

    setRandomDestination() {
        this.destinationCell = getRandomCellOfTerrainInGrid("FLOOR", this.location.getWorldLevel().grid);
        devTrace(4, `setting random destination for ${this.ofEntity.type}`, this.destinationCell);
    }

    moveAlongPath() {
        if (this.movementPath.length > 0) {
            devTrace(5, `moving along movement path`, this.movementPath);
            const nextCell = this.movementPath.shift();
            return this.tryMoveToCell(nextCell);
        }
        return this.actionCost;
    }

    // MOVEMENT AI / TYPE IMPLEMENTATIONS
    // IMPORTANT!!!!
    // action functions should return the time cost of the action!

    moveStepAimless() { // random dir, may bump into walls and such... though a bump results in a 0 action cost, so will try again
        devTrace(5, `move aimless for ${this.type}`);
        const randomDir = getRandomListItem(GridCell.ADJACENCY_DIRECTIONS);
        return this.tryMove(randomDir.dx, randomDir.dy);
    }


    moveWanderAimless() {
        devTrace(5, `moveWanderAimless for ${this.ofEntity.type}`, this.ofEntity);
        if (!this.destinationCell || this.movementPath.length === 0) {
            this.setRandomDestination();
            this.setPathToDestination();
        }
        return this.moveAlongPath();
    }

    moveWanderAggressive() { // if any hostiles are view and reachable, head towards the closest, otherwise wanderAimless
        devTrace(5, `wander aggressive for ${this.type}`);

        const origDestination = this.destinationCell;

        const visibleHostilesInfo = this.ofEntity.vision.getVisibleEntityInfo().filter(
            entInfo => ["HOSTILE_TO", "VIOLENT_TO"].includes(entInfo.relation)
        ).sort((a, b) => a.manhattenDistance - b.manhattenDistance);

        for (const entInfo of visibleHostilesInfo) {
            this.destinationCell = entInfo.entity.getCell();
            this.setPathToDestination();
            if (this.movementPath.length > 0) {
                devTrace(4, `wander aggressive - targeting ${entInfo.entity.type}`, this.ofEntity, entInfo.entity);
                return this.moveAlongPath();
            }
        }

        this.destinationCell = origDestination;
        this.setPathToDestination();
        return this.moveWanderAimless();
    }
}

export { EntityMovement, DEFAULT_MOVEMENT_ACTION_COST, DEFAULT_MOVEMENT_SPEC };