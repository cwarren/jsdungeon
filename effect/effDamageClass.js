import { Effect } from "./effectClass.js";

class EffDamage extends Effect {
    constructor(damageAmount, damageTypes = [], minDamage = 1) {
      super(damageTypes);
      this.amount = damageAmount < minDamage ? minDamage : damageAmount;
    }
  }
  
  export { EffDamage };