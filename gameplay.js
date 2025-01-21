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

  setUpAvatar(firstLevel);
}

function setUpAvatar(initialFloor) {
  const avatar = new Entity("AVATAR");
  avatar.placeRandomlyInWorldLevel(initialFloor);

  gameState.avatar = avatar;
  avatar.determineVisibleCells();
}

function getAvatarCell() {
  return gameState.avatar.getCell();
}

export { gameState, initializeGameState, getAvatarCell };

