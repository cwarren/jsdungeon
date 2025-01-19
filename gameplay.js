import { Entity } from "./entityClass.js";
import { WorldLevel } from "./worldLevelClass.js";

const gameState = {
  score: 0,
  currentLevel: 1,
  isPlaying: false,
  world: [],
  avatar: null
};

function initializeGameState(levelDimensions) {
  gameState.world = levelDimensions.map(([width, height], index) => new WorldLevel(index + 1, width, height));
  
  const firstLevel = gameState.world[0];
  const centerX = Math.floor(firstLevel.levelWidth / 2);
  const centerY = Math.floor(firstLevel.levelHeight / 2);
  
  // Find a FLOOR cell near the center
  const floorCell = firstLevel.findCellTerrainNearPlace("FLOOR", centerX, centerY, firstLevel.grid);
  const avatarX = floorCell ? floorCell.x : centerX;
  const avatarY = floorCell ? floorCell.y : centerY;
  
  gameState.avatar = new Entity(avatarX, avatarY, 1, "player", "@");
}

export { gameState, initializeGameState };

