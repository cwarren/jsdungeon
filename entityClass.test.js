import { Entity } from './entityClass';
import { gameState } from './gameStateClass';
import { rollDice } from './util';
import { EntityHealth } from './entityHealthClass';
import { EntityLocation } from './entityLocationClass';
import { EntityMovement } from './entityMovementClass';
import { EntityVision } from './entityVisionClass';
import { WorldLevel } from './worldLevelClass';
import { Damager } from './damagerClass';
import { addMessage } from './uiUtil';

// NOTE: many of these tests are more integration tests than unit tests

jest.mock('./util.js', () => ({
  rollDice: jest.fn(() => 10),
  devTrace: jest.fn(),
}));

jest.mock('./uiUtil.js', () => ({
    addMessage: jest.fn(),
  }));

jest.mock('./gameStateClass.js', () => ({
  gameState: {
    world: [],
  },
})
);

const TEST_DAMAGE_SPEC = { damager: new Damager("1d6+4", [], 0), actionCost: 100 };

const ENTITIES_DEFINITIONS = [
  {
    type: 'testEntity',
    name: 'Test Entity',
    displaySymbol: 'T',
    displayColor: 'red',
    baseActionCost: 100,
    initialHealthRoll: '1d10',
    naturalHealingRate: 0.01,
    naturalHealingTicks: 100,
    viewRadius: 5,
    movementSpec: { movementType: 'WALK', actionCost: 100 },
    meleeAttack: TEST_DAMAGE_SPEC,
  },
];

Entity.ENTITIES = {};
ENTITIES_DEFINITIONS.forEach((ent) => { Entity.ENTITIES[ent.type] = ent; });

describe('Entity', () => {
  let entity;

  beforeEach(() => {
    entity = new Entity('testEntity');
    const testWorldLevel = new WorldLevel(gameState, 0, 10, 10);
    testWorldLevel.generate();
    gameState.world = [testWorldLevel];
  });

  test('should initialize with correct values', () => {
    expect(entity.type).toBe('testEntity');
    expect(entity.name).toBe('Test Entity');
    expect(entity.displaySymbol).toBe('T');
    expect(entity.displayColor).toBe('red');
    expect(entity.baseActionCost).toBe(100);
    expect(entity.location).toBeInstanceOf(EntityLocation);
    expect(entity.vision).toBeInstanceOf(EntityVision);
    expect(entity.movement).toBeInstanceOf(EntityMovement);
    expect(entity.health).toBeInstanceOf(EntityHealth);
    expect(entity.meleeAttack).toEqual(TEST_DAMAGE_SPEC);
    expect(entity.destinationCell).toBeNull();
    expect(entity.movementPath).toEqual([]);
    expect(entity.damagedBy).toEqual([]);
    expect(entity.baseKillPoints).toBe(10);
    expect(entity.currentAdvancementPoints).toBe(0);
    expect(entity.actionStartingTime).toBe(0);
  });

  test('should place at cell', () => {
    const targetCell = gameState.world[0].grid[5][6];
    expect(targetCell.entity).toBeUndefined();
    entity.placeAtCell(targetCell);
    expect(targetCell.entity).toBe(entity);
    expect(entity.location.x).toBe(5);
    expect(entity.location.y).toBe(6);
    expect(entity.location.z).toBe(0);
  });

  test('should get cell', () => {
    const targetCell = gameState.world[0].grid[5][6];
    entity.placeAtCell(targetCell);
    console.log("gameState after entity.placeAtCell", gameState);
    expect(entity.getCell()).toBe(targetCell);
  });

  test('should die and remove entity from world', () => {
    entity.getDeathCredits = jest.fn(() => []);
    entity.placeAtCell(gameState.world[0].grid[5][6]);
    gameState.world[0].levelEntities = [entity];
    entity.die();
    expect(gameState.world[0].levelEntities).toEqual([]);
    expect(addMessage).toHaveBeenCalledWith('Test Entity dies');
  });
});