import { WorldLevel } from './worldLevelClass';
import { Structure } from './structureClass';
import { devTrace, constrainValue } from './util';
import { TurnQueue } from './gameTime';
import { Entity, DEFAULT_ACTION_COST } from './entityClass';
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
} from './gridGeneration';
import {
  getRandomEmptyCellOfTerrainInGrid,
  determineCellViewability,
} from './gridUtils';

jest.mock('./util', () => ({
  devTrace: jest.fn(),
  constrainValue: jest.fn((value, min, max) => Math.max(min, Math.min(max, value))),
}));

jest.mock('./gridGeneration', () => ({
  setWorldLevelForGridCells: jest.fn(),
  generateGrid_empty: jest.fn(() => []),
  generateGrid_random: jest.fn(() => []),
  generateGrid_caves: jest.fn(() => []),
  generateGrid_caves_shattered: jest.fn(() => []),
  generateGrid_caves_large: jest.fn(() => []),
  generateGrid_caves_huge: jest.fn(() => []),
  generateGrid_burrow: jest.fn(() => []),
  generateGrid_nest: jest.fn(() => []),
  generateGrid_roomsAndCorridors_random: jest.fn(() => []),
  generateGrid_roomsAndCorridors_subdivide: jest.fn(() => []),
  generateGrid_town: jest.fn(() => []),
  generateGrid_puddles: jest.fn(() => []),
}));

jest.mock('./gridUtils', () => ({
  getRandomEmptyCellOfTerrainInGrid: jest.fn(() => ({ x: 0, y: 0, z: 0, entity: null, isTraversible: true })),
  determineCellViewability: jest.fn(),
}));

jest.mock('./gameTime', () => ({
  TurnQueue: jest.fn().mockImplementation(() => ({
    addEntity: jest.fn(),
    addEntityAtBeginningOfTurnQueue: jest.fn(),
    removeEntity: jest.fn(),
    runTimeFor: jest.fn(),
    elapsedTime: 0,
    queue: [],
  })),
}));

jest.mock('./entityClass', () => ({
  Entity: jest.fn().mockImplementation(() => ({
    type: 'RAT_INSIDIOUS',
    placeAtCell: jest.fn(),
    getCell: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
  })),
  DEFAULT_ACTION_COST: 100,
}));

describe('WorldLevel', () => {
  let gameState;
  let worldLevel;

  beforeEach(() => {
    gameState = {
      avatar: {
        timeOnLevel: 0,
        resetTimeOnLevel: jest.fn(),
        placeAtCell: jest.fn(),
      },
      setTurnQueue: jest.fn(),
    };
    worldLevel = new WorldLevel(gameState, 1, 10, 10, 'EMPTY');
  });

  test('should initialize with correct values', () => {
    expect(worldLevel.gameState).toBe(gameState);
    expect(worldLevel.levelNumber).toBe(1);
    expect(worldLevel.levelWidth).toBe(10);
    expect(worldLevel.levelHeight).toBe(10);
    expect(worldLevel.grid).toBeNull();
    expect(worldLevel.levelType).toBe('EMPTY');
    expect(worldLevel.levelEntities).toEqual([]);
    expect(worldLevel.levelStructures).toEqual([]);
    expect(worldLevel.stairsDown).toBeNull();
    expect(worldLevel.stairsUp).toBeNull();
    expect(worldLevel.turnQueue).toEqual(expect.objectContaining({
      addEntity: expect.any(Function),
      addEntityAtBeginningOfTurnQueue: expect.any(Function),
      removeEntity: expect.any(Function),
      runTimeFor: expect.any(Function),
      elapsedTime: expect.any(Number),
      queue: expect.any(Array),
    }));
    expect(worldLevel.timeOfAvatarDeparture).toBe(0);
  });

  test('should generate grid and set world level for grid cells', () => {
    worldLevel.generateGrid();
    expect(generateGrid_empty).toHaveBeenCalledWith(10, 10);
    expect(setWorldLevelForGridCells).toHaveBeenCalledWith(worldLevel, []);
    expect(determineCellViewability).toHaveBeenCalledWith([]);
    expect(worldLevel.grid).toEqual([]);
  });

  test('should populate level with entities', () => {
    worldLevel.placeEntityRandomly = jest.fn();
    worldLevel.populate();
    expect(worldLevel.placeEntityRandomly).toHaveBeenCalled();
  });

  test('should place entity randomly', () => {
    const entity = new Entity('RAT_INSIDIOUS');
    worldLevel.addEntity = jest.fn();
    worldLevel.placeEntityRandomly(entity);
    expect(getRandomEmptyCellOfTerrainInGrid).toHaveBeenCalledWith('FLOOR', worldLevel.grid);
    expect(worldLevel.addEntity).toHaveBeenCalledWith(entity, { x: 0, y: 0, z: 0, entity: null, isTraversible: true });
  });

  test('should add entity to level', () => {
    const entity = new Entity('RAT_INSIDIOUS');
    worldLevel.addEntity(entity);
    expect(worldLevel.levelEntities).toContain(entity);
    expect(entity.placeAtCell).toHaveBeenCalled();
    expect(worldLevel.turnQueue.addEntity).toHaveBeenCalledWith(entity);
  });

  test('should add entity at beginning of turn queue', () => {
    const entity = new Entity('RAT_INSIDIOUS');
    worldLevel.addEntityAtBeginningOfTurnQueue(entity);
    expect(worldLevel.levelEntities).toContain(entity);
    expect(entity.placeAtCell).toHaveBeenCalled();
    expect(worldLevel.turnQueue.addEntityAtBeginningOfTurnQueue).toHaveBeenCalledWith(entity);
  });

  test('should remove entity from level', () => {
    const entity = new Entity('RAT_INSIDIOUS');
    worldLevel.levelEntities.push(entity);
    worldLevel.removeEntity(entity);
    expect(worldLevel.levelEntities).not.toContain(entity);
    expect(worldLevel.turnQueue.removeEntity).toHaveBeenCalledWith(entity);
  });

  test('should add stairs down', () => {
    worldLevel.addStairsDown();
    expect(getRandomEmptyCellOfTerrainInGrid).toHaveBeenCalledWith('FLOOR', worldLevel.grid);
    expect(worldLevel.stairsDown).toBeInstanceOf(Structure);
    expect(worldLevel.levelStructures).toContain(worldLevel.stairsDown);
  });

  test('should add stairs up and connect to stairs down', () => {
    const stairsDown = new Structure(0, 0, 1, 'STAIRS_DOWN', '>');
    worldLevel.addStairsUpTo(stairsDown);
    expect(getRandomEmptyCellOfTerrainInGrid).toHaveBeenCalledWith('FLOOR', worldLevel.grid);
    expect(worldLevel.stairsUp).toBeInstanceOf(Structure);
    expect(worldLevel.levelStructures).toContain(worldLevel.stairsUp);
    expect(stairsDown.connectsTo).toBe(worldLevel.stairsUp);
    expect(worldLevel.stairsUp.connectsTo).toBe(stairsDown);
  });

  test('should track avatar departure time', () => {
    worldLevel.trackAvatarDepartureTime();
    expect(worldLevel.timeOfAvatarDeparture).toBe(0);
  });

  test('should handle avatar entering level', () => {
    const entryCell = { x: 0, y: 0, z: 0 };
    worldLevel.handleAvatarEnteringLevel(entryCell);
    expect(constrainValue).toHaveBeenCalledWith(0, 0, DEFAULT_ACTION_COST * 100);
    expect(gameState.avatar.resetTimeOnLevel).toHaveBeenCalled();
    expect(gameState.setTurnQueue).toHaveBeenCalledWith(worldLevel.turnQueue);
    expect(worldLevel.turnQueue.runTimeFor).not.toHaveBeenCalled();
    expect(worldLevel.levelEntities).toContain(gameState.avatar);
    expect(gameState.avatar.placeAtCell).toHaveBeenCalledWith(entryCell);
    expect(gameState.avatar.actionStartingTime).toBe(0);
  });
});