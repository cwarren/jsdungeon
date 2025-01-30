import { Damage } from './damageClass';

describe('Damage', () => {
    test('should initialize with correct properties', () => {
        const damage = new Damage(10, ['fire', 'ice'], 5);
        expect(damage.amount).toBe(10);
        expect(damage.types).toEqual(['fire', 'ice']);
    });

    test('should set amount to minDamage if damageAmount is less than minDamage', () => {
        const damage = new Damage(3, ['fire'], 5);
        expect(damage.amount).toBe(5);
        expect(damage.types).toEqual(['fire']);
    });

    test('should initialize with default minDamage if not provided', () => {
        const damage = new Damage(0, ['ice']);
        expect(damage.amount).toBe(1);
        expect(damage.types).toEqual(['ice']);
    });

    test('should initialize with default damageTypes if not provided', () => {
        const damage = new Damage(7);
        expect(damage.amount).toBe(7);
        expect(damage.types).toEqual([]);
    });
});