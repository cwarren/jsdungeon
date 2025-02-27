import { Entity } from './entityClass.js';
import { getEntityDef } from "./entityDefinitions.js";
import { gameState } from '../gameStateClass.js';
import { rollDice, constrainValue } from '../util.js';
import { EntityHealth } from './entityHealthClass.js';
import { EntityLocation } from './entityLocationClass.js';
import { EntityMovement } from './entityMovementClass.js';
import { EntityVision } from './entityVisionClass.js';
import { WorldLevel } from '../world/worldLevelClass.js';
import { uiPaneMessages } from "../ui/ui.js";
import { EffGenDamage } from '../effect/effGenDamageClass.js';
import { EffDamage } from '../effect/effDamageClass.js';
import { Attack } from '../effect/attackClass.js';

// NOTE: many of these tests are more integration tests than unit tests

jest.mock('../util.js', () => ({
  rollDice: jest.fn(),
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

const TEST_DAMAGE_SPEC = { damager: new EffGenDamage("1d6+4", [], 0), baseActionTime: 100 };

const TEST_ENTITIES_DEFINITIONS = [
  getEntityDef('AVATAR'),
  getEntityDef('MOLD_PALE'),
  getEntityDef('WORM_VINE'),
  getEntityDef('RAT_INSIDIOUS'),
  getEntityDef('RAT_MALIGN'),
  {
    type: 'testEntity1', name: 'Test Entity 1', displaySymbol: 'T', displayColor: 'red',
    attributes: {
      'strength': 100, 'dexterity': 100, 'fortitude': 100, 'recovery': 100,
      'psyche': 100, 'awareness': 100, 'stability': 100, 'will': 100,
      'aura': 100, 'refinement': 100, 'depth': 100, 'flow': 100,
    },
    baseViewRadius: 5, baseHealthRoll: '1d10', baseActionTime: 100, baseNaturalHealingAmount: 0.01,
    naturalHealingTicks: 100,
    movementSpec: { movementType: 'WALK', baseMovementTime: 100 },
    meleeAttack: TEST_DAMAGE_SPEC,
    relations: { iFeelAboutOthersP2: "HOSTILE_TO" },
  }
];

TEST_ENTITIES_DEFINITIONS.forEach((ent) => { Entity.ENTITIES[ent.type] = ent; })

describe('Entity', () => {
  let entity;

  beforeEach(() => {
    rollDice.mockReturnValue(100);
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
    expect(entity.baseActionTime).toBe(100);
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

  test('should calculate vision radius correctly', () => {
    entity.attributes.setAttributes(Entity.ENTITIES['testEntity1'].attributes);
    const expectedViewRadius = Math.floor((Entity.ENTITIES['testEntity1'].baseViewRadius + 0/15 + 0/50 + 0/40) * 1.1 * 1);
    expect(entity.getViewRadius()).toBe(expectedViewRadius);
  });

  describe('Entity - Combat', () => {

    let attacker;
    let defender;
    let attack;

    beforeEach(() => {
      rollDice.mockReturnValue(100);
      attacker = new Entity('RAT_MALIGN');
      defender = new Entity('WORM_VINE');
      attack = attacker.createAttack(defender);
    });

    describe('Entity - Combat - death', () => {

      beforeEach(() => {
        rollDice.mockReturnValue(100);
        attacker = new Entity('RAT_MALIGN');
        defender = new Entity('WORM_VINE');
        attack = attacker.createAttack(defender);
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

    describe('Entity - Combat - support methods', () => {

      beforeEach(() => {
        rollDice.mockReturnValue(100);
        attacker = new Entity('RAT_MALIGN');
        defender = new Entity('WORM_VINE');
        attack = attacker.createAttack(defender);
      });

      test('should create Attack correctly', () => {
        expect(attack).toBeInstanceOf(Attack);
        expect(attack.attacker).toBe(attacker);
        expect(attack.defender).toBe(defender);
        expect(attack.defenderHitEffectGenerators).toEqual([attacker.meleeAttack.damager]);
        expect(attack.attackerHitEffectGenerators).toEqual([]);
        expect(attack.defenderEvadeEffectGenerators).toEqual([]);
        expect(attack.attackerEvadeEffectGenerators).toEqual([]);
      });

      test('should get precision for an attack', () => {
        const precision = attacker.getPrecision(attack);
        expect(precision).toBeGreaterThan(0);
      });

      test('should get evasion for an attack', () => {
        const evasion = attacker.getEvasion(attack);
        expect(evasion).toBeGreaterThan(0);
      });

      test('should determine whether hit was critical', () => {
        jest.spyOn(attacker, 'getCriticalHitThreshold').mockReturnValue(2);

        rollDice.mockReturnValue(74);
        expect(attacker.isHitCritical(attack)).toEqual(false);
        expect(attacker.getCriticalHitThreshold).toHaveBeenCalled();

        rollDice.mockReturnValue(1);
        expect(attacker.isHitCritical(attack)).toEqual(true);
      });

      test('should determine whether evade was critical', () => {
        jest.spyOn(defender, 'getCriticalEvadeThreshold').mockReturnValue(2);

        rollDice.mockReturnValue(74);
        expect(defender.isEvadeCritical(attack)).toEqual(false);
        expect(defender.getCriticalEvadeThreshold).toHaveBeenCalled();

        rollDice.mockReturnValue(1);
        expect(defender.isEvadeCritical(attack)).toEqual(true);
      });
    });

    describe('Entity - Combat - hitting and evading', () => {

      let defenderHitEffectGenerator;
      let attackerHitEffectGenerator;
      let defenderEvadeEffectGenerator;
      let attackerEvadeEffectGenerator;
      let mockEffDam_defHit;
      let mockEffDam_atkHit;
      let mockEffDam_defEv;
      let mockEffDam_atkEv;

      beforeEach(() => {
        rollDice.mockReturnValue(100);
        attacker = new Entity('RAT_MALIGN');
        defender = new Entity('WORM_VINE');
        attacker.health.curHealth = 10;
        defender.health.curHealth = 10;
        attack = attacker.createAttack(defender);
        defenderHitEffectGenerator = new EffGenDamage("1d1");
        attackerHitEffectGenerator = new EffGenDamage("2d1");
        defenderEvadeEffectGenerator = new EffGenDamage("3d1");
        attackerEvadeEffectGenerator = new EffGenDamage("4d1");
        attack.defenderHitEffectGenerators = [defenderHitEffectGenerator];
        attack.addAttackerHitEffectGenerator(attackerHitEffectGenerator);
        attack.addDefenderEvadeEffectGenerator(defenderEvadeEffectGenerator);
        attack.addAttackerEvadeEffectGenerator(attackerEvadeEffectGenerator);
        mockEffDam_defHit = new EffDamage(1);
        mockEffDam_atkHit = new EffDamage(2);
        mockEffDam_defEv = new EffDamage(3);
        mockEffDam_atkEv = new EffDamage(4);
        jest.spyOn(defenderHitEffectGenerator, "getEffect").mockReturnValue(mockEffDam_defHit);
        jest.spyOn(attackerHitEffectGenerator, "getEffect").mockReturnValue(mockEffDam_atkHit);
        jest.spyOn(defenderEvadeEffectGenerator, "getEffect").mockReturnValue(mockEffDam_defEv);
        jest.spyOn(attackerEvadeEffectGenerator, "getEffect").mockReturnValue(mockEffDam_atkEv);
      });

      test('should apply hit effects on hit', () => {
        jest.spyOn(defender, 'applyAttackEffect');
        jest.spyOn(attacker, 'applyAttackEffect');

        defender.beHit(attack);

        expect(defenderHitEffectGenerator.getEffect).toHaveBeenCalled();
        expect(attackerHitEffectGenerator.getEffect).toHaveBeenCalled();
        expect(defenderEvadeEffectGenerator.getEffect).not.toHaveBeenCalled();
        expect(attackerEvadeEffectGenerator.getEffect).not.toHaveBeenCalled();
        expect(defender.applyAttackEffect).toHaveBeenCalledWith(attacker, mockEffDam_defHit);
        expect(attacker.applyAttackEffect).toHaveBeenCalledWith(defender, mockEffDam_atkHit);
      });

      test('should apply evade effects on evade', () => {
        jest.spyOn(defender, 'applyAttackEffect');
        jest.spyOn(attacker, 'applyAttackEffect');

        defender.evadeHit(attack);

        expect(defenderHitEffectGenerator.getEffect).not.toHaveBeenCalled();
        expect(attackerHitEffectGenerator.getEffect).not.toHaveBeenCalled();
        expect(defenderEvadeEffectGenerator.getEffect).toHaveBeenCalled();
        expect(attackerEvadeEffectGenerator.getEffect).toHaveBeenCalled();

        expect(defender.applyAttackEffect).toHaveBeenCalledWith(attacker, mockEffDam_defEv);
        expect(attacker.applyAttackEffect).toHaveBeenCalledWith(defender, mockEffDam_atkEv);
      });
    });

    describe('Entity - Combat - taking damage', () => {

      let mockEffDam_defHit;

      beforeEach(() => {
        rollDice.mockReturnValue(100);
        attacker = new Entity('RAT_MALIGN');
        defender = new Entity('WORM_VINE');
        attacker.health.curHealth = 10;
        defender.health.curHealth = 10;
        mockEffDam_defHit = new EffDamage(5);
        jest.spyOn(defender.health, 'takeDamage'); // Spy on health damage function
        jest.spyOn(defender.movement, 'interruptOngoingMovement'); // Spy on movement interruption
        jest.spyOn(defender, 'die'); // Spy on death function
      });

      test('should correctly apply damage', () => {
        defender.takeDamageFrom(mockEffDam_defHit, attacker);
        expect(defender.health.takeDamage).toHaveBeenCalledWith(5);
      });

      test('should add damage source to damagedBy if first attack', () => {
        defender.takeDamageFrom(mockEffDam_defHit, attacker);
        expect(defender.damagedBy).toEqual([{ damageSource: attacker, damage: mockEffDam_defHit }]);
      });

      test('should accumulate damage for repeated attacks', () => {
        defender.takeDamageFrom(mockEffDam_defHit, attacker);
        defender.takeDamageFrom(new EffDamage(3), attacker);
        expect(defender.damagedBy.length).toBe(1);
        expect(defender.damagedBy[0].damage.amount).toBe(8);
      });

      test('should add a new entry for a different attacker', () => {
        const secondAttacker = new Entity('RAT_INSIDIOUS');
        defender.takeDamageFrom(mockEffDam_defHit, attacker);
        defender.takeDamageFrom(new EffDamage(4), secondAttacker);
        expect(defender.damagedBy.length).toBe(2);
        expect(defender.damagedBy).toEqual([
          { damageSource: attacker, damage: expect.objectContaining({ amount: 5 }) },
          { damageSource: secondAttacker, damage: expect.objectContaining({ amount: 4 }) },
        ]);
      });

      test('should log damage message to UI', () => {
        defender.takeDamageFrom(mockEffDam_defHit, attacker);
        expect(uiPaneMessages.addMessage).toHaveBeenCalledWith('Worm Vine takes 5 damage from Malign Rat');
      });

      test('should interrupt ongoing movement when taking damage', () => {
        defender.takeDamageFrom(mockEffDam_defHit, attacker);
        expect(defender.movement.interruptOngoingMovement).toHaveBeenCalled();
      });

      test('should not die if health remains above zero', () => {
        defender.health.curHealth = 10; // Set health above damage amount
        defender.takeDamageFrom(mockEffDam_defHit, attacker);
        expect(defender.die).not.toHaveBeenCalled();
      });

      test('should die if damage exceeds current health', () => {
        defender.die = jest.fn();
        defender.health.curHealth = 4; // Less than damage
        defender.takeDamageFrom(mockEffDam_defHit, attacker);
        expect(defender.die).toHaveBeenCalled();
      });

      test('should constrain damage to defender\'s remaining health + 1', () => {
        defender.die = jest.fn();
        defender.health.curHealth = 3;
        defender.takeDamageFrom(mockEffDam_defHit, attacker);
        expect(defender.health.takeDamage).toHaveBeenCalledWith(4); // Max allowed damage is 3 + 1
      });
    });

    describe('Entity - Combat - applying effects', () => {

      let mockEffDam_defHit;

      beforeEach(() => {
        rollDice.mockReturnValue(100);
        attacker = new Entity('RAT_MALIGN');
        defender = new Entity('WORM_VINE');
        attacker.health.curHealth = 10;
        defender.health.curHealth = 10;
        mockEffDam_defHit = new EffDamage(1);
      });

      test('applying a damage effect should result in taking damage', () => {
        jest.spyOn(defender, "takeDamageFrom");

        defender.applyAttackEffect(attacker, mockEffDam_defHit);

        expect(defender.takeDamageFrom).toHaveBeenCalledWith(mockEffDam_defHit, attacker);
      });



    });

    // test('', () => { });
    // test('', () => { });


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
      rollDice.mockReturnValue(100); // needed to ensure the worm vine has enough health that it doesn't die when it takes damage, ALSO ensure that stats are 100

      const wormVine = new Entity('WORM_VINE');
      const insidiousRat = new Entity('RAT_INSIDIOUS');
      expect(wormVine.getRelationshipTo(insidiousRat)).toBe("NEUTRAL_TO");

      wormVine.takeDamageFrom(new EffDamage(2), insidiousRat);
      expect(wormVine.getRelationshipTo(insidiousRat)).toBe("VIOLENT_TO");
    });

  });

});