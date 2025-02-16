import { Damager } from './damagerClass';
import { rollDice, devTrace } from '../util.js';
import { Damage } from './damageClass';

jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
    rollDice: jest.fn(),
}));

describe('Damager', () => {
    beforeEach(() => {
        rollDice.mockClear();
    });

    test('should initialize with correct properties', () => {
        const damager = new Damager('2d6', ['fire'], 2);
        expect(damager.amountDiceStr).toBe('2d6');
        expect(damager.types).toEqual(['fire']);
        expect(damager.minDamage).toBe(2);
    });

    test('should return Damage instance with rolled damage', () => {
        rollDice.mockReturnValue(7);
        const damager = new Damager('2d6', ['fire'], 2);
        const damage = damager.getDamage();
        expect(rollDice).toHaveBeenCalledWith('2d6');
        expect(damage).toBeInstanceOf(Damage);
        expect(damage.amount).toBe(7);
        expect(damage.types).toEqual(['fire']);
    });

    test('should return Damage instance with minimum damage if roll is less than minDamage', () => {
        rollDice.mockReturnValue(1);
        const damager = new Damager('1d4', ['ice'], 3);
        const damage = damager.getDamage();
        expect(rollDice).toHaveBeenCalledWith('1d4');
        expect(damage).toBeInstanceOf(Damage);
        expect(damage.amount).toBe(3);
        expect(damage.types).toEqual(['ice']);
    });
});