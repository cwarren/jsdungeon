import { Damager } from "./damagerClass.js";

const ENTITIES_DEFINITIONS = [
    {
      type: "AVATAR", name: "Player", displaySymbol: "@", displayColor: "#fff",
      viewRadius: 16, initialHealthRoll: "150", baseActionCost: 100, naturalHealingRate: .001
    },
    {
      type: "MOLD_PALE", name: "Pale Mold", displaySymbol: "m", displayColor: "#ddd",
      viewRadius: 2, initialHealthRoll: "2d6+4", baseActionCost: 210, naturalHealingRate: .002,
      meleeAttack: { damager: new Damager("1d4-1", [], 0), actionCost: 80 },
      movement: { movementType: "STATIONARY", actionCost: 210 },
    },
    {
      type: "WORM_VINE", name: "Worm Vine", displaySymbol: "w", displayColor: "#6C4",
      viewRadius: 2, initialHealthRoll: "2d6+4", baseActionCost: 100, naturalHealingRate: .001,
      meleeAttack: { damager: new Damager("1d3-1", [], 0), actionCost: 100 },
      movement: { movementType: "STEP_AIMLESS", actionCost: 100 },
    },
    {
      type: "RAT_INSIDIOUS", name: "Insidious Rat", displaySymbol: "r", displayColor: "#654",
      viewRadius: 2, initialHealthRoll: "1d6+3", baseActionCost: 100, naturalHealingRate: .001,
      meleeAttack: { damager: new Damager("1d3-1", [], 0), actionCost: 100 },
      movement: { movementType: "WANDER_AIMLESS", actionCost: 100 },
    },
    {
      type: "RAT_MALIGN", name: "Malign Rat", displaySymbol: "r", displayColor: "#321",
      viewRadius: 4, initialHealthRoll: "3d4+6", baseActionCost: 100, naturalHealingRate: .001,
      meleeAttack: { damager: new Damager("1d5", [], 0), actionCost: 100 },
      movement: { movementType: "WANDER_AGGRESSIVE", actionCost: 100 },
    },
  ];

  export { ENTITIES_DEFINITIONS };