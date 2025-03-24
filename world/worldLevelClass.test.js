import { WorldLevel } from './worldLevelClass.js';
import { Structure } from '../structure/structureClass.js';
import { Stairs } from '../structure/stairsClass.js';
import { devTrace, constrainValue } from '../util.js';
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
import { rollDice } from '../util.js';
import { uiPaneMessages, uiPaneInfo } from "../ui/ui.js";
import { WorldLevelSpecification } from './worldLevelSpecificationClass.js';
import { Repository } from '../repositoryClass.js';
import { GridCell } from './gridCellClass.js';

jest.mock('../util.js', () => ({
  devTrace: jest.fn(),
  // devTrace: jest.requireActual('../util.js').devTrace,
  constrainValue: jest.fn((value, min, max) => Math.max(min, Math.min(max, value))),
  generateId: jest.requireActual('../util.js').generateId,
}));

jest.mock('./gridGeneration', () => ({
  setWorldLevelForGridCells: jest.requireActual('./gridGeneration.js').setWorldLevelForGridCells,
  generateGrid_empty: jest.requireActual('./gridGeneration.js').generateGrid_empty,
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

jest.mock('../gameTime', () => ({
  TurnQueue: jest.requireActual('../gameTime.js').TurnQueue,
}));

jest.mock('../entity/entityClass', () => ({
  Entity: jest.fn().mockImplementation(() => ({
    type: 'RAT_INSIDIOUS',
    placeAtCell: jest.fn(),
    getCell: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
  })),
  DEFAULT_ACTION_COST: 100,
}));

jest.mock('../ui/ui.js', () => ({
  uiPaneMessages: { addMessage: jest.fn() },
  uiPaneInfo: { setInfo: jest.fn() },
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
      world: [],
      structureRepo: new Repository('stru'),
      entityRepo: new Repository('ent'),
    };
    worldLevel = new WorldLevel(gameState, 0, 10, 10, 'EMPTY');
    gameState.world[0] = worldLevel; // Add the world level to the gameState's world array
  });

  test('should initialize with correct values', () => {
    expect(worldLevel.gameState).toBe(gameState);
    expect(worldLevel.levelNumber).toBe(0);
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

  test('should set gameState', () => {
    expect(worldLevel.gameState).toBe(gameState);
    expect(worldLevel.turnQueue.gameState).toBe(gameState);

    const mockNewGameState = {data: 'super shallow mocked game state'};

    worldLevel.setGameState(mockNewGameState);

    expect(worldLevel.gameState).toBe(mockNewGameState);
    expect(worldLevel.turnQueue.gameState).toBe(mockNewGameState);
  });


  test('should get a valid world level from a WorldLevelSpecification', () => {
    const levelFromSpec = WorldLevel.getFromSpecification(gameState, 5, WorldLevelSpecification.generateWorldLevelSpec({ width: 18, height: 12, type: "RANDOM" }));
    expect(levelFromSpec.gameState).toBe(gameState);
    expect(levelFromSpec.levelNumber).toBe(5);
    expect(levelFromSpec.levelWidth).toBe(18);
    expect(levelFromSpec.levelHeight).toBe(12);
    expect(levelFromSpec.grid).toBeNull();
    expect(levelFromSpec.levelType).toBe('RANDOM');
  });

  test('should generate grid and set world level for grid cells', () => {
    worldLevel.generateGrid();
    expect(worldLevel.grid.length).toBe(10);
    expect(worldLevel.grid[0].length).toBe(10);
    expect(worldLevel.grid[0][0].worldLevel).toBe(worldLevel);
    expect(worldLevel.grid[0][0].z).toBe(worldLevel.levelNumber);
  });

  test('should populate level with entities', () => {
    worldLevel.placeEntityRandomly = jest.fn();
    worldLevel.populate();
    expect(worldLevel.placeEntityRandomly).toHaveBeenCalled();
  });

  test('should place entity randomly', () => {
    const entity = new Entity(gameState, 'RAT_INSIDIOUS');
    worldLevel.addEntity = jest.fn();
    worldLevel.placeEntityRandomly(entity);
    expect(getRandomEmptyCellOfTerrainInGrid).toHaveBeenCalledWith('FLOOR', worldLevel.grid);
    expect(worldLevel.addEntity).toHaveBeenCalledWith(entity, { x: 0, y: 0, z: 0, entity: null, isTraversible: true });
  });

  test('should add entity to level', () => {
    jest.spyOn(worldLevel.turnQueue, 'addEntity'); 

    const entity = new Entity(gameState, 'RAT_INSIDIOUS');
    worldLevel.addEntity(entity);

    expect(worldLevel.levelEntities).toContain(entity);
    expect(entity.placeAtCell).toHaveBeenCalled();
    expect(worldLevel.turnQueue.addEntity).toHaveBeenCalledWith(entity);
  });

  test('should add entity at beginning of turn queue', () => {
    jest.spyOn(worldLevel.turnQueue, 'addEntityAtBeginningOfTurnQueue'); 
    const entity = new Entity(gameState, 'RAT_INSIDIOUS');
    worldLevel.addEntityAtBeginningOfTurnQueue(entity);
    expect(worldLevel.levelEntities).toContain(entity);
    expect(entity.placeAtCell).toHaveBeenCalled();
    expect(worldLevel.turnQueue.addEntityAtBeginningOfTurnQueue).toHaveBeenCalledWith(entity);
  });

  test('should remove entity from level', () => {
    jest.spyOn(worldLevel.turnQueue, 'removeEntity'); 

    const entity = new Entity(gameState, 'RAT_INSIDIOUS');
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
    const stairsDown = new Stairs(worldLevel, 0, 0, 1, 'STAIRS_DOWN', '>');
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

  test('should track avatar departure and handle avatar entering level', () => {
    jest.spyOn(worldLevel.turnQueue, 'runTimeFor'); // Spy on the function

    worldLevel.trackAvatarDepartureTime();
    expect(worldLevel.timeOfAvatarDeparture).toBe(0);

    const entryCell = { x: 0, y: 0, z: 0 };
    worldLevel.handleAvatarEnteringLevel(entryCell);
    
    expect(constrainValue).toHaveBeenCalledWith(0, 0, DEFAULT_ACTION_COST * 100);
    expect(gameState.avatar.resetTimeOnLevel).toHaveBeenCalled();
    expect(gameState.setTurnQueue).toHaveBeenCalledWith(worldLevel.turnQueue);
    expect(worldLevel.turnQueue.runTimeFor).not.toHaveBeenCalled();
    expect(worldLevel.levelEntities).toContain(gameState.avatar);
    expect(gameState.avatar.placeAtCell).toHaveBeenCalledWith(entryCell);
    expect(gameState.avatar.actionStartingTime).toBe(0);
    expect(uiPaneMessages.addMessage).toHaveBeenCalledWith(`You enter level ${worldLevel.levelNumber + 1}`);
    expect(uiPaneInfo.setInfo).toHaveBeenCalled();
  });

  describe('WorldLevel Serialization', () => {
    let mockEntity1;
    let mockEntity2; 
    let mockStructure1;
    let mockStructure2;

    beforeEach(() => {
      mockEntity1 = { id: 'entity-1' }; 
      mockEntity2 = { id: 'entity-2' };
      gameState.entityRepo.add(mockEntity1);
      gameState.entityRepo.add(mockEntity2);

      mockStructure1 = { id: 'structure-1', connectsTo: 'structure-2', setWorldLevel: jest.fn(), reconnect: jest.fn() };
      mockStructure2 = { id: 'structure-2',  connectsTo: 'structure-1', setWorldLevel: jest.fn(), reconnect: jest.fn() };
      gameState.structureRepo.add(mockStructure1);
      gameState.structureRepo.add(mockStructure2);

      worldLevel.generate();
      worldLevel.levelEntities = [mockEntity1, mockEntity2];
      worldLevel.levelStructures = [mockStructure1, mockStructure2];
      worldLevel.stairsDown = mockStructure1;
      worldLevel.stairsUp = mockStructure2;
      worldLevel.timeOfAvatarDeparture = 42;
    });

    test('should return correct serialization object from forSerializing', () => {
      const serializedData = worldLevel.forSerializing();

      expect(serializedData.levelNumber).toEqual(worldLevel.levelNumber);
      expect(serializedData.levelWidth).toEqual(worldLevel.levelWidth);
      expect(serializedData.levelHeight).toEqual(worldLevel.levelHeight);
      expect(serializedData.levelType).toEqual(worldLevel.levelType);
      expect(serializedData.levelEntities).toEqual(['entity-1', 'entity-2']);
      expect(serializedData.levelStructures).toEqual(['structure-1', 'structure-2']);
      expect(serializedData.stairsDown).toEqual('structure-1');
      expect(serializedData.stairsUp).toEqual('structure-2');
      expect(serializedData.turnQueue).toEqual(worldLevel.turnQueue.forSerializing());
      expect(serializedData.timeOfAvatarDeparture).toEqual(42);

      expect(serializedData.grid.length).toEqual(worldLevel.levelWidth*worldLevel.levelHeight);
      expect(serializedData.grid[0]).toEqual(expect.objectContaining({ terrain: 'FLOOR', x: 0, y: 0, z: 0, structure: null, entity: null }));
    });

    test('should correctly deserialize WorldLevel from serialized data', () => {
      const serializedData = worldLevel.forSerializing();
      const deserializedWorldLevel = WorldLevel.deserialize(serializedData, gameState);

      expect(deserializedWorldLevel).toBeInstanceOf(WorldLevel);
      expect(deserializedWorldLevel.levelNumber).toEqual(worldLevel.levelNumber);
      expect(deserializedWorldLevel.levelWidth).toEqual(worldLevel.levelWidth);
      expect(deserializedWorldLevel.levelHeight).toEqual(worldLevel.levelHeight);
      expect(deserializedWorldLevel.levelType).toEqual(worldLevel.levelType);
      expect(deserializedWorldLevel.timeOfAvatarDeparture).toEqual(42);

      expect(deserializedWorldLevel.levelEntities).toEqual([mockEntity1, mockEntity2]);
      expect(deserializedWorldLevel.levelStructures).toEqual([mockStructure1, mockStructure2]);
      expect(deserializedWorldLevel.stairsDown).toEqual(mockStructure1);
      expect(deserializedWorldLevel.stairsUp).toEqual(mockStructure2);

      expect(deserializedWorldLevel.levelStructures[0].setWorldLevel).toHaveBeenCalled();
      expect(deserializedWorldLevel.levelStructures[0].reconnect).toHaveBeenCalled();

      expect(deserializedWorldLevel.turnQueue).toBeInstanceOf(TurnQueue);
      expect(deserializedWorldLevel.turnQueue.queue.length).toEqual(worldLevel.turnQueue.queue.length);
      // NOTE: just checking the queue length, as the queue entries are tested in the TurnQueue tests

      expect(deserializedWorldLevel.grid.length).toEqual(worldLevel.grid.length);
      expect(deserializedWorldLevel.grid[0].length).toEqual(worldLevel.grid[0].length);

      for (let y = 0; y < worldLevel.levelHeight; y++) {
        for (let x = 0; x < worldLevel.levelWidth; x++) {
          expect(deserializedWorldLevel.grid[x][y]).toBeInstanceOf(GridCell);
          expect(deserializedWorldLevel.grid[x][y].terrain).toEqual(worldLevel.grid[x][y].terrain);
          expect(deserializedWorldLevel.grid[x][y].x).toEqual(worldLevel.grid[x][y].x);
          expect(deserializedWorldLevel.grid[x][y].y).toEqual(worldLevel.grid[x][y].y);
          expect(deserializedWorldLevel.grid[x][y].z).toEqual(worldLevel.grid[x][y].z);
          expect(deserializedWorldLevel.grid[x][y].worldLevel).toBe(deserializedWorldLevel);
        }
      }
    });
  });

});