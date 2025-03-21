class SaveSlot {
    constructor(saveName, gameState=null) {
        this.name = saveName;
        this.gameState = gameState;
        this.persistencePlainObject = {};
        this.isLoaded =false;
        this.isSaved = false;
        this.timestampLastSaved = null;
    }
}

export { SaveSlot };