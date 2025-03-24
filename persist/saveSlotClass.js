class SaveSlot {
    constructor(saveName, saveVersion, gameState=null) {
        this.name = saveName;
        this.gameState = gameState;
        this.persistencePlainObject = {};
        this.isLoaded =false;
        this.isSaved = false;
        this.timestampLastSaved = null;
        this.saveVersion = saveVersion;
    }
}

export { SaveSlot };