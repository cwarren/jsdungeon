import { Entity } from "./entityClass.js";
import { WorldLevel } from "./worldLevelClass.js";
import { Avatar } from "./avatarClass.js";


class GameState {
    constructor() {
        this.reset();
    }
    static statuses = ["NEW","ACTIVE","WON","LOST","ABANDONED"];
    static statusesGameOver = ["WON","LOST","ABANDONED"];

    reset() {
        this.score = 1;
        this.currentLevel = 0;
        this.isPlaying = false;
        this.status = "NEW";
        this.world = [];
        this.avatar = null;
        this.currentTurnQueue = null; // each world level has it's own turn queue; this is set as the avatar goes up and down levels
    }

    initialize(levelSpecifications) {
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
        // const avatar = new Entity("AVATAR");
        const avatar = new Avatar();
        initialFloor.placeEntityRandomly(avatar);

        this.avatar = avatar;
        avatar.determineVisibleCells();
    }

    populateLevelWithEntities(worldLevel) {
        for (let i = 0; i < 5; i++) {
            const ent = new Entity("MOLD_PALE");
            worldLevel.placeEntityRandomly(ent);
        }
    }

    getAvatarCell() {
        return this.avatar ? this.avatar.getCell() : null;
    }

    //=====================
    // GAME MANAGEMENT

    winGame() {
        console.log("winning the game");
        this.status = "WON";
        this.isPlaying = false;
    }

    loseGame() {
        console.log("losing the game");
        this.status = "LOST";
        this.isPlaying = false;
    }

    abandonGame() {
        console.log("abandoning the game");
        this.status = "ABANDONED";
        this.isPlaying = false;
    }

    //=====================
    // TIME

    setTurnQueue(turnQueue) {
        this.currentTurnQueue = turnQueue;
    }

    advanceGameTime() {
        while (true) {
            // console.log("time passes...", currentTurnQueue);
            let activeEntity = this.currentTurnQueue.nextTurn();
            if (!activeEntity) break; // No more entities to process
    
            if (activeEntity === this.avatar && !activeEntity.isRunning) {
                break; // Stop when it's the avatar's turn and the avatar is not running
            }
        }
    }

    handlePlayerActionTime(actionCost) {
        // console.log(`handling player action time of ${actionCost}`);
        if (actionCost <= 0) return;
    
        // If the avatar is running, immediately continue running
        if (this.avatar.isRunning) {
            this.currentTurnQueue.addEntity(this.avatar, this.currentTurnQueue.queue[0].time + actionCost);
            this.currentTurnQueue.timePasses(actionCost);
            this.advanceGameTime();  // Keep the turns flowing for running
            return;
        }
    
        // Normal player action handling
        this.currentTurnQueue.addEntity(this.avatar, (this.currentTurnQueue.queue[0] ? this.currentTurnQueue.queue[0].time : 0) + actionCost);
        this.currentTurnQueue.timePasses(actionCost);
        this.currentTurnQueue.normalizeQueueTimes();
    
        this.advanceGameTime();
    }

}

// Create a single instance to maintain the game's state globally
const gameState = new GameState();

export { GameState, gameState };
