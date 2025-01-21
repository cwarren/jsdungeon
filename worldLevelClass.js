import { GridCell } from "./gridCellClass.js";
import { Structure } from "./structureClass.js";
import { constrainValue } from "./util.js";

const SUBDIVIDE_MIN_WIDTH = 6;
const SUBDIVIDE_MIN_HEIGHT = 6;
const SUBDIVIDE_MIN_DEPTH = 4;
const SUBDIVIDE_MAX_DEPTH = 5;
const MIN_ROOM_WIDTH = 3;
const MIN_ROOM_HEIGHT = 3;

class WorldLevel {
    constructor(levelNumber, levelWidth, levelHeight) {
        this.levelNumber = levelNumber;
        this.levelWidth = levelWidth;
        this.levelHeight = levelHeight;
        this.grid = this.generateGrid_town();
        this.determineCellViewability();
        this.levelEntities = [];
        this.levelStructures = [];
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

    generateGrid_empty(startingTerrain = "FLOOR") {
        return Array.from({ length: this.levelWidth }, (_, col) =>
           Array.from({ length: this.levelHeight }, (_, row) => new GridCell(col, row, this, startingTerrain))
        );
    }

    generateGrid_random() {
        const terrainTypes = Object.keys(GridCell.TYPES);
        return Array.from({ length: this.levelHeight }, (_, y) =>
            Array.from({ length: this.levelWidth }, (_, x) => {
                const randomTerrain = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
                return new GridCell(x, y, this, randomTerrain);
            })
        );
    }

    applyCellularAutomataSmoothing(grid, terrainToSmooth = "WALL") {
        let newGrid = this.generateGrid_empty();
        grid.forEach((col, x) => {
            col.forEach((cell, y) => {
                let terrainCount = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (y + dy >= 0 && y + dy < this.levelHeight && x + dx >= 0 && x + dx < this.levelWidth) {
                            if (grid[x + dx][y + dy].terrain === terrainToSmooth) {
                                terrainCount++;
                            }
                        } else {
                            terrainCount++; // Treat out-of-bounds as walls
                        }
                    }
                }
                // console.log(`automata smoothing ${x} ${y}`);
                newGrid[x][y] = new GridCell(x, y, this, terrainCount >= 5 ? terrainToSmooth : "FLOOR");
            });
        });
        return newGrid;
    }

    generateGrid_variable_caves(smoothness = 2) {
        let grid = this.generateGrid_empty();
        console.log("caves empty grid", grid);
        
        // Initialize all border cells as WALL
        for (let y = 0; y < this.levelHeight; y++) {
            for (let x = 0; x < this.levelWidth; x++) {
                if (x === 0 || y === 0 || x === this.levelWidth - 1 || y === this.levelHeight - 1) {
                    grid[x][y] = new GridCell(x, y, this, "WALL");
                } else {
                    const terrain = Math.random() < 0.45 ? "WALL" : "FLOOR";
                    grid[x][y] = new GridCell(x, y, this, terrain);
                }
            }
        }
        
        // Fill corners with WALL triangles
        const quarterWidth = Math.floor(this.levelWidth / 4);
        const quarterHeight = Math.floor(this.levelHeight / 4);
        for (let i = 0; i < quarterWidth; i++) {
            for (let j = 0; j < quarterHeight; j++) {
                if (i + j < quarterWidth) {
                    grid[i][j] = new GridCell(i, j, this, "WALL"); // Top-left corner
                    grid[i][this.levelHeight - 1 - j] = new GridCell(i, this.levelHeight - 1 - j, this, "WALL"); // Bottom-left
                    grid[this.levelWidth - 1 - i][j] = new GridCell(this.levelWidth - 1 - i, j, this, "WALL"); // Top-right
                    grid[this.levelWidth - 1 - i][this.levelHeight - 1 - j] = new GridCell(this.levelWidth - 1 - i, this.levelHeight - 1 - j, this, "WALL"); // Bottom-right
                }
            }
        }
        
        // Apply cellular automata smoothing
        for (let i = 0; i < smoothness; i++) {
            grid = this.applyCellularAutomataSmoothing(grid);
        }
    
        // Ensure full connectivity using flood fill
        let visited = new Set();
        let regions = [];
    
        function floodFill(x, y, levelWidth, levelHeight, grid, visited, region) {
            let stack = [[x, y]];
            while (stack.length > 0) {
                let [cx, cy] = stack.pop();
                let key = `${cx},${cy}`;
                if (!visited.has(key) && cx >= 0 && cy >= 0 && cx < levelWidth && cy < levelHeight && grid[cx][cy].terrain === "FLOOR") {
                    visited.add(key);
                    region.push([cx, cy]);
                    stack.push([cx + 1, cy]);
                    stack.push([cx - 1, cy]);
                    stack.push([cx, cy + 1]);
                    stack.push([cx, cy - 1]);
                }
            }
        }
        
        // Identify disconnected regions
        for (let y = 0; y < this.levelHeight; y++) {
            for (let x = 0; x < this.levelWidth; x++) {
                if (grid[x][y].terrain === "FLOOR" && !visited.has(`${x},${y}`)) {
                    let region = [];
                    floodFill(x, y, this.levelWidth, this.levelHeight, grid, visited, region);
                    regions.push(region);
                }
            }
        }

        // Connect disconnected regions with winding, irregular paths
        for (let i = 1; i < regions.length; i++) {
            let regionA = regions[i - 1];
            let regionB = regions[i];
            let [ax, ay] = regionA[Math.floor(Math.random() * regionA.length)];
            let [bx, by] = regionB[Math.floor(Math.random() * regionB.length)];
            
            while (ax !== bx || ay !== by) {
                if (Math.random() < 0.7) {
                    ax += Math.sign(bx - ax);
                } else {
                    ay += Math.sign(by - ay);
                }
                
                if (ax >= 0 && ax < this.levelWidth && ay >= 0 && ay < this.levelHeight) {
                    grid[ax][ay] = new GridCell(ax, ay, this, "FLOOR");
                    
                    // Add some variation in corridor width
                    if (Math.random() < 0.3) {
                        let offsetX = Math.random() < 0.5 ? -1 : 1;
                        let offsetY = Math.random() < 0.5 ? -1 : 1;
                        if (ax + offsetX >= 0 && ax + offsetX < this.levelWidth) {
                            grid[ax + offsetX][ay] = new GridCell(ax + offsetX, ay, this, "FLOOR");
                        }
                        if (ay + offsetY >= 0 && ay + offsetY < this.levelHeight) {
                            grid[ax][ay + offsetY] = new GridCell(ax, ay + offsetY, this, "FLOOR");
                        }
                    }
                }
            }
        }

        return grid;
    }

    generateGrid_caves() {
        return this.generateGrid_variable_caves(3);
    }

    generateGrid_caves_shattered() {
        return this.generateGrid_variable_caves(1);
    }

    generateGrid_caves_large() {
        return this.generateGrid_variable_caves(5);
    }

    generateGrid_caves_huge() {
        return this.generateGrid_variable_caves(11);
    }

    generateGrid_burrow() {
        let grid = this.generateGrid_empty("WALL");
        
        // Determine starting location within the central 75% of the grid
        let startX = Math.floor(this.levelWidth * 0.125) + Math.floor(Math.random() * (this.levelWidth * 0.75));
        let startY = Math.floor(this.levelHeight * 0.125) + Math.floor(Math.random() * (this.levelHeight * 0.75));
        
        let x = startX;
        let y = startY;
        for (let i = 0; i < this.levelWidth * this.levelHeight * 0.3; i++) {
            grid[x][y] = new GridCell(x, y, this, "FLOOR");
            const direction = Math.floor(Math.random() * 4);
            if (direction === 0 && y > 1) y--; // Up
            if (direction === 1 && y < this.levelHeight - 2) y++; // Down
            if (direction === 2 && x > 1) x--; // Left
            if (direction === 3 && x < this.levelWidth - 2) x++; // Right
        }
        
        return grid;
    }

    generateGrid_nest() {
        let grid = this.generateGrid_empty("WALL");
        
        // Determine starting location within the central 75% of the grid
        let startX = Math.floor(this.levelWidth * 0.125) + Math.floor(Math.random() * (this.levelWidth * 0.75));
        let startY = Math.floor(this.levelHeight * 0.125) + Math.floor(Math.random() * (this.levelHeight * 0.75));
        
        let x = startX;
        let y = startY;
        let lastDirection = Math.floor(Math.random() * 4);
        let burrowSize = (this.levelWidth * this.levelHeight * 0.2) + Math.floor(Math.random() * (this.levelWidth * this.levelHeight * 0.2));
        let maxBurrowAttempts = this.levelWidth * this.levelHeight * 0.6;
        // for (let i = 0; i < this.levelWidth * this.levelHeight * 0.3; i++) {
        let countBurrowed = 0;
        let countBurrowAttempts = 0;
        while ((countBurrowed < burrowSize) && (countBurrowAttempts < maxBurrowAttempts)) {
            countBurrowAttempts++;
            if (grid[x][y].terrain != "FLOOR") {
                countBurrowed++;
            }
            grid[x][y] = new GridCell(x, y, this, "FLOOR");
            const tryDirection = Math.floor(Math.random() * 5);
            const direction = tryDirection == 4 ? lastDirection : tryDirection;
            if (direction === 0 && y > 1) y--; // Up
            if (direction === 1 && y < this.levelHeight - 2) y++; // Down
            if (direction === 2 && x > 1) x--; // Left
            if (direction === 3 && x < this.levelWidth - 2) x++; // Right
            
            if (y == 2 || y == this.levelHeight - 3 || x == 2 || x == this.levelWidth - 3) {
                x = startX;
                y = startY;
                lastDirection = Math.floor(Math.random() * 4);
            }
            
            lastDirection = direction;
        }
        
        return grid;
    }

    generateGrid_roomsAndCorridors_random() {
        let grid = this.generateGrid_empty("WALL");
        
        // // Define number of rooms
        const numRooms = Math.random() * Math.floor(this.levelWidth * this.levelHeight * 0.01)+4;
        const rooms = [];
        
        const roomSizeBasis = Math.floor(Math.min(this.levelWidth, this.levelHeight) / 5);

        for (let i = 0; i < numRooms; i++) {
            const roomWidth = Math.floor(Math.random() * roomSizeBasis) + MIN_ROOM_WIDTH;
            const roomHeight = Math.floor(Math.random() * roomSizeBasis) + MIN_ROOM_HEIGHT;
            let roomStartX = Math.floor(Math.random() * (this.levelWidth - roomWidth - 1)) + 1;
            let roomStartY = Math.floor(Math.random() * (this.levelHeight - roomHeight - 1)) + 1;
            while (grid[roomStartX][roomStartY].terrain == "FLOOR") {
                roomStartX = Math.floor(Math.random() * (this.levelWidth - roomWidth - 1)) + 1;
                roomStartY = Math.floor(Math.random() * (this.levelHeight - roomHeight - 1)) + 1;
            }
            
            for (let x = roomStartX; x < roomStartX + roomWidth; x++) {
                for (let y = roomStartY; y < roomStartY + roomHeight; y++) {
                    grid[x][y] = new GridCell(x, y, this, "FLOOR");
                }
            }
            rooms.push({ x: roomStartX, y: roomStartY, width: roomWidth, height: roomHeight });
        }
        
        // Connect rooms with corridors
        for (let i = 1; i < rooms.length; i++) {
            const prevRoom = rooms[i - 1];
            const currRoom = rooms[i];
            let x = prevRoom.x + Math.floor(prevRoom.width / 2);
            let y = prevRoom.y + Math.floor(prevRoom.height / 2);
            let targetX = currRoom.x + Math.floor(currRoom.width / 2);
            let targetY = currRoom.y + Math.floor(currRoom.height / 2);
            
            while (x !== targetX || y !== targetY) {
                if (x !== targetX) {
                    x += Math.sign(targetX - x);
                } else if (y !== targetY) {
                    y += Math.sign(targetY - y);
                }
                
                grid[x][y] = new GridCell(x, y, this, "FLOOR");
            }
        }

        
        return grid;
    }

    
    generateGrid_roomsAndCorridors_subdivide() {
        let grid = this.generateGrid_empty("WALL");

        let rooms = [];
        const subdivideDepth = Math.floor(Math.random() * (SUBDIVIDE_MAX_DEPTH - SUBDIVIDE_MIN_DEPTH + 1)) + SUBDIVIDE_MIN_DEPTH;

        function subdivide(worldLevel, x, y, width, height, depth = 0) {
            if (width < SUBDIVIDE_MIN_WIDTH || height < SUBDIVIDE_MIN_HEIGHT) return;

            const minRoomWidth = Math.max(MIN_ROOM_WIDTH,Math.floor(width * .4));
            const minRoomHeigth = Math.max(MIN_ROOM_HEIGHT,Math.floor(height * .4));
            
            const roomWidth = Math.max(minRoomWidth, Math.floor(Math.random() * (width - 3)));
            const roomHeight = Math.max(minRoomHeigth, Math.floor(Math.random() * (height - 3)));
            const roomX = x + Math.floor(Math.random() * (width - roomWidth));
            const roomY = y + Math.floor(Math.random() * (height - roomHeight));
            
            let addedRoom = false;
            if ((depth > 1) && (Math.random() < .66)) {
                for (let rx = roomX; rx < roomX + roomWidth; rx++) {
                    for (let ry = roomY; ry < roomY + roomHeight; ry++) {
                        grid[rx][ry] = new GridCell(rx, ry, worldLevel, "FLOOR");
                    }
                }
                rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });
                addedRoom = true;
            }

            if ((depth < subdivideDepth) && (!addedRoom || Math.random() < .5)) {
                const splitVertical = width > height;
                const splitPoint = splitVertical
                    ? x + Math.floor(width / 2)
                    : y + Math.floor(height / 2);
                
                if (splitVertical) {
                    subdivide(worldLevel, x, y, splitPoint - x, height, depth + 1);
                    subdivide(worldLevel, splitPoint + 1, y, x + width - splitPoint - 1, height, depth + 1);
                } else {
                    subdivide(worldLevel, x, y, width, splitPoint - y, depth + 1);
                    subdivide(worldLevel, x, splitPoint + 1, width, y + height - splitPoint - 1, depth + 1);
                }
            }
        }

        subdivide(this, 1, 1, this.levelWidth - 2, this.levelHeight - 2);

        // Connect rooms with corridors
        for (let i = 1; i < rooms.length; i++) {
            const prevRoom = rooms[i - 1];
            const currRoom = rooms[i];
            let x = prevRoom.x + Math.floor(prevRoom.width / 2);
            let y = prevRoom.y + Math.floor(prevRoom.height / 2);
            let targetX = currRoom.x + Math.floor(currRoom.width / 2);
            let targetY = currRoom.y + Math.floor(currRoom.height / 2);
            
            while (x !== targetX) {
                grid[x][y] = new GridCell(x, y, this, "FLOOR");
                x += x < targetX ? 1 : -1;
            }
            while (y !== targetY) {
                grid[x][y] = new GridCell(x, y, this, "FLOOR");
                y += y < targetY ? 1 : -1;
            }
        }
        
        return grid;
    }

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
                    grid[x][y] = new GridCell(x, y, this, "WALL");
                    if (y === startY || y === startY + height - 1 || x === startX || x === startX + width - 1) {
                        possibleDoors.push([x, y]);
                    }
                }
            }
    
            // Add a "door" by converting one random perimeter cell to FLOOR
            let [doorX, doorY] = possibleDoors[Math.floor(Math.random() * possibleDoors.length)];
            grid[doorX][doorY] = new GridCell(doorX, doorY, this, "FLOOR"); // Placeholder for a door
        }
    
        // Surround the entire town with a one-cell-thick wall
        for (let x = 0; x < this.levelWidth; x++) {
            for (let y = 0; y < this.levelHeight; y++) {
                if (x === 0 || y === 0 || x === this.levelWidth - 1 || y === this.levelHeight - 1) {
                    grid[x][y] = new GridCell(x, y, this, "WALL");
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
            grid[puddleX][puddleY] = new GridCell(puddleX, puddleY, this, "WATER_SHALLOW");

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
                grid[puddleX][puddleY] = new GridCell(puddleX, puddleY, this, "WATER_SHALLOW");
                lastSpreadDir = puddleSpreadDir;
            }
        }

        // grid = this.applyCellularAutomataSmoothing(grid, "WATER_SHALLOW");

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
