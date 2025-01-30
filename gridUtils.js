import {generateGrid_empty} from "./gridGeneration.js";
import { GridCell } from "./gridCellClass.js";

function applyCellularAutomataSmoothing(grid, terrainToSmooth = "WALL") {
    const width = grid.length;
    const height = grid[0].length;
    let newGrid = generateGrid_empty(width, height);
    grid.forEach((col, x) => {
        col.forEach((cell, y) => {
            let terrainCount = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (y + dy >= 0 && y + dy < height && x + dx >= 0 && x + dx < width) {
                        if (grid[x + dx][y + dy].terrain === terrainToSmooth) {
                            terrainCount++;
                        }
                    } else {
                        terrainCount++; // Treat out-of-bounds as walls
                    }
                }
            }
            newGrid[x][y] =GridCell.createDetachedAt(x, y, terrainCount >= 5 ? terrainToSmooth : "FLOOR");
        });
    });
    return newGrid;
}

function findCellOfTerrainNearPlace(terrain, startX, startY, grid) {
    const levelWidth = grid.length;
    const levelHeight = grid[0].length;
    const searchRadius = Math.min(levelWidth, levelHeight);
    for (let radius = 0; radius < searchRadius; radius++) {
        for (let y = Math.max(0, startY - radius); y <= Math.min(levelHeight - 1, startY + radius); y++) {
            for (let x = Math.max(0, startX - radius); x <= Math.min(levelWidth - 1, startX + radius); x++) {
                if (grid[x][y].terrain === terrain) {
                    return grid[x][y];
                }
            }
        }
    }
    return null; // No matching cell found
}

function getRandomCellOfTerrainInGrid(terrain, grid) {
    const levelWidth = grid.length;
    const levelHeight = grid[0].length;
    let x = Math.floor(Math.random() * levelWidth);
    let y = Math.floor(Math.random() * levelHeight);
    return findCellOfTerrainNearPlace(terrain, x, y, grid);
}

function findEmptyCellTerrainNearPlace(terrain, startX, startY, grid) {
    const levelWidth = grid.length;
    const levelHeight = grid[0].length;
    const searchRadius = Math.max(levelWidth, levelHeight);
    for (let radius = 0; radius < searchRadius; radius++) {
        for (let x = Math.max(0, startX - radius); x <= Math.min(levelWidth - 1, startX + radius); x++) {
            for (let y = Math.max(0, startY - radius); y <= Math.min(levelHeight - 1, startY + radius); y++) {
                if (grid[x][y].terrain === terrain && !grid[x][y].structure && !grid[x][y].entity) {
                    return grid[x][y];
                }
            }
        }
    }
    return null; // No matching cell found
}

function getRandomEmptyCellOfTerrainInGrid(terrain, grid) {
    const levelWidth = grid.length;
    const levelHeight = grid[0].length;
    let x = Math.floor(Math.random() * levelWidth);
    let y = Math.floor(Math.random() * levelHeight);
    return findEmptyCellTerrainNearPlace(terrain, x, y, grid);
}

/**
 * Determines which cells in the grid are viewable.
 * A cell is viewable if it or any of its adjacent cells is not opaque.
 */
function determineCellViewability(grid) {
    const levelWidth = grid.length;
    const levelHeight = grid[0].length;
    for (let x = 0; x < levelWidth; x++) {
        for (let y = 0; y < levelHeight; y++) {
            let cell = grid[x][y];
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

// uses A-star algorithm
function determineCheapestMovementPath(startCell, endCell, worldLevel) {
    if (!endCell.isTraversible) {
        return [];  // No path to an untraversable location
    }

    class Node {
        constructor(cell, parent, g, h) {
            this.cell = cell;
            this.parent = parent;
            this.g = g; // Movement cost from start
            this.h = Math.abs(cell.x - endCell.x) + Math.abs(cell.y - endCell.y); // Manhattan heuristic
            this.f = this.g + this.h;
        }
    }

    const openSet = new Map();
    const closedSet = new Set();
    const startNode = new Node(startCell, null, 0, 0);
    openSet.set(`${startCell.x},${startCell.y}`, startNode);

    while (openSet.size > 0) {
        let currentNode = [...openSet.values()].reduce((a, b) => (a.f < b.f ? a : b));

        if (currentNode.cell === endCell) {
            let path = [];
            while (currentNode) {
                path.push(currentNode.cell);
                currentNode = currentNode.parent;
            }
            return path.reverse();
        }

        openSet.delete(`${currentNode.cell.x},${currentNode.cell.y}`);
        closedSet.add(`${currentNode.cell.x},${currentNode.cell.y}`);

        for (const { dx, dy } of GridCell.ADJACENCY_DIRECTIONS) {
            const newX = currentNode.cell.x + dx;
            const newY = currentNode.cell.y + dy;

            if (newX < 0 || newX >= worldLevel.levelWidth || newY < 0 || newY >= worldLevel.levelHeight) {
                continue;
            }

            const neighbor = worldLevel.grid[newX][newY];
            if (!neighbor.isTraversible || closedSet.has(`${newX},${newY}`)) {
                continue;
            }

            const g = currentNode.g + neighbor.entryMovementCost;
            const h = Math.abs(newX - endCell.x) + Math.abs(newY - endCell.y);
            const f = g + h;

            if (!openSet.has(`${newX},${newY}`) || openSet.get(`${newX},${newY}`).g > g) {
                openSet.set(`${newX},${newY}`, new Node(neighbor, currentNode, g, h));
            }
        }
    }

    return [];  // No path found
}

function computeBresenhamLine(x0, y0, x1, y1) {
    let points = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
      points.push([x0, y0]);
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    return points;
  }


export {
    applyCellularAutomataSmoothing,
    findCellOfTerrainNearPlace,
    getRandomCellOfTerrainInGrid,
    findEmptyCellTerrainNearPlace,
    getRandomEmptyCellOfTerrainInGrid,
    determineCellViewability,
    determineCheapestMovementPath,
    computeBresenhamLine
};