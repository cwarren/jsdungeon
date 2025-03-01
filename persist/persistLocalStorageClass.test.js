import { PersistLocalStorage } from "./persistLocalStorageClass.js";
import { SaveSlot } from "./saveSlotClass.js";

describe("PersistLocalStorage", () => {
    let persist, saveSlot;

    beforeEach(() => {
        persist = new PersistLocalStorage();
        saveSlot = new SaveSlot("testSlot");
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
        saveSlot.serializedData = { level: 5, inventory: ["sword", "shield"] };
        persist.saveGame(saveSlot);

        expect(localStorage.setItem).toHaveBeenCalledWith(
            "JSDungeonGameSave_testSlot",
            expect.any(String)
        );

        const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
        expect(savedData.name).toBe("testSlot");
        expect(savedData.data).toEqual(saveSlot.serializedData);
        expect(savedData.timestamp).toBeDefined();
    });

    // ===========================

    test("should load game from localStorage", () => {
        const savedState = {
            name: "testSlot",
            data: { level: 10, inventory: ["bow", "arrows"] },
            timestamp: Date.now(),
        };

        localStorage.setItem("JSDungeonGameSave_testSlot", JSON.stringify(savedState));
        persist.loadGame(saveSlot);

        expect(localStorage.getItem).toHaveBeenCalledWith("JSDungeonGameSave_testSlot");
        expect(saveSlot.serializedData).toEqual(savedState.data);
        expect(saveSlot.isLoaded).toBe(true);
    });

    // ===========================

    test("should return a list of saved games", () => {
        localStorage.setItem(
            "JSDungeonGameSave_testSlot",
            JSON.stringify({
                name: "testSlot",
                data: { level: 3 },
                timestamp: Date.now(),
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
        expect(saveSlot.serializedData).toEqual('');
        expect(saveSlot.isLoaded).toBe(false);
    });

    // ===========================

    test("should handle deletion of a non-existent save gracefully", () => {
        persist.deleteSavedGame(saveSlot);
        expect(localStorage.removeItem).toHaveBeenCalledWith("JSDungeonGameSave_testSlot");
    });
});
