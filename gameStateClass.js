import { Entity } from "./entityClass.js";
import { WorldLevel } from "./worldLevelClass.js";
import { initializeTurnSystem } from "./gameTime.js";

class GameState {
    constructor() {
        this.score = 0;
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
}

// Create a single instance to maintain the game's state globally
const gameState = new GameState();

export { gameState };
