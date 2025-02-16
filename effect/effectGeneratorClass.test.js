import { EffectGenerator } from './effectGeneratorClass.js';

describe('EffectGenerator', () => {
    test('should initialize with correct effect types', () => {
        const effectTypes = ['health', 'stamina', 'physical'];
        const effectGenerator = new EffectGenerator(effectTypes);

        expect(effectGenerator.types).toEqual(effectTypes);
    });

    test('should initialize with empty effect types if none provided', () => {
        const effectGenerator = new EffectGenerator();

        expect(effectGenerator.types).toEqual([]);
    });

    test('getEffect should return null by default', () => {
        const effectGenerator = new EffectGenerator();

        expect(effectGenerator.getEffect()).toBeNull();
    });

    test('should allow subclassing to override getEffect', () => {
        class CustomEffectGenerator extends EffectGenerator {
            getEffect() {
                return "Custom Effect";
            }
        }

        const customEffectGenerator = new CustomEffectGenerator();

        expect(customEffectGenerator.getEffect()).toBe("Custom Effect");
    });
});
