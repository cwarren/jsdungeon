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
import { Stairs } from "./structure/stairsClass.js";
import { Item } from "./item/itemClass.js";

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
        expect(gameState.itemRepo).toBeInstanceOf(Repository);
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
        expect(gameState.itemRepo).toBeInstanceOf(Repository);
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

    test("ingesting other game state should update gameState reference accordingly", () => {
        gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
        gameState.avatar.unregisterPaneMiniChar = jest.fn();
        gameState.avatar.registerPaneMiniChar = jest.fn();

        const otherGameState = new GameState();
        otherGameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
        otherGameState.avatar.unregisterPaneMiniChar = jest.fn();
        otherGameState.avatar.registerPaneMiniChar = jest.fn();

        expect(otherGameState.avatar.gameState).not.toBe(gameState);

        gameState.ingestOtherGameState(otherGameState);

        expect(otherGameState.avatar.gameState).toBe(gameState);
        expect(otherGameState.world[0].gameState).toBe(gameState);
    });

    describe("GameState - serialization", () => {

        let gameStateAsPlainObject;

        beforeEach(() => {
            gameStateAsPlainObject = {
                entityRepo: {
                    name: 'entities', items: [
                        {
                            id: 'id-m8gaq510-sdjax-0',
                            type: 'RAT_INSIDIOUS',
                            name: 'Insidious Rat',
                            baseActionTime: 100,
                            attributes: {
                                strength: 100,
                                dexterity: 100,
                                fortitude: 100,
                                recovery: 100,
                                psyche: 100,
                                awareness: 100,
                                stability: 100,
                                will: 100,
                                aura: 100,
                                refinement: 100,
                                depth: 100,
                                flow: 100
                            },
                            location: { x: 6, y: 9, z: 0 },
                            vision: {
                                viewRadius: 2,
                                seenCells: [
                                    '6,9,0', '5,9,0',
                                    '4,9,0', '5,8,0',
                                    '6,8,0', '6,7,0',
                                    '7,8,0', '7,9,0',
                                    '8,9,0'
                                ]
                            },
                            movement: {
                                isRunning: false,
                                runDelta: null,
                                type: 'WANDER_AIMLESS',
                                actionTime: 100,
                                destinationCell: null,
                                movementPath: [],
                                isSleeping: false
                            },
                            health: {
                                maxHealth: 100,
                                curHealth: 100,
                                naturalHealingRate: 0.001,
                                naturalHealingTicks: 250,
                                lastNaturalHealTime: 0
                            },
                            damagedBy: [],
                            baseKillPoints: 10,
                            currentAdvancementPoints: 0,
                            actionStartingTime: 0
                        },
                        {
                            id: 'id-m8gaq511-to8i9-2',
                            type: 'AVATAR',
                            name: 'Avatar',
                            baseActionTime: 100,
                            attributes: {
                                strength: 100,
                                dexterity: 100,
                                fortitude: 100,
                                recovery: 100,
                                psyche: 100,
                                awareness: 100,
                                stability: 100,
                                will: 100,
                                aura: 100,
                                refinement: 100,
                                depth: 100,
                                flow: 100
                            },
                            location: { x: 8, y: 9, z: 0 },
                            vision: {
                                viewRadius: 2.5,
                                seenCells: [
                                    '8,9,0', '7,9,0',
                                    '6,8,0', '6,9,0',
                                    '8,8,0', '7,7,0',
                                    '7,8,0', '8,7,0',
                                    '9,7,0', '9,8,0',
                                    '9,9,0'
                                ]
                            },
                            movement: {
                                isRunning: false,
                                runDelta: null,
                                type: 'STATIONARY',
                                actionTime: 100,
                                destinationCell: null,
                                movementPath: [],
                                isSleeping: false
                            },
                            health: {
                                maxHealth: 100,
                                curHealth: 100,
                                naturalHealingRate: 0.001,
                                naturalHealingTicks: 250,
                                lastNaturalHealTime: 0
                            },
                            damagedBy: [],
                            baseKillPoints: 10,
                            currentAdvancementPoints: 0,
                            actionStartingTime: 0,
                            timeOnLevel: 120,
                            meleeAttack: true
                        }
                    ]
                },
                structureRepo: {
                    name: 'structures', items: [
                        {
                            id: 'id-m8gaq511-oab4j-1',
                            x: 5,
                            y: 6,
                            z: 0,
                            type: 'STAIRS_DOWN',
                            displaySymbol: '>',
                            displayColor: '#fff',
                            connectsTo: null
                        }
                    ]
                },
                itemRepo: {
                    name: 'items', items: [
                        {
                            id: 'simple-item-id-123',
                            type: 'ROCK',
                            name: 'Rock',
                            displaySymbol: '.',
                            displayColor: '#fff'
                        }
                    ]
                },
                score: 1,
                currentLevel: 0,
                isPlaying: true,
                status: 'ACTIVE',
                world: [
                    {
                        levelNumber: 0,
                        levelWidth: 10,
                        levelHeight: 10,
                        levelType: 'EMPTY',
                        grid: [
                            { terrain: 'FLOOR', x: 0, y: 0, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 0, y: 1, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 0, y: 2, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 0, y: 3, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 0, y: 4, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 0, y: 5, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 0, y: 6, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 0, y: 7, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 0, y: 8, z: 0, structure: null, entity: null },
                            {
                                terrain: 'FLOOR',
                                x: 0,
                                y: 9,
                                z: 0,
                                structure: null,
                                entity: 'id-m8gaq511-to8i9-2'
                            },
                            { terrain: 'FLOOR', x: 1, y: 0, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 1, y: 1, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 1, y: 2, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 1, y: 3, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 1, y: 4, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 1, y: 5, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 1, y: 6, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 1, y: 7, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 1, y: 8, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 1, y: 9, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 2, y: 0, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 2, y: 1, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 2, y: 2, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 2, y: 3, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 2, y: 4, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 2, y: 5, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 2, y: 6, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 2, y: 7, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 2, y: 8, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 2, y: 9, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 3, y: 0, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 3, y: 1, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 3, y: 2, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 3, y: 3, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 3, y: 4, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 3, y: 5, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 3, y: 6, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 3, y: 7, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 3, y: 8, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 3, y: 9, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 4, y: 0, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 4, y: 1, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 4, y: 2, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 4, y: 3, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 4, y: 4, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 4, y: 5, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 4, y: 6, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 4, y: 7, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 4, y: 8, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 4, y: 9, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 5, y: 0, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 5, y: 1, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 5, y: 2, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 5, y: 3, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 5, y: 4, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 5, y: 5, z: 0, structure: null, entity: null },
                            {
                                terrain: 'FLOOR',
                                x: 5,
                                y: 6,
                                z: 0,
                                structure: 'id-m8gaq511-oab4j-1',
                                entity: null
                            },
                            { terrain: 'FLOOR', x: 5, y: 7, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 5, y: 8, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 5, y: 9, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 6, y: 0, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 6, y: 1, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 6, y: 2, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 6, y: 3, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 6, y: 4, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 6, y: 5, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 6, y: 6, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 6, y: 7, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 6, y: 8, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 6, y: 9, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 7, y: 0, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 7, y: 1, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 7, y: 2, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 7, y: 3, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 7, y: 4, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 7, y: 5, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 7, y: 6, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 7, y: 7, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 7, y: 8, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 7, y: 9, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 8, y: 0, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 8, y: 1, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 8, y: 2, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 8, y: 3, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 8, y: 4, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 8, y: 5, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 8, y: 6, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 8, y: 7, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 8, y: 8, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 8, y: 9, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 9, y: 0, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 9, y: 1, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 9, y: 2, z: 0, structure: null, entity: null },
                            {
                                terrain: 'FLOOR',
                                x: 9,
                                y: 3,
                                z: 0,
                                structure: null,
                                entity: 'id-m8gaq510-sdjax-0'
                            },
                            { terrain: 'FLOOR', x: 9, y: 4, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 9, y: 5, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 9, y: 6, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 9, y: 7, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 9, y: 8, z: 0, structure: null, entity: null },
                            { terrain: 'FLOOR', x: 9, y: 9, z: 0, structure: null, entity: null }
                        ],
                        levelEntities: ['id-m8gaq510-sdjax-0', 'id-m8gaq511-to8i9-2'],
                        levelStructures: ['id-m8gaq511-oab4j-1'],
                        stairsDown: 'id-m8gaq511-oab4j-1',
                        stairsUp: null,
                        turnQueue: {
                            queue: [
                                { entity: 'id-m8gaq511-to8i9-2', time: 0 },
                                { entity: 'id-m8gaq510-sdjax-0', time: 1 }
                            ],
                            elapsedTime: 0,
                            previousActionTime: 0
                        },
                        timeOfAvatarDeparture: 0
                    },
                    {
                        levelNumber: 1,
                        levelWidth: 15,
                        levelHeight: 15,
                        levelType: 'EMPTY',
                        grid: null,
                        levelEntities: [],
                        levelStructures: [],
                        stairsDown: null,
                        stairsUp: null,
                        turnQueue: { queue: [], elapsedTime: 0, previousActionTime: 0 },
                        timeOfAvatarDeparture: 0
                    }
                ],
                avatar: "id-m8gaq511-to8i9-2",
            };
        });

        test("should serialize to a plain object correctly", () => {
            gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);

            const gameStateForSerializing = gameState.forSerializing();

            expect(gameStateForSerializing).toEqual({
                entityRepo: gameState.entityRepo.forSerializing(),
                structureRepo: gameState.structureRepo.forSerializing(),
                itemRepo: gameState.itemRepo.forSerializing(),
                score: gameState.score,
                currentLevel: gameState.currentLevel,
                isPlaying: gameState.isPlaying,
                status: gameState.status,
                world: gameState.world.map(wl => wl.forSerializing()),
                avatar: gameState.avatar.id,
            });
        });

        test("should deserialize from a plain object correctly", () => {
            const deserializedGameState = GameState.deserialize(gameStateAsPlainObject);

            expect(deserializedGameState).toBeInstanceOf(GameState);
            expect(deserializedGameState.score).toBe(1);
            expect(deserializedGameState.currentLevel).toBe(0);
            expect(deserializedGameState.isPlaying).toBe(true);
            expect(deserializedGameState.status).toBe("ACTIVE");
            expect(deserializedGameState.entityRepo).toBeInstanceOf(Repository);
            expect(deserializedGameState.entityRepo.items.size).toEqual(2);
            expect(deserializedGameState.structureRepo).toBeInstanceOf(Repository);
            expect(deserializedGameState.structureRepo.items.size).toEqual(1);
            expect(deserializedGameState.itemRepo).toBeInstanceOf(Repository);
            expect(deserializedGameState.itemRepo.items.size).toEqual(1);
            expect(deserializedGameState.world.length).toBe(2);
            expect(deserializedGameState.world[0]).toBeInstanceOf(WorldLevel);
            expect(deserializedGameState.world[1]).toBeInstanceOf(WorldLevel);
            expect(deserializedGameState.avatar).toBeInstanceOf(Avatar);
            expect(deserializedGameState.avatar.id).toBe("id-m8gaq511-to8i9-2");
            expect(deserializedGameState.avatar.timeOnLevel).toBe(120);
            expect(deserializedGameState.currentTurnQueue).toEqual(deserializedGameState.world[0].turnQueue);

            // level entity avatar is referencing the same object as game state avatar
            expect(deserializedGameState.world[0].levelEntities[1]).toBe(deserializedGameState.avatar);

            // ensure stair structures are deserialized correctly
            expect(deserializedGameState.structureRepo.get('id-m8gaq511-oab4j-1')).toBeInstanceOf(Stairs);

            // ensure stair structures are deserialized correctly
            expect(deserializedGameState.itemRepo.get('simple-item-id-123')).toBeInstanceOf(Item);

        });

        test("should deserialize from plain object when item repo is missing", () => {
            gameStateAsPlainObject.itemRepo = null;
    
            const deserializedGameState = GameState.deserialize(gameStateAsPlainObject);
    
            expect(deserializedGameState).toBeInstanceOf(GameState);
            expect(deserializedGameState.itemRepo).toBeInstanceOf(Repository);
            expect(deserializedGameState.itemRepo.items.size).toEqual(0);
        });

    });

});
