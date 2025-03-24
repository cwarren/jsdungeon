import { Entity } from "./entity/entityClass.js";
import { Avatar } from "./entity/avatarClass.js";
import { Structure } from "./structure/structureClass.js";
import { Stairs } from "./structure/stairsClass.js";
import { WorldLevel } from "./world/worldLevelClass.js";
import { devTrace } from "./util.js";
import { uiPaneMain, uiPaneMessages, uiPaneInfo, uiPaneMiniChar } from "./ui/ui.js";
import { WorldLevelSpecification } from "./world/worldLevelSpecificationClass.js";
import { Repository } from "./repositoryClass.js";

class GameState {
    constructor() {
        this.reset();
    }
    static statuses = ["NEW", "ACTIVE", "WON", "LOST", "ABANDONED"];
    static statusesGameOver = ["WON", "LOST", "ABANDONED"];

    reset() {
        devTrace(3, "resetting game state");
        this.score = 1;
        this.currentLevel = 0;
        this.isPlaying = false;
        this.status = "NEW";
        this.world = [];
        this.avatar = null;
        this.currentTurnQueue = null; // each world level has it's own turn queue; this is set as the avatar goes up and down levels
        this.entityRepo = new Repository('entities');
        this.structureRepo = new Repository('structures');
    }

    forSerializing() {
        devTrace(4, "getting game state for serializing"); 
        return {
            entityRepo: this.entityRepo.forSerializing(),
            structureRepo: this.structureRepo.forSerializing(),
            score: this.score,
            currentLevel: this.currentLevel,
            isPlaying: this.isPlaying,
            status: this.status,
            world: this.world.map(wl => wl.forSerializing()),
            avatar: this.avatar.id,
        };
    }

    serialize() {
        devTrace(4, "serializing game state");
        return JSON.stringify(this.forSerializing());
    }

    static deserialize(data) {
        const newGameState = new GameState();

        // NOTE: we cannot deserialize the structureRepo using the generic Structure class because the repo-based 
        // deserialization assumues that all structures are of the same type and we have Stairs (and other) structures
        // that need to be deserialized using their specific class so we have to do it manually
        newGameState.structureRepo = new Repository(data.structureRepo.name);
        data.structureRepo.items.forEach(structureData => {
            let structure;
            if (structureData.type === 'STAIRS_UP' || structureData.type === 'STAIRS_DOWN') {
                structure = Stairs.deserialize(structureData, newGameState.world[structureData.z]);
            } else {
                // For other structures, use the generic Structure class
                structure = Structure.deserialize(structureData, newGameState.world[structureData.z]);
            }
            newGameState.structureRepo.add(structure);
        });

        // the entityRepo can be deserialized using the generic Entity class because all entities are of the same
        // type, except for the Avatar, which is handled after-the-fact
        newGameState.entityRepo = Repository.deserialize(data.entityRepo, Entity.deserialize, newGameState);        
        const avatarData = data.entityRepo.items.find(ent => ent.id == data.avatar)
        newGameState.avatar = Avatar.deserialize(avatarData, newGameState);
        newGameState.entityRepo.add(newGameState.avatar); // this overwrites the Entity instance in the repo with the Avatar one

        newGameState.score = data.score;
        newGameState.currentLevel = data.currentLevel;
        newGameState.isPlaying = data.isPlaying;
        newGameState.status = data.status;

        // IMPORTANT: this has to be done after the avatar is added to the entityRepo, otherwise the world level will reference a disconnected avatar
        newGameState.world = data.world.map(wlData => WorldLevel.deserialize(wlData, newGameState));

        newGameState.currentTurnQueue = newGameState.world[newGameState.currentLevel].turnQueue;

        return newGameState;
    }

    initialize(levelSpecifications) {
        devTrace(4, "initializing game state from level specs", levelSpecifications);
        // this.world = levelSpecifications.map(([width, height, genOption], index) => new WorldLevel(this, index, width, height, genOption));
        this.world = levelSpecifications.map((spec, index) => WorldLevel.getFromSpecification(this, index, spec));
        this.world[0].generate();

        const firstLevel = this.world[0];

        this.setUpAvatar(firstLevel);
        // this.populateLevelWithEntities(firstLevel); // DEV FUNCTION

        this.status = "ACTIVE";
        this.isPlaying = true;
        this.currentTurnQueue = firstLevel.turnQueue;
    }

    setUpAvatar(initialFloor) {
        devTrace(3, "setting up avatar in game state on initial floor", initialFloor);
        const avatar = new Avatar(this);
        initialFloor.placeEntityRandomlyAtBeginningOfTurnQueue(avatar);

        this.avatar = avatar;
        avatar.determineVisibleCells();

        if (uiPaneMiniChar && uiPaneMiniChar.avatar == null) {
            this.avatar.registerPaneMiniChar(uiPaneMiniChar);
        }
    }

    // NOTE: this is a dev function to populate the level with entities for testing
    // In a real game, entities would be placed by the level population function
    populateLevelWithEntities(worldLevel) {
        devTrace(4, "populating world level with entities", worldLevel);
        for (let i = 0; i < 4; i++) {
            const ent = new Entity(this,"MOLD_PALE");
            worldLevel.placeEntityRandomly(ent);
        }
        for (let i = 0; i < 2; i++) {
            const ent = new Entity(this,"WORM_VINE");
            worldLevel.placeEntityRandomly(ent);
        }
        for (let i = 0; i < 1; i++) {
            const ent = new Entity(this,"RAT_INSIDIOUS");
            worldLevel.placeEntityRandomly(ent);
        }
        for (let i = 0; i < 2; i++) {
            const ent = new Entity(this,"RAT_MALIGN");
            worldLevel.placeEntityRandomly(ent);
        }
    }

    // NOTE: this mutates the data in otherGameState to point to this
    ingestOtherGameState(otherGameState) {
        devTrace(4, "copying game state from another game state", otherGameState);

        this.score =  otherGameState.score;
        this.currentLevel = otherGameState.currentLevel;
        this.isPlaying = otherGameState.isPlaying;
        this.status = otherGameState.status;

        this.world = otherGameState.world;
        this.world.forEach((wl, index) => {
            wl.setGameState(this);
        });

        this.avatar = otherGameState.avatar;
        this.avatar.gameState = this;
        this.avatar.registerPaneMiniChar(uiPaneMiniChar);
        this.avatar.determineVisibleCells();

        this.entityRepo = otherGameState.entityRepo;
        this.entityRepo.items.forEach(entity => {
            entity.setGameState(this);
        });

        this.structureRepo = otherGameState.structureRepo;

        this.currentTurnQueue = this.world[this.currentLevel].turnQueue;
    }

    //=====================
    // INFORMATION

    getAvatarCell() {
        devTrace(6, "getting avatar cell via game state");
        return this.avatar ? this.avatar.getCell() : null;
    }

    getCurrentWorldLevel() {
        devTrace(6, "getting current world level via game state");
        return this.world[this.currentLevel];
    }

    //=====================
    // GAME MANAGEMENT

    winGame() {
        devTrace(1, "winning the game");
        this.avatar.unregisterPaneMiniChar();
        this.status = "WON";
        this.isPlaying = false;
        uiPaneMain.resetUIState();
        uiPaneMain.pushUIState("GAME_OVER");
    }

    loseGame() {
        devTrace(1, "losing the game");
        this.avatar.unregisterPaneMiniChar();
        this.status = "LOST";
        this.isPlaying = false;
        uiPaneMain.resetUIState();
        uiPaneMain.pushUIState("GAME_OVER");

    }

    abandonGame() {
        devTrace(1, "abandoning the game");
        this.avatar.unregisterPaneMiniChar();
        this.status = "ABANDONED";
        this.isPlaying = false;
        uiPaneMain.resetUIState();
        uiPaneMain.pushUIState("GAME_OVER");
    }

    //=====================
    // TIME

    setTurnQueue(turnQueue) {
        devTrace(4, "setting game state turn queue", turnQueue);
        this.currentTurnQueue = turnQueue;
    }

    advanceGameTime() {
        devTrace(5, "advanding game time via game state");
        while (this.status == 'ACTIVE') {
            let activeEntity = this.currentTurnQueue.nextTurn();
            if (!activeEntity) break; // No more entities to process

            if (activeEntity === this.avatar && !activeEntity.movement.isRunning && !activeEntity.movement.isSleeping) {
                break; // Stop when it's the avatar's turn and the avatar is not running
            }
        }
    }

    handlePlayerActionTime(actionTime) {
        devTrace(4, `handling player action time of ${actionTime} in game state`);
        if (actionTime <= 0) return;
        this.avatar.addTimeOnLevel(actionTime);
        uiPaneMessages.ageMessages();

        // If the avatar is running, immediately continue running
        if (this.avatar.movement.isRunning || this.avatar.isSleeping) {
            this.currentTurnQueue.addEntity(this.avatar, this.avatar.actionStartingTime + actionTime);
            this.advanceGameTime();  // Keep the turns flowing for running
            return;
        }

        this.currentTurnQueue.addEntity(this.avatar, this.avatar.actionStartingTime + actionTime);
        this.currentTurnQueue.normalizeQueueTimes();
        this.advanceGameTime();
    }

}

const WORLD_LEVEL_SPECS_FOR_DEV = [
    WorldLevelSpecification.generateWorldLevelSpec({ type: 'EMPTY', width: 6, height: 4 }),
    WorldLevelSpecification.generateWorldLevelSpec({ type: 'EMPTY', width: 15, height: 10 }),
    // WorldLevelSpecification.generateWorldLevelSpec({ type: 'TOWN', width: 30, height: 20 }),
    // WorldLevelSpecification.generateWorldLevelSpec({ type: 'ROOMS_SUBDIVIDE', width: 30, height: 20 }),
    // WorldLevelSpecification.generateWorldLevelSpec({ type: 'ROOMS_RANDOM', width: 30, height: 20 }),
    // WorldLevelSpecification.generateWorldLevelSpec({ type: 'PUDDLES', width: 30, height: 20 }),
    // WorldLevelSpecification.generateWorldLevelSpec({ type: 'BURROW', width: 30, height: 20 }),
    // WorldLevelSpecification.generateWorldLevelSpec({ type: 'NEST', width: 30, height: 20 }),
    // WorldLevelSpecification.generateWorldLevelSpec({ type: 'CAVES_SHATTERED', width: 30, height: 20 }),
    // WorldLevelSpecification.generateWorldLevelSpec({ type: 'CAVES', width: 30, height: 20 }),
    // WorldLevelSpecification.generateWorldLevelSpec({ type: 'CAVES_LARGE', width: 30, height: 20 }),
    // WorldLevelSpecification.generateWorldLevelSpec({ type: 'CAVES_HUGE', width: 30, height: 20 }),
    // WorldLevelSpecification.generateWorldLevelSpec({ type: 'EMPTY', width: 30, height: 20 }),
    // WorldLevelSpecification.generateWorldLevelSpec({ type: 'RANDOM', width: 30, height: 20 }),
];

export { GameState,  WORLD_LEVEL_SPECS_FOR_DEV };
