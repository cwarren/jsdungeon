import { Entity } from './entityClass.js';
import { getEntityDef } from "./entityDefinitions.js";
import { rollDice, constrainValue, generateId } from '../util.js';
import { EntityHealth } from './entityHealthClass.js';
import { EntityLocation } from './entityLocationClass.js';
import { EntityMovement } from './entityMovementClass.js';
import { EntityVision } from './entityVisionClass.js';
import { WorldLevel } from '../world/worldLevelClass.js';
import { uiPaneMessages } from "../ui/ui.js";
import { EffGenDamage } from '../effect/effGenDamageClass.js';
import { EffDamage } from '../effect/effDamageClass.js';
import { Attack } from '../effect/attackClass.js';
import { Repository } from '../repositoryClass.js';
import { ItemIdContainer } from '../item/itemIdContainerClass.js';
import { Item } from '../item/itemClass.js';

// NOTE: many of these tests are more integration tests than unit tests

jest.mock('../util.js', () => ({
  rollDice: jest.fn(),
  constrainValue: jest.requireActual('../util.js').constrainValue,
  formatNumberForMessage: jest.requireActual('../util.js').formatNumberForMessage,
  generateId: jest.requireActual('../util.js').generateId,
  idOf: jest.requireActual('../util.js').idOf,
  devTrace: jest.fn(),
}));

jest.mock('../ui/ui.js', () => ({
  uiPaneMessages: { addMessage: jest.fn() },
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
    baseCarryWeight: 10,
    naturalHealingTicks: 100,
    movementSpec: { movementType: 'WALK', baseMovementTime: 100 },
    meleeAttack: TEST_DAMAGE_SPEC,
    relations: { iFeelAboutOthers: "HOSTILE_TO" },
  }
];

TEST_ENTITIES_DEFINITIONS.forEach((ent) => { Entity.ENTITIES[ent.type] = ent; })

describe('Entity', () => {
  let entity;
  let gameState;
  let itemRepo;

  beforeEach(() => {
    rollDice.mockReturnValue(100);
    itemRepo = new Repository('items');
    gameState = { entityRepo: new Repository('entities'), itemRepo: itemRepo, world: [] };
    entity = new Entity(gameState, 'testEntity1');
    const testWorldLevel = new WorldLevel(gameState, 0, 10, 10);
    testWorldLevel.generateGrid();
    gameState.world = [testWorldLevel];
  });

  test('should initialize with correct values', () => {
    expect(entity.id.length).toBeGreaterThan(1);
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
    expect(entity.inventory).toBeNull();
    expect(entity.carryWeightBase).toBe(10);
    expect(entity.carryWeightCapacity).toBe(10);
    expect(entity.carryWeightCurrent).toBe(0);

    expect(gameState.entityRepo.get(entity.id)).toBe(entity);
  });

  test('should initialize with passed in id', () => {
    const e = new Entity(gameState, 'testEntity1', 'foo');
    expect(e.id).toEqual('foo');
  });

  test('should place at cell', () => {
    const targetCell = gameState.world[0].grid[5][6];
    expect(targetCell.entity).toBeNull();
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
    const expectedViewRadius = Math.floor((Entity.ENTITIES['testEntity1'].baseViewRadius + 0 / 15 + 0 / 50 + 0 / 40) * 1.1 * 1);
    expect(entity.getViewRadius()).toBe(expectedViewRadius);
  });

  describe('Entity - Combat', () => {

    let attacker;
    let defender;
    let attack;

    beforeEach(() => {
      rollDice.mockReturnValue(100);
      attacker = new Entity(gameState, 'RAT_MALIGN');
      defender = new Entity(gameState, 'WORM_VINE');
      attack = attacker.createAttack(defender);
    });

    describe('Entity - Combat - death', () => {

      beforeEach(() => {
        rollDice.mockReturnValue(100);
        attacker = new Entity(gameState, 'RAT_MALIGN');
        defender = new Entity(gameState, 'WORM_VINE');
      });

      test('should die and remove entity from world and the entity repo', () => {
        entity.getDeathCredits = jest.fn(() => []);
        entity.placeAtCell(gameState.world[0].grid[5][6]);
        gameState.world[0].levelEntities = [entity];
        expect(gameState.entityRepo.get(entity.id)).not.toBeNull();

        entity.die();

        expect(gameState.world[0].levelEntities).toEqual([]);
        expect(uiPaneMessages.addMessage).toHaveBeenCalledWith('Test Entity 1 dies');
        expect(gameState.entityRepo.get(entity.id)).toBeNull();
      });

      test('purge given entity from damagedBy', () => {
        defender.damagedBy.push({ "damageSource": entity, damageSourceType: 'Entity', "damage": new EffDamage(2) });
        const attackerDamageBy = { "damageSource": attacker, damageSourceType: 'Entity', "damage": new EffDamage(1) };
        defender.damagedBy.push(attackerDamageBy);

        defender.purgeEntityFromDamageTracking(entity);

        expect(defender.damagedBy).toEqual([attackerDamageBy]);
      });

      test('on death should be purged from other entities damagedBy', () => {
        entity.getDeathCredits = jest.fn(() => []);
        entity.placeAtCell(gameState.world[0].grid[5][6]);
        gameState.world[0].levelEntities = [entity];
        expect(gameState.entityRepo.get(entity.id)).not.toBeNull();

        defender.damagedBy.push({ "damageSource": entity, damageSourceType: 'Entity', "damage": new EffDamage(2) });

        entity.die();

        expect(defender.damagedBy).toEqual([]);
      });

      test('should calculate death credits correctly', () => {
        entity.damagedBy = [
          { damageSource: 'source1', damageSourceType: 'foo', damage: { amount: 30 } },
          { damageSource: 'source2', damageSourceType: 'foo', damage: { amount: 70 } },
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
        attacker = new Entity(gameState, 'RAT_MALIGN');
        defender = new Entity(gameState, 'WORM_VINE');
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
        attacker = new Entity(gameState, 'RAT_MALIGN');
        defender = new Entity(gameState, 'WORM_VINE');
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
        attacker = new Entity(gameState, 'RAT_MALIGN');
        defender = new Entity(gameState, 'WORM_VINE');
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
        expect(defender.damagedBy).toEqual([{ damageSource: attacker, damageSourceType: 'Entity', damage: mockEffDam_defHit }]);
      });

      test('should accumulate damage for repeated attacks', () => {
        defender.takeDamageFrom(mockEffDam_defHit, attacker);
        defender.takeDamageFrom(new EffDamage(3), attacker);
        expect(defender.damagedBy.length).toBe(1);
        expect(defender.damagedBy[0].damage.amount).toBe(8);
      });

      test('should add a new entry for a different attacker', () => {
        const secondAttacker = new Entity(gameState, 'RAT_INSIDIOUS');
        defender.takeDamageFrom(mockEffDam_defHit, attacker);
        defender.takeDamageFrom(new EffDamage(4), secondAttacker);
        expect(defender.damagedBy.length).toBe(2);
        expect(defender.damagedBy).toEqual([
          { damageSource: attacker, damageSourceType: 'Entity', damage: expect.objectContaining({ amount: 5 }) },
          { damageSource: secondAttacker, damageSourceType: 'Entity', damage: expect.objectContaining({ amount: 4 }) },
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
        attacker = new Entity(gameState, 'RAT_MALIGN');
        defender = new Entity(gameState, 'WORM_VINE');
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
      const otherEntity = new Entity(gameState, 'testEntity1');
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
      const avatar = new Entity(gameState, 'AVATAR');
      const paleMold = new Entity(gameState, 'MOLD_PALE');
      const wormVine = new Entity(gameState, 'WORM_VINE');
      const insidiousRat = new Entity(gameState, 'RAT_INSIDIOUS');
      const malignRat = new Entity(gameState, 'RAT_MALIGN');

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

      const wormVine = new Entity(gameState, 'WORM_VINE');
      const insidiousRat = new Entity(gameState, 'RAT_INSIDIOUS');
      expect(wormVine.getRelationshipTo(insidiousRat)).toBe("NEUTRAL_TO");

      wormVine.takeDamageFrom(new EffDamage(2), insidiousRat);
      expect(wormVine.getRelationshipTo(insidiousRat)).toBe("VIOLENT_TO");
    });

  });

  describe('Entity - inventory', () => {
    let sourceEntity, targetEntity;
    let item1, item2;

    beforeEach(() => {
      sourceEntity = new Entity(gameState, 'testEntity1');
      targetEntity = new Entity(gameState, 'testEntity1');

      item1 = Item.makeItem("ROCK", "item-1");
      gameState.itemRepo.add(item1);
      item2 = Item.makeItem("STICK", "item-2");
      gameState.itemRepo.add(item2);

    });

    test('should give item to entity and store it in inventory', () => {
      expect(entity.inventory).toBeNull(); // initially null
      entity.giveItem(item1);
      expect(entity.inventory).toBeInstanceOf(ItemIdContainer);
      expect(entity.inventory.has('item-1')).toBe(true);
    });

    test('should not duplicate items when giving same item twice', () => {
      entity.giveItem(item1);
      entity.giveItem(item1);
      expect(entity.inventory.itemIdList).toEqual(['item-1']);
    });

    test('should remove item from inventory with takeItem', () => {
      entity.giveItem(item1);
      entity.giveItem(item2);
      entity.takeItem('item-1');
      expect(entity.inventory.has('item-1')).toBe(false);
      expect(entity.inventory.has('item-2')).toBe(true);
    });

    test('should not throw if removing from empty or missing inventory', () => {
      expect(() => entity.takeItem('item-1')).not.toThrow();
    });

    test('should return true from hasItem when item is in inventory', () => {
      entity.giveItem('item-1');
      expect(entity.hasItem('item-1')).toBe(true);
    });

    test('should return false from hasItem when inventory is null or item missing', () => {
      expect(entity.hasItem('item-1')).toBe(false);
      entity.giveItem('item-2');
      expect(entity.hasItem('item-1')).toBe(false);
    });

    test('takeItemFrom should transfer item from external container into entity inventory', () => {
      const externalContainer = new ItemIdContainer(gameState.itemRepo, ['item-1']);
      expect(externalContainer.has('item-1')).toBe(true);

      sourceEntity.takeItemFrom('item-1', externalContainer);

      expect(sourceEntity.inventory.has('item-1')).toBe(true);
      expect(externalContainer.has('item-1')).toBe(false);
    });

    test('takeItemFrom should not add if source container is empty', () => {
      const externalContainer = new ItemIdContainer(gameState.itemRepo,);
      const result = sourceEntity.takeItemFrom('item-1', externalContainer);

      expect(sourceEntity.inventory).toBeNull(); // Should not initialize if nothing added
      expect(externalContainer.itemIdList).toEqual([]);
    });

    test('giveItemTo should transfer item to another container', () => {
      const targetContainer = new ItemIdContainer(gameState.itemRepo,);
      sourceEntity.giveItem(item1);
      sourceEntity.giveItemTo(item1, targetContainer);

      expect(sourceEntity.inventory.has(item1)).toBe(false);
      expect(targetContainer.has(item1)).toBe(true);
    });

    test('giveItemTo should not transfer if entity inventory is empty', () => {
      const targetContainer = new ItemIdContainer(gameState.itemRepo,);
      sourceEntity.giveItemTo(item1, targetContainer);

      expect(targetContainer.has(item1)).toBe(false);
    });

    test('giveItemTo should not transfer if no container provided', () => {
      sourceEntity.giveItem(item1);
      sourceEntity.giveItemTo(item1, null);
      expect(sourceEntity.inventory.has(item1)).toBe(true);
    });

    test('takeItemFrom should not do anything if no container provided', () => {
      sourceEntity.takeItemFrom('item-1', null);
      expect(sourceEntity.inventory).toBeNull();
    });

    test('takeSingleItemFromCell should not do anything if cell has no inventory', () => {
      const targetCell = gameState.world[0].grid[0][0];
      expect(targetCell.inventory).toBeNull();

      sourceEntity.takeSingleItemFromCell(targetCell);

      expect(sourceEntity.inventory).toBeNull();
      expect(targetCell.inventory).toBeNull();
    });

    test('takeSingleItemFromCell should get an item from a cell that has a single item', () => {
      const targetCell = gameState.world[0].grid[0][0];
      const item = Item.makeItem("ROCK");
      itemRepo.add(item);
      targetCell.giveItem(item);
      expect(sourceEntity.hasItem(item)).toBe(false);
      expect(targetCell.hasItem(item)).toBe(true);

      sourceEntity.takeSingleItemFromCell(targetCell);

      expect(sourceEntity.inventory).not.toBeNull();
      expect(sourceEntity.hasItem(item)).toBe(true);
      expect(targetCell.hasItem(item)).toBe(false);
    });

    test('takeAllItemsFromCell should get all item from a cell that has one or more items', () => {
      const targetCell = gameState.world[0].grid[0][0];
      const item = Item.makeItem("ROCK");
      itemRepo.add(item);
      targetCell.giveItem(item);
      const item2 = Item.makeItem("ROCK");
      itemRepo.add(item2);
      targetCell.giveItem(item2);
      expect(sourceEntity.hasItem(item)).toBe(false);
      expect(targetCell.hasItem(item)).toBe(true);
      expect(targetCell.hasItem(item2)).toBe(true);

      sourceEntity.takeAllItemsFromCell(targetCell);

      expect(sourceEntity.inventory).not.toBeNull();
      expect(sourceEntity.hasItem(item)).toBe(true);
      expect(sourceEntity.hasItem(item2)).toBe(true);
      expect(targetCell.inventory).toBeNull();
    });

    test('dropItem should move item from inventory to current cell', () => {
      sourceEntity.placeAtCell(gameState.world[0].grid[5][5]);
      const item = Item.makeItem("ROCK");
      itemRepo.add(item);
      const item2 = Item.makeItem("ROCK");
      itemRepo.add(item2);
      sourceEntity.giveItem(item);
      sourceEntity.giveItem(item2);

      expect(sourceEntity.inventory.count()).toEqual(2);
      expect(sourceEntity.getCell().inventory).toBeNull();

      sourceEntity.dropItem(item);

      expect(sourceEntity.inventory.count()).toEqual(1);
      expect(sourceEntity.inventory.has(item)).toBe(false);
      expect(sourceEntity.inventory.has(item2)).toBe(true);

      expect(sourceEntity.getCell().inventory.count()).toEqual(1);
      expect(sourceEntity.getCell().inventory.has(item)).toBe(true);
      expect(sourceEntity.getCell().inventory.has(item2)).toBe(false);
    });

    test('dropItem should move items in bulk from inventory to current cell', () => {
      sourceEntity.placeAtCell(gameState.world[0].grid[5][5]);
      const item = Item.makeItem("STICK");
      item.stackCount = 4;
      itemRepo.add(item);
      const item2 = Item.makeItem("ROCK");
      itemRepo.add(item2);
      sourceEntity.giveItem(item);
      sourceEntity.giveItem(item2);

      expect(sourceEntity.inventory.count()).toEqual(2);
      expect(sourceEntity.getCell().inventory).toBeNull();

      sourceEntity.dropItem(item);
      expect(sourceEntity.inventory.count()).toEqual(2);
      expect(sourceEntity.inventory.has(item)).toBe(true);
      expect(item.stackCount).toEqual(3);
      expect(sourceEntity.inventory.has(item2)).toBe(true);

      expect(sourceEntity.getCell().inventory.count()).toEqual(1);
      const itemInCell = sourceEntity.getCell().inventory.getFirstItem();
      expect(itemInCell.type).toEqual(item.type);
      expect(itemInCell.stackCount).toEqual(1);
      expect(sourceEntity.getCell().inventory.has(item2)).toBe(false);

      sourceEntity.dropItem(item, true);
      expect(sourceEntity.inventory.count()).toEqual(1);
      expect(sourceEntity.inventory.has(item)).toBe(false);
      expect(itemInCell.stackCount).toEqual(4);
    });

    test('should calculate carry weight capacity correctly', () => {
      expect(entity.getCarryWeightCapacity()).toBe(entity.carryWeightBase);

      entity.attributes.setAttributes({ strength: 120 });
      expect(entity.getCarryWeightCapacity()).toBe(12);

      entity.attributes.setAttributes({ fortitude: 120 });
      expect(entity.getCarryWeightCapacity()).toBe(13);
    });

    test('should calculate carry weight correctly as items are picked up and dropped', () => {
      const item1 = Item.makeItem("ROCK", "item-1");
      gameState.itemRepo.add(item1);
      const item2 = Item.makeItem("STICK", "item-2");
      item2.stackCount = 2;
      gameState.itemRepo.add(item2);

      // entity has to be placed in a cell to have be able to drop items
      const targetCell = gameState.world[0].grid[5][6];
      entity.placeAtCell(targetCell);

      expect(entity.carryWeightCurrent).toBe(0);

      entity.giveItem(item1);
      entity.giveItem(item2);

      // carry weight reflects items in inventory
      expect(entity.carryWeightCurrent).toBe(item1.getExtendedWeight() + item2.getExtendedWeight());

      // dropping an item reduces carry weight
      entity.dropItem(item1);
      expect(entity.carryWeightCurrent).toBe(item2.getExtendedWeight());

      // dropping part of a stack reduces carry weight
      entity.dropItem(item2);
      expect(entity.carryWeightCurrent).toBe(item2.getExtendedWeight());
    });

  });


  describe('Entity - Serializing', () => {
    test('should generate serializeable object correctly', () => {
      entity.placeAtCell(gameState.world[0].grid[5][5]);
      entity.health.curHealth = 75;
      entity.currentAdvancementPoints = 42;
      entity.damagedBy = [
        { damageSource: 'entity-2', damageSourceType: 'Entity', damage: new EffDamage(10) }
      ];

      const serializedData = entity.forSerializing();

      expect(serializedData).toEqual({
        id: entity.id,
        type: entity.type,
        name: entity.name,
        baseActionTime: entity.baseActionTime,
        attributes: entity.attributes.forSerializing(),
        location: entity.location.forSerializing(),
        vision: entity.vision.forSerializing(),
        movement: entity.movement.forSerializing(),
        health: entity.health.forSerializing(),
        damagedBy: [
          {
            damageSource: 'entity-2',
            damageSourceType: 'Entity',
            damage: new EffDamage(10).forSerializing()
          }
        ],
        baseKillPoints: entity.baseKillPoints,
        carryWeightCurrent: 0,
        carryWeightBase: 10,
        carryWeightCapacity: 10,
        currentAdvancementPoints: 42,
        actionStartingTime: entity.actionStartingTime,
        inventory: null,
      });

      expect(typeof serializedData.id).toBe('string');
      expect(serializedData.id.length).toBeGreaterThan(1);
      expect(serializedData.location).toBeTruthy();
      expect(serializedData.vision).toBeTruthy();
      expect(serializedData.movement).toBeTruthy();
      expect(serializedData.health).toBeTruthy();
    });

    test('should serialize to JSON string correctly', () => {
      entity.placeAtCell(gameState.world[0].grid[5][5]);
      entity.health.curHealth = 75;
      entity.currentAdvancementPoints = 42;

      const jsonString = entity.serialize();
      const parsedData = JSON.parse(jsonString);

      expect(parsedData).toEqual(entity.forSerializing());
      expect(typeof jsonString).toBe('string');
    });

    test('should deserialize correctly', () => {
      entity.placeAtCell(gameState.world[0].grid[5][5]);
      entity.health.curHealth = 75;
      entity.currentAdvancementPoints = 42;
      entity.damagedBy = [
        { damageSource: 'entity-2', damageSourceType: 'Entity', damage: new EffDamage(10) }
      ];

      const serializedData = entity.forSerializing();
      const deserializedEntity = Entity.deserialize(serializedData, gameState);

      expect(deserializedEntity.id).toBe(entity.id);
      expect(deserializedEntity.type).toBe(entity.type);
      expect(deserializedEntity.name).toBe(entity.name);
      expect(deserializedEntity.displaySymbol).toBe(entity.displaySymbol);
      expect(deserializedEntity.displayColor).toBe(entity.displayColor);
      expect(deserializedEntity.baseActionTime).toBe(entity.baseActionTime);
      expect(deserializedEntity.attributes.forSerializing()).toEqual(entity.attributes.forSerializing());
      expect(deserializedEntity.location.forSerializing()).toEqual(entity.location.forSerializing());
      expect(deserializedEntity.vision.forSerializing()).toEqual(entity.vision.forSerializing());
      expect(deserializedEntity.movement.forSerializing()).toEqual(entity.movement.forSerializing());
      expect(deserializedEntity.health.forSerializing()).toEqual(entity.health.forSerializing());
      expect(deserializedEntity.meleeAttack).toEqual(entity.meleeAttack);
      expect(deserializedEntity.relations).toEqual(entity.relations);
      expect(deserializedEntity.damagedBy).toHaveLength(1);
      expect(deserializedEntity.damagedBy[0].damageSource).toBe('entity-2');
      expect(deserializedEntity.damagedBy[0].damageSourceType).toBe('Entity');
      expect(deserializedEntity.damagedBy[0].damage.amount).toBe(10);
      expect(deserializedEntity.baseKillPoints).toBe(entity.baseKillPoints);
      expect(deserializedEntity.currentAdvancementPoints).toBe(42);
      expect(deserializedEntity.actionStartingTime).toBe(entity.actionStartingTime);
      expect(deserializedEntity.inventory).toBeNull();
      expect(deserializedEntity.carryWeightBase).toEqual(entity.carryWeightBase);
      expect(deserializedEntity.carryWeightCapacity).toEqual(entity.carryWeightCapacity);
      expect(deserializedEntity.carryWeightCurrent).toEqual(entity.carryWeightCurrent);
    });

    test('should deserialize with empty inventory correctly', () => {
      entity.placeAtCell(gameState.world[0].grid[5][5]);
      entity.health.curHealth = 75;
      entity.currentAdvancementPoints = 42;
      entity.damagedBy = [
        { damageSource: 'entity-2', damageSourceType: 'Entity', damage: new EffDamage(10) }
      ];

      const serializedData = entity.forSerializing();
      serializedData.inventory = null;

      const deserializedEntity = Entity.deserialize(serializedData, gameState);

      expect(deserializedEntity.inventory).toBeNull();
      expect(deserializedEntity.carryWeightBase).toEqual(entity.carryWeightBase);
      expect(deserializedEntity.carryWeightCapacity).toEqual(entity.carryWeightCapacity);
      expect(deserializedEntity.carryWeightCurrent).toEqual(entity.carryWeightCurrent);
    });

    test('should deserialize with full inventory correctly', () => {
      entity.placeAtCell(gameState.world[0].grid[5][5]);
      entity.health.curHealth = 75;
      entity.currentAdvancementPoints = 42;
      entity.damagedBy = [
        { damageSource: 'entity-2', damageSourceType: 'Entity', damage: new EffDamage(10) }
      ];

      const item1 = Item.makeItem("ROCK", "item-1");
      gameState.itemRepo.add(item1);
      const item2 = Item.makeItem("STICK", "item-2");
      gameState.itemRepo.add(item2);
      entity.giveItem(item1);
      entity.giveItem(item2);

      const serializedData = entity.forSerializing();

      const deserializedEntity = Entity.deserialize(serializedData, gameState);

      expect(deserializedEntity.inventory).toBeInstanceOf(ItemIdContainer);
      expect(deserializedEntity.inventory.has(item1)).toEqual(true);
      expect(deserializedEntity.inventory.has(item2)).toEqual(true);

      expect(deserializedEntity.carryWeightBase).toEqual(entity.carryWeightBase);
      expect(deserializedEntity.carryWeightCapacity).toEqual(entity.carryWeightCapacity);
      expect(deserializedEntity.carryWeightCurrent).toEqual(entity.carryWeightCurrent);
    });

    test('should correctly re-add the entity to the gameState repository on deserialization', () => {
      const serializedData = entity.forSerializing();
      const deserializedEntity = Entity.deserialize(serializedData, gameState);

      expect(gameState.entityRepo.get(deserializedEntity.id)).toBe(deserializedEntity);
    });
  });

});