import { Attack } from './attackClass.js';
import { rollDice } from '../util.js';

jest.mock('../util.js', () => ({
    rollDice: jest.fn(),
    devTrace: jest.fn(),
  }));

describe('Attack', () => {
    let attacker;
    let defender;
    let attack;

    beforeEach(() => {
        attacker = { name: "Attacker", getPrecision: jest.fn(), isHitCritical: jest.fn() };
        defender = { name: "Defender", getEvasion: jest.fn(), isEvadeCritical: jest.fn() };
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

    describe('Attack outcomes', () => {
        test('should correctly determine attack outcome - basic hit', () => {
          jest.spyOn(attacker, 'getPrecision').mockReturnValue(10);
          jest.spyOn(attacker, 'isHitCritical').mockReturnValue(false);
          jest.spyOn(defender, 'getEvasion').mockReturnValue(5);
          jest.spyOn(defender, 'isEvadeCritical').mockReturnValue(false);
          rollDice.mockReturnValue(7);
  
          attack.determineAttackOutcome();
          expect(attack.outcome).toBe('HIT');
        });
  
        test('should correctly determine attack outcome - critical hit', () => {
          jest.spyOn(attacker, 'getPrecision').mockReturnValue(10);
          jest.spyOn(attacker, 'isHitCritical').mockReturnValue(true);
          jest.spyOn(defender, 'getEvasion').mockReturnValue(5);
          jest.spyOn(defender, 'isEvadeCritical').mockReturnValue(false);
          rollDice.mockReturnValue(7);
  
          attack.determineAttackOutcome();
          expect(attack.outcome).toBe('CRITICAL_HIT');
        });
  
        test('should correctly determine attack outcome - basic evade', () => {
          jest.spyOn(attacker, 'getPrecision').mockReturnValue(10);
          jest.spyOn(attacker, 'isHitCritical').mockReturnValue(false);
          jest.spyOn(defender, 'getEvasion').mockReturnValue(5);
          jest.spyOn(defender, 'isEvadeCritical').mockReturnValue(false);
          rollDice.mockReturnValue(12);
  
          attack.determineAttackOutcome();
          expect(attack.outcome).toBe('EVADE');
        });
  
        test('should correctly determine attack outcome - critical evade', () => {
          jest.spyOn(attacker, 'getPrecision').mockReturnValue(10);
          jest.spyOn(attacker, 'isHitCritical').mockReturnValue(false);
          jest.spyOn(defender, 'getEvasion').mockReturnValue(5);
          jest.spyOn(defender, 'isEvadeCritical').mockReturnValue(true);
          rollDice.mockReturnValue(12);
  
          attack.determineAttackOutcome();
          expect(attack.outcome).toBe('CRITICAL_EVADE');
        });
      });
});
