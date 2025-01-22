import { Entity } from "./entityClass.js";
import { WorldLevel } from "./worldLevelClass.js";
import {initializeTurnSystem} from "./gameTime.js";

const gameState = {
  score: 0,
  currentLevel: 0,
  isPlaying: false,
  world: [],
  avatar: null
};

function initializeGameState(levelSpecifications) {
  gameState.world = levelSpecifications.map(([width, height, genOption], index) => new WorldLevel(index, width, height, genOption));
  gameState.world[0].generate();

  const firstLevel = gameState.world[0];
  if (gameState.world.length > 1) {
    firstLevel.addStairsDown();
  }

  setUpAvatar(firstLevel);

  populateLevelWithEntities(firstLevel);

  initializeTurnSystem();
}

function setUpAvatar(initialFloor) {
  const avatar = new Entity("AVATAR");
  initialFloor.placeEntityRandomly(avatar);

  gameState.avatar = avatar;
  avatar.determineVisibleCells();
}

function populateLevelWithEntities(worldLevel) {
  for (let i = 0; i<5; i++) {
    const ent = new Entity("MOLD_PALE");
    worldLevel.placeEntityRandomly(ent);
  }
}

function getAvatarCell() {
  return gameState.avatar.getCell();
}

export { gameState, initializeGameState, getAvatarCell };

