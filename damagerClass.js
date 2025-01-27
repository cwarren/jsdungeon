import { rollDice } from "./util.js";
import { Damage } from "./damageClass.js";

class Damager {
    constructor(amountDiceStr, damageTypes = [], minDamage = 1) {
      this.amountDiceStr = amountDiceStr;
      this.types = damageTypes;
      this.minDamage = minDamage;
    }
    getDamage() {
        return new Damage(rollDice(this.amountDiceStr), ...this.types, this.minDamage);
    }
  }
  
  export { Damager };