import { Entity } from "./entityClass.js";
import { WorldLevel } from "./worldLevelClass.js";

const gameState = {
  score: 0,
  currentLevel: 0,
  isPlaying: false,
  world: [],
  avatar: null
};

function initializeGameState(levelDimensions) {
  gameState.world = levelDimensions.map(([width, height], index) => new WorldLevel(index, width, height));
  
  const firstLevel = gameState.world[0];
  firstLevel.addStairsDown();
  const centerX = Math.floor(firstLevel.levelWidth / 2);
  const centerY = Math.floor(firstLevel.levelHeight / 2);
  
  // set up the avatar
  const floorCell = firstLevel.findEmptyCellTerrainNearPlace("FLOOR", centerX, centerY, firstLevel.grid);
  const avatarX = floorCell ? floorCell.x : centerX;
  const avatarY = floorCell ? floorCell.y : centerY;  
  const avatar = new Entity(avatarX, avatarY, 0, "player", "@");
  avatar.viewRadius = 9;
  gameState.avatar = avatar;
  avatar.determineVisibleCells(gameState);

}

function getAvatarCell() {
  // return gameState.world[gameState.avatar.z].grid[gameState.avatar.x][gameState.avatar.y]
  return gameState.avatar.getCell();
}

export { gameState, initializeGameState, getAvatarCell };

