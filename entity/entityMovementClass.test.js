import { EntityMovement, DEFAULT_MOVEMENT_SPEC, DEFAULT_MOVEMENT_ACTION_COST } from './entityMovementClass.js';
import { WorldLevel } from '../world/worldLevelClass.js';
import { Entity, DEFAULT_ACTION_COST } from './entityClass.js';
import { getEntityDef } from "./entityDefinitions.js";
import { EffGenDamage } from '../effect/effGenDamageClass.js';
import { devTrace, constrainValue, rollDice, getRandomListItem } from '../util.js';
import { gameState } from '../gameStateClass.js';
import { uiPaneMessages, uiPaneInfo } from "../ui/ui.js";
import { WorldLevelSpecification } from '../world/worldLevelSpecificationClass.js';
import {
  findCellOfTerrainNearPlace,
  getRandomCellOfTerrainInGrid,
  findEmptyCellTerrainNearPlace,
  getRandomEmptyCellOfTerrainInGrid,
  determineCellViewability,
  applyCellularAutomataSmoothing,
  computeBresenhamLine,
  determineCheapestMovementPath,
  determineCheapestMovementPathForEntity
} from '../world/gridUtils.js';
import { GridCell } from '../world/gridCellClass.js';

jest.mock('../util.js', () => ({
  devTrace: jest.fn(),
  constrainValue: jest.requireActual('../util.js').constrainValue,
  rollDice: jest.requireActual('../util.js').rollDice,
  getRandomListItem: jest.fn(),
}));

jest.mock('../ui/ui.js', () => ({
  uiPaneMessages: { addMessage: jest.fn() },
  uiPaneInfo: { setInfo: jest.fn() },
}));

jest.mock('../world/gridUtils.js', () => ({
  determineCheapestMovementPathForEntity: jest.requireActual('../world/gridUtils.js').determineCheapestMovementPathForEntity,
  determineCellViewability: jest.requireActual('../world/gridUtils.js').determineCellViewability,
  getRandomEmptyCellOfTerrainInGrid: jest.requireActual('../world/gridUtils.js').getRandomEmptyCellOfTerrainInGrid,
  computeBresenhamLine: jest.requireActual('../world/gridUtils.js').computeBresenhamLine,
  getRandomCellOfTerrainInGrid: jest.fn(),
}));

const WORLD_LEVEL_SPECS_FOR_TESTING = [
  WorldLevelSpecification.generateWorldLevelSpec({ type: 'EMPTY', width: 10, height: 10 }),
  WorldLevelSpecification.generateWorldLevelSpec({ type: 'EMPTY', width: 15, height: 15 }),
];


describe('EntityMovement', () => {
  let entity;
  let entityLocation;
  let entityMovement;

  let worldLevel;

  const TEST_ENTITIES_DEFINITIONS = [
    getEntityDef('WORM_VINE'),
    getEntityDef('MOLD_PALE'),
    getEntityDef('RAT_MALIGN'),
  ];

  TEST_ENTITIES_DEFINITIONS.forEach((ent) => { Entity.ENTITIES[ent.type] = ent; })
  const TEST_MOVEMENT_SPEC = Entity.ENTITIES["RAT_MALIGN"].movementSpec;

  beforeEach(() => {
    gameState.reset();
    gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
    worldLevel = gameState.world[0];
    while (worldLevel.levelEntities.length > 0) {
      worldLevel.removeEntity(worldLevel.levelEntities[0]);
    }

    entity = new Entity("RAT_MALIGN");
    worldLevel.addEntity(entity, worldLevel.grid[0][0]);
    entityLocation = entity.location;
    entityMovement = entity.movement;
  });

  test('should initialize with correct values', () => {
    expect(entityMovement.ofEntity).toBe(entity);
    expect(entityMovement.location).toBe(entityLocation);
    expect(entityMovement.isRunning).toBe(false);
    expect(entityMovement.runDelta).toBeNull();
    expect(entityMovement.type).toBe(TEST_MOVEMENT_SPEC.movementType);
    expect(entityMovement.actionCost).toBe(TEST_MOVEMENT_SPEC.actionCost);
  });

  test('should try to move to a cell and succeed', () => {
    jest.spyOn(entityLocation, 'getCellAtDelta');
    jest.spyOn(entity, 'determineVisibleCells');
    const resultMovementCost = entityMovement.tryMove(1, 1);
    expect(resultMovementCost).toBe(TEST_MOVEMENT_SPEC.actionCost);
    expect(entityLocation.getCellAtDelta).toHaveBeenCalledWith(1, 1);
    expect(entity.determineVisibleCells).toHaveBeenCalled();
  });

  test('should try to move slowly to a cell and succeed', () => {
    jest.spyOn(entityLocation, 'getCellAtDelta');
    jest.spyOn(entity, 'determineVisibleCells');
    entityMovement = new EntityMovement(entity, { movementType: "STATIONARY", actionCost: 325 });
    const resultMovementCost = entityMovement.tryMove(1, 1);
    expect(resultMovementCost).toBe(325);
    expect(entityLocation.getCellAtDelta).toHaveBeenCalledWith(1, 1);
    expect(entity.determineVisibleCells).toHaveBeenCalled();
  });

  test('should try to move to a cell and fail due to non-traversible cell', () => {
    jest.spyOn(entityLocation, 'getCellAtDelta');
    entityLocation.getCellAtDelta = jest.fn((dx, dy) => ({ x: 5 + dx, y: 5 + dy, z: 0, entity: null, isTraversible: false }));
    const resultMovementCost = entityMovement.tryMove(1, 1);
    expect(resultMovementCost).toBe(0);
    expect(entityLocation.getCellAtDelta).toHaveBeenCalledWith(1, 1);
  });

  test('should try to move to a cell and handle occupied cell', () => {
    jest.spyOn(entity, 'handleAttemptedMoveIntoOccupiedCell');
    const entityInTargetCell = new Entity("MOLD_PALE");
    worldLevel.addEntity(entityInTargetCell, worldLevel.grid[1][1]);

    const resultMovementCost = entityMovement.tryMove(1, 1);
    expect(resultMovementCost).toBe(0);
    expect(entity.handleAttemptedMoveIntoOccupiedCell).toHaveBeenCalled();
  });

  test('should try to move to a specific cell and succeed', () => {
    jest.spyOn(entityLocation, 'getCell');
    jest.spyOn(entity, 'determineVisibleCells');
    const targetCell = { x: 6, y: 6, z: 0, entity: null, isTraversible: true };
    entityLocation.getCell = jest.fn(() => ({ x: 5, y: 5, z: 0, entity: null, getDeltaToOtherCell: jest.fn(() => ({ dx: 1, dy: 1 })) }));

    const resultMovementCost = entityMovement.tryMoveToCell(targetCell);
    expect(resultMovementCost).toBe(TEST_MOVEMENT_SPEC.actionCost);
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
    jest.spyOn(entityLocation, 'getCellAtDelta');
    const resultCanMove = entityMovement.canMoveToDeltas(1, 1);
    expect(resultCanMove).toBe(true);
    expect(entityLocation.getCellAtDelta).toHaveBeenCalledWith(1, 1);
  });

  test('should check if can move to deltas and return false due to non-traversible cell', () => {
    jest.spyOn(entityLocation, 'getCellAtDelta');
    entityLocation.getCellAtDelta = jest.fn((dx, dy) => ({ x: 5 + dx, y: 5 + dy, z: 0, entity: null, isTraversible: false }));

    const resultCanMove = entityMovement.canMoveToDeltas(1, 1);
    expect(resultCanMove).toBe(false);
    expect(entityLocation.getCellAtDelta).toHaveBeenCalledWith(1, 1);
  });

  test('should confirm move to a new cell', () => {
    jest.spyOn(entity, 'determineVisibleCells');
    const newCell = { x: 6, y: 6, z: 0, entity: null, isTraversible: true };
    const oldCell = { x: 5, y: 5, z: 0, entity: entity };
    entityLocation.getCell = jest.fn(() => oldCell);

    const resultMovementCost = entityMovement.confirmMove(newCell);
    expect(resultMovementCost).toBe(TEST_MOVEMENT_SPEC.actionCost);
    expect(oldCell.entity).toBeUndefined();
    expect(newCell.entity).toBe(entity);
    expect(entity.determineVisibleCells).toHaveBeenCalled();
  });

  test('should confirm move to deltas', () => {
    jest.spyOn(entityLocation, 'placeAtCell');
    jest.spyOn(entity, 'determineVisibleCells');
    const oldCell = { x: 5, y: 5, z: 0, entity: entity };
    const newCell = { x: 6, y: 6, z: 0, entity: null, isTraversible: true };
    entityLocation.getCell = jest.fn(() => oldCell);
    entityLocation.getCellAtDelta = jest.fn((dx, dy) => newCell);

    const resultMovementCost = entityMovement.confirmMoveDeltas(1, 1);
    expect(resultMovementCost).toBe(DEFAULT_MOVEMENT_ACTION_COST);
    expect(oldCell.entity).toBeUndefined();
    expect(newCell.entity).toBe(entity);
    expect(entityLocation.placeAtCell).toHaveBeenCalledWith(newCell);
    expect(entity.determineVisibleCells).toHaveBeenCalled();
  });

  // SLEEPING (technically "movement" even if the entity isn't moving per se)
  describe('EntityMovement - Sleeping Methods', () => {
    test('should start sleeping', () => {
      entityMovement.isSleeping = false;
      entityMovement.startSleeping();
      expect(entityMovement.isSleeping).toBe(true);
    });

    test('should stop sleeping', () => {
      entityMovement.isSleeping = true;
      entityMovement.stopSleeping();
      expect(entityMovement.isSleeping).toBe(false);
    });

    describe('EntityMovement - Sleeping Methods - canSleep', () => {
      test('should return true for canSleep when no threats and not at max health', () => {
        entity.health.curHealth = 50;
        entity.health.maxHealth = 100;
        expect(entityMovement.canSleep()).toBe(true);
      });

      test('should return false for canSleep if entity is at max health', () => {
        entity.health.curHealth = 100;
        entity.health.maxHealth = 100;

        expect(entityMovement.canSleep()).toBe(false);
      });

      test('should return true for canSleep when adjacent entity is not hostile or violent AND at less than max health', () => {
        // Add a neutral entity nearby
        const occupiedCell = worldLevel.grid[1][0]; // Adjacent to (0,0)
        const entityInOccupiedCell = new Entity("MOLD_PALE");
        worldLevel.addEntity(entityInOccupiedCell, occupiedCell);
        entity.health.curHealth = 50; // Not at max health
        entity.health.maxHealth = 100;

        expect(entityMovement.canSleep()).toBe(true);
      });

      test('should return false for canSleep when a hostile entity is adjacent', () => {
        // Add a hostile entity nearby
        const occupiedCell = worldLevel.grid[1][0]; // Adjacent to (0,0)
        const hostileEntity = new Entity("RAT_MALIGN");

        worldLevel.addEntity(hostileEntity, occupiedCell);

        expect(entityMovement.canSleep()).toBe(false);
      });

      test('should return false for canSleep when a violent entity is adjacent', () => {
        // Add a violent entity nearby
        const occupiedCell = worldLevel.grid[0][1]; // Adjacent to (0,0)
        const violentEntity = new Entity("WORM_VINE");
        worldLevel.addEntity(violentEntity, occupiedCell);
        // Ensure violent relationship
        jest.spyOn(entity, 'getRelationshipTo').mockReturnValue("VIOLENT_TO");

        expect(entityMovement.canSleep()).toBe(false);
      });

    });

    test('should return 0 for continueSleeping if not already sleeping', () => {
      entityMovement.isSleeping = false;
      expect(entityMovement.continueSleeping()).toBe(0);
    });

    test('should stop sleeping and return 0 for continueSleeping if canSleep is false', () => {
      entityMovement.isSleeping = true;

      // Add a hostile entity to ensure canSleep() returns false
      const occupiedCell = worldLevel.grid[1][1];
      const hostileEntity = new Entity("RAT_MALIGN");
      worldLevel.addEntity(hostileEntity, occupiedCell);
      jest.spyOn(entityMovement, 'canSleep').mockReturnValue(false);

      jest.spyOn(entityMovement, 'stopSleeping');

      expect(entityMovement.continueSleeping()).toBe(0);
      expect(entityMovement.stopSleeping).toHaveBeenCalled();
    });

    test('should heal naturally and return action cost for continueSleeping if conditions allow', () => {
      entityMovement.isSleeping = true;

      // No hostile entities added, so canSleep() should return true
      jest.spyOn(entityMovement, 'canSleep').mockReturnValue(true);
      jest.spyOn(entity, 'healNaturally');

      expect(entityMovement.continueSleeping()).toBe(DEFAULT_MOVEMENT_ACTION_COST);
      expect(entity.healNaturally).toHaveBeenCalled();
    });
  });


  // RUNNING
  describe('EntityMovement - Running Methods', () => {
    test('should start running with given deltas', () => {
      const deltas = { dx: 1, dy: 0 };
      entityMovement.startRunning(deltas);
      expect(entityMovement.isRunning).toBe(true);
      expect(entityMovement.runDelta).toEqual(deltas);
    });

    test('should stop running', () => {
      entityMovement.startRunning({ dx: 1, dy: 0 });
      entityMovement.stopRunning();
      expect(entityMovement.isRunning).toBe(false);
      expect(entityMovement.runDelta).toBeNull();
    });

    test('should check if can run to deltas and return true', () => {
      jest.spyOn(entityLocation, 'getCellAtDelta');
      const traversibleCell = { x: 6, y: 6, z: 0, entity: null, isTraversible: true, getAdjacentCells: () => [] };
      entityLocation.getCellAtDelta.mockReturnValue(traversibleCell);

      const result = entityMovement.canRunToDeltas(1, 1);
      expect(result).toBe(true);
      expect(entityLocation.getCellAtDelta).toHaveBeenCalledWith(1, 1);
    });

    test('should check if can run to deltas and return false due to non-traversible cell', () => {
      jest.spyOn(entityLocation, 'getCellAtDelta');
      const nonTraversibleCell = { x: 6, y: 6, z: 0, entity: null, isTraversible: false };
      entityLocation.getCellAtDelta.mockReturnValue(nonTraversibleCell);

      const result = entityMovement.canRunToDeltas(1, 1);
      expect(result).toBe(false);
      expect(entityLocation.getCellAtDelta).toHaveBeenCalledWith(1, 1);
    });

    test('should check if can run to deltas and return false due to adjacent entity', () => {
      const traversibleCell = worldLevel.grid[1][1];
      const entityInTargetCell = new Entity("MOLD_PALE");
      worldLevel.addEntity(entityInTargetCell, traversibleCell);

      const result = entityMovement.canRunToDeltas(1, 1);
      expect(result).toBe(false);
    });

    test('should continue running if conditions allow', () => {
      entityMovement.startRunning({ dx: 1, dy: 0 });

      jest.spyOn(entityMovement, 'canRunToDeltas').mockReturnValue(true);
      jest.spyOn(entityMovement, 'confirmMoveDeltas').mockReturnValue(DEFAULT_MOVEMENT_ACTION_COST);
      jest.spyOn(entity, 'healNaturally');

      const result = entityMovement.continueRunning();
      expect(result).toBe(DEFAULT_MOVEMENT_ACTION_COST);
      expect(entityMovement.confirmMoveDeltas).toHaveBeenCalledWith(1, 0);
      expect(entity.healNaturally).toHaveBeenCalled();
    });

    test('should stop running if conditions prevent it', () => {
      entityMovement.startRunning({ dx: 1, dy: 0 });

      jest.spyOn(entityMovement, 'canRunToDeltas').mockReturnValue(false);
      jest.spyOn(entityMovement, 'stopRunning');

      const result = entityMovement.continueRunning();
      expect(result).toBe(0);
      expect(entityMovement.stopRunning).toHaveBeenCalled();
    });

    test('should interrupt ongoing movement', () => {
      entityMovement.destinationCell = worldLevel.grid[5][5];
      entityMovement.movementPath = [worldLevel.grid[6][6], worldLevel.grid[7][7]];
      entityMovement.startRunning({ dx: 1, dy: 0 });

      entityMovement.interruptOngoingMovement();
      expect(entityMovement.destinationCell).toBeNull();
      expect(entityMovement.movementPath).toEqual([]);
      expect(entityMovement.isRunning).toBe(false);
      expect(entityMovement.runDelta).toBeNull();
    });
  });

  // MOVEMENT AI SUPPORT
  describe('EntityMovement - Movement AI Support Methods', () => {
    test('should set empty path when destination is not set', () => {
      entityMovement.destinationCell = undefined;
      entityMovement.setPathToDestination();
      expect(entityMovement.movementPath).toEqual([]);
    });

    test('should set path to destination', () => {
      const destinationCell = worldLevel.grid[4][4];
      const path = [worldLevel.grid[1][1], worldLevel.grid[2][2], worldLevel.grid[3][3], worldLevel.grid[4][4]];
      entityMovement.destinationCell = destinationCell;

      entityMovement.setPathToDestination();
      expect(entityMovement.movementPath).toEqual(path); // starting cell removed
    });

    test('should set random destination', () => {
      const randomCell = { x: 8, y: 8, z: 0, entity: null, isTraversible: true };
      getRandomCellOfTerrainInGrid.mockReturnValue(randomCell);

      entityMovement.setRandomDestination();
      expect(getRandomCellOfTerrainInGrid).toHaveBeenCalledWith("FLOOR", entityLocation.getWorldLevel().grid);
      expect(entityMovement.destinationCell).toBe(randomCell);
    });

    test('should move along path', () => {
      const nextCell = { x: 6, y: 6, z: 0, entity: null, isTraversible: true };
      entityMovement.movementPath = [nextCell];
      entityMovement.tryMoveToCell = jest.fn(() => DEFAULT_MOVEMENT_ACTION_COST);

      const result = entityMovement.moveAlongPath();
      expect(result).toBe(DEFAULT_MOVEMENT_ACTION_COST);
      expect(entityMovement.tryMoveToCell).toHaveBeenCalledWith(nextCell);
      expect(entityMovement.movementPath).toEqual([]);
    });

    test('should return action cost if no path to move along', () => {
      entityMovement.movementPath = [];
      const result = entityMovement.moveAlongPath();
      expect(result).toBe(entityMovement.actionCost);
    });
  });

  // MOVEMENT AI METHODS
  describe('EntityMovement - Movement AI Methods', () => {
    test('movement type implementation - should move aimlessly', () => {
      const randomDir = { dx: 1, dy: 0 };
      getRandomListItem.mockReturnValue(randomDir);
      entityMovement.tryMove = jest.fn(() => DEFAULT_MOVEMENT_ACTION_COST);

      const result = entityMovement.moveStepAimless();
      expect(result).toBe(DEFAULT_MOVEMENT_ACTION_COST);
      expect(getRandomListItem).toHaveBeenCalledWith(GridCell.ADJACENCY_DIRECTIONS);
      expect(entityMovement.tryMove).toHaveBeenCalledWith(randomDir.dx, randomDir.dy);
    });

    test('movement type implementation - should move wander aimlessly', () => {
      jest.spyOn(entityMovement, 'tryMoveToCell');
      const randomCell = worldLevel.grid[0][4];
      getRandomCellOfTerrainInGrid.mockReturnValue(randomCell);

      const result = entityMovement.moveWanderAimless();
      expect(result).toBe(DEFAULT_MOVEMENT_ACTION_COST);
      expect(getRandomCellOfTerrainInGrid).toHaveBeenCalledWith("FLOOR", entityLocation.getWorldLevel().grid);
      expect(entityMovement.tryMoveToCell).toHaveBeenCalledWith(worldLevel.grid[0][1]);
      expect(entityMovement.movementPath).toEqual([worldLevel.grid[0][2], worldLevel.grid[0][3], worldLevel.grid[0][4]]);
    });

    test('movement type implementation - should move wander aggressive pure', () => {
      jest.spyOn(entityMovement, 'tryMoveToCell');
      const hostileToEntity = new Entity("WORM_VINE");
      worldLevel.addEntity(hostileToEntity, worldLevel.grid[2][2]); // NOTE: this is within the vision range of the default entity

      const result = entityMovement.moveWanderAggressive();
      expect(result).toBe(DEFAULT_MOVEMENT_ACTION_COST);
      expect(entityMovement.tryMoveToCell).toHaveBeenCalledWith(worldLevel.grid[1][1]);
      expect(entityMovement.movementPath).toEqual([worldLevel.grid[2][2]]);
    });

    test('movement type implementation - should move wander aggressive with no hostiles', () => {
      jest.spyOn(entityMovement, 'tryMoveToCell');
      const randomCell = worldLevel.grid[4][0];
      getRandomCellOfTerrainInGrid.mockReturnValue(randomCell);

      const result = entityMovement.moveWanderAggressive();
      expect(result).toBe(DEFAULT_MOVEMENT_ACTION_COST);
      expect(getRandomCellOfTerrainInGrid).toHaveBeenCalledWith("FLOOR", entityLocation.getWorldLevel().grid);
      expect(entityMovement.tryMoveToCell).toHaveBeenCalledWith(worldLevel.grid[1][0]);
      expect(entityMovement.movementPath).toEqual([worldLevel.grid[2][0], worldLevel.grid[3][0], worldLevel.grid[4][0]]);
    });
  });
});