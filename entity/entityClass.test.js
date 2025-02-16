import { Entity } from './entityClass.js';
import { gameState } from '../gameStateClass.js';
import { rollDice, constrainValue } from '../util.js';
import { EntityHealth } from './entityHealthClass.js';
import { EntityLocation } from './entityLocationClass.js';
import { EntityMovement } from './entityMovementClass.js';
import { EntityVision } from './entityVisionClass.js';
import { WorldLevel } from '../world/worldLevelClass.js';
import { EffGenDamage } from '../effect/effGenDamageClass.js';
import { uiPaneMessages } from "../ui/ui.js";
import { EffDamage } from '../effect/effDamageClass.js';

// NOTE: many of these tests are more integration tests than unit tests

jest.mock('../util.js', () => ({
  rollDice: jest.fn(() => 10),
  constrainValue: jest.requireActual('../util.js').constrainValue,
  formatNumberForMessage: jest.requireActual('../util.js').formatNumberForMessage,
  devTrace: jest.fn(),
}));

jest.mock('../ui/ui.js', () => ({
  uiPaneMessages: { addMessage: jest.fn() },
}));

jest.mock('../gameStateClass.js', () => ({
  gameState: {
    world: [],
  },
}));

const TEST_DAMAGE_SPEC = { damager: new EffGenDamage("1d6+4", [], 0), actionCost: 100 };

const TEST_ENTITIES_DEFINITIONS = [
  {
    type: "AVATAR", name: "Avatar", displaySymbol: "@", displayColor: "#fff",
    viewRadius: 8, initialHealthRoll: "150", baseActionCost: 100, naturalHealingRate: .001,
    relations: { othersFeelAboutMe: "HOSTILE_TO", iFeelAboutOthers: "HOSTILE_TO" },
  },
  {
    type: "MOLD_PALE", name: "Pale Mold", displaySymbol: "m", displayColor: "#ddd",
    viewRadius: 2, initialHealthRoll: "2d6+4", baseActionCost: 210, naturalHealingRate: .002,
    meleeAttack: { damager: new EffGenDamage("1d4-1", [], 0), actionCost: 80 },
    movementSpec: { movementType: "STATIONARY", actionCost: 210 },
    relations: {
      overrideFeelingsToOthers: {
        "WORM_VINE": "FRIENDLY_TO",
      },
      othersFeelAboutMe: "NEUTRAL_TO", iFeelAboutOthers: "NEUTRAL_TO",
    },
  },
  {
    type: "WORM_VINE", name: "Worm Vine", displaySymbol: "w", displayColor: "#6C4",
    viewRadius: 2, initialHealthRoll: "2d6+4", baseActionCost: 100, naturalHealingRate: .001,
    meleeAttack: { damager: new EffGenDamage("1d3-1", [], 0), actionCost: 100 },
    movementSpec: { movementType: "STEP_AIMLESS", actionCost: 100 },
    relations: {
      overrideFeelingsToOthers: {
        "AVATAR": "NEUTRAL_TO",
      },
      iFeelAboutOthers: "NEUTRAL_TO"
    },
  },
  {
    type: "RAT_INSIDIOUS", name: "Insidious Rat", displaySymbol: "r", displayColor: "#654",
    viewRadius: 2, initialHealthRoll: "1d6+3", baseActionCost: 100, naturalHealingRate: .001,
    meleeAttack: { damager: new EffGenDamage("1d3-1", [], 0), actionCost: 100 },
    movementSpec: { movementType: "WANDER_AIMLESS", actionCost: 100 },
    relations: { iFeelAboutOthers: "NEUTRAL_TO" },
  },
  {
    type: "RAT_MALIGN", name: "Malign Rat", displaySymbol: "r", displayColor: "#321",
    viewRadius: 4, initialHealthRoll: "3d4+6", baseActionCost: 100, naturalHealingRate: .001,
    meleeAttack: { damager: new EffGenDamage("1d5", [], 0), actionCost: 100 },
    movementSpec: { movementType: "WANDER_AGGRESSIVE", actionCost: 100 },
    relations: {
      overrideFeelingsToOthers: {
        "RAT_INSIDIOUS": "FRIENDLY_TO",
      },
      iFeelAboutOthers: "HOSTILE_TO",
    },
  },
  {
    type: 'testEntity1', name: 'Test Entity 1', displaySymbol: 'T', displayColor: 'red',
    viewRadius: 5, initialHealthRoll: '1d10', baseActionCost: 100, naturalHealingRate: 0.01,
    naturalHealingTicks: 100,
    movementSpec: { movementType: 'WALK', actionCost: 100 },
    meleeAttack: TEST_DAMAGE_SPEC,
    relations: { iFeelAboutOthersP2: "HOSTILE_TO" },
  }
];

TEST_ENTITIES_DEFINITIONS.forEach((ent) => { Entity.ENTITIES[ent.type] = ent; })

describe('Entity', () => {
  let entity;

  beforeEach(() => {
    entity = new Entity('testEntity1');
    const testWorldLevel = new WorldLevel(gameState, 0, 10, 10);
    testWorldLevel.generateGrid();
    gameState.world = [testWorldLevel];
  });

  test('should initialize with correct values', () => {
    expect(entity.type).toBe('testEntity1');
    expect(entity.name).toBe('Test Entity 1');
    expect(entity.displaySymbol).toBe('T');
    expect(entity.displayColor).toBe('red');
    expect(entity.baseActionCost).toBe(100);
    expect(entity.location).toBeInstanceOf(EntityLocation);
    expect(entity.vision).toBeInstanceOf(EntityVision);
    expect(entity.movement).toBeInstanceOf(EntityMovement);
    expect(entity.health).toBeInstanceOf(EntityHealth);
    expect(entity.meleeAttack).toEqual(TEST_DAMAGE_SPEC);
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
    expect(entity.getCell()).toBe(targetCell);
  });


  describe('Entity - Combat', () => {

    let attacker;
    let defender;

    beforeEach(() => {
      const attacker = new Entity('RAT_MALIGN');
      const defender = new Entity('WORM_VINE');
    });

    test('should die and remove entity from world', () => {
      entity.getDeathCredits = jest.fn(() => []);
      entity.placeAtCell(gameState.world[0].grid[5][6]);
      gameState.world[0].levelEntities = [entity];
      entity.die();
      expect(gameState.world[0].levelEntities).toEqual([]);
      expect(uiPaneMessages.addMessage).toHaveBeenCalledWith('Test Entity 1 dies');
    });

    test('should calculate death credits correctly', () => {
      entity.damagedBy = [
        { damageSource: 'source1', damage: { amount: 30 } },
        { damageSource: 'source2', damage: { amount: 70 } },
      ];
      const deathCredits = entity.getDeathCredits();
      expect(deathCredits).toEqual([
        { damageSource: 'source1', proportionalDamage: 0.3 },
        { damageSource: 'source2', proportionalDamage: 0.7 },
      ]);
    });

    test('death credits should return empty array if no damage dealt', () => {
      entity.damagedBy = [];
      const deathCredits = entity.getDeathCredits();
      expect(deathCredits).toEqual([]);
    });

  });


  describe('Entity - Relationships', () => {

    test('should get default action for other entity based on relationship', () => {
      const otherEntity = new Entity('testEntity1');
      entity.getRelationshipTo = jest.fn((otherEntity) => 'HOSTILE_TO');
      expect(entity.getDefaultActionFor(otherEntity)).toBe('ATTACK');

      entity.getRelationshipTo = jest.fn((otherEntity) => 'VIOLENT_TO');
      expect(entity.getDefaultActionFor(otherEntity)).toBe('ATTACK');

      entity.getRelationshipTo = jest.fn((otherEntity) => 'FRIENDLY_TO');
      expect(entity.getDefaultActionFor(otherEntity)).toBe('BUMP');

      entity.getRelationshipTo = jest.fn((otherEntity) => 'NEUTRAL_TO');
      expect(entity.getDefaultActionFor(otherEntity)).toBe('BUMP');

      entity.getRelationshipTo = jest.fn((otherEntity) => 'TAMED_BY');
      expect(entity.getDefaultActionFor(otherEntity)).toBe('SWAP');

      entity.getRelationshipTo = jest.fn((otherEntity) => 'UNKNOWN');
      expect(entity.getDefaultActionFor(otherEntity)).toBe('ATTACK');
    });

    test('should get correct relationship between entities', () => {
      const avatar = new Entity('AVATAR');
      const paleMold = new Entity('MOLD_PALE');
      const wormVine = new Entity('WORM_VINE');
      const insidiousRat = new Entity('RAT_INSIDIOUS');
      const malignRat = new Entity('RAT_MALIGN');

      expect(avatar.getRelationshipTo(paleMold)).toBe("NEUTRAL_TO");
      expect(avatar.getRelationshipTo(wormVine)).toBe("HOSTILE_TO");
      expect(avatar.getRelationshipTo(insidiousRat)).toBe("HOSTILE_TO");
      expect(avatar.getRelationshipTo(malignRat)).toBe("HOSTILE_TO");

      expect(paleMold.getRelationshipTo(avatar)).toBe("HOSTILE_TO");
      expect(paleMold.getRelationshipTo(wormVine)).toBe("FRIENDLY_TO");
      expect(paleMold.getRelationshipTo(insidiousRat)).toBe("NEUTRAL_TO");
      expect(paleMold.getRelationshipTo(malignRat)).toBe("NEUTRAL_TO");

      expect(wormVine.getRelationshipTo(avatar)).toBe("NEUTRAL_TO");
      expect(wormVine.getRelationshipTo(paleMold)).toBe("NEUTRAL_TO");
      expect(wormVine.getRelationshipTo(insidiousRat)).toBe("NEUTRAL_TO");
      expect(wormVine.getRelationshipTo(malignRat)).toBe("NEUTRAL_TO");

      expect(insidiousRat.getRelationshipTo(avatar)).toBe("HOSTILE_TO");
      expect(insidiousRat.getRelationshipTo(paleMold)).toBe("NEUTRAL_TO");
      expect(insidiousRat.getRelationshipTo(wormVine)).toBe("NEUTRAL_TO");
      expect(insidiousRat.getRelationshipTo(malignRat)).toBe("NEUTRAL_TO");

      expect(malignRat.getRelationshipTo(avatar)).toBe("HOSTILE_TO");
      expect(malignRat.getRelationshipTo(paleMold)).toBe("NEUTRAL_TO");
      expect(malignRat.getRelationshipTo(wormVine)).toBe("HOSTILE_TO");
      expect(malignRat.getRelationshipTo(insidiousRat)).toBe("FRIENDLY_TO");
    });

    test('should have violent relationship to an otherwise neutral entity that has damaged it', () => {
      const wormVine = new Entity('WORM_VINE');
      const insidiousRat = new Entity('RAT_INSIDIOUS');
      expect(wormVine.getRelationshipTo(insidiousRat)).toBe("NEUTRAL_TO");

      wormVine.takeDamageFrom(new EffDamage(2), insidiousRat);
      expect(wormVine.getRelationshipTo(insidiousRat)).toBe("VIOLENT_TO");
    });

  });

});