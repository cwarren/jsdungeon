import { EntityLocation } from './entityLocationClass';
import { gameState } from './gameStateClass';
import { devTrace } from './util';

jest.mock('./util', () => ({
  devTrace: jest.fn(),
}));

jest.mock('./gameStateClass', () => ({
  gameState: {
    world: [
      {
        levelWidth: 10,
        levelHeight: 10,
        grid: Array.from({ length: 10 }, (_, x) =>
          Array.from({ length: 10 }, (_, y) => ({
            x,
            y,
            z: 0,
            entity: null,
            getAdjacentCells: jest.fn(() => []),
          }))
        ),
      },
    ],
  },
}));

describe('EntityLocation', () => {
  let entity;
  let entityLocation;

  beforeEach(() => {
    entity = { type: 'testEntity', determineVisibleCells: jest.fn() };
    entityLocation = new EntityLocation(entity, 5, 5, 0);
  });

  test('should initialize with correct values', () => {
    expect(entityLocation.ofEntity).toBe(entity);
    expect(entityLocation.x).toBe(5);
    expect(entityLocation.y).toBe(5);
    expect(entityLocation.z).toBe(0);
  });

  test('should get the correct cell', () => {
    const cell = entityLocation.getCell();
    expect(cell).toEqual({ x: 5, y: 5, z: 0, entity: null, getAdjacentCells: expect.any(Function) });
  });

  test('should get the correct cell at delta', () => {
    const cell = entityLocation.getCellAtDelta(1, 1);
    expect(cell).toEqual({ x: 6, y: 6, z: 0, entity: null, getAdjacentCells: expect.any(Function) });
  });

  test('should return null for out of bounds cell at delta', () => {
    const cell = entityLocation.getCellAtDelta(10, 10);
    expect(cell).toBeNull();
  });

  test('should get adjacent cells', () => {
    const adjacentCells = entityLocation.getAdjacentCells();
    expect(adjacentCells).toEqual([]);
  });

  test('should place entity at specified location', () => {
    const result = entityLocation.placeAt(6, 6, 0);
    expect(result).toBe(true);
    expect(entityLocation.x).toBe(6);
    expect(entityLocation.y).toBe(6);
    expect(entityLocation.z).toBe(0);
    expect(gameState.world[0].grid[6][6].entity).toBe(entity);
    expect(entity.determineVisibleCells).toHaveBeenCalled();
  });

  test('should not place entity in occupied cell', () => {
    gameState.world[0].grid[6][6].entity = { type: 'otherEntity' };
    const result = entityLocation.placeAt(6, 6, 0);
    expect(result).toBe(false);
    expect(entityLocation.x).toBe(5);
    expect(entityLocation.y).toBe(5);
    expect(entityLocation.z).toBe(0);
  });

  test('should place entity at specified cell', () => {
    const targetCell = gameState.world[0].grid[7][7];
    const result = entityLocation.placeAtCell(targetCell);
    expect(result).toBe(true);
    expect(entityLocation.x).toBe(7);
    expect(entityLocation.y).toBe(7);
    expect(entityLocation.z).toBe(0);
    expect(targetCell.entity).toBe(entity);
    expect(entity.determineVisibleCells).toHaveBeenCalled();
  });

  test('should not place entity at occupied cell', () => {
    const targetCell = gameState.world[0].grid[7][7];
    targetCell.entity = { type: 'otherEntity' };
    const result = entityLocation.placeAtCell(targetCell);
    expect(result).toBe(false);
    expect(entityLocation.x).toBe(5);
    expect(entityLocation.y).toBe(5);
    expect(entityLocation.z).toBe(0);
  });

  test('should get the correct world level', () => {
    const worldLevel = entityLocation.getWorldLevel();
    expect(worldLevel).toEqual(gameState.world[0]);
  });

  test('should throw error if entity is not on a valid level', () => {
    entityLocation.z = 1; // Invalid level
    expect(() => entityLocation.getWorldLevel()).toThrow(`Entity ${entity.type} is not on a valid level`);
  });
});