class Attack {
  constructor(
      attacker,
      defender,
      defenderHitEffectGenerators = [],
      attackerHitEffectGenerators = [],
      defenderEvadeEffectGenerators = [],
      attackerEvadeEffectGenerators = []
  ) {
      this.attacker = attacker;
      this.defender = defender;
      this.defenderHitEffectGenerators = defenderHitEffectGenerators;
      this.attackerHitEffectGenerators = attackerHitEffectGenerators;
      this.defenderEvadeEffectGenerators = defenderEvadeEffectGenerators;
      this.attackerEvadeEffectGenerators = attackerEvadeEffectGenerators;
  }

  addDefenderHitEffectGenerator(effectGenerator) {
      this.defenderHitEffectGenerators.push(effectGenerator);
  }

  addAttackerHitEffectGenerator(effectGenerator) {
      this.attackerHitEffectGenerators.push(effectGenerator);
  }

  addDefenderEvadeEffectGenerator(effectGenerator) {
      this.defenderEvadeEffectGenerators.push(effectGenerator);
  }

  addAttackerEvadeEffectGenerator(effectGenerator) {
      this.attackerEvadeEffectGenerators.push(effectGenerator);
  }
}

export { Attack };
