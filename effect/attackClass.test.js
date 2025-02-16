import { Attack } from './attackClass.js';

describe('Attack', () => {
    let attacker;
    let defender;
    let attack;

    beforeEach(() => {
        attacker = { name: "Attacker" };
        defender = { name: "Defender" };
        attack = new Attack(attacker, defender);
    });

    test('should initialize with correct values', () => {
        expect(attack.attacker).toBe(attacker);
        expect(attack.defender).toBe(defender);
        expect(attack.defenderHitEffectGenerators).toEqual([]);
        expect(attack.attackerHitEffectGenerators).toEqual([]);
        expect(attack.defenderEvadeEffectGenerators).toEqual([]);
        expect(attack.attackerEvadeEffectGenerators).toEqual([]);
    });

    test('should add defender hit effect generator', () => {
        const effectGenerator = jest.fn();
        attack.addDefenderHitEffectGenerator(effectGenerator);
        expect(attack.defenderHitEffectGenerators).toContain(effectGenerator);
    });

    test('should add attacker hit effect generator', () => {
        const effectGenerator = jest.fn();
        attack.addAttackerHitEffectGenerator(effectGenerator);
        expect(attack.attackerHitEffectGenerators).toContain(effectGenerator);
    });

    test('should add defender evade effect generator', () => {
        const effectGenerator = jest.fn();
        attack.addDefenderEvadeEffectGenerator(effectGenerator);
        expect(attack.defenderEvadeEffectGenerators).toContain(effectGenerator);
    });

    test('should add attacker evade effect generator', () => {
        const effectGenerator = jest.fn();
        attack.addAttackerEvadeEffectGenerator(effectGenerator);
        expect(attack.attackerEvadeEffectGenerators).toContain(effectGenerator);
    });

    test('should initialize with effect generators provided in constructor', () => {
        const hitEffect1 = jest.fn();
        const hitEffect2 = jest.fn();
        const evadeEffect1 = jest.fn();
        const evadeEffect2 = jest.fn();

        const attackWithEffects = new Attack(
            attacker,
            defender,
            [hitEffect1],
            [hitEffect2],
            [evadeEffect1],
            [evadeEffect2]
        );

        expect(attackWithEffects.defenderHitEffectGenerators).toContain(hitEffect1);
        expect(attackWithEffects.attackerHitEffectGenerators).toContain(hitEffect2);
        expect(attackWithEffects.defenderEvadeEffectGenerators).toContain(evadeEffect1);
        expect(attackWithEffects.attackerEvadeEffectGenerators).toContain(evadeEffect2);
    });
});
