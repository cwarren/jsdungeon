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

        const result = valueModifier.appliedTo(10); // (10 * 2) + 5 = 25
        expect(result).toBe(25);
    });

    test('should apply multiple modifier layers correctly', () => {
        valueModifier.addModifierLayer(new ModifierLayer([1.2], [5]));
        valueModifier.addModifierLayer(new ModifierLayer([0.9], [-2]));

        const result = valueModifier.appliedTo(100);
        // Step 1: (100 * 1.2) + 5 = 125
        // Step 2: (125 * 0.9) - 2 = 110.5
        expect(result).toBe(110.5);
    });

    test('should handle empty modifier layers correctly', () => {
        valueModifier.addModifierLayer(new ModifierLayer());

        const result = valueModifier.appliedTo(50);
        expect(result).toBe(50); // No modifications applied
    });

    test('should apply correctly when only multipliers are provided', () => {
        valueModifier.addModifierLayer(new ModifierLayer([2, 1.5], []));

        const result = valueModifier.appliedTo(10); // 10 * 2 * 1.5 = 30
        expect(result).toBe(30);
    });

    test('should apply correctly when only flats are provided', () => {
        valueModifier.addModifierLayer(new ModifierLayer([], [5, 10]));

        const result = valueModifier.appliedTo(20); // 20 + 5 + 10 = 35
        expect(result).toBe(35);
    });

    test('should return the original value when no modifiers are present', () => {
        const result = valueModifier.appliedTo(42);
        expect(result).toBe(42); // No changes applied
    });

    test('should handle negative multipliers and flats correctly', () => {
        valueModifier.addModifierLayer(new ModifierLayer([-1.5], [-10]));

        const result = valueModifier.appliedTo(20); // (20 * -1.5) - 10 = -40
        expect(result).toBe(-40);
    });

    test('should handle zero multipliers correctly', () => {
        valueModifier.addModifierLayer(new ModifierLayer([0], [10]));

        const result = valueModifier.appliedTo(100); // (100 * 0) + 10 = 10
        expect(result).toBe(10);
    });

    test('should correctly apply multiple multipliers and flats within the same layer', () => {
        valueModifier.addModifierLayer(new ModifierLayer([2, 0.5], [5, -2]));

        const result = valueModifier.appliedTo(10); // (10 * 2 * 0.5) + 5 - 2 = 13
        expect(result).toBe(13);
    });

    test('should correctly apply multiple modifier layers with multiple values', () => {
        valueModifier.addModifierLayer(new ModifierLayer([2], [5]));
        valueModifier.addModifierLayer(new ModifierLayer([0.5, 3], [2, -1]));

        const result = valueModifier.appliedTo(10);
        // Step 1: (10 * 2) + 5 = 25
        // Step 2: (25 * 0.5 * 3) + 2 - 1 = 38.5
        expect(result).toBe(38.5);
    });

    describe('ValueModifier - combine', () => {

        test('should combine multiple ValueModifiers with the same number of layers', () => {
            const vm1 = new ValueModifier([
                new ModifierLayer([1.2], [5]),
                new ModifierLayer([1.1], [3])
            ]);

            const vm2 = new ValueModifier([
                new ModifierLayer([0.9], [-2]),
                new ModifierLayer([1.05], [4])
            ]);

            const combined = ValueModifier.combine(vm1, vm2);

            expect(combined.modifierLayers.length).toBe(2);
            expect(combined.modifierLayers[0].multipliers).toEqual([1.2, 0.9]);
            expect(combined.modifierLayers[0].flats).toEqual([5, -2]);
            expect(combined.modifierLayers[1].multipliers).toEqual([1.1, 1.05]);
            expect(combined.modifierLayers[1].flats).toEqual([3, 4]);
        });

        test('should handle ValueModifiers with different numbers of layers', () => {
            const vm1 = new ValueModifier([
                new ModifierLayer([1.2], [5]),
                new ModifierLayer([1.1], [3])
            ]);

            const vm2 = new ValueModifier([
                new ModifierLayer([0.9], [-2])
            ]);

            const combined = ValueModifier.combine(vm1, vm2);

            expect(combined.modifierLayers.length).toBe(2);
            expect(combined.modifierLayers[0].multipliers).toEqual([1.2, 0.9]);
            expect(combined.modifierLayers[0].flats).toEqual([5, -2]);
            expect(combined.modifierLayers[1].multipliers).toEqual([1.1]);
            expect(combined.modifierLayers[1].flats).toEqual([3]);
        });

        test('should return an empty ValueModifier when no arguments are passed', () => {
            const combined = ValueModifier.combine();

            expect(combined.modifierLayers.length).toBe(0);
        });

        test('should return an identical ValueModifier when only one is passed', () => {
            const vm = new ValueModifier([
                new ModifierLayer([1.3], [7]),
                new ModifierLayer([1.2], [4])
            ]);

            const combined = ValueModifier.combine(vm);

            expect(combined.modifierLayers.length).toBe(2);
            expect(combined.modifierLayers[0].multipliers).toEqual([1.3]);
            expect(combined.modifierLayers[0].flats).toEqual([7]);
            expect(combined.modifierLayers[1].multipliers).toEqual([1.2]);
            expect(combined.modifierLayers[1].flats).toEqual([4]);
        });

        test('should handle ValueModifiers with empty layers', () => {
            const vm1 = new ValueModifier([
                new ModifierLayer([], [5])
            ]);

            const vm2 = new ValueModifier([
                new ModifierLayer([0.9], [])
            ]);

            const combined = ValueModifier.combine(vm1, vm2);

            expect(combined.modifierLayers.length).toBe(1);
            expect(combined.modifierLayers[0].multipliers).toEqual([0.9]);
            expect(combined.modifierLayers[0].flats).toEqual([5]);
        });
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

    describe('ModifierLayer - combine', () => {
        // Tests for combine static method
        test('should combine two ModifierLayers correctly', () => {
            const layer1 = new ModifierLayer([1.5, 2], [5]);
            const layer2 = new ModifierLayer([0.8], [-2, 3]);

            const combinedLayer = ModifierLayer.combine(layer1, layer2);

            expect(combinedLayer.multipliers).toEqual([1.5, 2, 0.8]);
            expect(combinedLayer.flats).toEqual([5, -2, 3]);
        });

        test('should combine multiple ModifierLayers correctly', () => {
            const layer1 = new ModifierLayer([1.5], [5]);
            const layer2 = new ModifierLayer([0.8], [-2]);
            const layer3 = new ModifierLayer([1.1, 0.9], [4, -1]);

            const combinedLayer = ModifierLayer.combine(layer1, layer2, layer3);

            expect(combinedLayer.multipliers).toEqual([1.5, 0.8, 1.1, 0.9]);
            expect(combinedLayer.flats).toEqual([5, -2, 4, -1]);
        });

        test('should handle combining an empty ModifierLayer with a non-empty one', () => {
            const layer1 = new ModifierLayer();
            const layer2 = new ModifierLayer([1.2, 0.7], [3, -1]);

            const combinedLayer = ModifierLayer.combine(layer1, layer2);

            expect(combinedLayer.multipliers).toEqual([1.2, 0.7]);
            expect(combinedLayer.flats).toEqual([3, -1]);
        });

        test('should handle combining partially full ModifierLayers', () => {
            const layer1 = new ModifierLayer([1.5], []);
            const layer2 = new ModifierLayer([], [-2]);
            const layer3 = new ModifierLayer([1.1], [4]);

            const combinedLayer = ModifierLayer.combine(layer1, layer2, layer3);

            expect(combinedLayer.multipliers).toEqual([1.5, 1.1]);
            expect(combinedLayer.flats).toEqual([-2, 4]);
        });

        test('should return an empty ModifierLayer when combining only empty layers', () => {
            const layer1 = new ModifierLayer();
            const layer2 = new ModifierLayer();

            const combinedLayer = ModifierLayer.combine(layer1, layer2);

            expect(combinedLayer.multipliers).toEqual([]);
            expect(combinedLayer.flats).toEqual([]);
        });

        test('should handle combining a single ModifierLayer (no-op case)', () => {
            const layer1 = new ModifierLayer([1.3, 0.9], [4, -2]);

            const combinedLayer = ModifierLayer.combine(layer1);

            expect(combinedLayer.multipliers).toEqual([1.3, 0.9]);
            expect(combinedLayer.flats).toEqual([4, -2]);
        });
    });

});
