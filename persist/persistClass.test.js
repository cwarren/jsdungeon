import { Persist } from "./persistClass";

describe('Persist (base)', () => {

    let mockMessagePane;

    beforeEach(() => { 
        mockMessagePane = {
            ageMessages: jest.fn(),
            addMessage: jest.fn(),
        };
    });

    test('initializes with message pane', () => {
        const persist = new Persist(mockMessagePane);
        
        expect(persist.messagePane).toBe(mockMessagePane);
        expect(typeof persist.saveVersion).toBe("string");
    });

    test('tellUser sends messages to message pane', () => {
        const persist = new Persist(mockMessagePane);

        persist.tellUser('Test message');
        expect(mockMessagePane.ageMessages).toHaveBeenCalled();
        expect(mockMessagePane.addMessage).toHaveBeenCalledWith('Test message');
    });

    test('createSaveSlot creates a new SaveSlot object', () => {
        const persist = new Persist(mockMessagePane);
        const saveName = 'TestSlot';
        const gameState = { level: 1, score: 100 };

        const saveSlot = persist.createSaveSlot(saveName, gameState);

        expect(saveSlot.name).toBe(saveName);
        expect(saveSlot.gameState).toEqual(gameState);
        expect(saveSlot.isLoaded).toBe(false);
        expect(saveSlot.persistencePlainObject).toEqual({});
        expect(saveSlot.isSaved).toBe(false);
        expect(saveSlot.timestampLastSaved).toBeNull();
        expect(saveSlot.saveVersion).toBe(persist.saveVersion);
    });
});

