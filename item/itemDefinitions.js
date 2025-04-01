import { EffGenDamage } from "../effect/effGenDamageClass.js";

const ITEM_DEFINITIONS = [
  {
    type: "ROCK", name: "Rock", description: "It's a rock. It would be a poor gift.", displaySymbol: "*", displayColor: "#fff",
  },
  {
    type: "STICK", name: "Stick", description: "It's brown and stick-y", displaySymbol: "-", displayColor: "#fff",
  },
];

function getItemDef(itemType) {
  return ITEM_DEFINITIONS.find(item => item.type === itemType) || null;
}


export { ITEM_DEFINITIONS, getItemDef };