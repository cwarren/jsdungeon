import { GameState } from '../gameStateClass.js';
import { WorldLevelSpecification } from '../world/worldLevelSpecificationClass.js';
import { inventoryActionsMap, validatorForInventoryItemSelection } from './inventoryActions.js';
import { uiPaneMessages, uiPaneMain } from '../ui/ui.js';
import { Item } from '../item/itemClass.js';
import { ItemIdContainer } from '../item/itemIdContainerClass.js';

const WORLD_LEVEL_SPECS_FOR_TESTING = [
    WorldLevelSpecification.generateWorldLevelSpec({ type: 'EMPTY', width: 10, height: 10, populationParams: { entityPopulation: 'NONE', itemPopulation: 'NONE' }, }),
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
        eventHandler: { startListBasedInput: jest.fn(), priorInfo: 'priorInfo' },
    },
}));

describe('inventoryActions tests', () => {
    let avatar;
    let gameState;
    let item1;
    let item2;

    beforeEach(() => {
        gameState = new GameState();
        gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
        avatar = gameState.avatar;

        avatar.getCell().entity = null;
        avatar.placeAt(4, 4, 0);

        item1 = new Item('itemKey1', 'Item 1');
        item2 = new Item('itemKey2', 'Item 2');

        gameState.itemRepo.add(item1);
        gameState.itemRepo.add(item2);

        jest.clearAllMocks();
    });


    describe('inventoryActions tests - lineUp and lineDown', () => {
        test('lineUp calls the scrollUp method in the inventory renderer', () => {
            const mockScrollUp = jest.fn();
            uiPaneMain.renderers = { INVENTORY: { scrollUp: mockScrollUp } };

            inventoryActionsMap.INVENTORY_LINE_UP.action(gameState);

            expect(mockScrollUp).toHaveBeenCalledTimes(1);
        });

        test('lineDown calls the scrollDown method in the inventory renderer', () => {
            const mockScrollDown = jest.fn();
            uiPaneMain.renderers = { INVENTORY: { scrollDown: mockScrollDown } };

            inventoryActionsMap.INVENTORY_LINE_DOWN.action(gameState);

            expect(mockScrollDown).toHaveBeenCalledTimes(1);
        });
    });

    describe('inventoryActions tests - validatorForInventoryItemSelection', () => {
        test('validatorForInventoryItemSelection calls isValidSelection in the inventory renderer', () => {
            const mockIsValidSelection = jest.fn(() => true);
            uiPaneMain.renderers = { INVENTORY: { isValidSelection: mockIsValidSelection } };

            const result = validatorForInventoryItemSelection(gameState, 'testKey');

            expect(mockIsValidSelection).toHaveBeenCalledTimes(1);
            expect(mockIsValidSelection).toHaveBeenCalledWith('testKey');
            expect(result).toBe(true);
        });
    });


    describe('inventoryActions tests - list drop', () => {

        test('dropItemResolve calls dropItem on the avatar with the correct item', () => {
            const mockGetListOffset = jest.fn(() => 0);
            const mockGetListItemLabels = jest.fn(() => ['a', 'b']);
            uiPaneMain.renderers = { INVENTORY: { getListOffset: mockGetListOffset, getListItemLabels: mockGetListItemLabels, draw: jest.fn() } };

            const mockDropItem = jest.fn();
            avatar.dropItem = mockDropItem;

            avatar.inventory.add(item1);
            avatar.inventory.add(item2);


            inventoryActionsMap.INVENTORY_DROP.actionResolver(gameState, 'b');

            expect(mockGetListOffset).toHaveBeenCalledTimes(1);
            expect(mockGetListItemLabels).toHaveBeenCalledTimes(1);
            expect(mockDropItem).toHaveBeenCalledTimes(1);
            expect(mockDropItem).toHaveBeenCalledWith(item2);
            expect(uiPaneMain.renderers.INVENTORY.draw).toHaveBeenCalledTimes(1);
        });

        test('dropItemResolve shows a message if no item is found', () => {
            const mockGetListOffset = jest.fn(() => 0);
            const mockGetListItemLabels = jest.fn(() => ['a', 'b']);
            uiPaneMain.renderers = { INVENTORY: { getListOffset: mockGetListOffset, getListItemLabels: mockGetListItemLabels, draw: jest.fn()  } };

            const mockDropItem = jest.fn();
            avatar.dropItem = mockDropItem;

            avatar.inventory.add(item1);

            const mockAddMessage = jest.fn();
            uiPaneMessages.addMessage = mockAddMessage;

            inventoryActionsMap.INVENTORY_DROP.actionResolver(gameState, 'b');

            expect(mockGetListOffset).toHaveBeenCalledTimes(1);
            expect(mockGetListItemLabels).toHaveBeenCalledTimes(1);
            expect(mockAddMessage).toHaveBeenCalledTimes(1);
            expect(mockAddMessage).toHaveBeenCalledWith('No such item in inventory');
            expect(uiPaneMain.renderers.INVENTORY.draw).not.toHaveBeenCalled();

        });


    });

    describe('inventoryActions tests - examine', () => {
        test.todo('Show details of selected item in info panel');
        // test('Show details of selected item in info panel', () => {
        //     expect(1).toEqual(0);
        // });
    });

    describe('inventoryActions tests - put', () => {
        test.todo('Shift selected item into container in current space');
        // test('Shift selected item into container in the current space', () => {
        //     expect(1).toEqual(0);
        // });
    });

    describe('inventoryActions tests - equip', () => {
        test.todo('Wear/wield the selected item');
        // test('Wear/wield the selected item', () => {
        //     expect(1).toEqual(0);
        // });
    });


});
