import { Entity } from "./entityClass.js";
import { WorldLevel } from "./worldLevelClass.js";
import { Avatar } from "./avatarClass.js";
import { devTrace } from "./util.js";
import { ageMessages } from "./uiUtil.js";

class GameState {
    constructor() {
        this.reset();
    }
    static statuses = ["NEW","ACTIVE","WON","LOST","ABANDONED"];
    static statusesGameOver = ["WON","LOST","ABANDONED"];

    reset() {
        devTrace(3,"resetting game state");
        this.score = 1;
        this.currentLevel = 0;
        this.isPlaying = false;
        this.status = "NEW";
        this.world = [];
        this.avatar = null;
        this.currentTurnQueue = null; // each world level has it's own turn queue; this is set as the avatar goes up and down levels
    }

    initialize(levelSpecifications) {
        devTrace(4,"initializing game state from level specs", levelSpecifications);
        this.world = levelSpecifications.map(([width, height, genOption], index) => new WorldLevel(this, index, width, height, genOption));
        this.world[0].generate();

        const firstLevel = this.world[0];
        if (this.world.length > 1) {
            firstLevel.addStairsDown();
        }

        this.setUpAvatar(firstLevel);
        this.populateLevelWithEntities(firstLevel);

        this.status="ACTIVE";
        this.isPlaying = true;
        this.currentTurnQueue = firstLevel.turnQueue;
    }

    setUpAvatar(initialFloor) {
        devTrace(3, "setting up avatar in game state on initial floor", initialFloor);
        const avatar = new Avatar();
        initialFloor.placeEntityRandomly(avatar);

        this.avatar = avatar;
        avatar.determineVisibleCells();
    }

    populateLevelWithEntities(worldLevel) {
        devTrace(4, "populating world level with entities", worldLevel);
        // for (let i = 0; i < 4; i++) {
        //     const ent = new Entity("MOLD_PALE");
        //     worldLevel.placeEntityRandomly(ent);
        // }
        // for (let i = 0; i < 2; i++) {
        //     const ent = new Entity("WORM_VINE");
        //     worldLevel.placeEntityRandomly(ent);
        // }
        // for (let i = 0; i < 1; i++) {
        //     const ent = new Entity("RAT_INSIDIOUS");
        //     worldLevel.placeEntityRandomly(ent);
        // }
        // for (let i = 0; i < 2; i++) {
        //     const ent = new Entity("RAT_MALIGN");
        //     worldLevel.placeEntityRandomly(ent);
        // }
    }

    getAvatarCell() {
        devTrace(6,"getting avatar cell via game state");
        return this.avatar ? this.avatar.getCell() : null;
    }

    //=====================
    // GAME MANAGEMENT

    winGame() {
        devTrace(1,"winning the game");
        this.status = "WON";
        this.isPlaying = false;
    }

    loseGame() {
        devTrace(1,"losing the game");
        this.status = "LOST";
        this.isPlaying = false;
    }

    abandonGame() {
        devTrace(1,"abandoning the game");
        this.status = "ABANDONED";
        this.isPlaying = false;
    }

    //=====================
    // TIME

    setTurnQueue(turnQueue) {
        devTrace(4,"setting game state turn queue", turnQueue);
        this.currentTurnQueue = turnQueue;
    }

    advanceGameTime() {
        devTrace(5,"advanding game time via game state");
        while (this.status == 'ACTIVE') {
            let activeEntity = this.currentTurnQueue.nextTurn();
            if (!activeEntity) break; // No more entities to process
    
            if (activeEntity === this.avatar && !activeEntity.movement.isRunning) {
                break; // Stop when it's the avatar's turn and the avatar is not running
            }
        }
    }

    handlePlayerActionTime(actionCost) {
        devTrace(4,`handling player action time of ${actionCost} in game state`);
        if (actionCost <= 0) return;
        this.avatar.addTimeOnLevel(actionCost);
        ageMessages();
    
        // If the avatar is running, immediately continue running
        if (this.avatar.movement.isRunning) {
            this.currentTurnQueue.addEntity(this.avatar, this.avatar.actionStartingTime + actionCost);
            this.advanceGameTime();  // Keep the turns flowing for running
            return;
        }
    
        this.currentTurnQueue.addEntity(this.avatar, this.avatar.actionStartingTime + actionCost);
        this.currentTurnQueue.normalizeQueueTimes();
        this.advanceGameTime();
    }

}

// Create a single instance to maintain the game's state globally
const gameState = new GameState();

export { GameState, gameState };
