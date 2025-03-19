import { GameState } from "./gameStateClass.js";
import { Repository } from "./repositoryClass.js";
import { Entity } from "./entity/entityClass.js";
import { Structure } from "./structure/structureClass.js";
import { WorldLevel } from "./world/worldLevelClass.js";
import { Avatar } from "./entity/avatarClass.js";
import { WorldLevelSpecification } from "./world/worldLevelSpecificationClass.js";
import { devTrace } from "./util.js";
import { TurnQueue } from "./gameTime.js";
import { uiPaneMain } from "./ui/ui.js";

jest.mock('./util.js', () => ({
    devTrace: jest.fn(),
    rollDice: jest.fn(() => 100),
    valueCalc: jest.requireActual('./util.js').valueCalc,
    formatNumberForMessage: jest.fn(() => '10'),
    generateId: jest.requireActual('./util.js').generateId,
}));

jest.mock('./ui/ui.js', () => ({
    uiPaneMessages: { addMessage: jest.fn(), },
    uiPaneInfo: { setInfo: jest.fn() },
    uiPaneMain: { resetUIState: jest.fn(), pushUIState: jest.fn() },
}));


const WORLD_LEVEL_SPECS_FOR_TESTING = [
    WorldLevelSpecification.generateWorldLevelSpec({ type: 'EMPTY', width: 10, height: 10 }),
    WorldLevelSpecification.generateWorldLevelSpec({ type: 'EMPTY', width: 15, height: 15 }),
];

describe("GameState Tests", () => {
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
    });

    test("instantiates with correct default values", () => {
        expect(gameState.score).toBe(1);
        expect(gameState.currentLevel).toBe(0);
        expect(gameState.isPlaying).toBe(false);
        expect(gameState.status).toBe("NEW");
        expect(gameState.world).toEqual([]);
        expect(gameState.avatar).toBeNull();
        expect(gameState.currentTurnQueue).toBeNull();
        expect(gameState.entityRepo).toBeInstanceOf(Repository);
        expect(gameState.structureRepo).toBeInstanceOf(Repository);
    });


    test("initializes correctly", () => {
        gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);

        expect(gameState.score).toBe(1);
        expect(gameState.currentLevel).toBe(0);
        expect(gameState.isPlaying).toBe(true);
        expect(gameState.status).toBe("ACTIVE");
        expect(gameState.world.length).toEqual(WORLD_LEVEL_SPECS_FOR_TESTING.length);
        expect(gameState.avatar).toBeInstanceOf(Avatar);
        expect(gameState.currentTurnQueue).toBeInstanceOf(TurnQueue);
        expect(gameState.entityRepo).toBeInstanceOf(Repository);
        expect(gameState.structureRepo).toBeInstanceOf(Repository);
    });



    test("initialize() creates world levels and sets avatar", () => {
        gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);

        expect(gameState.world.length).toBe(2);
        expect(gameState.world[0]).toBeInstanceOf(WorldLevel);
        expect(gameState.world[1]).toBeInstanceOf(WorldLevel);
        expect(gameState.isPlaying).toBe(true);
        expect(gameState.status).toBe("ACTIVE");
        expect(gameState.avatar).toBeInstanceOf(Avatar);
    });

    test("advances game time correctly", () => {
        const mockSpecs = [
            WorldLevelSpecification.generateWorldLevelSpec({ width: 10, height: 10, type: "EMPTY" }),
        ];
        gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
        gameState.advanceGameTime();

        expect(gameState.currentTurnQueue).not.toBeNull();
    });

    test("winGame updates status and ends the game", () => {
        gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
        gameState.avatar.unregisterPaneMiniChar = jest.fn();

        gameState.winGame();

        expect(gameState.status).toBe("WON");
        expect(gameState.isPlaying).toBe(false);
        expect(gameState.avatar.unregisterPaneMiniChar).toHaveBeenCalled();
        expect(uiPaneMain.resetUIState).toHaveBeenCalled();
        expect(uiPaneMain.pushUIState).toHaveBeenCalled();
    });

    test("loseGame updates status and ends the game", () => {
        gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
        gameState.avatar.unregisterPaneMiniChar = jest.fn();

        gameState.loseGame();

        expect(gameState.status).toBe("LOST");
        expect(gameState.isPlaying).toBe(false);
        expect(gameState.avatar.unregisterPaneMiniChar).toHaveBeenCalled();
        expect(uiPaneMain.resetUIState).toHaveBeenCalled();
        expect(uiPaneMain.pushUIState).toHaveBeenCalled();
    });

    test("abandonGame updates status and ends the game", () => {
        gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
        gameState.avatar.unregisterPaneMiniChar = jest.fn();

        gameState.abandonGame();

        expect(gameState.status).toBe("ABANDONED");
        expect(gameState.isPlaying).toBe(false);
        expect(gameState.avatar.unregisterPaneMiniChar).toHaveBeenCalled();
        expect(uiPaneMain.resetUIState).toHaveBeenCalled();
        expect(uiPaneMain.pushUIState).toHaveBeenCalled();
    });

    describe("GameState - serialization", () => {
        // TODO: Add tests for serialization
    });
});
