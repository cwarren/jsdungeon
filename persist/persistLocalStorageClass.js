import { Persist } from "./persistClass.js";
import { SaveSlot } from "./saveSlotClass.js";

class PersistLocalStorage extends Persist {
    constructor() {
        super();
        this.STORAGE_PREFIX = "JSDungeonGameSave_"; // Prefix to avoid conflicts
    }

    // ===========================

    saveGame(saveSlot) {
        try {
            const saveTimestamp = Date.now();
            const saveData = {
                name: saveSlot.name,
                data: saveSlot.serializedData,
                timestamp: saveTimestamp
            };

            localStorage.setItem(this.STORAGE_PREFIX + saveSlot.name, JSON.stringify(saveData));

            saveSlot.isSaved = true;
            saveSlot.timestampLastSaved = saveTimestamp;
            this.tellUser(`Game saved in slot: ${saveSlot.name}`);
        } catch (error) {
            console.error(`Save failed for slot: ${saveSlot.name}`, error);
            this.tellUser(`Save failed for slot: ${saveSlot.name}`);
        }
    }

    // ===========================

    loadGame(saveSlot) {
        try {
            const saveData = localStorage.getItem(this.STORAGE_PREFIX + saveSlot.name);

            if (saveData) {
                const parsedData = JSON.parse(saveData);
                saveSlot.serializedData = parsedData.data;
                saveSlot.isLoaded = true;
                this.tellUser(`Loaded game from slot: ${saveSlot.name}`);
            } else {
                this.tellUser(`No save found in slot: ${saveSlot.name}`);
            }
        } catch (error) {
            console.error(`Failed to load game from slot: ${saveSlot.name}`, error);
            this.tellUser(`Failed to load game from slot: ${saveSlot.name}`);
        }
    }

    // ===========================

    getSaveSlots() {
        try {
            const saves = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.STORAGE_PREFIX)) {
                    const saveData = JSON.parse(localStorage.getItem(key));
                    const saveSlot = new SaveSlot(saveData.name);
                    saveSlot.timestampLastSaved = new Date(saveData.timestamp).toLocaleString();
                    saves.push(saveSlot);
                }
            }

            return saves;
        } catch (error) {
            console.error("Failed to get list of saved games.", error);
            this.tellUser("Failed to get list of saved games.");
            return [];
        }
    }

    // ===========================

    deleteSavedGame(saveSlot) {
        try {
            localStorage.removeItem(this.STORAGE_PREFIX + saveSlot.name);
            saveSlot.isSaved = false;
            saveSlot.timestampLastSaved = null;
            this.tellUser(`Deleted save slot: ${saveSlot.name}`);
        } catch (error) {
            console.error(`Failed to delete save ${saveSlot.name}`, error);
            this.tellUser(`Failed to delete save ${saveSlot.name}`);
        }
    }
}

export { PersistLocalStorage };
