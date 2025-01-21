function applyCellularAutomataSmoothing(grid, terrainToSmooth = "WALL") {
    let newGrid = generateGrid_empty();
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


// uses A-star algorithm
function determineCheapestMovementPath(startCell, endCell, worldLevel) {
    // // Calculate Manhattan distance
    const manhattanDistance = Math.abs(startCell.x - endCell.x) + Math.abs(startCell.y - endCell.y);

    if (!endCell.isTraversible) {
        return []; // No path possible to non-traversible places
    }

    class Node {
        constructor(cell, parent, g, h) {
            this.cell = cell;
            this.parent = parent;
            this.g = g; // Cost from start node
            this.h = h; // Heuristic (Manhattan distance)
            this.f = g + h; // Total cost
        }
    }

    const openSet = new Map(); // Stores nodes to be evaluated
    const closedSet = new Set(); // Stores evaluated nodes
    const startNode = new Node(startCell, null, 0, manhattanDistance);
    openSet.set(`${startCell.x},${startCell.y}`, startNode);

    while (openSet.size > 0) {
        // Find node with the lowest f-cost
        let currentNode = [...openSet.values()].reduce((a, b) => (a.f < b.f ? a : b));

        if (currentNode.cell === endCell) {
            // Path found, reconstruct it
            let path = [];
            while (currentNode) {
                path.push(currentNode.cell);
                currentNode = currentNode.parent;
            }
            return path.reverse();
        }

        openSet.delete(`${currentNode.cell.x},${currentNode.cell.y}`);
        closedSet.add(`${currentNode.cell.x},${currentNode.cell.y}`);

        const tryMove = (dx, dy, movementCost) => {
            const newX = currentNode.cell.x + dx;
            const newY = currentNode.cell.y + dy;

            if (newX < 0 || newX >= worldLevel.levelWidth || newY < 0 || newY >= worldLevel.levelHeight) {
                return;
            }

            const neighbor = worldLevel.grid[newY][newX];

            if (!neighbor.isTraversible || closedSet.has(`${newX},${newY}`)) {
                return;
            }

            const g = currentNode.g + movementCost;
            const h = Math.abs(newX - endCell.x) + Math.abs(newY - endCell.y);
            const f = g + h;

            if (!openSet.has(`${newX},${newY}`) || openSet.get(`${newX},${newY}`).g > g) {
                openSet.set(`${newX},${newY}`, new Node(neighbor, currentNode, g, h));
            }
        };

        // Prioritize orthogonal moves over diagonal moves
        for (const { dx, dy } of GridCell.ADJACENCY_DIRECTIONS_ORTHOGONAL) {
            tryMove(dx, dy, currentNode.cell.entryMovementCost);
        }

        for (const { dx, dy } of GridCell.ADJACENCY_DIRECTIONS_DIAGONAL) {
            tryMove(dx, dy, currentNode.cell.entryMovementCost * 1.4);
        }
    }

    return []; // No path found
}
