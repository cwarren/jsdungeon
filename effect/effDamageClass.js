import { Effect } from "./effectClass.js";

class EffDamage extends Effect {
  constructor(damageAmount, damageTypes = [], minDamage = 1) {
    super(damageTypes);
    this.amount = damageAmount < minDamage ? minDamage : damageAmount;
  }

  forSerializing() {
    return {
      amount: this.amount,
      types: this.types,
    };
  }

  serialize() {
    return JSON.stringify(this.forSerializing());
  }

  static deserialize(data) {
    return new EffDamage(data.amount, data.types);
  }


}

export { EffDamage };