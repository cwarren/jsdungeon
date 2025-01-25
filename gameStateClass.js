import { Entity } from "./entityClass.js";
import { WorldLevel } from "./worldLevelClass.js";
import { TurnQueue } from "./gameTime.js";



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
        this.turnQueue = new TurnQueue();
    }

    initialize(levelSpecifications) {
        this.world = levelSpecifications.map(([width, height, genOption], index) => new WorldLevel(index, width, height, genOption));
        this.world[0].generate();

        const firstLevel = this.world[0];
        if (this.world.length > 1) {
            firstLevel.addStairsDown();
        }

        this.setUpAvatar(firstLevel);
        this.populateLevelWithEntities(firstLevel);

        this.status="ACTIVE";
        this.isPlaying = true;
        this.initializeTurnSystem();
    }

    setUpAvatar(initialFloor) {
        const avatar = new Entity("AVATAR");
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
    advanceGameTime() {
        while (true) {
            // console.log("time passes...", turnQueue);
            let activeEntity = this.turnQueue.nextTurn();
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
            this.turnQueue.addEntity(this.avatar, this.turnQueue.queue[0].time + actionCost);
            this.turnQueue.timePasses(actionCost);
            this.advanceGameTime();  // Keep the turns flowing for running
            return;
        }
    
        // Normal player action handling
        this.turnQueue.addEntity(this.avatar, this.turnQueue.queue[0].time + actionCost);
        this.turnQueue.timePasses(actionCost);
        this.turnQueue.normalizeQueueTimes();
    
        this.advanceGameTime();
    }

    initializeTurnSystem() {
        this.initializeTurnSystem_mobsOnly();
        this.turnQueue.addEntity(this.avatar, -1); // Add player to the queue, at the front
    }

    initializeTurnSystem_mobsOnly() {
        this.turnQueue.clear();
        const levelEntities = this.world[this.avatar.z].levelEntities;
        levelEntities.forEach(entity => {
            if (entity.type != "AVATAR") {
                this.turnQueue.addEntity(entity, Math.floor(Math.random() * levelEntities.length)); // shuffle them a bit
            }
        });
    }

}

// Create a single instance to maintain the game's state globally
const gameState = new GameState();

export { GameState, gameState };
