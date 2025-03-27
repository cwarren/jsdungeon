import { EffGenDamage } from "../effect/effGenDamageClass.js";

const ITEM_DEFINITIONS = [
  {
    type: "ROCK", name: "Rock", displaySymbol: "*", displayColor: "#fff",
  },
];

function getItemDef(itemType) {
  return ITEM_DEFINITIONS.find(item => item.type === itemType) || null;
}


export { ITEM_DEFINITIONS, getItemDef };