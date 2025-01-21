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
    generateGrid_roomsAndCorridors_subdivide
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
            this.grid = this.generateGrid_town(levelWidth,levelHeight);
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

    // generateGrid_burrow() {
    //     let grid = this.generateGrid_empty("WALL");
        
    //     // Determine starting location within the central 75% of the grid
    //     let startX = Math.floor(this.levelWidth * 0.125) + Math.floor(Math.random() * (this.levelWidth * 0.75));
    //     let startY = Math.floor(this.levelHeight * 0.125) + Math.floor(Math.random() * (this.levelHeight * 0.75));
        
    //     let x = startX;
    //     let y = startY;
    //     for (let i = 0; i < this.levelWidth * this.levelHeight * 0.3; i++) {
    //         grid[x][y] = GridCell.createAttached(x, y, this, "FLOOR");
    //         const direction = Math.floor(Math.random() * 4);
    //         if (direction === 0 && y > 1) y--; // Up
    //         if (direction === 1 && y < this.levelHeight - 2) y++; // Down
    //         if (direction === 2 && x > 1) x--; // Left
    //         if (direction === 3 && x < this.levelWidth - 2) x++; // Right
    //     }
        
    //     return grid;
    // }

    // generateGrid_nest() {
    //     let grid = this.generateGrid_empty("WALL");
        
    //     // Determine starting location within the central 75% of the grid
    //     let startX = Math.floor(this.levelWidth * 0.125) + Math.floor(Math.random() * (this.levelWidth * 0.75));
    //     let startY = Math.floor(this.levelHeight * 0.125) + Math.floor(Math.random() * (this.levelHeight * 0.75));
        
    //     let x = startX;
    //     let y = startY;
    //     let lastDirection = Math.floor(Math.random() * 4);
    //     let burrowSize = (this.levelWidth * this.levelHeight * 0.2) + Math.floor(Math.random() * (this.levelWidth * this.levelHeight * 0.2));
    //     let maxBurrowAttempts = this.levelWidth * this.levelHeight * 0.6;
    //     // for (let i = 0; i < this.levelWidth * this.levelHeight * 0.3; i++) {
    //     let countBurrowed = 0;
    //     let countBurrowAttempts = 0;
    //     while ((countBurrowed < burrowSize) && (countBurrowAttempts < maxBurrowAttempts)) {
    //         countBurrowAttempts++;
    //         if (grid[x][y].terrain != "FLOOR") {
    //             countBurrowed++;
    //         }
    //         grid[x][y] = GridCell.createAttached(x, y, this, "FLOOR");
    //         const tryDirection = Math.floor(Math.random() * 5);
    //         const direction = tryDirection == 4 ? lastDirection : tryDirection;
    //         if (direction === 0 && y > 1) y--; // Up
    //         if (direction === 1 && y < this.levelHeight - 2) y++; // Down
    //         if (direction === 2 && x > 1) x--; // Left
    //         if (direction === 3 && x < this.levelWidth - 2) x++; // Right
            
    //         if (y == 2 || y == this.levelHeight - 3 || x == 2 || x == this.levelWidth - 3) {
    //             x = startX;
    //             y = startY;
    //             lastDirection = Math.floor(Math.random() * 4);
    //         }
            
    //         lastDirection = direction;
    //     }
        
    //     return grid;
    // }

    // generateGrid_roomsAndCorridors_random() {
    //     let grid = this.generateGrid_empty("WALL");
        
    //     // // Define number of rooms
    //     const numRooms = Math.random() * Math.floor(this.levelWidth * this.levelHeight * 0.01)+4;
    //     const rooms = [];
        
    //     const roomSizeBasis = Math.floor(Math.min(this.levelWidth, this.levelHeight) / 5);

    //     for (let i = 0; i < numRooms; i++) {
    //         const roomWidth = Math.floor(Math.random() * roomSizeBasis) + MIN_ROOM_WIDTH;
    //         const roomHeight = Math.floor(Math.random() * roomSizeBasis) + MIN_ROOM_HEIGHT;
    //         let roomStartX = Math.floor(Math.random() * (this.levelWidth - roomWidth - 1)) + 1;
    //         let roomStartY = Math.floor(Math.random() * (this.levelHeight - roomHeight - 1)) + 1;
    //         while (grid[roomStartX][roomStartY].terrain == "FLOOR") {
    //             roomStartX = Math.floor(Math.random() * (this.levelWidth - roomWidth - 1)) + 1;
    //             roomStartY = Math.floor(Math.random() * (this.levelHeight - roomHeight - 1)) + 1;
    //         }
            
    //         for (let x = roomStartX; x < roomStartX + roomWidth; x++) {
    //             for (let y = roomStartY; y < roomStartY + roomHeight; y++) {
    //                 grid[x][y] = GridCell.createAttached(x, y, this, "FLOOR");
    //             }
    //         }
    //         rooms.push({ x: roomStartX, y: roomStartY, width: roomWidth, height: roomHeight });
    //     }
        
    //     // Connect rooms with corridors
    //     for (let i = 1; i < rooms.length; i++) {
    //         const prevRoom = rooms[i - 1];
    //         const currRoom = rooms[i];
    //         let x = prevRoom.x + Math.floor(prevRoom.width / 2);
    //         let y = prevRoom.y + Math.floor(prevRoom.height / 2);
    //         let targetX = currRoom.x + Math.floor(currRoom.width / 2);
    //         let targetY = currRoom.y + Math.floor(currRoom.height / 2);
            
    //         while (x !== targetX || y !== targetY) {
    //             if (x !== targetX) {
    //                 x += Math.sign(targetX - x);
    //             } else if (y !== targetY) {
    //                 y += Math.sign(targetY - y);
    //             }
                
    //             grid[x][y] = GridCell.createAttached(x, y, this, "FLOOR");
    //         }
    //     }

        
    //     return grid;
    // }

    
    // generateGrid_roomsAndCorridors_subdivide() {
    //     let grid = this.generateGrid_empty("WALL");

    //     let rooms = [];
    //     const subdivideDepth = Math.floor(Math.random() * (SUBDIVIDE_MAX_DEPTH - SUBDIVIDE_MIN_DEPTH + 1)) + SUBDIVIDE_MIN_DEPTH;

    //     function subdivide(worldLevel, x, y, width, height, depth = 0) {
    //         if (width < SUBDIVIDE_MIN_WIDTH || height < SUBDIVIDE_MIN_HEIGHT) return;

    //         const minRoomWidth = Math.max(MIN_ROOM_WIDTH,Math.floor(width * .4));
    //         const minRoomHeigth = Math.max(MIN_ROOM_HEIGHT,Math.floor(height * .4));
            
    //         const roomWidth = Math.max(minRoomWidth, Math.floor(Math.random() * (width - 3)));
    //         const roomHeight = Math.max(minRoomHeigth, Math.floor(Math.random() * (height - 3)));
    //         const roomX = x + Math.floor(Math.random() * (width - roomWidth));
    //         const roomY = y + Math.floor(Math.random() * (height - roomHeight));
            
    //         let addedRoom = false;
    //         if ((depth > 1) && (Math.random() < .66)) {
    //             for (let rx = roomX; rx < roomX + roomWidth; rx++) {
    //                 for (let ry = roomY; ry < roomY + roomHeight; ry++) {
    //                     grid[rx][ry] = GridCell.createAttached(rx, ry, worldLevel, "FLOOR");
    //                 }
    //             }
    //             rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });
    //             addedRoom = true;
    //         }

    //         if ((depth < subdivideDepth) && (!addedRoom || Math.random() < .5)) {
    //             const splitVertical = width > height;
    //             const splitPoint = splitVertical
    //                 ? x + Math.floor(width / 2)
    //                 : y + Math.floor(height / 2);
                
    //             if (splitVertical) {
    //                 subdivide(worldLevel, x, y, splitPoint - x, height, depth + 1);
    //                 subdivide(worldLevel, splitPoint + 1, y, x + width - splitPoint - 1, height, depth + 1);
    //             } else {
    //                 subdivide(worldLevel, x, y, width, splitPoint - y, depth + 1);
    //                 subdivide(worldLevel, x, splitPoint + 1, width, y + height - splitPoint - 1, depth + 1);
    //             }
    //         }
    //     }

    //     subdivide(this, 1, 1, this.levelWidth - 2, this.levelHeight - 2);

    //     // Connect rooms with corridors
    //     for (let i = 1; i < rooms.length; i++) {
    //         const prevRoom = rooms[i - 1];
    //         const currRoom = rooms[i];
    //         let x = prevRoom.x + Math.floor(prevRoom.width / 2);
    //         let y = prevRoom.y + Math.floor(prevRoom.height / 2);
    //         let targetX = currRoom.x + Math.floor(currRoom.width / 2);
    //         let targetY = currRoom.y + Math.floor(currRoom.height / 2);
            
    //         while (x !== targetX) {
    //             grid[x][y] = GridCell.createAttached(x, y, this, "FLOOR");
    //             x += x < targetX ? 1 : -1;
    //         }
    //         while (y !== targetY) {
    //             grid[x][y] = GridCell.createAttached(x, y, this, "FLOOR");
    //             y += y < targetY ? 1 : -1;
    //         }
    //     }
        
    //     return grid;
    // }

    generateGrid_town(numBuildings = 5, minSize = 4, maxSize = 8) {
        let grid = this.generateGrid_empty("FLOOR");
    
        // Function to create a building
        const buildings = [];
    
        for (let i = 0; i < numBuildings; i++) {
            let width = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
            let height = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
            let startX = Math.floor(Math.random() * (this.levelWidth - width - 3)) + 2;
            let startY = Math.floor(Math.random() * (this.levelHeight - height - 3)) + 2;
    
            // Ensure no overlapping by checking against previous buildings - the "+ 1"'s in here ensure there's a least one space between buildings
            let overlaps = buildings.some(building => 
                startX < building.x + building.width + 1 &&
                startX + width + 1 > building.x &&
                startY < building.y + building.height + 1 &&
                startY + height + 1 > building.y
            );
            if (overlaps) {
                i--;
                continue;
            }
    
            buildings.push({ x: startX, y: startY, width, height });
    
            // Create the building with walls
            let possibleDoors = []; // i.e. the perimeter cells of the building
            for (let x = startX; x < startX + width; x++) {
                for (let y = startY; y < startY + height; y++) {
                    grid[x][y] = GridCell.createAttached(x, y, this, "WALL");
                    if (y === startY || y === startY + height - 1 || x === startX || x === startX + width - 1) {
                        possibleDoors.push([x, y]);
                    }
                }
            }
    
            // Add a "door" by converting one random perimeter cell to FLOOR
            let [doorX, doorY] = possibleDoors[Math.floor(Math.random() * possibleDoors.length)];
            grid[doorX][doorY] = GridCell.createAttached(doorX, doorY, this, "FLOOR"); // Placeholder for a door
        }
    
        // Surround the entire town with a one-cell-thick wall
        for (let x = 0; x < this.levelWidth; x++) {
            for (let y = 0; y < this.levelHeight; y++) {
                if (x === 0 || y === 0 || x === this.levelWidth - 1 || y === this.levelHeight - 1) {
                    grid[x][y] = GridCell.createAttached(x, y, this, "WALL");
                }
            }
        }
    
        return grid;
    }
    

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
