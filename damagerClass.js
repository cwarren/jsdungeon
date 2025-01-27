import { rollDice } from "./util.js";
import { Damage } from "./damageClass.js";

class Damager {
    constructor(amountDiceStr, damageTypes = []) {
      this.amountDiceStr = amountDiceStr;
      this.types = damageTypes;
    }
    getDamage() {
        return new Damage(rollDice(this.amountDiceStr), ...this.types);
    }
  }
  
  export { Damager };