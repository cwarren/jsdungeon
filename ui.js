import { gameState } from "./gameStateClass.js";
import { executeGameCommand, keyBinding, actionMaps } from "./gameCommands.js";
import { uiActionsMap } from "./uiActions.js";
// import {advanceGameTime} from "./gameTime.js";
import { TextBlock } from "./textBlockClass.js";
import { createHelpText } from "./util.js";

// On page load, initialize the game state, then draw it, then start game turns

// level width, level height, level gen type
const worldLevelSpecifications = [
  [15, 10, "EMPTY"], 
  [30, 20, "TOWN"], 
  [30, 20, "ROOMS_SUBDIVIDE"], 
  [30, 20, "ROOMS_RANDOM"], 
  [30, 20, "PUDDLES"], 
  [30, 20, "BURROW"], 
  [30, 20, "NEST"], 
  [30, 20, "CAVES_SHATTERED"], 
  [30, 20, "CAVES"], 
  [30, 20, "CAVES_LARGE"], 
  [30, 20, "CAVES_HUGE"], 
  [30, 20, "EMPTY"], 
  [30, 20, "RANDOM"], 
];

function initializeGameWorld() { // this is a hack until I pull this stuff out to a better location
  gameState.initialize(worldLevelSpecifications);
}
initializeGameWorld();

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


const helpTextBlocks = {};
function initializeHelpTextBlocks(keyBindings, actionMaps) {
    for (const commandSet in keyBindings) {
        if (actionMaps[commandSet]) {
            helpTextBlocks[commandSet] = new TextBlock(createHelpText(keyBindings[commandSet], actionMaps[commandSet], uiActionsMap));
        }
    }
}
initializeHelpTextBlocks(keyBinding, actionMaps);
console.log("helpTextBlocks", helpTextBlocks);

let uiStateStack = ["GAME_META","GAMEPLAY"];  // Stack starts with gameplay as the default state

// Function to get the current UI state
function getCurrentUIState() {
    return uiStateStack.length > 0 ? uiStateStack[uiStateStack.length - 1] : "GAMEPLAY";
}

// Function to push a new state onto the stack
function pushUIState(newState) {
    uiStateStack.push(newState);
    resizeCanvas();  // Redraw to reflect new state
}

// Function to pop the top state off the stack
function popUIState() {
    if (uiStateStack.length > 1) {  // Prevent popping the last state
        uiStateStack.pop();
        resizeCanvas();  // Redraw to reflect new state
    }
}

// Function to clear the stack and set a single state
function setUIState(newState) {
    uiStateStack = [newState];
    resizeCanvas();  // Redraw to reflect new state
}

function resetUIState() {
  uiStateStack = ["GAME_META"];
}

// Avatar movement path
let avatarMovementPath = [];

// Function to resize canvas and redraw game
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.9;
  drawUI();
}

const uiStates = [
  "GAMEPLAY",
  "CHARACTER_SHEET",
  "INVENTORY",
  "EQUIPMENT",
  "MAP_SCREEN",
  "GAME_META",
  "GAME_OVER",
  "PROSE_SECTION",
  "CUSTOM_GRAPHICS",
];

// Draw the UI function (blank black canvas)
function drawUI() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  switch (getCurrentUIState()) {
    case "GAMEPLAY":
      drawGame(gameState);
      break;
    case "CHARACTER_SHEET":
      drawCharacterSheet(gameState);
      break;
    case "INVENTORY":
      drawInventory(gameState);
      break;
    case "EQUIPMENT":
      drawEquipment(gameState);
      break;
    case "GAME_META":
      drawGameMeta();
      break;
    case "GAME_OVER":
      drawGameOver();
      break;
    case "PROSE_SECTION":
      drawProseSection(gameState);
      break;
    case "HELP":
      console.log("uiStateStack", uiStateStack);
      drawHelp();
      break;
    case "MAP_SCREEN":
      drawMapScreen(gameState);
      break;
    case "CUSTOM_GRAPHICS":
      drawCustomGraphics(gameState);
      break;
  }
}

// Function to draw the world level
function drawWorldLevel(worldLevel) {
  // console.log("gameState", gameState);
  drawWorldLevelGrid(worldLevel);
  drawWorldLevelStructures(worldLevel);
  drawWorldLevelItems(worldLevel);
  drawWorldLevelEntities(worldLevel);
//   drawAvatarMovementPath();
}

function drawGridCell(cell, offsetX, offsetY, cellSize, gridSpacing) {
    ctx.fillStyle = cell.color;
    ctx.fillRect(
      offsetX + cell.x * (cellSize + gridSpacing),
      offsetY + cell.y * (cellSize + gridSpacing),
      cellSize,
      cellSize
    );
}

function drawGridCellFaint(cell, offsetX, offsetY, cellSize, gridSpacing) {
  ctx.fillStyle = cell.color;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(
    offsetX + cell.x * (cellSize + gridSpacing),
    offsetY + cell.y * (cellSize + gridSpacing),
    cellSize,
    cellSize
  );
  ctx.globalAlpha = 1;
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
            const cell = worldLevel.grid[col][row];
            if (gameState.avatar.visibleCells.has(cell)) {
                drawGridCell(cell, offsetX, offsetY, cellSize, gridSpacing);
            } else if (gameState.avatar.seenCells.has(cell)) {
                drawGridCellFaint(cell, offsetX, offsetY, cellSize, gridSpacing);
            }
        }
    }
  }

// Stub functions for additional world level elements
function drawWorldLevelStructures(worldLevel) {
  const cellSize = uiSettings.baseCellSize * uiSettings.zoomFactor;
  const gridSpacing = uiSettings.gridCellSpacing;
  const offsetX = (canvas.width - (worldLevel.levelWidth * (cellSize + gridSpacing))) / 2;
  const offsetY = (canvas.height - (worldLevel.levelHeight * (cellSize + gridSpacing))) / 2;

  // Draw all structures in the level
  worldLevel.levelStructures.forEach(structure => {
    const structureCell = structure.getCell();
    if (gameState.avatar.visibleCells.has(structureCell) || gameState.avatar.seenCells.has(structureCell)) {
      drawStructureInWorldLevel(structure, offsetX, offsetY, cellSize, gridSpacing);
    }
  });
}

// Function to draw an entity in the world level
function drawStructureInWorldLevel(structure, offsetX, offsetY, cellSize, gridSpacing) {
  ctx.fillStyle = "white";
  ctx.font = `${cellSize * 0.8}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    structure.displaySymbol,
    offsetX + structure.x * (cellSize + gridSpacing) + cellSize / 2,
    offsetY + structure.y * (cellSize + gridSpacing) + cellSize / 2
  );
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
    if (entity.isVisibleTo(gameState.avatar)) {
      drawEntityInWorldLevel(entity, offsetX, offsetY, cellSize, gridSpacing);
    }
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
        console.log("Clicked Cell Adjacencies:", clickedCell.getAdjacentCells());
    
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
    console.log("key event", event);
      pressedKeys.add(event.key);
      executeGameCommand(event.key, event);
      resizeCanvas(); // Redraw game after executing a command
  }
});

window.addEventListener("keyup", (event) => {
  pressedKeys.delete(event.key);
});


// Function to draw the game
function drawGame(gameState) {
  if (!gameState || !gameState.world || gameState.world.length === 0) return;

  const currentLevel = gameState.world.find(level => level.levelNumber === gameState.currentLevel);
  if (!currentLevel) return;

  drawWorldLevel(currentLevel);
}

function drawCharacterSheet() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("ui state: CHARACTER_SHEET", 50, 50);
}

function drawInventory() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("ui state: INVENTORY", 50, 50);
}

function drawEquipment() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("ui state: EQUIPMENT", 50, 50);
}

function drawGameMeta() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("ui state: GAME_META", 50, 50);
}

function drawGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("ui state: GAME_OVER", 50, 50);
  let gameStateMessage = "You won! :)";
  if (gameState.status == "LOST") { gameStateMessage = "You lost. :("; }
  if (gameState.status == "ABANDONED") { gameStateMessage = "You abandoned that game."; }
  ctx.fillText(gameStateMessage, 100, 100);
}

function drawProseSection() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("ui state: PROSE_SECTION", 50, 50);
}

function drawHelp() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  const lineHeight = 24; // Space between lines
  const startX = 50;
  let startY = 50;

  const helpFor = uiStateStack[uiStateStack.length - 2]; // help is always in the context of the screen in which it was called
  const helpTextBlock = helpTextBlocks[helpFor];

  if (!helpTextBlock) {
      ctx.fillText("No help text available", startX, startY);
      return;
  }

  const displayTextRows = helpTextBlock.getDisplayTextRows();
  
  for (let i = 0; i < displayTextRows.length; i++) {
      if (startY + lineHeight > canvas.height) break; // Stop drawing if the current line would go below the bottom of the canvas
      ctx.fillText(displayTextRows[i], startX, startY);
      startY += lineHeight;
  }
}


function drawMapScreen() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("ui state: MAP_SCREEN", 50, 50);
}

function drawCustomGraphics() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("ui state: CUSTOM_GRAPHICS", 50, 50);
}

// Adjust canvas size and redraw game on window resize
window.addEventListener("resize", resizeCanvas);

// Now that gameState and canvas and such are set up, render the game
resizeCanvas();

gameState.advanceGameTime();

export { initializeGameWorld, resizeCanvas, drawGame, uiSettings, pushUIState, popUIState, setUIState, resetUIState, getCurrentUIState };
