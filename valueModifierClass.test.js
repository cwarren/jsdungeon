import { ValueModifier, ModifierLayer } from './valueModifierClass.js';
import { devTrace } from './util.js';
jest.mock('./util.js', () => ({
    devTrace: jest.fn(),
}));


describe('ValueModifier', () => {
    let valueModifier;

    beforeEach(() => {
        valueModifier = new ValueModifier();
    });

    test('should initialize with an empty modifierLayers array', () => {
        expect(valueModifier.modifierLayers).toEqual([]);
    });

    test('should add a modifier layer correctly', () => {
        const modifierLayer = new ModifierLayer([1.5], [10]);
        valueModifier.addModifierLayer(modifierLayer);

        expect(valueModifier.modifierLayers).toEqual([{ multipliers: [1.5], flats: [10] }]);
    });

    test('should apply a single modifier layer correctly', () => {
        const modifierLayer = new ModifierLayer([2], [5]);
        valueModifier.addModifierLayer(modifierLayer);

        const result = valueModifier.apply(10); // (10 * 2) + 5 = 25
        expect(result).toBe(25);
    });

    test('should apply multiple modifier layers correctly', () => {
        valueModifier.addModifierLayer(new ModifierLayer([1.2], [5]));
        valueModifier.addModifierLayer(new ModifierLayer([0.9], [-2]));

        const result = valueModifier.apply(100);
        // Step 1: (100 * 1.2) + 5 = 125
        // Step 2: (125 * 0.9) - 2 = 110.5
        expect(result).toBe(110.5);
    });

    test('should handle empty modifier layers correctly', () => {
        valueModifier.addModifierLayer(new ModifierLayer());

        const result = valueModifier.apply(50);
        expect(result).toBe(50); // No modifications applied
    });

    test('should apply correctly when only multipliers are provided', () => {
        valueModifier.addModifierLayer(new ModifierLayer([2, 1.5], []));

        const result = valueModifier.apply(10); // 10 * 2 * 1.5 = 30
        expect(result).toBe(30);
    });

    test('should apply correctly when only flats are provided', () => {
        valueModifier.addModifierLayer(new ModifierLayer([], [5, 10]));

        const result = valueModifier.apply(20); // 20 + 5 + 10 = 35
        expect(result).toBe(35);
    });

    test('should return the original value when no modifiers are present', () => {
        const result = valueModifier.apply(42);
        expect(result).toBe(42); // No changes applied
    });

    test('should handle negative multipliers and flats correctly', () => {
        valueModifier.addModifierLayer(new ModifierLayer([-1.5], [-10]));

        const result = valueModifier.apply(20); // (20 * -1.5) - 10 = -40
        expect(result).toBe(-40);
    });

    test('should handle zero multipliers correctly', () => {
        valueModifier.addModifierLayer(new ModifierLayer([0], [10]));

        const result = valueModifier.apply(100); // (100 * 0) + 10 = 10
        expect(result).toBe(10);
    });

    test('should correctly apply multiple multipliers and flats within the same layer', () => {
        valueModifier.addModifierLayer(new ModifierLayer([2, 0.5], [5, -2]));

        const result = valueModifier.apply(10); // (10 * 2 * 0.5) + 5 - 2 = 13
        expect(result).toBe(13);
    });

    test('should correctly apply multiple modifier layers with multiple values', () => {
        valueModifier.addModifierLayer(new ModifierLayer([2], [5]));
        valueModifier.addModifierLayer(new ModifierLayer([0.5, 3], [2, -1]));

        const result = valueModifier.apply(10);
        // Step 1: (10 * 2) + 5 = 25
        // Step 2: (25 * 0.5 * 3) + 2 - 1 = 38.5
        expect(result).toBe(38.5);
    });
});

describe('ModifierLayer', () => {
    test('should initialize with given multipliers and flats', () => {
        const modifierLayer = new ModifierLayer([1.2, 0.8], [5, -3]);

        expect(modifierLayer.multipliers).toEqual([1.2, 0.8]);
        expect(modifierLayer.flats).toEqual([5, -3]);
    });

    test('should initialize with empty arrays when no arguments are provided', () => {
        const modifierLayer = new ModifierLayer();

        expect(modifierLayer.multipliers).toEqual([]);
        expect(modifierLayer.flats).toEqual([]);
    });
});
