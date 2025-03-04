// NOTE: this defines an interface; the are specific PersistX sub-classes that implement the details of particular persistence methods

class Persist {

    constructor(messagePane) {
        this.messagePane = messagePane
    }

    // takes: a save slot and a game state
    // does: persists the gamestate in that save slot, overwriting anything that may already have been there
    // returns: n/a
    saveGame(saveSlot) {
        // stub
    }

    // takes: a save slot
    // returns: a GameState object based on the info in the indicated save slot
    loadGame(saveSlot) {  
        // stub
    }

    // takes: n/a
    // does: n/a
    // returns: a list of SaveSlots, which may or may not have games saved in them
    getSaveSlots() {
        // stub
    }

    // takes: a save slot
    // does: deletes the saved game data (if any) from the indicated save slot
    // returns: n/a
    deleteSavedGame(saveSlot) {
        // stub
    }

    //------------------------

    tellUser(msg) {
        // TODO: replace this with showing the msg in the messages pane
        console.log(msg);
        this.messagePane.ageMessages();
        this.messagePane.addMessage(msg);
    }
};

export {Persist};