import { ItemIdContainer } from "../item/itemIdContainerClass.js";
import { idOf } from "../util.js";

class GridCell {
    static TYPES = {
        FLOOR: { terrain: "FLOOR", isTraversible: true, entryMovementCost: 10, isOpaque: false, color: "#888" },
        WALL: { terrain: "WALL", isTraversible: false, entryMovementCost: Infinity, isOpaque: true, color: "#222" },
        WATER_SHALLOW: { terrain: "WATER_SHALLOW", isTraversible: true, entryMovementCost: 30, isOpaque: false, color: "#00BFFF" },
        WATER_DEEP: { terrain: "WATER_DEEP", isTraversible: true, entryMovementCost: 120, isOpaque: false, color: "#00008B" }
    };

    static ADJACENCY_DIRECTIONS = [
        { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 }, // Upper row
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 },  // Sides
        { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }  // Lower row
    ];
    static ADJACENCY_DIRECTIONS_ORTHOGONAL = [{ dx: 0, dy: -1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }];
    static ADJACENCY_DIRECTIONS_DIAGONAL = [{ dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }];

    static createDetached(terrain = "FLOOR") {
        return new GridCell(terrain);
    }
    static createDetachedAt(x, y, terrain = "FLOOR") {
        const newCell = new GridCell(terrain);
        newCell.x = x;
        newCell.y = y;
        return newCell;
    }

    static createAttached(x, y, worldLevel, terrain = "FLOOR") {
        const cell = GridCell.createDetached(terrain);
        cell.attatchToWorldLevel(x, y, worldLevel);
        return cell;
    }

    constructor(terrain = "FLOOR") {
        const type = GridCell.TYPES[terrain] || GridCell.TYPES.FLOOR;
        this.x = -1;
        this.y = -1;
        this.z = -1;
        this.terrain = type.terrain;
        this.isTraversible = type.isTraversible;
        this.entryMovementCost = type.entryMovementCost;
        this.isOpaque = type.isOpaque;
        this.isViewable = !this.isOpaque; // cells are viewable if they are not opaque or are next to a non-opaque cell - the latter has to be calculated in a pass through during level generation
        this.isVisible = false;
        this.color = type.color;
        this.structure = null;
        this.entity = null;
        this.worldLevel = null;
        this.inventory = null;
    }

    //======================================================================
    // SERIALIZATION

    forSerializing() {
        const plainObject = {
            terrain: this.terrain,
            x: this.x,
            y: this.y,
            z: this.z,
        };
        if (this.structure) {
            plainObject['structure'] = this.structure.id;
        }
        if (this.entity) {
            plainObject['entity'] = this.entity.id;
        }
        if (this.inventory) {
            plainObject['inventory'] = this.inventory.forSerializing();
        }
        return plainObject;
    }

    serialize() {
        return JSON.stringify(this.forSerializing());
    }

    static deserialize(data, worldLevel) {
        const gridCell = GridCell.createAttached(data.x, data.y, worldLevel, data.terrain);
        if (data.structure) { gridCell.structure = worldLevel.gameState.structureRepo.get(data.structure); }
        if (data.entity) { gridCell.entity = worldLevel.gameState.entityRepo.get(data.entity); }
        if (data.inventory) { gridCell.inventory = ItemIdContainer.deserialize(data.inventory); }
        return gridCell;
    }

    //======================================================================
    // GENERAL

    setPosition(x, y, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    attatchToWorldLevel(x, y, worldLevel) {
        this.x = x;
        this.y = y;
        this.setWorldLevel(worldLevel);
    }

    setWorldLevel(worldLevel) {
        this.worldLevel = worldLevel;
        this.z = worldLevel.levelNumber;
    }

    getAdjacentCells() {
        const adjacentCells = [];

        for (const { dx, dy } of GridCell.ADJACENCY_DIRECTIONS) {
            const newX = this.x + dx;
            const newY = this.y + dy;

            if (newX >= 0 && newX < this.worldLevel.levelWidth && newY >= 0 && newY < this.worldLevel.levelHeight) {
                adjacentCells.push(this.worldLevel.grid[newX][newY]);
            }
        }

        return adjacentCells;
    }

    getDeltaToOtherCell(otherCell) {
        return { dx: otherCell.x - this.x, dy: otherCell.y - this.y };
    }

    //======================================================================
    // INVENTORY

    giveItem(itemObjectOrId) {
        if (!this.inventory) {
            this.inventory = new ItemIdContainer();
        }
        this.inventory.add(itemObjectOrId);
    }

    takeItem(itemObjectOrId) {
        if (!this.inventory) {
            console.log(`Cannot remove item ${idOf(itemObjectOrId)} from empty or non-existent inventory of grid cell ${this.x} ${this.y} ${this.z}`);
            return;
        }
        this.inventory.remove(itemObjectOrId);
        if (this.inventory.isEmpty()) {
            this.inventory = null;
        }
    }

    extractFirstItem() {
        if (!this.inventory) {
            console.log(`Cannot extract first item from empty or non-existent inventory of grid cell ${this.x} ${this.y} ${this.z}`);
            return null;
        }
        const extractedItemId = this.inventory.extractFirst();
        const extractedItem = this.worldLevel.gameState.itemRepo.get(extractedItemId);
        return extractedItem;
    }

    hasItem(itemObjectOrId) {
        if (!this.inventory) {
            return false;
        }
        return this.inventory.has(itemObjectOrId);
    }

    takeItemFrom(itemObjectOrId, itemIdContainer) {
        if (!itemIdContainer || itemIdContainer.isEmpty()) {
            console.log(`Cannot take item ${idOf(itemObjectOrId)} from empty or non-existent container`);
            return;
        }
        if (!this.inventory) {
            this.inventory = new ItemIdContainer();
        }

        this.inventory.takeItemFrom(itemObjectOrId, itemIdContainer);
    }

    giveItemTo(itemObjectOrId, itemIdContainer) {
        if (!itemIdContainer) {
            console.log(`Cannot put item ${idOf(itemObjectOrId)} into non-existent container`);
            return;
        }
        if (!this.inventory || this.inventory.isEmpty()) {
            console.log(`Cannot give item ${idOf(itemObjectOrId)} from empty or non-existent inventory of grid cell ${this.x} ${this.y} ${this.z}`);
            return;
        }

        this.inventory.giveItemTo(itemObjectOrId, itemIdContainer);
        if (this.inventory.isEmpty()) {
            this.inventory = null;
        }
    }

    // UTILITY

    /**
     * Checks if any cell in the list has the specified property with the given value.
     * @param {GridCell[]} cellList - List of cells to check.
     * @param {string} propertyName - The property name to check.
     * @param {*} targetValue - The target value to match.
     * @returns {boolean} - True if any cell has the property equal to the target value, otherwise false.
     */
    static anyCellHasPropertyOfValue(cellList, propertyName, targetValue) {
        return cellList.some(cell => cell[propertyName] === targetValue);
    }
}

export { GridCell };