import { Persist } from "./persistClass.js";
import { SaveSlot } from "./saveSlotClass.js";

class PersistIndexedDB extends Persist {
    constructor() {
        super(); // Ensures proper inheritance
        this.DB_NAME = "JSDungeonGameSavesDB";
        this.STORE_NAME = "saves";
        this.DB_VERSION = 1;
        this.KEY_PATH = "slotName";
        this.isSaving = false;
        this.isLoading = false;
        this.isGettingSaveSlots = false;
        this.isDeleting = false;
    }

    // ===========================

    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: this.KEY_PATH });
                }
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error("DB error: ", event.target.error);
                reject("Database error: " + (event.target.error?.message || "Unknown error"));

            };
        });
    }

    // ===========================

    async saveGame(saveSlot) {
        if (this.isSaving) {
            console.warn("Save attempt ignored: already saving.");
            return;
        }
        this.isSaving = true;
    
        try {
            const db = await this.openDatabase();
            const transaction = db.transaction(this.STORE_NAME, "readwrite");
            const store = transaction.objectStore(this.STORE_NAME);
    
            const saveTimestamp = Date.now();
            await new Promise((resolve, reject) => {
                const request = store.put({
                    [this.KEY_PATH]: saveSlot.name,
                    data: saveSlot.serializedData,
                    timestamp: saveTimestamp,
                });
                request.onsuccess = resolve;
                request.onerror = (event) => reject(event.target.error);
                transaction.oncomplete = resolve; // Ensures the transaction fully commits
            });
    
            saveSlot.isSaved = true;
            saveSlot.timestampLastSaved = saveTimestamp;
            this.tellUser(`Game saved in slot: ${saveSlot.name}`);
        } catch (error) {
            console.error(`Save failed for slot: ${saveSlot.name}`, error);
            this.tellUser(`Save failed for slot: ${saveSlot.name}`);
        } finally {
            this.isSaving = false;
        }
    }
    


    async loadGame(saveSlot) {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const db = await this.openDatabase();
            const transaction = db.transaction(this.STORE_NAME, "readonly");
            const store = transaction.objectStore(this.STORE_NAME);

            const result = await new Promise((resolve, reject) => {
                const request = store.get(saveSlot.name);
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject(event.target.error);
            });

            console.log("load result:", result);

            if (result) {
                saveSlot.serializedData = result.data;
                saveSlot.isLoaded = true;
                this.tellUser(`Loaded game ${saveSlot.name}`);
            } else {
                this.tellUser(`No save found in slot: ${saveSlot.name}`);
            }
        } catch (error) {
            console.error(`Failed to load game from slot: ${saveSlot.name}`, error);
            this.tellUser(`Failed to load game from slot: ${saveSlot.name}`);
        } finally {
            this.isLoading = false;
        }
    }


    async getSaveSlots() {
        if (this.isGettingSaveSlots) return;
        this.isGettingSaveSlots = true;

        try {
            const db = await this.openDatabase();
            const transaction = db.transaction(this.STORE_NAME, "readonly");
            const store = transaction.objectStore(this.STORE_NAME);

            const result = await new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject(event.target.error);
            });

            return result.map(save => {
                const ss = new SaveSlot(save[this.KEY_PATH]);
                ss.timestampLastSaved = new Date(save.timestamp).toLocaleString();
                return ss;
            });
        } catch (error) {
            console.error("Failed to get list of saved games.", error);
            this.tellUser("Failed to get list of saved games.");
            return [];
        } finally {
            this.isGettingSaveSlots = false;
        }
    }


    async deleteSavedGame(saveSlot) {
        if (this.isDeleting) return;
        this.isDeleting = true;

        try {
            const db = await this.openDatabase();
            const transaction = db.transaction(this.STORE_NAME, "readwrite");
            const store = transaction.objectStore(this.STORE_NAME);

            await new Promise((resolve, reject) => {
                const request = store.delete(saveSlot.name);
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject(event.target.error);
            });

            saveSlot.isSaved = false;
            saveSlot.timestampLastSaved = null;
            this.tellUser(`Deleted save slot: ${saveSlot.name}`);
        } catch (error) {
            console.error(`Failed to delete save ${saveSlot.name}`, error);
            this.tellUser(`Failed to delete save ${saveSlot.name}`);
        } finally {
            this.isDeleting = false;
        }
    }

}

export { PersistIndexedDB };
