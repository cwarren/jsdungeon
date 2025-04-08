import { GameState } from '../gameStateClass.js';
import { WorldLevelSpecification } from '../world/worldLevelSpecificationClass.js';
import { inventoryActionsMap } from './inventoryActions.js';
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

describe('inventoryActions tests', () => {
    let avatar;
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
        gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
        avatar = gameState.avatar;

        avatar.getCell().entity = null;
        avatar.placeAt(4, 4, 0);
        jest.clearAllMocks();
    });

    test.todo('inventory secondary input validator');
    // test('inventory secondary input validator', () => {
    //     expect(1).toEqual(0);
    // });

    describe('inventoryActions tests - list nav', () => {

        test.todo('Line down does nothing when inventory is empty or short');
        // test('Line down does nothing when inventory is empty or short', () => {
        //     expect(1).toEqual(0);
        // });

        test.todo('Line down moves down a line when inventory list is long');
        // test('Line down moves down a line when inventory list is long', () => {
        //     expect(1).toEqual(0);
        // });

        test.todo('Line down does nothing when already at the end of the inventory list');
        // test('Line down does nothing when already at the end of the inventory list', () => {
        //     expect(1).toEqual(0);
        // });

        test.todo('Line up does nothing when inventory is empty or short');
        // test('Line up does nothing when inventory is empty or short', () => {
        //     expect(1).toEqual(0);
        // });

        test.todo('Line up moves up a line when inventory list is long');
        // test('Line up moves up a line when inventory list is long', () => {
        //     expect(1).toEqual(0);
        // });

        test.todo('Line up does nothing when already at the beginning of the inventory list');
        // test('Line up does nothing when already at the beginning of the inventory list', () => {
        //     expect(1).toEqual(0);
        // });

    });

    describe('inventoryActions tests - list drop', () => {
        test.todo('Drop selected item into current space');
        // test('Drop selected item into current space', () => {
        //     expect(1).toEqual(0);
        // });
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
