import { WorldLevel } from './worldLevelClass.js';
import { Structure } from '../structure/structureClass.js';
import { TurnQueue } from '../gameTime.js';
import { Entity, DEFAULT_ACTION_COST } from '../entity/entityClass.js';
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
import { devTrace, constrainValue, rollDice, valueCalc } from '../util.js';
import { GAME_STATE } from '../gameStateClass.js';
import { uiPaneMessages, uiPaneInfo } from "../ui/ui.js";
import { WorldLevelSpecification } from './worldLevelSpecificationClass.js';



jest.mock('../util.js', () => ({
  devTrace: jest.fn(),
  constrainValue: jest.fn((value, min, max) => Math.max(min, Math.min(max, value))),
  rollDice: jest.requireActual('../util.js').rollDice,
  valueCalc: jest.requireActual('../util.js').valueCalc,
  generateId: jest.requireActual('../util.js').generateId,
}));

jest.mock('../ui/ui.js', () => ({
  uiPaneMessages: {addMessage: jest.fn()},
  uiPaneInfo: { setInfo: jest.fn()},
}));

const WORLD_LEVEL_SPECS_FOR_TESTING= [
  WorldLevelSpecification.generateWorldLevelSpec({type: 'EMPTY', width: 10, height: 10}),
  WorldLevelSpecification.generateWorldLevelSpec({type: 'EMPTY', width: 15, height: 15}),
];

describe('WorldLevel Integration Tests', () => {
  let worldLevel;

  beforeEach(() => {
    GAME_STATE.reset();
    GAME_STATE.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
    worldLevel = GAME_STATE.world[0];
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
    const lowerWorldLevel = GAME_STATE.world[1];

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

    GAME_STATE.avatar.addTimeOnLevel(10);
    expect(GAME_STATE.avatar.timeOnLevel).toBe(10);

    worldLevel.handleAvatarEnteringLevel(worldLevel.grid[0][0]);
    expect(worldLevel.levelEntities).toContain(GAME_STATE.avatar);
    expect(worldLevel.grid[0][0].entity).toBe(GAME_STATE.avatar);
    expect(GAME_STATE.avatar.timeOnLevel).toBe(0);
    expect(uiPaneMessages.addMessage).toHaveBeenCalledWith(`You enter level ${worldLevel.levelNumber + 1}`);
    expect(uiPaneInfo.setInfo).toHaveBeenCalled();
  });

});