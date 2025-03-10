import { devTrace, constrainValue, formatNumberForMessage } from "../util.js";

const DEFAULT_NATURAL_HEALING_TICKS = 250; // how often natural healing occurs in game time ticks
const DEFAULT_NATURAL_HEALING_RATE = 0.001; // what portion of maximum health is healed per natural healing tick 

class EntityHealth {
  /**
   * Creates an instance of EntityHealth.
   * @param {Object} ofEntity - The entity this health belongs to.
   * @param {number} maxHealth - The maximum health of the entity.
   * @param {number} [naturalHealingRate=DEFAULT_NATURAL_HEALING_RATE] - The rate of natural healing.
   * @param {number} [naturalHealingTicks=DEFAULT_NATURAL_HEALING_TICKS] - The interval for natural healing in game ticks.
   */
  constructor(ofEntity, maxHealth, naturalHealingRate = DEFAULT_NATURAL_HEALING_RATE, naturalHealingTicks = DEFAULT_NATURAL_HEALING_TICKS) {
    if (maxHealth <= 0) {
      console.log(ofEntity);
      console.log("maxHealth naturalHealingRate naturalHealingTicks", maxHealth, naturalHealingRate, naturalHealingTicks);
      throw new Error("maxHealth must be greater than 0");
    }
    this.ofEntity = ofEntity;
    this.maxHealth = maxHealth;
    this.curHealth = this.maxHealth;
    this.naturalHealingRate = naturalHealingRate;
    this.naturalHealingTicks = naturalHealingTicks;
    this.lastNaturalHealTime = 0;
  }

  /**
   * Reduces the health by the specified damage amount.
   * @param {number} damage - The amount of damage to take.
   */
  takeDamage(damageAmount) {
    if (damageAmount < 0) {
      throw new Error("Damage must be a non-negative value");
    }
    this.curHealth = Math.max(this.curHealth - damageAmount, 0);
  }

  /**
   * Increases the health by the specified amount, up to the maximum health.
   * @param {number} amount - The amount of health to heal.
   */
  heal(amount) {
    if (amount < 0) {
      throw new Error("Heal amount must be a non-negative value");
    }
    this.curHealth = Math.min(this.curHealth + amount, this.maxHealth);
  }

  /**
   * Heals the entity naturally over time - heal based on the naturalHealingRate if at least naturalHealingTicks have passed.
   * @param {number} currentTime - The current game time in ticks.
   */
  healNaturally(currentTime) {
    devTrace(5, `healNaturally at ${currentTime} for entity (last natural heal time was ${this.lastNaturalHealTime})`, this.ofEntity);
    const enoughTimePassed = (currentTime - this.lastNaturalHealTime) >= this.naturalHealingTicks;
    const anythingToHeal = this.curHealth < this.maxHealth;
    const healingCount = Math.floor((currentTime - this.lastNaturalHealTime) / this.naturalHealingTicks);
    if (enoughTimePassed && anythingToHeal) {
      const healAmt = healingCount * this.getHealAmountPerInterval();
      devTrace(5, `natural healing occurs for ${this.ofEntity.type} at ${currentTime} based on last natural healing time ${this.lastNaturalHealTime}, heal count of ${healingCount} restoring ${healAmt}`, this);
      this.curHealth = constrainValue(this.curHealth + healAmt, 0, this.maxHealth);
      this.ofEntity.showNaturalHealingMessage(`Natural healing of ${formatNumberForMessage(healAmt)} for ${this.ofEntity.name}`);
    }
    if (enoughTimePassed) {
      this.lastNaturalHealTime += healingCount * this.naturalHealingTicks;
    }
  }
  getHealAmountPerInterval() {
    return this.naturalHealingRate * this.maxHealth;
  }

  /**
   * Checks if the entity is alive.
   * @returns {boolean} True if the entity is alive, false otherwise.
   */
  isAlive() {
    return this.curHealth > 0;
  }

  /**
   * Gets the current health status of the entity.
   * @returns {Object} An object containing the current and maximum health.
   */
  getHealthStatus() {
    return {
      currentHealth: this.curHealth,
      maxHealth: this.maxHealth,
    };
  }

  /**
     * Prepares the health attributes for serialization.
     * @returns {Object} A simple object representing the health attributes.
     */
  forSerializing() {
    return {
      maxHealth: this.maxHealth,
      curHealth: this.curHealth,
      naturalHealingRate: this.naturalHealingRate,
      naturalHealingTicks: this.naturalHealingTicks,
      lastNaturalHealTime: this.lastNaturalHealTime
    };
  }

  /**
   * Serializes the health attributes into a JSON string.
   * @returns {string} The serialized JSON representation.
   */
  serialize() {
    return JSON.stringify(this.forSerializing());
  }

  /**
   * Deserializes a given data object into a new EntityHealth instance.
   * @param {Object} data - The serialized data object.
   * @param {Object} ofEntity - The entity this health belongs to.
   * @returns {EntityHealth} A new instance with restored values.
   */
  static deserialize(data, ofEntity) {
    const health = new EntityHealth(
      ofEntity,
      data.maxHealth,
      data.naturalHealingRate,
      data.naturalHealingTicks
    );
    health.curHealth = data.curHealth;
    health.lastNaturalHealTime = data.lastNaturalHealTime;
    return health;
  }
}

export { EntityHealth, DEFAULT_NATURAL_HEALING_TICKS, DEFAULT_NATURAL_HEALING_RATE };