import { EntityVision } from './entityVisionClass';
import { gameState } from './gameStateClass';
import { computeBresenhamLine } from './gridUtils.js';

jest.mock('./util', () => ({
  devTrace: jest.fn(),
}));

jest.mock('./gameStateClass', () => ({
  gameState: {
    world: [
      {
        grid: Array.from({ length: 10 }, (_, x) =>
          Array.from({ length: 10 }, (_, y) => ({
            x,
            y,
            z: 0,
            entity: null,
          }))
        ),
      },
    ],
  },
}));

jest.mock('./gridUtils.js', () => ({
  computeBresenhamLine: jest.fn((x0, y0, x1, y1) => {
    // Simple mock implementation of Bresenham's line algorithm
    let points = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
      points.push([x0, y0]);
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    return points;
  }),
}));

describe('EntityVision', () => {
  let entity;
  let entityVision;
  let otherEntity;

  beforeEach(() => {
    entity = {
      type: 'testEntity',
      location: {
        x: 5,
        y: 5,
        z: 0,
        getWorldLevel: jest.fn(() => gameState.world[0]),
      },
      getCell: jest.fn(() => gameState.world[0].grid[5][5]),
    };
    otherEntity = {
      type: 'otherEntity',
      getCell: jest.fn(() => gameState.world[0].grid[6][6]),
      canSeeEntity: jest.fn(() => true),
    };
    entityVision = new EntityVision(entity, 3);
  });

  test('should initialize with correct values', () => {
    expect(entityVision.ofEntity).toBe(entity);
    expect(entityVision.viewRadius).toBe(3);
    expect(entityVision.visibleCells).toEqual(new Set());
    expect(entityVision.seenCells).toEqual(new Set());
  });

  test('should check if entity is visible to another entity', () => {
    const result = entityVision.isVisibleToEntity(otherEntity);
    expect(result).toBe(true);
    expect(otherEntity.canSeeEntity).toHaveBeenCalledWith(entity);
  });

  test('should check if entity can see another entity', () => {
    entityVision.visibleCells.add(otherEntity.getCell());
    const result = entityVision.canSeeEntity(otherEntity);
    expect(result).toBe(true);
  });

  test('should determine visible cells', () => {
    entityVision.determineVisibleCells();
    expect(entity.location.getWorldLevel).toHaveBeenCalled();
    expect(computeBresenhamLine).toHaveBeenCalled();
  });

  test('should determine visible cells in grid', () => {
    entityVision.determineVisibleCellsInGrid(gameState.world[0].grid);
    expect(entityVision.visibleCells.size).toBeGreaterThan(0);
    expect(computeBresenhamLine).toHaveBeenCalled();
  });
});