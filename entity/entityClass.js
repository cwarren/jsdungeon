import { EffDamage } from "../effect/effDamageClass.js";
import { rollDice, getRandomListItem, constrainValue, devTrace, formatNumberForMessage, generateId, idOf } from "../util.js";
import { ENTITIES_DEFINITIONS } from "./entityDefinitions.js";
import { uiPaneMessages } from "../ui/ui.js";
import { EntityHealth, DEFAULT_NATURAL_HEALING_TICKS } from "./entityHealthClass.js";
import { EntityLocation } from "./entityLocationClass.js";
import { EntityMovement } from "./entityMovementClass.js";
import { EntityVision } from "./entityVisionClass.js";
import { Attack } from "../effect/attackClass.js";
import { EntityAttributes } from "./entityAttributesClass.js";
import { ValueModifier, ModifierLayer } from "../valueModifierClass.js";
import { ItemIdContainer } from "../item/itemIdContainerClass.js";

const DEFAULT_ACTION_COST = 100;

class Entity {

  constructor(gameState, type, id = null) {
    this.gameState = gameState;
    this.id = id ? id : generateId();
    this.type = type;
    this.name = Entity.ENTITIES[type].name;
    this.displaySymbol = Entity.ENTITIES[type].displaySymbol;
    this.displayColor = Entity.ENTITIES[type].displayColor;

    this.baseActionTime = Entity.ENTITIES[type].baseActionTime || DEFAULT_ACTION_COST;

    // NOTE: the attributes have to be set very early because many of the subsequent things use attributes in calculations
    this.attributes = new EntityAttributes(this);
    this.attributes.rollAttributes(Entity.ENTITIES[type].attributes);

    this.location = new EntityLocation(this, -1, -1, -1); // placeholder values for initial location
    this.vision = new EntityVision(this, this.getViewRadius());
    this.movement = new EntityMovement(this, Entity.ENTITIES[type].movementSpec);
    this.health = new EntityHealth(
      this,
      this.getMaxHeath(),
      this.getNaturalHealingAmount(),
      this.getNaturalHealingTime()
    );

    this.meleeAttack = Entity.ENTITIES[type].meleeAttack;

    this.relations = Entity.ENTITIES[type].relations;

    // used in combat AI and for relationship stuff
    this.damagedBy = []; // array of {damageSource: string or object, damageSourceType: string, damage; EffDamage instance} objects

    this.baseKillPoints = 10; // worth this many advancement points when killed
    this.currentAdvancementPoints = 0;

    this.actionStartingTime = 0;

    this.inventory = null;

    // NOTE: carry weight capacity is not a hard limit - once carry weight is over capacity, the entity will be slowed down
    this.carryWeightBase = Entity.ENTITIES[type].baseCarryWeight || 0;
    this.carryWeightCapacity = this.getCarryWeightCapacity();
    this.carryWeighCurrent = 0;

    this.gameState.entityRepo.add(this);
  }

  setGameState(gameState) {
    devTrace(5, `set game state for entity`, gameState);
    this.gameState = gameState;
  }

  //======================================================================
  // SERIALIZATION

  forSerializing() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      baseActionTime: this.baseActionTime,
      attributes: this.attributes.forSerializing(),
      location: this.location.forSerializing(),
      vision: this.vision.forSerializing(),
      movement: this.movement.forSerializing(),
      health: this.health.forSerializing(),
      damagedBy: this.damagedBy.map(dmg => ({
        damageSource: typeof dmg.damageSource === 'object' ? dmg.damageSource.id : dmg.damageSource,
        damageSourceType: dmg.damageSourceType,
        damage: dmg.damage.forSerializing(),
      })),
      baseKillPoints: this.baseKillPoints,
      currentAdvancementPoints: this.currentAdvancementPoints,
      actionStartingTime: this.actionStartingTime,
      inventory: this.inventory ? this.inventory.forSerializing() : null,
      carryWeightBase: this.carryWeightBase,
      carryWeightCapacity: this.carryWeightCapacity,
      carryWeighCurrent: this.carryWeighCurrent,
    };
  }

  serialize() {
    return JSON.stringify(this.forSerializing());
  }

  static deserialize(data, gameState) {
    const entity = new Entity(gameState, data.type, data.id);

    entity.name = data.name;
    entity.baseActionTime = data.baseActionTime;

    // Restore attributes, location, vision, movement, and health
    entity.attributes = EntityAttributes.deserialize(data.attributes, entity);
    entity.location = EntityLocation.deserialize(data.location, entity);
    entity.vision = EntityVision.deserialize(data.vision, entity);
    entity.movement = EntityMovement.deserialize(data.movement, entity);
    entity.health = EntityHealth.deserialize(data.health, entity);

    entity.damagedBy = data.damagedBy.map(dmg => ({
      damageSource: dmg.damageSource, // NOTE: these are all strings; they're de-referenced on use as needed
      damageSourceType: dmg.damageSourceType,
      damage: EffDamage.deserialize(dmg.damage)
    }));

    entity.baseKillPoints = data.baseKillPoints;
    entity.currentAdvancementPoints = data.currentAdvancementPoints;
    entity.actionStartingTime = data.actionStartingTime;

    entity.inventory = null;
    if (data.inventory) {
      entity.inventory = ItemIdContainer.deserialize(gameState.itemRepo, data.inventory);
    }

    // NOTE: could derive these instead handling them directly as a part of serialization, but simpler for now to just make them explicit
    entity.carryWeightBase= data.carryWeightBase;
    entity.carryWeightCapacity= data.carryWeightCapacity;
    entity.carryWeighCurrent= data.carryWeighCurrent;

    return entity;
  }


  //======================================================================
  // INSPECTION & INFORMATION

  getCell() {
    return this.location.getCell();
  }
  getCellAtDelta(dx, dy) {
    return this.location.getCellAtDelta(dx, dy);
  }
  getAdjacentCells() {
    return this.location.getAdjacentCells();
  }

  getAdjacentEntities() {
    devTrace(7, "getting entities adjacent to entity", this);
    const adjCells = this.location.getAdjacentCells();
    const adjEntities = [];
    adjCells.forEach(cell => { if (cell.entity) { adjEntities.push(cell.entity); } });
    devTrace(6, "other entities adjacent to this entity", this, adjEntities);
    return adjEntities;
  }

  //======================================================================
  // VISION

  // fortitude (minor), awareness (major), psyche (minor)
  getViewRadius() {
    let baseViewRadius = Entity.ENTITIES[this.type].baseViewRadius;
    let viewRadiusModifier = new ValueModifier([
      new ModifierLayer(
        [],
        [
          (this.attributes.awareness - EntityAttributes.BASE_VALUE) / 14,
          (this.attributes.fortitude - EntityAttributes.BASE_VALUE) / 51,
          (this.attributes.psyche - EntityAttributes.BASE_VALUE) / 39,
        ]
      ),
      new ModifierLayer(
        [
          this.attributes.awareness / EntityAttributes.BASE_VALUE,
        ],
        []
      ),
    ]);
    return viewRadiusModifier.appliedTo(baseViewRadius);
  }

  isVisibleTo(otherEntity) {
    return this.vision.isVisibleToEntity(otherEntity);
  }

  canSeeEntity(otherEntity) {
    return this.vision.canSeeEntity(otherEntity);
  }

  determineVisibleCells() {
    return this.vision.determineVisibleCells();
  }

  //======================================================================
  // ADVANCEMENT

  receiveAdvancementPoints(points) {
    devTrace(2, `${this.type} receiving ${points} advancement points`);
    this.currentAdvancementPoints += points;
  }


  //======================================================================
  // AI

  takeTurn() {
    devTrace(2, `${this.type} acts at ${this.actionStartingTime}`, this);
    let actionTime = this.baseActionTime;
    this.healNaturally();

    // AI logic or automatic actions go here...
    const adjacentsCost = this.dealWithAdjacentEntities();
    if (adjacentsCost > 0) { return adjacentsCost; }

    if (this.movement.type == 'STATIONARY') { return this.movement.actionTime; }
    if (this.movement.type == 'STEP_AIMLESS') { return this.movement.moveStepAimless(); }
    if (this.movement.type == 'WANDER_AIMLESS') { return this.movement.moveWanderAimless(); }
    if (this.movement.type == 'WANDER_AGGRESSIVE') { return this.movement.moveWanderAggressive(); }

    return actionTime;
  }

  static RELATIONSHIPS = ["TAMED_BY", "FRIENDLY_TO", "NEUTRAL_TO", "HOSTILE_TO", "VIOLENT_TO"];
  // A note on relations:
  // 0. IMPLICIT: if entity B has damaged entity A, then entity A is VIOLENT_TO entity B regardless of anything in the definitions
  // 1. overrideFeelingsToOthers otherwise has precedence on how entity A feels about entity B, but has no effect on how B feels about A
  // 2. othersFeelAboutMe has precedence over another entity's iFeelAboutOthers - if entity X has othersFeelAboutMe HOSTILE_TO and entity Y has iFeelAboutOthers NEUTRAL_TO, Y will be HOSTILE_TO X
  // 3. iFeelAboutOthers comes into play only if none of the above do
  // 4. lastly if nothing at all is specified, then the default is NEUTRAL_TO
  getRelationshipTo(otherEntity) {
    devTrace(6, "getting entity relationship", this, otherEntity);
    if (this.getEntitiesThatDamagedMe().includes(otherEntity)) { return "VIOLENT_TO"; }
    if (this.relations.overrideFeelingsToOthers && this.relations.overrideFeelingsToOthers[otherEntity.type]) {
      return this.relations.overrideFeelingsToOthers[otherEntity.type]
    }
    let relation = otherEntity.relations.othersFeelAboutMe;
    if (!relation) {
      relation = this.relations.iFeelAboutOthers;
    }
    if (!relation) {
      relation = "NEUTRAL_TO";
    }
    return relation;
  }

  getDefaultActionFor(otherEntity) {
    devTrace(5, "getting default action", this, otherEntity);
    const relationship = this.getRelationshipTo(otherEntity);
    devTrace(6, `${this.name} is ${relationship} ${otherEntity.name}`);
    if (["HOSTILE_TO", "VIOLENT_TO"].includes(relationship)) {
      return "ATTACK"
    }
    if (["FRIENDLY_TO", "NEUTRAL_TO"].includes(relationship)) {
      return "BUMP";
    }
    if (["TAMED_BY"].includes(relationship)) {
      return "SWAP";
    }
    return "ATTACK";
  }

  getEntitiesThatDamagedMe() {
    this.deRefDamagedBy();
    return this.damagedBy
      .filter(damBy => damBy.damageSourceType == 'Entity')
      .map(damBy => damBy.damageSource);
  }

  purgeEntityFromDamageTracking(entity) {
    const purged = this.damagedBy.filter(damBy => damBy.damageSourceType != 'Entity' || damBy.damageSource.id != entity.id);
    this.damagedBy = purged;
  }

  dealWithAdjacentEntities() {
    const hostiles = [];
    const superHostiles = [];
    const toRetaliate = this.getEntitiesThatDamagedMe();
    this.getAdjacentEntities().forEach(adjEnt => {
      if (toRetaliate.includes(adjEnt)) { superHostiles.push(adjEnt); }
      else if (["HOSTILE_TO", "VIOLENT_TO"].includes(this.getRelationshipTo(adjEnt))) { hostiles.push(adjEnt); }
    });
    let entityToAttack = null;
    if (superHostiles.length > 0) {
      entityToAttack = getRandomListItem(superHostiles);
    } else if (hostiles.length > 0) {
      // check to see if any of them have damaged this entity before - prioritize those, in order of damage done to me, breaking ties at random
      entityToAttack = getRandomListItem(hostiles);
    }
    if (entityToAttack) { return this.doMeleeAttackOn(entityToAttack); }
    return 0;
  }

  handleAttemptedMoveIntoOccupiedCell(targetCell) {
    devTrace(6, `${this.type} trying to move into occupied cell`, targetCell);
    const defaultAction = this.getDefaultActionFor(targetCell.entity);
    if (defaultAction == 'ATTACK') {
      return this.doMeleeAttackOn(targetCell.entity);
    }
    if (defaultAction == 'BUMP') {
      // TODO: put a message in the message pane about this, and change the console.log to a devTrace
      console.log(`move prevented because target cell is already occupied: ${targetCell.entity.name} at ${targetCell.x} ${targetCell.y} ${targetCell.z}`);
      return 0;
    }
    if (defaultAction == 'SWAP') {
      // TODO: put a message in the message pane about this, and change the console.log to a devTrace
      console.log(`SWAP ACTION NOT YET IMPLEMENTED: ${targetCell.entity.name} at ${targetCell.x} ${targetCell.y} ${targetCell.z}`);
      return 0;
    }
    console.log(`handleAttemptedMoveIntoOccupiedCell results in unknown action ${defaultAction}, doing nothing at ${targetCell.x} ${targetCell.y} ${targetCell.z}`);
    return 0;
  }

  //======================================================================
  // ACTIONS
  // IMPORTANT!!!!
  // action functions should return the time cost of the action!

  setActionStartingTime(actionStartingTime) {
    this.actionStartingTime = actionStartingTime;
  }

  interruptOngoingActions() {
    this.movement.interruptOngoingMovement();
  }

  // ------------------
  // ACTIONS - MOVEMENT & LOCATION

  tryMove(dx, dy) {
    return this.movement.tryMove(dx, dy);
  }

  tryMoveToCell(targetCell) {
    return this.movement.tryMoveToCell(targetCell);
  }

  placeAt(x, y, z) {
    return this.location.placeAt(x, y, z);
  }

  placeAtCell(cell) {
    return this.location.placeAtCell(cell);
  }

  canMoveToCell(cell) {
    return this.movement.canMoveToCell(cell);
  }
  canMoveToDeltas(dx, dy) {
    return this.movement.canMoveToDeltas(dx, dy);
  }

  confirmMove(newCell) {
    return this.movement.confirmMove(newCell);
  }
  confirmMoveDeltas(dx, dy) {
    return this.movement.confirmMoveDeltas(dx, dy);
  }

  startRunning(deltas) {
    this.movement.startRunning(deltas);
  }

  stopRunning() {
    this.movement.stopRunning();
  }
  canRunToDeltas(dx, dy) { // similar to canMoveTo, but more things will stop running
    return this.movement.canRunToDeltas(dx, dy);
  }
  continueRunning() {
    return this.movement.continueRunning();
  }

  startSleeping() {
    this.movement.startSleeping();
  }
  stopSleeping() {
    this.movement.stopSleeping();
  }
  continueSleeping() {
    return this.movement.continueSleeping();
  }

  // ------------------
  // COMBAT

  createAttack(defender) {
    // TODO: implement customizations / extensions to effect generators here?
    // E.g. a melee attack damage effect generator gen's damage based on wielded weapon, stats, temp mods, etc.

    // NOTE: probably need to pass in some kind of additional attackType param or something to be able
    // to know what dam generators to create and how; maybe 'melee' vs 'ranged' is sufficient for now...?
    // Or maybe pass in the attack weapon? That sounds better off hand...

    const atk = new Attack(
      this,
      defender,
      this.getMeleeHitEffectGenerators(),
    );
    return atk;
  }

  // NOTE: override this in Avatar
  getMeleeHitEffectGenerators() {
    return [this.meleeAttack.damager];
  }

  getPrecision(attack) {
    let attackPrecision = 0;
    if (Entity.ENTITIES[this.type].basePrecision) { attackPrecision = Entity.ENTITIES[this.type].basePrecision; }

    // dexterity (major), awareness (moderate), refinement (minor), strength (moderate), psyche (minor)
    let attackPrecisionModifier = new ValueModifier([
      new ModifierLayer(
        [],
        [
          (this.attributes.dexterity) / 6,
          (this.attributes.awareness) / 17,
          (this.attributes.strength - EntityAttributes.BASE_VALUE) / 28,
        ]
      ),
      new ModifierLayer(
        [
          this.attributes.dexterity / EntityAttributes.BASE_VALUE,
          Math.sqrt(this.attributes.awareness / EntityAttributes.BASE_VALUE),
        ],
        [
          (this.attributes.refinement - EntityAttributes.BASE_VALUE) / 39,
          (this.attributes.psyche - EntityAttributes.BASE_VALUE) / 43,
        ]
      ),
      new ModifierLayer(
        [
          Math.sqrt(this.attributes.dexterity / EntityAttributes.BASE_VALUE),
        ],
        []
      ),
    ]);

    attackPrecision = attackPrecisionModifier.appliedTo(attackPrecision);
    return Math.floor(attackPrecision);
  }

  getEvasion(attack) {
    let attackEvasion = 0;
    if (Entity.ENTITIES[this.type].baseEvasion) { attackEvasion = Entity.ENTITIES[this.type].baseEvasion; }

    // dexterity (major), awareness (major), refinement (moderate)
    let attackEvasionModifier = new ValueModifier([
      new ModifierLayer(
        [],
        [
          (this.attributes.dexterity) / 13,
          (this.attributes.awareness) / 14,
        ]
      ),
      new ModifierLayer(
        [
          this.attributes.dexterity / EntityAttributes.BASE_VALUE,
        ],
        [
          (this.attributes.refinement - EntityAttributes.BASE_VALUE) / 26,
        ]
      ),
      new ModifierLayer(
        [
          Math.sqrt(this.attributes.awareness / EntityAttributes.BASE_VALUE),
        ],
        []
      ),
    ]);

    attackEvasion = attackEvasionModifier.appliedTo(attackEvasion);
    return Math.floor(attackEvasion);
  }

  isHitCritical(attack) {
    return rollDice("1d100") <= this.getCriticalHitThreshold();
  }
  getCriticalHitThreshold() {
    return 2;
  }

  isEvadeCritical(attack) {
    return rollDice("1d100") <= this.getCriticalEvadeThreshold();
  }
  getCriticalEvadeThreshold() {
    return 2;
  }

  beHit(attack) {
    attack.defenderHitEffectGenerators.forEach(effGen => {
      attack.defender.applyAttackEffect(attack.attacker, effGen.getEffect());
    });
    attack.attackerHitEffectGenerators.forEach(effGen => {
      attack.attacker.applyAttackEffect(attack.defender, effGen.getEffect());
    });
  }

  evadeHit(attack) {
    attack.defenderEvadeEffectGenerators.forEach(effGen => {
      attack.defender.applyAttackEffect(attack.attacker, effGen.getEffect());
    });
    attack.attackerEvadeEffectGenerators.forEach(effGen => {
      attack.attacker.applyAttackEffect(attack.defender, effGen.getEffect());
    });
  }

  applyAttackEffect(effectSource, effect) {
    // effect mitigation in this function, or deeper down? Maybe some of each - probably will make sense to do different things in different places
    if (effect instanceof EffDamage) {
      return this.takeDamageFrom(effect, effectSource);
    }

    console.log(`Unknown or unhandled effect type: ${effect.constructor.name}`);

    return null;
  }

  doMeleeAttackOn(otherEntity) {
    devTrace(3, `${this.type} doing melee attack on ${otherEntity.type}`, this, otherEntity);
    if (this.meleeAttack) {
      const atk = this.createAttack(otherEntity);
      atk.determineAttackOutcome();
      atk.attacker.showAttackMessages(atk, uiPaneMessages); // show messages for both, so avatar gets hitting and being hit messages
      atk.defender.showAttackMessages(atk, uiPaneMessages);
      if (atk.outcome == 'HIT' || atk.outcome == 'CRITICAL_HIT') {
        otherEntity.beHit(atk);
      } else {
        otherEntity.evadeHit(atk);
      }

      return this.getMeleeAttackActionCost();
    }
    devTrace(4, `${this.type} has no melee attack`);
    return 0;
  }

  getMeleeAttackActionCost() {
    devTrace(6, "getting melee attack action cost for entity", this);
    if (this.meleeAttack) { return this.meleeAttack.baseMeleeAttackTime; }
    return DEFAULT_ACTION_COST;
  }

  // ------------------
  // HEALTH

  // this assumes the damage source is an entity; this will be revised when we have other damage sources
  takeDamageFrom(effDam, otherEntity) {
    devTrace(4, "taking attack damage from entity", this, effDam, otherEntity);

    let damAmount = this.getMitigatedDamageAmount(effDam, otherEntity);

    damAmount = constrainValue(effDam.amount, 0, this.health.curHealth + 1);

    this.health.takeDamage(damAmount);

    this.deRefDamagedBy();

    let existingEntry = this.damagedBy.find(entry => entry.damageSource === otherEntity);
    if (existingEntry) {
      existingEntry.damage.amount += damAmount;
    } else {
      this.damagedBy.push({ "damageSource": otherEntity, damageSourceType: 'Entity', "damage": new EffDamage(damAmount) });
    }

    uiPaneMessages.addMessage(`${this.name} takes ${formatNumberForMessage(damAmount)} damage from ${otherEntity.name}`);

    // Reset movement plans on damage
    this.movement.interruptOngoingMovement();

    if (!this.health.isAlive()) {
      this.die();
    }

    return null;
  }

  // NOTE: modifers for mitigation are inverted relative to most other cases, as the point is reduction, not increase
  getMitigatedDamageAmount(effDam, effSource) {
    let damAmount = effDam.amount;

    if (effDam.types.includes('PHYSICAL')) {
      // attribute-based: fortitude (moderate), strength (minor), aura (very minor)
      const physicalMitigtionAttributeModifer = new ValueModifier([
        new ModifierLayer(
          [
            Math.sqrt(Math.sqrt(EntityAttributes.BASE_VALUE / this.attributes.strength)),
            Math.sqrt(Math.sqrt(Math.sqrt(EntityAttributes.BASE_VALUE / this.attributes.aura))),
          ],
          [
            (EntityAttributes.BASE_VALUE - this.attributes.fortitude) / 45,
          ]
        ),
        new ModifierLayer(
          [
            Math.sqrt(EntityAttributes.BASE_VALUE / this.attributes.fortitude),
          ],
          []
        ),
      ]);

      damAmount = physicalMitigtionAttributeModifer.appliedTo(damAmount);
    }

    return damAmount;
  }


  // assign death credits, remove this entity from the game
  die() {
    devTrace(2, `${this.type} has died.`, this);

    const killCredits = this.getDeathCredits();
    killCredits.forEach(entry => {
      if (entry.damageSource && typeof entry.damageSource.receiveAdvancementPoints === "function") {
        const advancementPoints = Math.floor(this.baseKillPoints * entry.proportionalDamage);
        entry.damageSource.receiveAdvancementPoints(advancementPoints);
      }
    });

    this.gameState.world[this.location.z].removeEntity(this);
    this.gameState.entityRepo.remove(this.id);

    // once this entity is dead it doesn't get credit in the future for killing anything...
    this.gameState.entityRepo.items.forEach((entity, entityId) => {
      entity.purgeEntityFromDamageTracking(this);
    });

    uiPaneMessages.addMessage(`${this.name} dies`);

    this.damagedBy = [];
    this.vision.visibleCells.clear();
    this.vision.seenCells.clear();
  }

  deRefDamagedBy() {
    this.damagedBy.forEach(entry => {
      if (typeof entry.damageSource === 'string') {
        if (entry.damageSourceType === 'Entity') {
          entry.damageSource = this.gameState.entityRepo.get(entry.damageSource);
        }
      }
    });
  }

  // get proportional responsibility for damage dealt to this entity
  getDeathCredits() {
    devTrace(6, "determining death credits for entity", this);
    let totalDamage = this.damagedBy.reduce((sum, entry) => sum + entry.damage.amount, 0);
    if (totalDamage === 0) {
      return []; // No damage dealt, return an empty array
    }

    this.deRefDamagedBy();

    return this.damagedBy.map(entry => ({
      damageSource: entry.damageSource,
      proportionalDamage: entry.damage.amount / totalDamage
    }));
  }

  healNaturally() {
    this.health.healNaturally(this.actionStartingTime);
  }

  getMaxHeath() {
    let maxHealth = rollDice(Entity.ENTITIES[this.type].baseHealthRoll);

    // fortitude (major), strength (minor), stability (minor), aura (minor), depth (moderate)
    let maxHealthModifier = new ValueModifier([
      new ModifierLayer(
        [],
        [(this.attributes.fortitude - EntityAttributes.BASE_VALUE) / 11,
        (this.attributes.strength - EntityAttributes.BASE_VALUE) / 34,]
      ),
      new ModifierLayer(
        [this.attributes.fortitude / EntityAttributes.BASE_VALUE,
        Math.sqrt(this.attributes.depth / EntityAttributes.BASE_VALUE),],
        [(this.attributes.stability - EntityAttributes.BASE_VALUE) / 47,
        (this.attributes.aura - EntityAttributes.BASE_VALUE) / 55,
        (this.attributes.depth - EntityAttributes.BASE_VALUE) / 26,]
      ),
      new ModifierLayer(
        [Math.sqrt(this.attributes.fortitude / EntityAttributes.BASE_VALUE),],
        []
      ),
    ]);

    return Math.floor(maxHealthModifier.appliedTo(maxHealth));
  }

  getNaturalHealingAmount() {
    let healingAmount = Entity.ENTITIES[this.type].baseNaturalHealingAmount;

    // recovery (major), fortitude (minor), flow (minor)
    let healingAmountModifier = new ValueModifier([
      new ModifierLayer(
        [],
        [
          (this.attributes.fortitude - EntityAttributes.BASE_VALUE) / 41,
          (this.attributes.flow - EntityAttributes.BASE_VALUE) / 37,
        ]
      ),
      new ModifierLayer(
        [
          this.attributes.recovery / EntityAttributes.BASE_VALUE,
        ],
        [
          (this.attributes.recovery - EntityAttributes.BASE_VALUE) / 17,
          (this.attributes.fortitude - EntityAttributes.BASE_VALUE) / 33,
          (this.attributes.flow - EntityAttributes.BASE_VALUE) / 37,
        ]
      ),
      new ModifierLayer(
        [
          Math.sqrt(this.attributes.recovery / EntityAttributes.BASE_VALUE),
        ],
        []
      ),
    ]);

    return healingAmountModifier.appliedTo(healingAmount);
  }

  getNaturalHealingTime() {
    // NOTE: for healing time, lower is better!
    // calc as if higher is better (per normal modifiers stuff), then at the end use that in the denom as a factor

    let healingTime = DEFAULT_NATURAL_HEALING_TICKS;

    // recovery (major), fortitude (moderate), will (minor), refinement (minor), flow (minor)
    let healingTimeModifier = new ValueModifier([
      new ModifierLayer(
        [
          Math.sqrt(this.attributes.fortitude / EntityAttributes.BASE_VALUE),
        ],
        [
          (this.attributes.recovery - EntityAttributes.BASE_VALUE) / 19,
          (this.attributes.fortitude - EntityAttributes.BASE_VALUE) / 11,
          (this.attributes.refinement - EntityAttributes.BASE_VALUE) / 35,
        ]
      ),
      new ModifierLayer(
        [],
        [
          (this.attributes.will - EntityAttributes.BASE_VALUE) / 47,
          (this.attributes.flow - EntityAttributes.BASE_VALUE) / 26,
        ]
      ),
      new ModifierLayer(
        [
          this.attributes.recovery / EntityAttributes.BASE_VALUE,
        ],
        [
          (this.attributes.recovery - EntityAttributes.BASE_VALUE) / 7,
        ]
      ),
    ]);

    const adjHealingTime = healingTimeModifier.appliedTo(healingTime);

    return healingTime * (healingTime / adjHealingTime);
  }

  // ------------------
  // PLAYER COMMUNICATION

  showNaturalHealingMessage(message) {
    // by default, entities don't show messages for natural healing, though some may (such as the avatar)
  }

  showAttackMessages(atk, messagePane) {
    // by default, entities don't show messages for attacks, though some may (such as the avatar)
    // future: this is probably where we check to see if this entity is visible to the avatar and control message display based on that (at which point the doubled call in doMeleeAttackOn should be replaced by a this.showAttackMessages)
    // atk.sendMessageAboutAttackOutcome(uiPaneMessages); // TODO NEXT: replace this with a showAttackMessages(atk, pane) call, which the avatar overrides (send message only if attacker or defender is visible)
  }

  showMessage(msg) {
    // empty for standard entities, overridden in Avatar
  }

  //======================================================================
  // INVENTORY

  giveItem(itemObjectOrId) {
    if (! this.inventory) {
      this.inventory = new ItemIdContainer(this.gameState.itemRepo);
    }
    this.inventory.add(itemObjectOrId);
    this.carryWeighCurrent = this.inventory.getTotalExtendedWeight();
  }

  takeItem(itemObjectOrId) {
    if (! this.inventory) {
      console.log(`Cannot remove item ${idOf(itemObjectOrId)} from empty or non-existent inventory of entity ${this.name}`);
      return;
    }
    this.inventory.remove(itemObjectOrId);
    this.carryWeighCurrent = this.inventory.getTotalExtendedWeight();
  }

  hasItem(itemObjectOrId) {
    if (! this.inventory) {
      return false;
    }
    return this.inventory.has(itemObjectOrId);
  }

  takeItemFrom(itemObjectOrId, itemIdContainer) {
    if (! itemIdContainer || itemIdContainer.isEmpty()) {
      console.log(`Cannot take item ${idOf(itemObjectOrId)} from empty or non-existent container`);
      return;
    }
    if (! this.inventory) {
      this.inventory = new ItemIdContainer(this.gameState.itemRepo);
    }
    
    this.inventory.takeItemFrom(itemObjectOrId, itemIdContainer);
    this.carryWeighCurrent = this.inventory.getTotalExtendedWeight();
  }

  giveItemTo(itemObjectOrId, itemIdContainer) {
    if (! itemIdContainer) {
      console.log(`Cannot put item ${idOf(itemObjectOrId)} into non-existent container`);
      return;
    }
    if (! this.inventory || this.inventory.isEmpty()) {
      console.log(`Cannot give item ${idOf(itemObjectOrId)} from empty or non-existent inventory of entity ${this.name}`);
      return;
    }

    this.inventory.giveItemTo(itemObjectOrId, itemIdContainer);
    this.carryWeighCurrent = this.inventory.getTotalExtendedWeight();
  }

  takeSingleItemFromCell(targetCell) {
    if (! targetCell.inventory) {
      return;
    }
    const extractedItem = targetCell.extractFirstItem();
    this.giveItem(extractedItem);
    this.showMessage(`You pick up the ${extractedItem.name}`);
  }

  takeAllItemsFromCell(targetCell) {
    if (! targetCell.inventory) {
      return;
    }
    targetCell.extractAllItems().forEach(item => { this.giveItem(item)});
    this.showMessage(`You pick up everything there`);
  }

  dropItem(item) {
    // console.log(`entity ${this.name} dropping ${item.name}`);
    this.getCell().takeItemFrom(item, this.inventory);
    this.carryWeighCurrent = this.inventory.getTotalExtendedWeight();
    this.showMessage(`You drop the ${item.name}`);
  }

  getCarryWeightCapacity() {
    // strength (major), fortitude (moderate), recovery (moderate), stability (minor), will (minor), aura (minor), depth (minor)
    let carryWeightModifier = new ValueModifier([
      new ModifierLayer(
        [Math.sqrt(this.attributes.strength / EntityAttributes.BASE_VALUE),],
        [(this.attributes.fortitude - EntityAttributes.BASE_VALUE) / 67,
        (this.attributes.strength - EntityAttributes.BASE_VALUE) / 41,]
      ),
      new ModifierLayer(
        [Math.sqrt(Math.sqrt(this.attributes.fortitude / EntityAttributes.BASE_VALUE)),],
        [(this.attributes.recovery - EntityAttributes.BASE_VALUE) / 23,
          (this.attributes.stability - EntityAttributes.BASE_VALUE) / 53,
          (this.attributes.will - EntityAttributes.BASE_VALUE) / 47,
          (this.attributes.aura - EntityAttributes.BASE_VALUE) / 51,
          (this.attributes.depth - EntityAttributes.BASE_VALUE) / 61,]
      ),
      new ModifierLayer(
        [Math.sqrt(this.attributes.strength / EntityAttributes.BASE_VALUE),],
        []
      ),
    ]);

    return Math.floor(carryWeightModifier.appliedTo(this.carryWeightBase));
  }

  //================================================
  //================================================
  //================================================
  // ENTITY SET UP

  static ENTITIES = {};
  static initializeEntitiesFromList() {
    ENTITIES_DEFINITIONS.forEach((ent) => { Entity.ENTITIES[ent.type] = ent; })
  }
}

Entity.initializeEntitiesFromList();

export { Entity, DEFAULT_ACTION_COST };