import { GridCell } from "./gridCellClass.js";
import { Structure } from "./structureClass.js";
import { constrainValue } from "./util.js";
import {
    setWorldLevelForGridCells,
    generateGrid_empty, 
    generateGrid_random,
    generateGrid_caves,
    generateGrid_caves_shattered,
    generateGrid_caves_large,
    generateGrid_caves_huge,
    generateGrid_burrow,
    generateGrid_nest,
    generateGrid_roomsAndCorridors_random,
    generateGrid_roomsAndCorridors_subdivide,
    generateGrid_town
} from "./gridGeneration.js";

// const SUBDIVIDE_MIN_WIDTH = 6;
// const SUBDIVIDE_MIN_HEIGHT = 6;
// const SUBDIVIDE_MIN_DEPTH = 4;
// const SUBDIVIDE_MAX_DEPTH = 5;
// const MIN_ROOM_WIDTH = 3;
// const MIN_ROOM_HEIGHT = 3;

class WorldLevel {
    constructor(levelNumber, levelWidth, levelHeight, levelType = "EMPTY") {
        this.levelNumber = levelNumber;
        this.levelWidth = levelWidth;
        this.levelHeight = levelHeight;
        if (levelType == "EMPTY") {
            this.grid = generateGrid_empty(levelWidth,levelHeight);
        } else if (levelType == "TOWN") {
            this.grid = generateGrid_town(levelWidth,levelHeight);
        } else if (levelType == "BURROW") {
            this.grid = generateGrid_burrow(levelWidth,levelHeight);
        } else if (levelType == "CAVES") {
            this.grid = generateGrid_caves(levelWidth,levelHeight);
        } else if (levelType == "CAVES_HUGE") {
            this.grid = generateGrid_caves_huge(levelWidth,levelHeight);
        } else if (levelType == "CAVES_LARGE") {
            this.grid = generateGrid_caves_large(levelWidth,levelHeight);
        } else if (levelType == "CAVES_SHATTERED") {
            this.grid = generateGrid_caves_shattered(levelWidth,levelHeight);
        } else if (levelType == "NEST") {
            this.grid = generateGrid_nest(levelWidth,levelHeight);
        } else if (levelType == "PUDDLES") {
            this.grid = this.generateGrid_puddles(levelWidth,levelHeight);
        } else if (levelType == "RANDOM") {
            this.grid = generateGrid_random(levelWidth,levelHeight);
        } else if (levelType == "ROOMS_RANDOM") {
            this.grid = generateGrid_roomsAndCorridors_random(levelWidth,levelHeight);
        } else if (levelType == "ROOMS_SUBDIVIDE") {
            this.grid = generateGrid_roomsAndCorridors_subdivide(levelWidth,levelHeight);
        } else {
            this.grid = this.generateGrid_empty(levelWidth,levelHeight);
        }
        setWorldLevelForGridCells(this, this.grid);
        this.determineCellViewability();
        this.levelType = levelType;
        this.levelEntities = [];
        this.levelStructures = [];
        console.log("new world level", this);
    }

    addEntity(ent) {
        this.levelEntities.push(ent);
    }

    addStairsDown() {
        const stairsDownCell = this.getRandomEmptyCellOfTerrain("FLOOR",this.grid);
        const stairsDown = new Structure(stairsDownCell.x,stairsDownCell.y,this.levelNumber,'STAIRS_DOWN','>');
        stairsDownCell.structure = stairsDown;
        this.levelStructures.push(stairsDown);
    }

    addStairsUpTo(stairsDown) {
        const stairsUpCell = this.getRandomEmptyCellOfTerrain("FLOOR",this.grid);
        const stairsUp = new Structure(stairsUpCell.x,stairsUpCell.y,this.levelNumber,'STAIRS_UP','<');
        stairsUpCell.structure = stairsUp;
        stairsDown.connectsTo = stairsUp;
        stairsUp.connectsTo = stairsDown;
        this.levelStructures.push(stairsUp);
    }


    // generateGrid_town(numBuildings = 5, minSize = 4, maxSize = 8) {
    //     let grid = this.generateGrid_empty("FLOOR");
    
    //     // Function to create a building
    //     const buildings = [];
    
    //     for (let i = 0; i < numBuildings; i++) {
    //         let width = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    //         let height = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    //         let startX = Math.floor(Math.random() * (this.levelWidth - width - 3)) + 2;
    //         let startY = Math.floor(Math.random() * (this.levelHeight - height - 3)) + 2;
    
    //         // Ensure no overlapping by checking against previous buildings - the "+ 1"'s in here ensure there's a least one space between buildings
    //         let overlaps = buildings.some(building => 
    //             startX < building.x + building.width + 1 &&
    //             startX + width + 1 > building.x &&
    //             startY < building.y + building.height + 1 &&
    //             startY + height + 1 > building.y
    //         );
    //         if (overlaps) {
    //             i--;
    //             continue;
    //         }
    
    //         buildings.push({ x: startX, y: startY, width, height });
    
    //         // Create the building with walls
    //         let possibleDoors = []; // i.e. the perimeter cells of the building
    //         for (let x = startX; x < startX + width; x++) {
    //             for (let y = startY; y < startY + height; y++) {
    //                 grid[x][y] = GridCell.createAttached(x, y, this, "WALL");
    //                 if (y === startY || y === startY + height - 1 || x === startX || x === startX + width - 1) {
    //                     possibleDoors.push([x, y]);
    //                 }
    //             }
    //         }
    
    //         // Add a "door" by converting one random perimeter cell to FLOOR
    //         let [doorX, doorY] = possibleDoors[Math.floor(Math.random() * possibleDoors.length)];
    //         grid[doorX][doorY] = GridCell.createAttached(doorX, doorY, this, "FLOOR"); // Placeholder for a door
    //     }
    
    //     // Surround the entire town with a one-cell-thick wall
    //     for (let x = 0; x < this.levelWidth; x++) {
    //         for (let y = 0; y < this.levelHeight; y++) {
    //             if (x === 0 || y === 0 || x === this.levelWidth - 1 || y === this.levelHeight - 1) {
    //                 grid[x][y] = GridCell.createAttached(x, y, this, "WALL");
    //             }
    //         }
    //     }
    
    //     return grid;
    // }
    

    generateGrid_puddles(puddleDensity = 0.12, puddleMaxSize = 3) {
        let grid = this.generateGrid_empty();

        const numPuddles = Math.floor(this.levelWidth * this.levelHeight * puddleDensity);
        for (let i = 0; i < numPuddles; i++) {
            let puddleX = Math.floor(Math.random() * this.levelWidth);
            let puddleY = Math.floor(Math.random() * this.levelHeight);
            let puddleSize = Math.floor(Math.random() * puddleMaxSize) + 1;
            grid[puddleX][puddleY] = GridCell.createAttached(puddleX, puddleY, this, "WATER_SHALLOW");

            // let puddleSpreadDirections = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            let puddleSpreadDeltas = {"R": [1, 0],"L": [-1, 0],"D": [0, 1],"U": [0, -1]};
            let puddleSpreadDirections = Object.keys(puddleSpreadDeltas);
            let lastSpreadDir = "";
            for (let ps = 0; ps<puddleSize; ps++) {
                puddleSpreadDirections.sort(() => Math.random() - 0.5); // Shuffle directions for randomness
                let puddleSpreadDir = puddleSpreadDirections[0] != lastSpreadDir ? puddleSpreadDirections[0] : puddleSpreadDirections[1];
                let [dx, dy] = puddleSpreadDeltas[puddleSpreadDir];
                puddleX = constrainValue(puddleX + dx, 0, this.levelWidth-1);
                puddleY = constrainValue(puddleY + dy, 0, this.levelHeight-1);
                grid[puddleX][puddleY] = GridCell.createAttached(puddleX, puddleY, this, "WATER_SHALLOW");
                lastSpreadDir = puddleSpreadDir;
            }
        }

        return grid;
    }

    findCellTerrainNearPlace(terrain, startX, startY, grid) {
        const searchRadius = Math.max(this.levelWidth, this.levelHeight);
        for (let radius = 0; radius < searchRadius; radius++) {
            for (let y = Math.max(0, startY - radius); y <= Math.min(this.levelHeight - 1, startY + radius); y++) {
                for (let x = Math.max(0, startX - radius); x <= Math.min(this.levelWidth - 1, startX + radius); x++) {
                    if (grid[x][y].terrain === terrain) {
                        return grid[x][y];
                    }
                }
            }
        }
        return null; // No matching cell found
    }

    getRandomCellOfTerrainInGrid(terrain, grid) {
        let x = Math.floor(Math.random() * this.levelWidth);
        let y = Math.floor(Math.random() * this.levelHeight);
        return this.findCellTerrainNearPlace(terrain, x, y, grid);
    }

    findEmptyCellTerrainNearPlace(terrain, startX, startY, grid) {
        const searchRadius = Math.max(this.levelWidth, this.levelHeight);
        for (let radius = 0; radius < searchRadius; radius++) {
            for (let y = Math.max(0, startY - radius); y <= Math.min(this.levelHeight - 1, startY + radius); y++) {
                for (let x = Math.max(0, startX - radius); x <= Math.min(this.levelWidth - 1, startX + radius); x++) {
                    if (grid[x][y].terrain === terrain && !grid[x][y].structure && !grid[x][y].entity) {
                        return grid[x][y];
                    }
                }
            }
        }
        return null; // No matching cell found
    }

    getRandomEmptyCellOfTerrain(terrain, grid) {
        let x = Math.floor(Math.random() * this.levelWidth);
        let y = Math.floor(Math.random() * this.levelHeight);
        return this.findEmptyCellTerrainNearPlace(terrain, x, y, grid);
    }

    /**
 * Determines which cells in the grid are viewable.
 * A cell is viewable if it or any of its adjacent cells is not opaque.
 */
    determineCellViewability() {
        for (let x = 0; x < this.levelWidth; x++) {
            for (let y = 0; y < this.levelHeight; y++) {
                let cell = this.grid[x][y];
                // console.log(`cell ${x} ${y}`, cell);
                if (!cell.isOpaque) {
                    cell.isViewable = true; 
                } else {
                    let adjacentCells = cell.getAdjacentCells();
                    cell.isViewable = GridCell.anyCellHasPropertyOfValue(adjacentCells, "isOpaque", false);
                } 
            }
        }
    }

}

export { WorldLevel };
