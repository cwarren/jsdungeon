class GridCell {
    static TYPES = {
        FLOOR: { terrain: "FLOOR", isTraversible: true, entryMovementCost: 10, isOpaque: false, color: "#888" },
        WALL: { terrain: "WALL", isTraversible: false, entryMovementCost: Infinity, isOpaque: true, color: "#222" },
        WATER_SHALLOW: { terrain: "WATER_SHALLOW", isTraversible: true, entryMovementCost: 30, isOpaque: false, color: "#00BFFF" },
        WATER_DEEP: { terrain: "WATER_DEEP", isTraversible: true, entryMovementCost: 120, isOpaque: false, color: "#00008B" }
    };

    constructor(x, y, worldLevel, terrain = "FLOOR") {
        const type = GridCell.TYPES[terrain] || GridCell.TYPES.FLOOR;
        this.x = x;
        this.y = y;
        this.worldLevel = worldLevel;
        this.terrain = type.terrain;
        this.isTraversible = type.isTraversible;
        this.entryMovementCost = type.entryMovementCost;
        this.isOpaque = type.isOpaque;
        this.color = type.color;
        // console.log("created cell", this);
    }
}

export { GridCell };