import { applyCellularAutomataSmoothing } from "./gridUtils.js";
import { GridCell } from "./gridCellClass.js";
import { constrainValue, devTrace } from "../util.js";

const SUBDIVIDE_MIN_WIDTH = 6;
const SUBDIVIDE_MIN_HEIGHT = 6;
const SUBDIVIDE_MIN_DEPTH = 4;
const SUBDIVIDE_MAX_DEPTH = 5;
const MIN_ROOM_WIDTH = 3;
const MIN_ROOM_HEIGHT = 3;
const MAX_TOWN_BUILDING_ATTEMPTS = 200;

function setWorldLevelForGridCells(worldLevel, grid) {
    devTrace(5,`setWorldLevelForGridCells`);
    grid.forEach(gridCol => {
        gridCol.forEach(gridCell => {
            gridCell.setWorldLevel(worldLevel);
        });
    });
}

function generateGrid_empty(width, height, generationParams = {}) {
    devTrace(5,`generateGrid_empty ${width} ${height}`, generationParams);
    const startingTerrain = generationParams && generationParams.startingTerrain ? generationParams.startingTerrain : "FLOOR";
    const newGrid = Array.from({ length: width }, (_, col) =>
        Array.from({ length: height }, (_, row) => GridCell.createDetachedAt(col, row, startingTerrain))
    );
    //  console.log("empty grid", newGrid);
    return newGrid;
}


function generateGrid_random(width, height, generationParams = {}) {
    devTrace(5,`generateGrid_random ${width} ${height}`, generationParams);
    const terrainTypes = Object.keys(GridCell.TYPES);
    const newGrid = Array.from({ length: width }, (_, col) =>
        Array.from({ length: height }, (_, row) => {
            const randomTerrain = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
            return GridCell.createDetachedAt(col, row, randomTerrain);
        })
    );
    //  console.log("random grid", newGrid);
    return newGrid;
}

function generateGrid_variable_caves(width, height, smoothness = 2) {
    devTrace(5,`generateGrid_variable_caves ${width} ${height} ${smoothness}`, );
    let grid = generateGrid_empty(width, height);

    // Initialize all border cells as WALL, fill the interior with simple noise
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                grid[x][y] = GridCell.createDetachedAt(x, y, "WALL");
            } else {
                const terrain = Math.random() < 0.45 ? "WALL" : "FLOOR";
                grid[x][y] = GridCell.createDetachedAt(x, y, terrain);
            }
        }
    }

    // Fill corners with WALL triangles
    const quarterWidth = Math.floor(width / 4);
    const quarterHeight = Math.floor(height / 4);
    for (let i = 0; i < quarterWidth; i++) {
        for (let j = 0; j < quarterHeight; j++) {
            if (i + j < quarterWidth) {
                grid[i][j] = GridCell.createDetachedAt(i, j, "WALL"); // Top-left corner
                grid[i][height - 1 - j] = GridCell.createDetachedAt(i, height - 1 - j, "WALL"); // Bottom-left
                grid[width - 1 - i][j] = GridCell.createDetachedAt(width - 1 - i, j, "WALL"); // Top-right
                grid[width - 1 - i][height - 1 - j] = GridCell.createDetachedAt(width - 1 - i, height - 1 - j, "WALL"); // Bottom-right
            }
        }
    }

    // Apply cellular automata smoothing
    for (let i = 0; i < smoothness; i++) {
        grid = applyCellularAutomataSmoothing(grid);
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
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (grid[x][y].terrain === "FLOOR" && !visited.has(`${x},${y}`)) {
                let region = [];
                floodFill(x, y, width, height, grid, visited, region);
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

            if (ax >= 0 && ax < width && ay >= 0 && ay < height) {
                grid[ax][ay] = GridCell.createDetachedAt(ax, ay, "FLOOR");

                // Add some variation in corridor width
                if (Math.random() < 0.3) {
                    let offsetX = Math.random() < 0.5 ? -1 : 1;
                    let offsetY = Math.random() < 0.5 ? -1 : 1;
                    if (ax + offsetX >= 0 && ax + offsetX < width) {
                        grid[ax + offsetX][ay] = GridCell.createDetachedAt(ax + offsetX, ay, "FLOOR");
                    }
                    if (ay + offsetY >= 0 && ay + offsetY < height) {
                        grid[ax][ay + offsetY] = GridCell.createDetachedAt(ax, ay + offsetY, "FLOOR");
                    }
                }
            }
        }
    }

    return grid;
}

function generateGrid_caves(width, height, generationParams = {}) {
    devTrace(5,`generateGrid_caves ${width} ${height}`, generationParams);
    return generateGrid_variable_caves(width, height, 3);
}

function generateGrid_caves_shattered(width, height, generationParams = {}) {
    devTrace(5,`generateGrid_caves_shattered ${width} ${height}`, generationParams);
    return generateGrid_variable_caves(width, height, 1);
}

function generateGrid_caves_large(width, height, generationParams = {}) {
    devTrace(5,`generateGrid_caves_large ${width} ${height}`, generationParams);
    return generateGrid_variable_caves(width, height, 5);
}

function generateGrid_caves_huge(width, height, generationParams = {}) {
    devTrace(5,`generateGrid_caves_huge ${width} ${height}`, generationParams);
    return generateGrid_variable_caves(width, height, 11);
}

function generateGrid_burrow(width, height, generationParams = {}) {
    devTrace(5,`generateGrid_burrow ${width} ${height}`, generationParams);
    let grid = generateGrid_empty(width, height, {startingTerrain: "WALL"});

    // Determine starting location within the central 75% of the grid
    let startX = Math.floor(width * 0.125) + Math.floor(Math.random() * (width * 0.75));
    let startY = Math.floor(height * 0.125) + Math.floor(Math.random() * (height * 0.75));

    // then carve out floors in a random walk (orthogonal)
    let x = startX;
    let y = startY;
    for (let i = 0; i < width * height * 0.3; i++) {
        grid[x][y] = GridCell.createDetachedAt(x, y, "FLOOR");
        const direction = Math.floor(Math.random() * 4);
        if (direction === 0 && y > 1) y--; // Up
        if (direction === 1 && y < height - 2) y++; // Down
        if (direction === 2 && x > 1) x--; // Left
        if (direction === 3 && x < width - 2) x++; // Right
    }

    return grid;
}

// similar to burrow, but preferentially follow previous direction, and re-set to start when hitting an edge
function generateGrid_nest(width, height, generationParams = {}) {
    devTrace(5,`generateGrid_nest ${width} ${height}`, generationParams);
    let grid = generateGrid_empty(width, height, {startingTerrain: "WALL"});

    // Determine starting location within the central 75% of the grid
    let startX = Math.floor(width * 0.125) + Math.floor(Math.random() * (width * 0.75));
    let startY = Math.floor(height * 0.125) + Math.floor(Math.random() * (height * 0.75));

    let x = startX;
    let y = startY;
    let lastDirection = Math.floor(Math.random() * 4);
    let burrowSize = (width * height * 0.2) + Math.floor(Math.random() * (width * height * 0.2));
    let maxBurrowAttempts = width * height * 0.6;
    let countBurrowed = 0;
    let countBurrowAttempts = 0;
    while ((countBurrowed < burrowSize) && (countBurrowAttempts < maxBurrowAttempts)) {
        countBurrowAttempts++;
        if (grid[x][y].terrain != "FLOOR") {
            countBurrowed++;
        }
        grid[x][y] = GridCell.createDetachedAt(x, y, "FLOOR");
        const tryDirection = Math.floor(Math.random() * 5);
        const direction = tryDirection == 4 ? lastDirection : tryDirection;
        if (direction === 0 && y > 1) y--; // Up
        if (direction === 1 && y < height - 2) y++; // Down
        if (direction === 2 && x > 1) x--; // Left
        if (direction === 3 && x < width - 2) x++; // Right

        if (y == 2 || y == height - 3 || x == 2 || x == width - 3) {
            x = startX;
            y = startY;
            lastDirection = Math.floor(Math.random() * 4);
        }

        lastDirection = direction;
    }

    return grid;
}

const MAX_ATTEMPTS_TO_START_ROOM = 20;
function generateGrid_roomsAndCorridors_random(width, height, generationParams = {}) {
    devTrace(5,`generateGrid_roomsAndCorridors_random ${width} ${height}`, generationParams);
    let grid = generateGrid_empty(width, height, {startingTerrain: "WALL"});

    // // Define number of rooms
    const numRooms = Math.random() * Math.floor(width * height * 0.01) + 4;
    const rooms = [];

    const roomSizeBasis = Math.floor(Math.min(width, height) / 5);

    for (let i = 0; i < numRooms; i++) {
        const roomWidth = Math.floor(Math.random() * roomSizeBasis) + MIN_ROOM_WIDTH;
        const roomHeight = Math.floor(Math.random() * roomSizeBasis) + MIN_ROOM_HEIGHT;
        let roomStartX = Math.floor(Math.random() * (width - roomWidth - 1)) + 1;
        let roomStartY = Math.floor(Math.random() * (height - roomHeight - 1)) + 1;

        let countAttemptsToStartRoom = 0;
        while (grid[roomStartX][roomStartY].terrain == "FLOOR" && countAttemptsToStartRoom < MAX_ATTEMPTS_TO_START_ROOM) {
            roomStartX = Math.floor(Math.random() * (width - roomWidth - 1)) + 1;
            roomStartY = Math.floor(Math.random() * (height - roomHeight - 1)) + 1;
            countAttemptsToStartRoom++;
        }

        if (countAttemptsToStartRoom < MAX_ATTEMPTS_TO_START_ROOM) {
            for (let x = roomStartX; x < roomStartX + roomWidth; x++) {
                for (let y = roomStartY; y < roomStartY + roomHeight; y++) {
                    grid[x][y] = GridCell.createDetachedAt(x, y, "FLOOR");
                }
            }
            rooms.push({ x: roomStartX, y: roomStartY, width: roomWidth, height: roomHeight });
        }
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

            grid[x][y] = GridCell.createDetachedAt(x, y, "FLOOR");
        }
    }


    return grid;
}


function generateGrid_roomsAndCorridors_subdivide(width, height, generationParams = {}) {
    devTrace(5,`generateGrid_roomsAndCorridors_subdivide ${width} ${height}`, generationParams);
    let grid = generateGrid_empty(width, height, {startingTerrain: "WALL"});

    let rooms = [];
    const subdivideDepth = Math.floor(Math.random() * (SUBDIVIDE_MAX_DEPTH - SUBDIVIDE_MIN_DEPTH + 1)) + SUBDIVIDE_MIN_DEPTH;

    function subdivide(x, y, width, height, depth = 0) {
        if (width < SUBDIVIDE_MIN_WIDTH || height < SUBDIVIDE_MIN_HEIGHT) return;

        const minRoomWidth = Math.max(MIN_ROOM_WIDTH, Math.floor(width * .4));
        const minRoomHeigth = Math.max(MIN_ROOM_HEIGHT, Math.floor(height * .4));

        const roomWidth = Math.max(minRoomWidth, Math.floor(Math.random() * (width - 3)));
        const roomHeight = Math.max(minRoomHeigth, Math.floor(Math.random() * (height - 3)));
        const roomX = x + Math.floor(Math.random() * (width - roomWidth));
        const roomY = y + Math.floor(Math.random() * (height - roomHeight));

        let addedRoom = false;
        if ((depth > 1) && (Math.random() < .66)) {
            for (let rx = roomX; rx < roomX + roomWidth; rx++) {
                for (let ry = roomY; ry < roomY + roomHeight; ry++) {
                    grid[rx][ry] = GridCell.createDetachedAt(rx, ry, "FLOOR");
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
                subdivide(x, y, splitPoint - x, height, depth + 1);
                subdivide(splitPoint + 1, y, x + width - splitPoint - 1, height, depth + 1);
            } else {
                subdivide(x, y, width, splitPoint - y, depth + 1);
                subdivide(x, splitPoint + 1, width, y + height - splitPoint - 1, depth + 1);
            }
        }
    }

    subdivide(1, 1, width - 2, height - 2);

    // Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
        const prevRoom = rooms[i - 1];
        const currRoom = rooms[i];
        let x = prevRoom.x + Math.floor(prevRoom.width / 2);
        let y = prevRoom.y + Math.floor(prevRoom.height / 2);
        let targetX = currRoom.x + Math.floor(currRoom.width / 2);
        let targetY = currRoom.y + Math.floor(currRoom.height / 2);

        while (x !== targetX) {
            grid[x][y] = GridCell.createDetachedAt(x, y, "FLOOR");
            x += x < targetX ? 1 : -1;
        }
        while (y !== targetY) {
            grid[x][y] = GridCell.createDetachedAt(x, y, "FLOOR");
            y += y < targetY ? 1 : -1;
        }
    }

    return grid;
}

function generateGrid_town(width, height, generationParams = {}, numBuildings = 5, minSize = 4, maxSize = 8) {
    devTrace(5,`generateGrid_town ${width} ${height}`, generationParams);
    let grid = generateGrid_empty(width, height);

    // Function to create a building
    const buildings = [];
    let buildingAttempts = 0;

    for (let i = 0; (i < numBuildings) && (buildingAttempts < MAX_TOWN_BUILDING_ATTEMPTS); i++) {
        buildingAttempts++;
        let buildingWidth = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
        let buildingHeight = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
        let startX = Math.floor(Math.random() * (width - buildingWidth - 3)) + 2;
        let startY = Math.floor(Math.random() * (height - buildingHeight - 3)) + 2;

        // Ensure no overlapping by checking against previous buildings - the "+ 1" is in here ensure there's a least one space between buildings
        let overlaps = buildings.some(building =>
            startX < building.x + building.width + 1 &&
            startX + buildingWidth + 1 > building.x &&
            startY < building.y + building.height + 1 &&
            startY + buildingHeight + 1 > building.y
        );
        if (overlaps) {
            i--; // turn back the loop counter, which means we get the specified number buildings rather than "up to" the specified number of buildings
            continue;
        }

        buildings.push({ x: startX, y: startY, width: buildingWidth, height: buildingHeight });

        // Create the building with walls
        let possibleDoors = []; // i.e. the perimeter cells of the building
        for (let x = startX; x < startX + buildingWidth; x++) {
            for (let y = startY; y < startY + buildingHeight; y++) {
                grid[x][y] = GridCell.createDetachedAt(x, y, "WALL");
                if (y === startY || y === startY + buildingHeight - 1 || x === startX || x === startX + buildingWidth - 1) {
                    possibleDoors.push([x, y]);
                }
            }
        }

        // Add a "door" by converting one random perimeter cell to FLOOR
        let [doorX, doorY] = possibleDoors[Math.floor(Math.random() * possibleDoors.length)];
        grid[doorX][doorY] = GridCell.createDetachedAt(doorX, doorY, "FLOOR"); // Placeholder for a door
    }

    // Surround the entire town with a one-cell-thick wall
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                grid[x][y] = GridCell.createDetachedAt(x, y, "WALL");
            }
        }
    }

    return grid;
}


function generateGrid_puddles(width, height, generationParams = {}, puddleDensity = 0.12, puddleMaxSize = 3) {
    devTrace(5,`generateGrid_puddles ${width} ${height}`, generationParams);
    let grid = generateGrid_empty(width, height);

    const numPuddles = Math.floor(width * height * puddleDensity);
    for (let i = 0; i < numPuddles; i++) {
        let puddleX = Math.floor(Math.random() * width);
        let puddleY = Math.floor(Math.random() * height);
        let puddleSize = Math.floor(Math.random() * puddleMaxSize) + 1;
        grid[puddleX][puddleY] = GridCell.createDetachedAt(puddleX, puddleY, "WATER_SHALLOW");

        let puddleSpreadDeltas = { "R": [1, 0], "L": [-1, 0], "D": [0, 1], "U": [0, -1] };
        let puddleSpreadDirections = Object.keys(puddleSpreadDeltas);
        let lastSpreadDir = "";
        for (let ps = 0; ps < puddleSize; ps++) {
            puddleSpreadDirections.sort(() => Math.random() - 0.5);
            let puddleSpreadDir = puddleSpreadDirections[0] != lastSpreadDir ? puddleSpreadDirections[0] : puddleSpreadDirections[1]; // spread in a different direction than last time
            let [dx, dy] = puddleSpreadDeltas[puddleSpreadDir];
            puddleX = constrainValue(puddleX + dx, 0, width - 1);
            puddleY = constrainValue(puddleY + dy, 0, height - 1);
            grid[puddleX][puddleY] = GridCell.createDetachedAt(puddleX, puddleY, "WATER_SHALLOW");
            lastSpreadDir = puddleSpreadDir;
        }
    }

    return grid;
}

export {
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
    generateGrid_town,
    generateGrid_puddles
};