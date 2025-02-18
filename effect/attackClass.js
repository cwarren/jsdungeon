import { rollDice } from '../util.js';

class Attack {
    constructor(
        attacker,
        defender,
        defenderHitEffectGenerators = [],
        attackerHitEffectGenerators = [],
        defenderEvadeEffectGenerators = [],
        attackerEvadeEffectGenerators = [],
    ) {
        this.attacker = attacker;
        this.defender = defender;
        this.defenderHitEffectGenerators = defenderHitEffectGenerators;
        this.attackerHitEffectGenerators = attackerHitEffectGenerators;
        this.defenderEvadeEffectGenerators = defenderEvadeEffectGenerators;
        this.attackerEvadeEffectGenerators = attackerEvadeEffectGenerators;
        this.outcome = 'PENDING';
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

    determineAttackOutcome() {
        const atkPrec = this.attacker.getPrecision(this);
        const defEv = this.defender.getEvasion(this);
        const combatRange = atkPrec + defEv;
        const combatRoll = rollDice("1d" + combatRange);
        if (combatRoll <= atkPrec) {
            if (this.attacker.isHitCritical(this)) {
                this.outcome = "CRITICAL_HIT";
            } else {
                this.outcome = "HIT";
            }
        } else {
            if (this.defender.isEvadeCritical(this)) {
                this.outcome = "CRITICAL_EVADE";
            } else {
                this.outcome = "EVADE";
            }
        }
    }

    sendMessageAboutAttackOutcome(messagePane) {
        if (this.outcome == 'HIT') {
            messagePane.addMessage(`${this.attacker.name} hits ${this.defender.name}`);
        } else if (this.outcome == 'CRITICAL_HIT') {
            messagePane.addMessage(`${this.attacker.name} critically hits ${this.defender.name}`);
        } else if (this.outcome == 'EVADE') {
            messagePane.addMessage(`${this.defender.name} evades ${this.attacker.name}`);
        } else if (this.outcome == 'CRITICAL_EVADE') {
            messagePane.addMessage(`${this.defender.name} critically evades ${this.attacker.name}`);
        }
    }
}

export { Attack };
