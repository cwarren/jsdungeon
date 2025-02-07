import { Entity } from "./entityClass.js";
import { WorldLevel } from "./worldLevelClass.js";
import { Avatar } from "./avatarClass.js";
import { devTrace } from "./util.js";
import { uiPaneMain, uiPaneMessages, uiPaneInfo, uiPaneMiniChar } from "./ui.js";
import { WorldLevelSpecification } from "./worldLevelSpecificationClass.js";

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
        // this.world = levelSpecifications.map(([width, height, genOption], index) => new WorldLevel(this, index, width, height, genOption));
        this.world = levelSpecifications.map((spec, index) => WorldLevel.getFromSpecification(this, index, spec));
        this.world[0].generate();

        const firstLevel = this.world[0];

        this.setUpAvatar(firstLevel);
        // this.populateLevelWithEntities(firstLevel); // DEV FUNCTION

        this.status="ACTIVE";
        this.isPlaying = true;
        this.currentTurnQueue = firstLevel.turnQueue;
    }

    setUpAvatar(initialFloor) {
        devTrace(3, "setting up avatar in game state on initial floor", initialFloor);
        const avatar = new Avatar();
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
            const ent = new Entity("MOLD_PALE");
            worldLevel.placeEntityRandomly(ent);
        }
        for (let i = 0; i < 2; i++) {
            const ent = new Entity("WORM_VINE");
            worldLevel.placeEntityRandomly(ent);
        }
        for (let i = 0; i < 1; i++) {
            const ent = new Entity("RAT_INSIDIOUS");
            worldLevel.placeEntityRandomly(ent);
        }
        for (let i = 0; i < 2; i++) {
            const ent = new Entity("RAT_MALIGN");
            worldLevel.placeEntityRandomly(ent);
        }
    }

    //=====================
    // INFORMATION

    getAvatarCell() {
        devTrace(6,"getting avatar cell via game state");
        return this.avatar ? this.avatar.getCell() : null;
    }

    getCurrentWorldLevel() {
        devTrace(6,"getting current world level via game state");
        return gameState.world[gameState.currentLevel];
    }

    //=====================
    // GAME MANAGEMENT

    winGame() {
        devTrace(1,"winning the game");
        this.avatar.unregisterPaneMiniChar();
        this.status = "WON";
        this.isPlaying = false;
        uiPaneMain.resetUIState();
        uiPaneMain.pushUIState("GAME_OVER");
    }

    loseGame() {
        devTrace(1,"losing the game");
        this.avatar.unregisterPaneMiniChar();
        this.status = "LOST";
        this.isPlaying = false;
        uiPaneMain.resetUIState();
        uiPaneMain.pushUIState("GAME_OVER");

    }

    abandonGame() {
        devTrace(1,"abandoning the game");
        this.avatar.unregisterPaneMiniChar();
        this.status = "ABANDONED";
        this.isPlaying = false;
        uiPaneMain.resetUIState();
        uiPaneMain.pushUIState("GAME_OVER");
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
        uiPaneMessages.ageMessages();
    
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

// each level is specified as [level width, level height, level gen type]
// const WORLD_LEVEL_SPECS_FOR_DEV= [
//     [15, 10, "EMPTY"], 
//     [30, 20, "TOWN"], 
//     [30, 20, "ROOMS_SUBDIVIDE"], 
//     [30, 20, "ROOMS_RANDOM"], 
//     [30, 20, "PUDDLES"], 
//     [30, 20, "BURROW"], 
//     [30, 20, "NEST"], 
//     [30, 20, "CAVES_SHATTERED"], 
//     [30, 20, "CAVES"], 
//     [30, 20, "CAVES_LARGE"], 
//     [30, 20, "CAVES_HUGE"], 
//     [30, 20, "EMPTY"], 
//     [30, 20, "RANDOM"], 
//   ];
  const WORLD_LEVEL_SPECS_FOR_DEV= [
    WorldLevelSpecification.generateWorldLevelSpec({type: 'EMPTY', width: 15, height: 10}),
    WorldLevelSpecification.generateWorldLevelSpec({type: 'TOWN', width: 30, height: 20}),
    WorldLevelSpecification.generateWorldLevelSpec({type: 'ROOMS_SUBDIVIDE', width: 30, height: 20}),
    WorldLevelSpecification.generateWorldLevelSpec({type: 'ROOMS_RANDOM', width: 30, height: 20}),
    WorldLevelSpecification.generateWorldLevelSpec({type: 'PUDDLES', width: 30, height: 20}),
    WorldLevelSpecification.generateWorldLevelSpec({type: 'BURROW', width: 30, height: 20}),
    WorldLevelSpecification.generateWorldLevelSpec({type: 'NEST', width: 30, height: 20}),
    WorldLevelSpecification.generateWorldLevelSpec({type: 'CAVES_SHATTERED', width: 30, height: 20}),
    WorldLevelSpecification.generateWorldLevelSpec({type: 'CAVES', width: 30, height: 20}),
    WorldLevelSpecification.generateWorldLevelSpec({type: 'CAVES_LARGE', width: 30, height: 20}),
    WorldLevelSpecification.generateWorldLevelSpec({type: 'CAVES_HUGE', width: 30, height: 20}),
    WorldLevelSpecification.generateWorldLevelSpec({type: 'EMPTY', width: 30, height: 20}),
    WorldLevelSpecification.generateWorldLevelSpec({type: 'RANDOM', width: 30, height: 20}),
  ];


// Create a single instance to maintain the game's state globally
const gameState = new GameState();
function initializeGameWorld() { // this is a hack until I put this stuff in a better location (probably just embed it in the class)
    gameState.initialize(WORLD_LEVEL_SPECS_FOR_DEV);
    gameState.advanceGameTime();
  }


export { GameState, gameState, WORLD_LEVEL_SPECS_FOR_DEV, initializeGameWorld };
