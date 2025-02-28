class SaveSlot {
    constructor(saveName, gamestate=null) {
        this.name = saveName;
        this.gamestate = gamestate;
        this.serializedData = '';
        this.isLoaded = gamestate != null;
        this.isSaved = false;
        this.timestampLastSaved = null;
    }
}

export { SaveSlot };