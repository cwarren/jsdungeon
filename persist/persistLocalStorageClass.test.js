
import { PersistLocalStorage } from "./persistLocalStorageClass.js";

describe("PersistLocalStorage", () => {
    let persist, saveSlot;
    const mockPersistencePlainObject = { level: 5, inventory: ["sword", "shield"] };

    beforeEach(() => {
        const mockUiPaneMessages = {
            addMessage: jest.fn(),
            ageMessages: jest.fn(),
        };
    
        persist = new PersistLocalStorage(mockUiPaneMessages);
        saveSlot = persist.createSaveSlot("testSlot", {forSerializing: () => { return mockPersistencePlainObject; }});
        jest.spyOn(Storage.prototype, "setItem");
        jest.spyOn(Storage.prototype, "getItem");
        jest.spyOn(Storage.prototype, "removeItem");
        jest.spyOn(Storage.prototype, "key");
        jest.spyOn(Storage.prototype, "length", "get").mockReturnValue(1);
    });

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    // ===========================

    test("should save game to localStorage", () => {
        saveSlot.persistencePlainObject = mockPersistencePlainObject;

        persist.saveGame(saveSlot);

        expect(localStorage.setItem).toHaveBeenCalledWith(
            "JSDungeonGameSave_testSlot",
            expect.any(String)
        );

        const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);

        expect(savedData.name).toBe("testSlot");
        expect(savedData.data).toEqual(saveSlot.persistencePlainObject);
        expect(savedData.timestamp).toBeDefined();
        expect(savedData.saveVersion).toBe(persist.saveVersion);

    });

    // ===========================

    test("should not load game from localStorage when save version is not compatible", () => {
        const savedState = {
            name: "testSlot",
            data: { level: 10, inventory: ["bow", "arrows"] },
            timestamp: Date.now(),
            saveVersion: "bad save version",
        };

        localStorage.setItem("JSDungeonGameSave_testSlot", JSON.stringify(savedState));
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        persist.loadGame(saveSlot);

        expect(localStorage.getItem).toHaveBeenCalledWith("JSDungeonGameSave_testSlot");

        expect(saveSlot.persistencePlainObject).toEqual({});
        expect(saveSlot.isLoaded).toBe(false);
        expect(saveSlot.errorMessage).not.toEqual('');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining(saveSlot.name),
            expect.any(Error)
        );
    
        consoleErrorSpy.mockRestore();
    });

    test("should load game from localStorage when save version is compatible", () => {
        const savedState = {
            name: "testSlot",
            data: { level: 10, inventory: ["bow", "arrows"] },
            timestamp: Date.now(),
            saveVersion: persist.saveVersion,
        };

        localStorage.setItem("JSDungeonGameSave_testSlot", JSON.stringify(savedState));
        persist.loadGame(saveSlot);

        expect(localStorage.getItem).toHaveBeenCalledWith("JSDungeonGameSave_testSlot");
        expect(saveSlot.persistencePlainObject).toEqual(savedState.data);
        expect(saveSlot.isLoaded).toBe(true);
        expect(saveSlot.errorMessage).toEqual('');
    });

    // ===========================

    test("should not return save slots with incompatible save versions", () => {
        localStorage.setItem(
            "JSDungeonGameSave_testSlot",
            JSON.stringify({
                name: "testSlot",
                data: { level: 3 },
                timestamp: Date.now(),
                saveVersion: "bad save version",
            })
        );

        jest.spyOn(Storage.prototype, "key").mockImplementation((index) => {
            return index === 0 ? "JSDungeonGameSave_testSlot" : null;
        });

        const saves = persist.getSaveSlots();

        expect(saves.length).toBe(0);
    });


    test("should return a list of saved games with compatible save versions", () => {
        localStorage.setItem(
            "JSDungeonGameSave_testSlot",
            JSON.stringify({
                name: "testSlot",
                data: { level: 3 },
                timestamp: Date.now(),
                saveVersion: persist.saveVersion,
            })
        );

        jest.spyOn(Storage.prototype, "key").mockImplementation((index) => {
            return index === 0 ? "JSDungeonGameSave_testSlot" : null;
        });

        const saves = persist.getSaveSlots();

        expect(saves.length).toBe(1);
        expect(saves[0].name).toBe("testSlot");
        expect(saves[0].timestampLastSaved).toBeDefined();
    });

    // ===========================

    test("should delete a saved game from localStorage", () => {
        localStorage.setItem(
            "JSDungeonGameSave_testSlot",
            JSON.stringify({ name: "testSlot", data: {} })
        );

        persist.deleteSavedGame(saveSlot);

        expect(localStorage.removeItem).toHaveBeenCalledWith("JSDungeonGameSave_testSlot");
    });

    // ===========================

    test("should handle loading a non-existent save gracefully", () => {
        persist.loadGame(saveSlot);
        expect(localStorage.getItem).toHaveBeenCalledWith("JSDungeonGameSave_testSlot");
        expect(saveSlot.persistencePlainObject).toEqual({});
        expect(saveSlot.isLoaded).toBe(false);
    });

    // ===========================

    test("should handle deletion of a non-existent save gracefully", () => {
        persist.deleteSavedGame(saveSlot);
        expect(localStorage.removeItem).toHaveBeenCalledWith("JSDungeonGameSave_testSlot");
    });
});
