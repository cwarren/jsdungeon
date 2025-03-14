import { EffDamage } from './effDamageClass.js';
import { devTrace } from '../util.js';
jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
}));

describe('EffDamage', () => {
    test('should initialize with correct properties', () => {
        const damage = new EffDamage(10, ['fire', 'ice'], 5);
        expect(damage.amount).toBe(10);
        expect(damage.types).toEqual(['fire', 'ice']);
    });

    test('should set amount to minDamage if damageAmount is less than minDamage', () => {
        const damage = new EffDamage(3, ['fire'], 5);
        expect(damage.amount).toBe(5);
        expect(damage.types).toEqual(['fire']);
    });

    test('should initialize with default minDamage if not provided', () => {
        const damage = new EffDamage(0, ['ice']);
        expect(damage.amount).toBe(1);
        expect(damage.types).toEqual(['ice']);
    });

    test('should initialize with default damageTypes if not provided', () => {
        const damage = new EffDamage(7);
        expect(damage.amount).toBe(7);
        expect(damage.types).toEqual([]);
    });

    describe('EffDamage - Serialization', () => {
        test('should serialize to a plain object correctly', () => {
            const damage = new EffDamage(12, ['fire', 'piercing']);
            const serialized = damage.forSerializing();

            expect(serialized).toEqual({
                amount: 12,
                types: ['fire', 'piercing'],
            });
        });

        test('should serialize to JSON correctly', () => {
            const damage = new EffDamage(15, ['acid', 'bludgeoning']);
            const jsonString = damage.serialize();

            expect(jsonString).toBe(
                JSON.stringify({
                    amount: 15,
                    types: ['acid', 'bludgeoning'],
                })
            );
        });

        test('should deserialize from a plain object correctly', () => {
            const data = { amount: 20, types: ['cold', 'slashing'] };
            const damage = EffDamage.deserialize(data);

            expect(damage).toBeInstanceOf(EffDamage);
            expect(damage.amount).toBe(20);
            expect(damage.types).toEqual(['cold', 'slashing']);
        });

        test('should deserialize from JSON correctly', () => {
            const jsonString = JSON.stringify({ amount: 18, types: ['lightning', 'force'] });
            const parsedData = JSON.parse(jsonString);
            const damage = EffDamage.deserialize(parsedData);

            expect(damage).toBeInstanceOf(EffDamage);
            expect(damage.amount).toBe(18);
            expect(damage.types).toEqual(['lightning', 'force']);
        });

        test('should handle missing damage types in deserialization', () => {
            const data = { amount: 8 };
            const damage = EffDamage.deserialize(data);

            expect(damage).toBeInstanceOf(EffDamage);
            expect(damage.amount).toBe(8);
            expect(damage.types).toEqual([]); // Defaults to an empty array
        });
    });

});