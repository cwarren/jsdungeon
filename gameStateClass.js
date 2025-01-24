import { Entity } from "./entityClass.js";
import { WorldLevel } from "./worldLevelClass.js";
import { initializeTurnSystem } from "./gameTime.js";


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
        initializeTurnSystem();
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

}

// Create a single instance to maintain the game's state globally
const gameState = new GameState();

export { GameState, gameState };
