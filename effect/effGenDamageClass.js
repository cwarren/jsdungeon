import { rollDice } from "../util.js";
import { EffDamage } from "./effDamageClass.js";
import { EffectGenerator } from "./effectGeneratorClass.js";

class EffGenDamage extends EffectGenerator {
    constructor(amountDiceStr, damageTypes = [], minDamage = 1) {
      super(damageTypes);
      this.amountDiceStr = amountDiceStr;
      this.minDamage = minDamage;
    }
    getEffect() {
        return new EffDamage(rollDice(this.amountDiceStr), [...this.types], this.minDamage);
    }
  }
  
  export { EffGenDamage };