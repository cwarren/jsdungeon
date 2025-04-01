import { GameState } from '../gameStateClass.js';
import { WorldLevelSpecification } from '../world/worldLevelSpecificationClass.js';
import { gameActionsMap } from './gameActions.js';
import { uiPaneMessages, uiPaneMain } from '../ui/ui.js';
import { Item } from '../item/itemClass.js';
import { ItemIdContainer } from '../item/itemIdContainerClass.js';

const WORLD_LEVEL_SPECS_FOR_TESTING = [
    WorldLevelSpecification.generateWorldLevelSpec({ type: 'EMPTY', width: 10, height: 10, populationParams: {entityPopulation: 'NONE', itemPopulation: 'NONE'}, }),
];

jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
    rollDice: jest.fn(() => 100),
    valueCalc: jest.requireActual('../util.js').valueCalc,
    formatNumberForMessage: jest.fn(() => '10'),
    generateId: jest.requireActual('../util.js').generateId,
    idOf: jest.requireActual('../util.js').idOf,
}));

jest.mock('../ui/ui.js', () => ({
    uiPaneMessages: { addMessage: jest.fn() },
    uiPaneMain: {
        zoomIn: jest.fn(),
        zoomOut: jest.fn(),
        zoomReset: jest.fn(),
        eventHandler: { startListBasedInput: jest.fn(), priorInfo: 'priorInfo'},
    },
}));

describe('gameActions tests', () => {
    let avatar;
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
        gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
        avatar = gameState.avatar;

        // TODO: clear out entities other than the avatar, and initial items - don't let the default level population interfere with testing (can cause intermittent failures)

        avatar.getCell().entity = null;
        avatar.placeAt(4, 4, 0);
        jest.clearAllMocks();
    });

    const directionTests = [
        ['MOVE_UL', -1, -1],
        ['MOVE_U', 0, -1],
        ['MOVE_UR', 1, -1],
        ['MOVE_L', -1, 0],
        ['MOVE_R', 1, 0],
        ['MOVE_DL', -1, 1],
        ['MOVE_D', 0, 1],
        ['MOVE_DR', 1, 1],
    ];

    describe('gameActions tests - movement', () => {

        test.each(directionTests)('%s moves the avatar and returns time cost', (actionKey, dx, dy) => {
            const startCell = avatar.getCell();

            const result = gameActionsMap[actionKey].action(gameState);

            const endCell = avatar.getCell();
            expect(endCell.x).toBe(startCell.x + dx);
            expect(endCell.y).toBe(startCell.y + dy);
            expect(result).toBeGreaterThan(0);
        });

        test('MOVE_WAIT returns avatar base action time', () => {
            const result = gameActionsMap.MOVE_WAIT.action(gameState);

            expect(result).toBe(avatar.baseActionTime);
        });

        test('SLEEP starts the avatar sleeping', () => {
            jest.spyOn(gameState.avatar, 'startSleeping');

            const result = gameActionsMap.SLEEP.action(gameState);

            expect(gameState.avatar.startSleeping).toHaveBeenCalled();
        });

        test('RUN_U starts running and returns initial time cost', () => {
            jest.spyOn(gameState.avatar.movement, 'startRunning');
            jest.spyOn(gameState.avatar, 'continueRunning');

            const result = gameActionsMap.RUN_U.action(gameState);

            expect(gameState.avatar.movement.startRunning).toHaveBeenCalled();
            expect(gameState.avatar.continueRunning).toHaveBeenCalled();
        });

        describe('gameActions tests - movement - stairs', () => {

            // NOTE: we can rely on there being no stairs since the testing world has only a single level

            test('TAKE_STAIRS_UP fails gracefully and takes no time without stairs', () => {
                const result = gameActionsMap.TAKE_STAIRS_UP.action(gameState);
                expect(result).toBe(0);
                expect(uiPaneMessages.addMessage).toHaveBeenCalled();
            });

            test('TAKE_STAIRS_DOWN fails gracefully and takes no time without stairs', () => {
                const result = gameActionsMap.TAKE_STAIRS_DOWN.action(gameState);
                expect(result).toBe(0);
                expect(uiPaneMessages.addMessage).toHaveBeenCalled();
            });
        });
    });

    describe('gameActions tests - inventory, get', () => {
        test('GET_SINGLE_ITEM does nothing and takes no time if no items to get', () => {
            avatar.getCell().inventory = null;
            const initialInventorySize = avatar.inventory.count();
            const result = gameActionsMap.GET_SINGLE_ITEM.action(gameState);
            expect(result).toBe(0);
            expect(avatar.inventory.count()).toEqual(initialInventorySize);
        });

        test('GET_SINGLE_ITEM takes the only item from the cell, using some time and clearing out that location', () => {
            const avCell = avatar.getCell();
            avCell.inventory = new ItemIdContainer();
            const item = Item.makeItem("ROCK");
            gameState.itemRepo.add(item);
            avCell.giveItem(item);
            expect(avatar.inventory.count()).toEqual(0);
            expect(avCell.inventory.count()).toEqual(1);

            const result = gameActionsMap.GET_SINGLE_ITEM.action(gameState);

            expect(avatar.inventory.count()).toEqual(1);
            expect(avCell.inventory).toBeNull();
            expect(result).toBe(avatar.baseActionTime);
        });

        test('GET_SINGLE_ITEM takes one of multiple item from the cell, using some time', () => {
            const avCell = avatar.getCell();
            avCell.inventory = new ItemIdContainer();

            const item = Item.makeItem("ROCK");
            gameState.itemRepo.add(item);
            avCell.giveItem(item);
            const item2 = Item.makeItem("ROCK");
            gameState.itemRepo.add(item2);
            avCell.giveItem(item2);
            
            expect(avatar.inventory.count()).toEqual(0);
            expect(avCell.inventory.count()).toEqual(2);

            const result = gameActionsMap.GET_SINGLE_ITEM.action(gameState);

            expect(avatar.inventory.count()).toEqual(1);
            expect(avCell.inventory.count()).toEqual(1);
            expect(result).toBe(avatar.baseActionTime);
        });

        test('GET_ALL_ITEMS does nothing and takes no time if no items', () => {
            avatar.getCell().inventory = null;
            const initialInventorySize = avatar.inventory.count();
            const result = gameActionsMap.GET_ALL_ITEMS.action(gameState);
            expect(result).toBe(0);
            expect(avatar.inventory.count()).toEqual(initialInventorySize);
        });

        test('GET_ALL_ITEMS does the same as GET_SINGLE_ITEM if only one item is in the cell', () => {
            const avCell = avatar.getCell();
            avCell.inventory = new ItemIdContainer();
            const item = Item.makeItem("ROCK");
            gameState.itemRepo.add(item);
            avCell.giveItem(item);
            expect(avatar.inventory.count()).toEqual(0);
            expect(avCell.inventory.count()).toEqual(1);

            const result = gameActionsMap.GET_ALL_ITEMS.action(gameState);

            expect(avatar.inventory.count()).toEqual(1);
            expect(avCell.inventory).toBeNull();
            expect(result).toBe(avatar.baseActionTime);
        });

        test('GET_ALL_ITEMS gets all items and takes longer if more than one item is there', () => {
            const avCell = avatar.getCell();
            avCell.inventory = new ItemIdContainer();

            const item = Item.makeItem("ROCK");
            gameState.itemRepo.add(item);
            avCell.giveItem(item);
            const item2 = Item.makeItem("ROCK");
            gameState.itemRepo.add(item2);
            avCell.giveItem(item2);
            
            expect(avatar.inventory.count()).toEqual(0);
            expect(avCell.inventory.count()).toEqual(2);

            const result = gameActionsMap.GET_ALL_ITEMS.action(gameState);

            expect(avatar.inventory.count()).toEqual(2);
            expect(avCell.inventory).toBeNull();
            expect(result).toBe(avatar.baseActionTime * 2);
        });
    });

    describe('gameActions tests - inventory, list and other', () => {
        test('INVENTORY_SHOW shifts to list-based input', () => {
            const result = gameActionsMap.INVENTORY_SHOW.action(gameState);
            expect(result).toBe(0);
            expect(uiPaneMain.eventHandler.startListBasedInput).toHaveBeenCalled();
        });
        test('INVENTORY_SHOW resolver updates the info panel', () => {
            const result = gameActionsMap.INVENTORY_SHOW.actionResolver (gameState, [{},{name: 'item name', description: 'item descr'}], 1);
            
            expect(uiPaneMain.eventHandler.priorInfo).not.toEqual('priorInfo');
        }); 

        test('INVENTORY_DROP shifts to list-based input', () => {
            const result = gameActionsMap.INVENTORY_DROP.action(gameState);
            expect(result).toBe(0);
            expect(uiPaneMain.eventHandler.startListBasedInput).toHaveBeenCalled();
        }); 
        test('INVENTORY_DROP resolver moves item from avatar inventory to current cell', () => {
            const item1 = Item.makeItem('ROCK');
            gameState.itemRepo.add(item1);
            gameState.avatar.giveItem(item1);
            const item2 = Item.makeItem('STICK');
            gameState.itemRepo.add(item2);
            gameState.avatar.giveItem(item2);

            const result = gameActionsMap.INVENTORY_DROP.actionResolver (gameState, gameState.avatar.inventory.getItems(gameState.itemRepo), 0);

            expect(gameState.avatar.hasItem(item1)).toBe(false);
            expect(gameState.avatar.hasItem(item2)).toBe(true);

            expect(gameState.avatar.getCell().hasItem(item1)).toBe(true);
            expect(gameState.avatar.getCell().hasItem(item2)).toBe(false);
        }); 
    });

    describe('gameActions tests - zoom', () => {

        test('ZOOM actions call UI functions', () => {
            expect(gameActionsMap.ZOOM_IN.action(gameState)).toBe(0);
            expect(uiPaneMain.zoomIn).toHaveBeenCalled();

            expect(gameActionsMap.ZOOM_OUT.action(gameState)).toBe(0);
            expect(uiPaneMain.zoomOut).toHaveBeenCalled();

            expect(gameActionsMap.ZOOM_RESET.action(gameState)).toBe(0);
            expect(uiPaneMain.zoomReset).toHaveBeenCalled();
        });
    });

});
