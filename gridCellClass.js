class GridCell {
    static TYPES = {
        FLOOR: { terrain: "FLOOR", isTraversible: true, entryMovementCost: 10, isOpaque: false, color: "#888" },
        WALL: { terrain: "WALL", isTraversible: false, entryMovementCost: Infinity, isOpaque: true, color: "#222" },
        WATER_SHALLOW: { terrain: "WATER_SHALLOW", isTraversible: true, entryMovementCost: 30, isOpaque: false, color: "#00BFFF" },
        WATER_DEEP: { terrain: "WATER_DEEP", isTraversible: true, entryMovementCost: 120, isOpaque: false, color: "#00008B" }
    };

    static ADJACENCY_DIRECTIONS = [
        { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 }, // Upper row
        { dx: -1, dy: 0 },                  { dx: 1, dy: 0 },  // Sides
        { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }  // Lower row
    ];
    static ADJACENCY_DIRECTIONS_ORTHOGONAL = [{ dx: 0, dy: -1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }];
    static ADJACENCY_DIRECTIONS_DIAGONAL = [{ dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }];

    static createDetached(terrain = "FLOOR") {
        return new GridCell(terrain);
    }
    static createDetachedAt(x,y,terrain = "FLOOR") {
        const newCell = new GridCell(terrain);
        newCell.x = x;
        newCell.y = y;
        return newCell;
    }

    static createAttached(x, y, worldLevel, terrain = "FLOOR") {
        const cell = GridCell.createDetached(terrain);
        cell.attatchToWorldLevel(x,y,worldLevel);
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
        this.isViewable = ! this.isOpaque; // cells are viewable if they are not opaque or are next to a non-opaque cell - the latter has to be calculated in a pass through during level generation
        this.isVisible = false;
        this.color = type.color;
        this.structure = undefined;
        this.entity = undefined;
        // console.log("created cell", this);
    }

    setPosition(x,y,z=0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    attatchToWorldLevel(x,y,worldLevel) {
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

        // console.log('getAdjacentCells, this', this);
        // console.log('getAdjacentCells, this.worldLevel', this.worldLevel);
        // console.log('getAdjacentCells, this.worldLevel.grid', this.worldLevel.grid);
        for (const { dx, dy } of GridCell.ADJACENCY_DIRECTIONS) {
            const newX = this.x + dx;
            const newY = this.y + dy;
            // console.log(`${newX},${newY}`);

            if (newX >= 0 && newX < this.worldLevel.levelWidth && newY >= 0 && newY < this.worldLevel.levelHeight) {
                adjacentCells.push(this.worldLevel.grid[newX][newY]);
            }
        }

        return adjacentCells;
    }

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