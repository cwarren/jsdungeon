import { Effect } from './effectClass.js';

describe('Effect', () => {
    test('should initialize with correct effect types', () => {
        const effectTypes = ['physical', 'fire'];
        const effect = new Effect(effectTypes);

        expect(effect.types).toEqual(effectTypes);
    });

    test('should initialize with empty effect types if none provided', () => {
        const effect = new Effect();

        expect(effect.types).toEqual([]);
    });
});
