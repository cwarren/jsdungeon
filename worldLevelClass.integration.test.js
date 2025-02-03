import { WorldLevel } from './worldLevelClass.js';
import { Structure } from './structureClass.js';
import { TurnQueue } from './gameTime.js';
import { Entity, DEFAULT_ACTION_COST } from './entityClass.js';
import {
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
  generateGrid_puddles,
} from './gridGeneration.js';
import {
  getRandomEmptyCellOfTerrainInGrid,
  determineCellViewability,
} from './gridUtils.js';
import { devTrace, constrainValue, rollDice } from './util.js';
import { gameState } from './gameStateClass.js';
import { uiPaneMessages } from "./ui.js";



jest.mock('./util.js', () => ({
  devTrace: jest.fn(),
  constrainValue: jest.fn((value, min, max) => Math.max(min, Math.min(max, value))),
  rollDice: jest.requireActual('./util.js').rollDice,
}));

jest.mock('./ui.js', () => ({
  uiPaneMessages: {addMessage: jest.fn()},
}));

describe('WorldLevel Integration Tests', () => {
  let worldLevel;

  beforeEach(() => {
    gameState.reset();
    gameState.initialize([[10, 10, 'EMPTY'], [15, 15, 'EMPTY']]);
    worldLevel = gameState.world[0];
  });

  test('on generation should generate grid and populate level', () => {
    // worldLevel.generateGrid();
    worldLevel.generate();
    expect(worldLevel.grid).not.toBeNull();
    expect(worldLevel.grid.length).toBe(10);
    expect(worldLevel.grid[0].length).toBe(10);
    expect(worldLevel.levelEntities.length).toBeGreaterThan(0);
    expect(worldLevel.levelStructures.length).toBeGreaterThan(0);
    expect(worldLevel.stairsDown).not.toBeNull();
    expect(worldLevel.stairsUp).toBeNull();
  });

  test('should add and remove entities correctly', () => {
    const entity = new Entity('RAT_INSIDIOUS');
    worldLevel.addEntity(entity, worldLevel.grid[0][0]);
    expect(worldLevel.levelEntities).toContain(entity);
    expect(worldLevel.grid[0][0].entity).toBe(entity);

    worldLevel.removeEntity(entity);
    expect(worldLevel.levelEntities).not.toContain(entity);
  });

  test('should handle stairs correctly on level generation', () => {
    const lowerWorldLevel = gameState.world[1];

    worldLevel.generate();
    expect(worldLevel.stairsUp).toBeNull();
    expect(worldLevel.stairsDown).not.toBeNull();
    expect(worldLevel.stairsDown.connectsTo).toBeNull();

    lowerWorldLevel.generate();
    expect(worldLevel.stairsDown.connectsTo).toBe(lowerWorldLevel.stairsUp);
    expect(lowerWorldLevel.stairsUp).not.toBeNull();
    expect(lowerWorldLevel.stairsUp.connectsTo).toBe(worldLevel.stairsDown);
    expect(lowerWorldLevel.stairsDown).toBeNull();
  });

  test('should track avatar departure and handle avatar entering level', () => {
    worldLevel.trackAvatarDepartureTime();
    expect(worldLevel.timeOfAvatarDeparture).toBe(0);

    gameState.avatar.addTimeOnLevel(10);
    expect(gameState.avatar.timeOnLevel).toBe(10);

    worldLevel.handleAvatarEnteringLevel(worldLevel.grid[0][0]);
    expect(worldLevel.levelEntities).toContain(gameState.avatar);
    expect(worldLevel.grid[0][0].entity).toBe(gameState.avatar);
    expect(gameState.avatar.timeOnLevel).toBe(0);
    expect(uiPaneMessages.addMessage).toHaveBeenCalledWith(`You enter level ${worldLevel.levelNumber + 1}`);
  });

});