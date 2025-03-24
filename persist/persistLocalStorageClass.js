import { Persist } from "./persistClass.js";

class PersistLocalStorage extends Persist {
    constructor(messagePane) {
        super(messagePane);
        this.STORAGE_PREFIX = "JSDungeonGameSave_"; // Prefix to avoid conflicts
    }

    // ===========================

    saveGame(saveSlot) {
        try {
            const saveTimestamp = Date.now();
            const saveData = {
                name: saveSlot.name,
                data: saveSlot.gameState.forSerializing(),
                timestamp: saveTimestamp,
                saveVersion: saveSlot.saveVersion,
            };

            console.log(`saveData for slot: ${saveSlot.name}`, saveData);

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
                if (parsedData.saveVersion != this.saveVersion) {
                    const msg = `Could not load ${saveSlot.name} - save slot version ${parsedData.saveVersion} differs from persistence version ${this.saveVersion}`;
                    saveSlot.errorMessage = msg;
                    throw new Error(msg);
                }
                saveSlot.persistencePlainObject = parsedData.data;
                saveSlot.isLoaded = true;
                this.tellUser(`Loaded game '${saveSlot.name}'`);
                console.log('Loaded save slot:', saveSlot);
            } else {
                this.tellUser(`No save found in slot: ${saveSlot.name}`);
            }
        } catch (error) {
            console.error(`Failed to load game from slot: ${saveSlot.name}`, error);
            this.tellUser(`Failed to load game from slot: ${saveSlot.name} (see log for details)`);
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
                    if (saveData.saveVersion != this.saveVersion) {
                        console.log(`skipping slot ${saveData.name} because it's save version of ${saveData.saveVersion} is not compatible with persistence version ${this.saveVersion}`);
                        continue;
                    }
                    const saveSlot = this.createSaveSlot(saveData.name);
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
