import { devTrace, getRandomListItem, prefixArticleTo } from "../util.js";
import { GridCell } from "../world/gridCellClass.js";
import { getRandomCellOfTerrainInGrid, determineCheapestMovementPathForEntity, computeBresenhamLine } from "../world/gridUtils.js";
import { uiPaneMessages } from "../ui/ui.js";

const DEFAULT_MOVEMENT_ACTION_COST = 100;
const DEFAULT_MOVEMENT_SPEC = { movementType: "STATIONARY", baseMovementTime: DEFAULT_MOVEMENT_ACTION_COST };

class EntityMovement {
    constructor(ofEntity, movementSpec = DEFAULT_MOVEMENT_SPEC) {
        this.ofEntity = ofEntity;
        this.location = ofEntity.location;
        this.isRunning = false;
        this.runDelta = null;
        this.type = movementSpec.movementType;
        this.actionTime = movementSpec.baseMovementTime;
        this.destinationCell = null;
        this.movementPath = [];
        this.isSleeping = false;
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
            this.ofEntity.showMessage(`You cannot move there because it's not traversible`);
            console.log(`move prevented because target cell is not traversable: ${targetCell.terrain} at ${targetCell.x} ${targetCell.y} ${targetCell.z}`);
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
        this.messageAboutCellContents(targetCell);
        return this.actionTime;
    }
    confirmMoveDeltas(dx, dy) {
        devTrace(6, `confirming move to deltas ${dx},${dy}`, this.ofEntity);
        const oldCell = this.location.getCell();
        oldCell.entity = undefined;
        const newCell = this.location.getCellAtDelta(dx, dy);
        this.location.placeAtCell(newCell);
        this.messageAboutCellContents(newCell);
        return this.actionTime;
    }

    // TODO: this function needs a better home....
    messageAboutCellContents(targetCell) {
        if (! targetCell.inventory) {
            return;
        }
        if (targetCell.inventory.count() == 1) {
            const item = targetCell.inventory.getFirstItem(this.ofEntity.gameState.itemRepo);
            const stackSuffix = item.stackCount > 1 ? " pile" : "";
            this.ofEntity.showMessage(`There's ${prefixArticleTo(item.name)}${stackSuffix} here.`);
            return;
        }
        this.ofEntity.showMessage("There are some items here.");
    }

    // SLEEPING METHODS

    canSleep() {
        devTrace(5, `checking if ${this.ofEntity.type} can sleep`, this.ofEntity);

        // cannot sleep if already at max health
        if (this.ofEntity.health.curHealth >= this.ofEntity.health.maxHealth) {
            devTrace(6, `${this.ofEntity.type} is already at max health and does not need to sleep`, this.ofEntity);
            this.ofEntity.showMessage(`You cannot sleep because you're already at full health`);
            return false;
        }

        // cannot sleep if there's a hostile or violent entity adjacent
        const adjacentCells = this.location.getCell().getAdjacentCells();
        for (const cell of adjacentCells) {
            if (cell.entity) {
                const relation = this.ofEntity.getRelationshipTo(cell.entity);
                if (relation === "HOSTILE_TO" || relation === "VIOLENT_TO") {
                    devTrace(6, `${this.ofEntity.type} cannot sleep due to ${cell.entity.type} ${relation} it`, this.ofEntity, cell.entity);
                    this.ofEntity.showMessage(`You cannot sleep because there's danger nearby`);
                    return false;
                }
            }
        }

        return true;
    }

    continueSleeping() {
        devTrace(5, `continuing sleep for ${this.ofEntity.type}`, this.ofEntity);

        if (!this.isSleeping) {
            devTrace(5, `${this.ofEntity.type} is not sleeping, returning 0`, this.ofEntity);
            return 0;
        }

        if (!this.canSleep()) {
            devTrace(5, `${this.ofEntity.type} was interrupted and stopped sleeping`, this.ofEntity);
            this.stopSleeping();
            return 0;
        }

        devTrace(4, `${this.ofEntity.type} continues sleeping and heals naturally`, this.ofEntity);
        this.ofEntity.healNaturally();
        if (this.ofEntity.addTimeOnLevel) { this.ofEntity.addTimeOnLevel(DEFAULT_MOVEMENT_ACTION_COST); }
        return DEFAULT_MOVEMENT_ACTION_COST;
    }

    startSleeping() {
        devTrace(5, `${this.ofEntity.type} is starting to sleep`, this.ofEntity);
        this.ofEntity.showMessage('You fall asleep.')
        this.isSleeping = true;
    }

    stopSleeping() {
        devTrace(5, `${this.ofEntity.type} stopped sleeping`, this.ofEntity);
        this.isSleeping = false;
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
        const hasAdjacentStructure = adjacentCells.some(cell =>
            !(cell.structure === undefined || cell.structure == null)  // stop if adjacent to a structure
        );
        if (hasAdjacentStructure) { 
            this.ofEntity.showMessage("You stop running because you're next to a structure of some sort.")
            return false;
        }
        const hasAdjacentEntity = adjacentCells.some(cell =>
            !(cell.entity === undefined || cell.entity == null) // stop if adjacent to a mob
        );
        if (hasAdjacentEntity) { 
            this.ofEntity.showMessage("You stop running because you're next to a creature of some sort.")
            return false;
        }
        if (this.location.getCell().inventory) { 
            this.ofEntity.showMessage("You stop running because there's something here.")
            return false;
        }

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
        this.ofEntity.healNaturally(); // don't forget to check for healing while running! Normally this is called in takeTurn, but when a character is running this method is called in place of takeTurn
        const runActionCost = this.confirmMoveDeltas(this.runDelta.dx, this.runDelta.dy); // confirmMoveDeltas actually does the move and returns the action cost
        if (this.ofEntity.addTimeOnLevel) { this.ofEntity.addTimeOnLevel(runActionCost); }
        return runActionCost;
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
        this.stopSleeping();
    }

    // INSPECTION

    getMovementStatus() {
        return {
            isRunning: this.isRunning,
            isSleeping: this.isSleeping,
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
        this.movementPath = determineCheapestMovementPathForEntity(
            this.ofEntity,
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
        return this.actionTime;
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

    // SERIALIZATION

    /**
     * Prepares the movement attributes for serialization.
     * @returns {Object} A simple object representing the movement attributes.
     */
    forSerializing() {
        return {
            isRunning: this.isRunning,
            runDelta: this.runDelta,
            type: this.type,
            actionTime: this.actionTime,
            destinationCell: this.destinationCell ? { x: this.destinationCell.x, y: this.destinationCell.y, z: this.destinationCell.z } : null,
            movementPath: this.movementPath.map(cell => ({ x: cell.x, y: cell.y, z: cell.z })),
            isSleeping: this.isSleeping
        };
    }

    /**
     * Serializes the movement attributes into a JSON string.
     * @returns {string} The serialized JSON representation.
     */
    serialize() {
        return JSON.stringify(this.forSerializing());
    }

    /**
     * Deserializes a given data object into a new EntityMovement instance.
     * @param {Object} data - The serialized data object.
     * @param {Object} ofEntity - The entity this movement belongs to.
     * @returns {EntityMovement} A new instance with restored values.
     */
    static deserialize(data, ofEntity) {
        const movement = new EntityMovement(ofEntity, { movementType: data.type, baseMovementTime: data.actionTime });
        movement.isRunning = data.isRunning;
        movement.runDelta = data.runDelta;
        movement.destinationCell = data.destinationCell ? { x: data.destinationCell.x, y: data.destinationCell.y, z: data.destinationCell.z } : null;
        movement.movementPath = data.movementPath.map(cell => ({ x: cell.x, y: cell.y, z: cell.z }));
        movement.isSleeping = data.isSleeping;
        return movement;
    }
}

export { EntityMovement, DEFAULT_MOVEMENT_ACTION_COST, DEFAULT_MOVEMENT_SPEC };