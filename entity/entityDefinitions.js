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
      'strength': 10, 'dexterity': 10, 'fortitude': 10, 'recovery': 10,
      'psyche': 10, 'awareness': 10, 'stability': 10, 'will': 10,
      'aura': 10, 'refinement': 10, 'depth': 10, 'flow': 10,
    },
    viewRadius: 8, initialHealthRoll: "150", baseActionCost: 100, naturalHealingRate: .001,
    relations: { othersFeelAboutMe: "HOSTILE_TO", iFeelAboutOthers: "HOSTILE_TO" },
  },
  {
    type: "MOLD_PALE", name: "Pale Mold", displaySymbol: "m", displayColor: "#ddd",
    attributes: {
      'strength': 1, 'dexterity': 1, 'fortitude': 10, 'recovery': 15,
      'psyche': 1, 'awareness': 2, 'stability': 10, 'will': 2,
      'aura': 0, 'refinement': 0, 'depth': 0, 'flow': 0,
    },
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
    attributes: {
      'strength': 2, 'dexterity': 3, 'fortitude': 5, 'recovery': 6,
      'psyche': 1, 'awareness': 1, 'stability': 1, 'will': 1,
      'aura': 0, 'refinement': 0, 'depth': 0, 'flow': 0,
    },
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
    attributes: {
      'strength': 3, 'dexterity': 8, 'fortitude': 10, 'recovery': 10,
      'psyche': 1, 'awareness': 5, 'stability': 3, 'will': 1,
      'aura': 0, 'refinement': 0, 'depth': 0, 'flow': 0,
    },
    viewRadius: 2, initialHealthRoll: "1d6+3", baseActionCost: 100, naturalHealingRate: .001,
    meleeAttack: { damager: new EffGenDamage("1d3-1", [], 0), actionCost: 100 },
    movementSpec: { movementType: "WANDER_AIMLESS", actionCost: 100 },
    relations: { iFeelAboutOthers: "NEUTRAL_TO" },
  },
  {
    type: "RAT_MALIGN", name: "Malign Rat", displaySymbol: "r", displayColor: "#321",
    attributes: {
      'strength': 4, 'dexterity': 10, 'fortitude': 11, 'recovery': 10,
      'psyche': 3, 'awareness': 7, 'stability': 5, 'will': 3,
      'aura': 2, 'refinement': 1, 'depth': 1, 'flow': 1,
    },
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
];

// NOTE: this is mostly used in support of testing; real code will generally use the type-based look-up object set up in Entity
function getEntityDef(entityType) {
  return ENTITIES_DEFINITIONS.find(entity => entity.type === entityType) || null;
}


export { ENTITIES_DEFINITIONS, getEntityDef };