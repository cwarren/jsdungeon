import { gameState, initializeGameState } from "./gameplay.js";
import { executeCommand } from "./gameCommands.js";

// On page load, initialize the game state, then draw it

// Define the level dimensions
const levelDimensions = [
  [60, 40], // Level 1: 20x20 grid
//   [15, 15]  // Level 2: 15x15 grid
];

// Initialize the game state
initializeGameState(levelDimensions);

// Create and initialize the canvas
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// Style the canvas container to center it
canvas.style.position = "absolute";
canvas.style.top = "50%";
canvas.style.left = "50%";
canvas.style.transform = "translate(-50%, -50%)";

// UI settings
const uiSettings = {
    zoomFactorMin: 0.3,
    zoomFactorMax: 3,
    zoomFactor: .5,
    baseCellSize: 30,
    gridCellSpacing: 1
};

// Avatar movement path
let avatarMovementPath = [];

// Function to resize canvas and redraw game
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.9;
  drawUI();
  drawGame(gameState);
}

// Draw the UI function (blank black canvas)
function drawUI() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Function to draw the world level
function drawWorldLevel(worldLevel) {
  drawWorldLevelGrid(worldLevel);
  drawWorldLevelStructures(worldLevel);
  drawWorldLevelItems(worldLevel);
  drawWorldLevelEntities(worldLevel);
//   drawAvatarMovementPath();
}

// Function to draw a single grid cell
// function drawGridCell(cell, offsetX, offsetY, cellSize, gridSpacing) {
//     ctx.fillStyle = "#333"; // Dark grey for grid cells
//     ctx.fillRect(
//       offsetX + cell.x * (cellSize + gridSpacing),
//       offsetY + cell.y * (cellSize + gridSpacing),
//       cellSize,
//       cellSize
//     );
//   }

function drawGridCell(cell, offsetX, offsetY, cellSize, gridSpacing) {
    // Set fill color based on terrain type
    // console.log("drawing cell ",cell);
    ctx.fillStyle = cell.color;
    ctx.fillRect(
      offsetX + cell.x * (cellSize + gridSpacing),
      offsetY + cell.y * (cellSize + gridSpacing),
      cellSize,
      cellSize
    );
}

// Function to draw the game grid
function drawWorldLevelGrid(worldLevel) {
    const cellSize = uiSettings.baseCellSize * uiSettings.zoomFactor;
    const gridSpacing = uiSettings.gridCellSpacing;
    const offsetX = (canvas.width - (worldLevel.levelWidth * (cellSize + gridSpacing))) / 2;
    const offsetY = (canvas.height - (worldLevel.levelHeight * (cellSize + gridSpacing))) / 2;
  
    for (let col = 0; col < worldLevel.levelWidth; col++) {
        for (let row = 0; row < worldLevel.levelHeight; row++) {   
            // console.log(`drawing cell at ${col}, ${row}`, worldLevel.grid[col][row]);     
            drawGridCell(worldLevel.grid[col][row], offsetX, offsetY, cellSize, gridSpacing);
        }
    }
  }

// Stub functions for additional world level elements
function drawWorldLevelStructures(worldLevel) {
  // Placeholder for drawing structures
}

function drawWorldLevelItems(worldLevel) {
  // Placeholder for drawing items
}

// Function to draw an entity in the world level
function drawEntityInWorldLevel(entity, offsetX, offsetY, cellSize, gridSpacing) {
  ctx.fillStyle = "white";
  ctx.font = `${cellSize * 0.8}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    entity.displaySymbol,
    offsetX + entity.x * (cellSize + gridSpacing) + cellSize / 2,
    offsetY + entity.y * (cellSize + gridSpacing) + cellSize / 2
  );
}

// Function to draw all entities in the level
function drawWorldLevelEntities(worldLevel) {
  const cellSize = uiSettings.baseCellSize * uiSettings.zoomFactor;
  const gridSpacing = uiSettings.gridCellSpacing;
  const offsetX = (canvas.width - (worldLevel.levelWidth * (cellSize + gridSpacing))) / 2;
  const offsetY = (canvas.height - (worldLevel.levelHeight * (cellSize + gridSpacing))) / 2;

  // Draw all entities in the level
  worldLevel.levelEntities.forEach(entity => {
    drawEntityInWorldLevel(entity, offsetX, offsetY, cellSize, gridSpacing);
  });

  // Draw the avatar if it's in this world level
  const avatar = gameState.avatar;
  if (avatar && avatar.z === worldLevel.levelNumber) {
    drawEntityInWorldLevel(avatar, offsetX, offsetY, cellSize, gridSpacing);
  }
}

// Function to draw the avatar movement path
function drawAvatarMovementPath() {
    // console.log('drawing avatar movement path');
    if (avatarMovementPath.length === 0) return;
  
    const cellSize = uiSettings.baseCellSize * uiSettings.zoomFactor;
    const gridSpacing = uiSettings.gridCellSpacing;
    const currentLevel = gameState.world.find(level => level.levelNumber === gameState.currentLevel);
    if (!currentLevel) return;
  
    const offsetX = (canvas.width - (currentLevel.levelWidth * (cellSize + gridSpacing))) / 2;
    const offsetY = (canvas.height - (currentLevel.levelHeight * (cellSize + gridSpacing))) / 2;
  
    ctx.fillStyle = "red";
    avatarMovementPath.forEach(cell => {
      const x = offsetX + cell.x * (cellSize + gridSpacing) + cellSize / 2;
      const y = offsetY + cell.y * (cellSize + gridSpacing) + cellSize / 2;
      ctx.beginPath();
      ctx.arc(x, y, cellSize * 0.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

// Function to detect and log clicked grid cell
canvas.addEventListener("click", (event) => {
    const currentLevel = gameState.world.find(level => level.levelNumber === gameState.currentLevel);
    if (!currentLevel) return;
  
    const cellSize = uiSettings.baseCellSize * uiSettings.zoomFactor;
    const gridSpacing = uiSettings.gridCellSpacing;
    const offsetX = (canvas.width - (currentLevel.levelWidth * (cellSize + gridSpacing))) / 2;
    const offsetY = (canvas.height - (currentLevel.levelHeight * (cellSize + gridSpacing))) / 2;
  
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
  
    const col = Math.floor((mouseX - offsetX) / (cellSize + gridSpacing));
    const row = Math.floor((mouseY - offsetY) / (cellSize + gridSpacing));
  
    if (col >= 0 && col < currentLevel.levelWidth && row >= 0 && row < currentLevel.levelHeight) {
        // console.log(`###### clicked at ${col} ${row}`);
        const clickedCell = currentLevel.grid[col][row];
        console.log("Clicked Cell:", clickedCell);
    
        // Check if the avatar is in the clicked cell
        const avatar = gameState.avatar;
        if (avatar.x === col && avatar.y === row && avatar.z === currentLevel.levelNumber) {
            console.log("Avatar is in the clicked cell:", avatar);
            avatarMovementPath = []; // Reset movement path if clicking the avatar's cell
        } else {
            // avatarMovementPath = determineCheapestMovementPath(currentLevel.grid[avatar.y][avatar.x], clickedCell, currentLevel);
            console.log("Computed movement path:", avatarMovementPath);
        }
        resizeCanvas();
    }
});


// Track pressed keys to prevent repeat events
let pressedKeys = new Set();

// Capture keyboard input, execute commands, and prevent repeat events
window.addEventListener("keydown", (event) => {
  if (!pressedKeys.has(event.key)) {
      pressedKeys.add(event.key);
      executeCommand(event.key);
      resizeCanvas(); // Redraw game after executing a command
  }
});

window.addEventListener("keyup", (event) => {
  pressedKeys.delete(event.key);
});

function determineCheapestMovementPath(startCell, endCell, worldLevel) {
    // // Calculate Manhattan distance
    const manhattanDistance = Math.abs(startCell.x - endCell.x) + Math.abs(startCell.y - endCell.y);

    // // Short-circuit if the Manhattan distance is more than 12
    // if (manhattanDistance > 12) {
    //     return [];
    // }

    if (!endCell.isTraversible) {
        return []; // No path possible to non-traversible places
    }

    const orthogonalDirections = [
        { dx: 0, dy: -1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }
    ];
    const diagonalDirections = [
        { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
    ];

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
        for (const { dx, dy } of orthogonalDirections) {
            tryMove(dx, dy, currentNode.cell.entryMovementCost);
        }

        for (const { dx, dy } of diagonalDirections) {
            tryMove(dx, dy, currentNode.cell.entryMovementCost * 1.4);
        }
    }

    return []; // No path found
}


// Function to draw the game
function drawGame(gameState) {
  if (!gameState || !gameState.world || gameState.world.length === 0) return;

  const currentLevel = gameState.world.find(level => level.levelNumber === gameState.currentLevel);
  if (!currentLevel) return;

  drawWorldLevel(currentLevel);
}

// Adjust canvas size and redraw game on window resize
window.addEventListener("resize", resizeCanvas);

// Now that gameState and canvas and such are set up, render the game
resizeCanvas();

export { resizeCanvas, drawGame, uiSettings };
