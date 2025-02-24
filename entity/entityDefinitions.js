import { EffGenDamage } from "../effect/effGenDamageClass.js";

// A note on relations:
// 0. IMPLICIT: if entity B has damaged entity A, then entity A is VIOLENT_TO entity B regardless of anything in the definitions
// 1. overrideFeelingsToOthers otherwise has precedence on how entity A feels about entity B, but has no effect on how B feels about A
// 2. othersFeelAboutMe has precedence over another entity's iFeelAboutOthers - if entity X has othersFeelAboutMe HOSTILE_TO and entity Y has iFeelAboutOthers NEUTRAL_TO, Y will be HOSTILE_TO X
// 3. iFeelAboutOthers comes into play only if none of the above do
// 4. lastly if nothing at all is specified, then the default is NEUTRAL_TO

const ENTITIES_DEFINITIONS = [
  {
    type: "AVATAR", name: "Avatar", displaySymbol: "@", displayColor: "#fff",
    attributes: {
      'strength': 100, 'dexterity': 100, 'fortitude': 100, 'recovery': 100,
      'psyche': 100, 'awareness': 100, 'stability': 100, 'will': 100,
      'aura': 100, 'refinement': 100, 'depth': 100, 'flow': 100,
    },
    baseViewRadius: 3, baseHealthRoll: "20", baseActionTime: 100, baseNaturalHealingAmount: .001,
    basePrecision: 1, baseEvasion: 1,
    relations: { othersFeelAboutMe: "HOSTILE_TO", iFeelAboutOthers: "HOSTILE_TO" },
  },
  {
    type: "MOLD_PALE", name: "Pale Mold", displaySymbol: "m", displayColor: "#ddd",
    attributes: {
      'strength': 100, 'dexterity': 100, 'fortitude': 100, 'recovery': 100,
      'psyche': 100, 'awareness': 100, 'stability': 100, 'will': 100,
      'aura': 100, 'refinement': 100, 'depth': 100, 'flow': 100,
    },
    baseViewRadius: 1, baseHealthRoll: "2d6+4", baseActionTime: 210, baseNaturalHealingAmount: .002,
    meleeAttack: { damager: new EffGenDamage("1d4-1", ['MELEE', 'POISON', 'CLOUD'], 0), baseMeleeAttackTime: 80 },
    movementSpec: { movementType: "STATIONARY", baseMovementTime: 210 },
    relations: {
      overrideFeelingsToOthers: {
        "WORM_VINE": "FRIENDLY_TO",
      },
      othersFeelAboutMe: "NEUTRAL_TO", iFeelAboutOthers: "NEUTRAL_TO", 
    },
  },
  {
    type: "WORM_VINE", name: "Worm Vine", displaySymbol: "w", displayColor: "#6C4",
    attributes: {
      'strength': 100, 'dexterity': 100, 'fortitude': 100, 'recovery': 100,
      'psyche': 100, 'awareness': 100, 'stability': 100, 'will': 100,
      'aura': 100, 'refinement': 100, 'depth': 100, 'flow': 100,
    },
    baseViewRadius: 2, baseHealthRoll: "2d6+4", baseActionTime: 100, baseNaturalHealingAmount: .001,
    meleeAttack: { damager: new EffGenDamage("1d3-1", ['MELEE', 'PHYSICAL', 'SLAM'], 0), baseMeleeAttackTime: 100 },
    movementSpec: { movementType: "STEP_AIMLESS", baseMovementTime: 100 },
    relations: {
      overrideFeelingsToOthers: {
        "AVATAR": "NEUTRAL_TO",
      },
      iFeelAboutOthers: "NEUTRAL_TO"
    },
  },
  {
    type: "RAT_INSIDIOUS", name: "Insidious Rat", displaySymbol: "r", displayColor: "#654",
    attributes: {
      'strength': 100, 'dexterity': 100, 'fortitude': 100, 'recovery': 100,
      'psyche': 100, 'awareness': 100, 'stability': 100, 'will': 100,
      'aura': 100, 'refinement': 100, 'depth': 100, 'flow': 100,
    },
    baseViewRadius: 2, baseHealthRoll: "1d6+3", baseActionTime: 100, baseNaturalHealingAmount: .001,
    basePrecision: 1, baseEvasion: 3,
    meleeAttack: { damager: new EffGenDamage("1d3-1", ['MELEE', 'PHYSICAL', 'BITE'], 0), baseMeleeAttackTime: 100 },
    movementSpec: { movementType: "WANDER_AIMLESS", baseMovementTime: 100 },
    relations: { iFeelAboutOthers: "NEUTRAL_TO" },
  },
  {
    type: "RAT_MALIGN", name: "Malign Rat", displaySymbol: "r", displayColor: "#321",
    attributes: {
      'strength': 100, 'dexterity': 100, 'fortitude': 100, 'recovery': 100,
      'psyche': 100, 'awareness': 100, 'stability': 100, 'will': 100,
      'aura': 100, 'refinement': 100, 'depth': 100, 'flow': 100,
    },
    baseViewRadius: 4, baseHealthRoll: "3d4+6", baseActionTime: 100, baseNaturalHealingAmount: .001,
    basePrecision: 2, baseEvasion: 4,
    meleeAttack: { damager: new EffGenDamage("1d5", ['MELEE', 'PHYSICAL', 'BITE'], 0), baseMeleeAttackTime: 100 },
    movementSpec: { movementType: "WANDER_AGGRESSIVE", baseMovementTime: 100 },
    relations: {
      overrideFeelingsToOthers: {
        "RAT_INSIDIOUS": "FRIENDLY_TO",
      },
      iFeelAboutOthers: "HOSTILE_TO",
    },
  },
];

// NOTE: this is mostly used in support of testing; real code will generally use the type-based look-up object set up in Entity
function getEntityDef(entityType) {
  return ENTITIES_DEFINITIONS.find(entity => entity.type === entityType) || null;
}


export { ENTITIES_DEFINITIONS, getEntityDef };