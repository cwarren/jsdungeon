import { SaveSlot } from './saveSlotClass.js';

describe('SaveSlot', () => {
    test('initializes with a save name and default values', () => {
        const slot = new SaveSlot('Slot1');
        
        expect(slot.name).toBe('Slot1');
        expect(slot.gameState).toBeNull();
        expect(slot.isLoaded).toBe(false);
        expect(slot.persistencePlainObject).toEqual({});
        expect(slot.isSaved).toBe(false);
        expect(slot.timestampLastSaved).toBeNull();
    });

    test('initializes with a save name and given gamestate', () => {
        const gameState = { level: 5, score: 1000 };

        const slot = new SaveSlot('Slot2', gameState);
        
        expect(slot.name).toBe('Slot2');
        expect(slot.gameState).toEqual(gameState);
        expect(slot.isLoaded).toBe(false);
        expect(slot.persistencePlainObject).toEqual({});
        expect(slot.isSaved).toBe(false);
        expect(slot.timestampLastSaved).toBeNull();
    });
});

