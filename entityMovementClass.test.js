import { EntityMovement, DEFAULT_MOVEMENT_SPEC } from './entityMovementClass';

jest.mock('./util', () => ({
  devTrace: jest.fn(),
}));

describe('EntityMovement', () => {
  let entity;
  let entityLocation;
  let entityMovement;

  beforeEach(() => {
    entityLocation = {
      getCell: jest.fn(() => ({ x: 5, y: 5, z: 0, entity: null, isTraversible: true })),
      getCellAtDelta: jest.fn((dx, dy) => ({ x: 5 + dx, y: 5 + dy, z: 0, entity: null, isTraversible: true })),
      placeAtCell: jest.fn((targetCell) => {
        if (targetCell.entity) {
          return false;
        }
        targetCell.entity = entity;
        entity.determineVisibleCells();
        return true;
      }),
    };
    entity = {
      type: 'testEntity',
      location: entityLocation,
      handleAttemptedMoveIntoOccupiedCell: jest.fn(() => 0),
      determineVisibleCells: jest.fn(() => 0),
    };
    entityMovement = new EntityMovement(entity);
  });

  test('should initialize with correct values', () => {
    expect(entityMovement.ofEntity).toBe(entity);
    expect(entityMovement.location).toBe(entityLocation);
    expect(entityMovement.isRunning).toBe(false);
    expect(entityMovement.runDelta).toBeNull();
    expect(entityMovement.type).toBe(DEFAULT_MOVEMENT_SPEC.movementType);
    expect(entityMovement.actionCost).toBe(DEFAULT_MOVEMENT_SPEC.actionCost);
  });

  test('should try to move to a cell and succeed', () => {
    const resultMovementCost = entityMovement.tryMove(1, 1);
    expect(resultMovementCost).toBe(DEFAULT_MOVEMENT_SPEC.actionCost);
    expect(entityLocation.getCellAtDelta).toHaveBeenCalledWith(1, 1);
    expect(entity.determineVisibleCells).toHaveBeenCalled();
  });

  test('should try to move slowly to a cell and succeed', () => {
    entityMovement = new EntityMovement(entity, { movementType: "STATIONARY", actionCost: 325 });
    const resultMovementCost = entityMovement.tryMove(1, 1);
    expect(resultMovementCost).toBe(325);
    expect(entityLocation.getCellAtDelta).toHaveBeenCalledWith(1, 1);
    expect(entity.determineVisibleCells).toHaveBeenCalled();
  });

  test('should try to move to a cell and fail due to non-traversible cell', () => {
    entityLocation.getCellAtDelta = jest.fn((dx, dy) => ({ x: 5 + dx, y: 5 + dy, z: 0, entity: null, isTraversible: false }));
    const resultMovementCost = entityMovement.tryMove(1, 1);
    expect(resultMovementCost).toBe(0);
    expect(entityLocation.getCellAtDelta).toHaveBeenCalledWith(1, 1);
  });

  test('should try to move to a cell and handle occupied cell', () => {
    entityLocation.getCellAtDelta = jest.fn((dx, dy) => ({ x: 5 + dx, y: 5 + dy, z: 0, entity: { type: 'otherEntity' }, isTraversible: true }));
    const resultMovementCost = entityMovement.tryMove(1, 1);
    expect(resultMovementCost).toBe(0);
    expect(entity.handleAttemptedMoveIntoOccupiedCell).toHaveBeenCalled();
  });

  test('should try to move to a specific cell and succeed', () => {
    const targetCell = { x: 6, y: 6, z: 0, entity: null, isTraversible: true };
    entityLocation.getCell = jest.fn(() => ({ x: 5, y: 5, z: 0, entity: null, getDeltaToOtherCell: jest.fn(() => ({ dx: 1, dy: 1 })) }));
    const resultMovementCost = entityMovement.tryMoveToCell(targetCell);
    expect(resultMovementCost).toBe(DEFAULT_MOVEMENT_SPEC.actionCost);
    expect(entityLocation.getCell).toHaveBeenCalled();
    expect(entity.determineVisibleCells).toHaveBeenCalled();
  });

  test('should check if can move to a cell and return true', () => {
    const targetCell = { x: 6, y: 6, z: 0, entity: null, isTraversible: true };
    const resultCanMove = entityMovement.canMoveToCell(targetCell);
    expect(resultCanMove).toBe(true);
  });

  test('should check if can move to a cell and return false due to non-traversible cell', () => {
    const targetCell = { x: 6, y: 6, z: 0, entity: null, isTraversible: false };
    const resultCanMove = entityMovement.canMoveToCell(targetCell);
    expect(resultCanMove).toBe(false);
  });

  test('should check if can move to deltas and return true', () => {
    const resultCanMove = entityMovement.canMoveToDeltas(1, 1);
    expect(resultCanMove).toBe(true);
    expect(entityLocation.getCellAtDelta).toHaveBeenCalledWith(1, 1);
  });

  test('should check if can move to deltas and return false due to non-traversible cell', () => {
    entityLocation.getCellAtDelta = jest.fn((dx, dy) => ({ x: 5 + dx, y: 5 + dy, z: 0, entity: null, isTraversible: false }));
    const resultCanMove = entityMovement.canMoveToDeltas(1, 1);
    expect(resultCanMove).toBe(false);
    expect(entityLocation.getCellAtDelta).toHaveBeenCalledWith(1, 1);
  });

  test('should confirm move to a new cell', () => {
    const newCell = { x: 6, y: 6, z: 0, entity: null, isTraversible: true };
    const oldCell = { x: 5, y: 5, z: 0, entity: entity };
    entityLocation.getCell = jest.fn(() => oldCell);
    const resultMovementCost = entityMovement.confirmMove(newCell);
    expect(resultMovementCost).toBe(DEFAULT_MOVEMENT_SPEC.actionCost);
    expect(oldCell.entity).toBeUndefined();
    expect(newCell.entity).toBe(entity);
    expect(entity.determineVisibleCells).toHaveBeenCalled();
  });

  test('should confirm move to deltas', () => {
    const oldCell = { x: 5, y: 5, z: 0, entity: entity };
    const newCell = { x: 6, y: 6, z: 0, entity: null, isTraversible: true };
    entityLocation.getCell = jest.fn(() => oldCell);
    entityLocation.getCellAtDelta = jest.fn((dx, dy) => newCell);

    const resultMovementCost = entityMovement.confirmMoveDeltas(1, 1);
    expect(resultMovementCost).toBe(100);
    expect(oldCell.entity).toBeUndefined();
    expect(newCell.entity).toBe(entity);
    expect(entityLocation.placeAtCell).toHaveBeenCalledWith(newCell);
    expect(entity.determineVisibleCells).toHaveBeenCalled();
  });
});