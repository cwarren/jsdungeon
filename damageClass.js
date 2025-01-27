class Damage {
    constructor(damageAmount, damageTypes = [], minDamage = 1) {
      this.amount = damageAmount < minDamage ? minDamage : damageAmount;
      this.types = damageTypes;
    }
  }
  
  export { Damage };