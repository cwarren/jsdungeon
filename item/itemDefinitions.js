import { EffGenDamage } from "../effect/effGenDamageClass.js";

// NOTE: it's fine for weight and volume to be 0 or fractional/decimal values; negative would be weird, but should work too

const ITEM_DEFINITIONS = [
  {
    type: "ROCK", name: "Rock", description: "It's a rock. It would be a poor gift.", displaySymbol: "*", displayColor: "#fff", weight: 5, volume: 1,
  },
  {
    type: "STICK", name: "Stick", description: "It's brown and stick-y", displaySymbol: "-", displayColor: "#fff", isStackable: true, weight: 1, volume: 2,
  },
];

function getItemDef(itemType) {
  return ITEM_DEFINITIONS.find(item => item.type === itemType) || null;
}


export { ITEM_DEFINITIONS, getItemDef };