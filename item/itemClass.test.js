import { Item } from './itemClass.js';
import { getItemDef } from './itemDefinitions.js';
import { generateId } from '../util.js';

jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
    rollDice: jest.fn(() => 100),
    valueCalc: jest.requireActual('../util.js').valueCalc,
    formatNumberForMessage: jest.fn(() => '10'),
    generateId: jest.requireActual('../util.js').generateId,
    idOf: jest.requireActual('../util.js').idOf,
}));

describe('Item', () => {
    const rockDef = getItemDef('ROCK');
    const stickDef = getItemDef('STICK');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Item - creation', () => {
        test('constructor assigns fields correctly with explicit ID', () => {
            const item = new Item(rockDef, 'custom-id-001');

            expect(item.id).toBe('custom-id-001');
            expect(item.type).toBe(rockDef.type);
            expect(item.name).toBe(rockDef.name);
            expect(item.description).toBe(rockDef.description);
            expect(item.displaySymbol).toBe(rockDef.displaySymbol);
            expect(item.displayColor).toBe(rockDef.displayColor);
        });

        test('constructor assigns generated ID if none provided', () => {
            jest.spyOn(require('../util.js'), 'generateId');
            const item = new Item(rockDef);

            expect(generateId).toHaveBeenCalled();
        });

        test('makeItem returns a valid Item when type is known', () => {
            const item = Item.makeItem('ROCK');

            expect(item).toBeInstanceOf(Item);
            expect(item.type).toBe(rockDef.type);
            expect(item.name).toBe(rockDef.name);
        });

        test('makeItem returns null and logs when type is unknown', () => {
            console.log = jest.fn();

            const item = Item.makeItem('UNKNOWN_TYPE');

            expect(item).toBeNull();
            expect(console.log).toHaveBeenCalled();
        });
    });

    describe('Item - getters and setters', () => {
        test('getExtendedWeight returns correct extended weight', () => {
            const item = new Item(rockDef);
            item.stackCount = 3;

            expect(item.getExtendedWeight()).toBe(rockDef.weight * 3);
        });

        test('getExtendedVolume returns correct extended volume', () => {
            const item = new Item(stickDef);
            item.stackCount = 2;

            expect(item.getExtendedVolume()).toBe(stickDef.volume * 2);
        });
        test('getExtendedWeight returns correct weight for single item', () => {
            const item = new Item(rockDef);

            expect(item.getExtendedWeight()).toBe(rockDef.weight);
        });
    });

    describe('Item - stacking', () => {
        test('canStackWith returns true for stackable items of the same type', () => {
            const item1 = new Item(stickDef);
            const item2 = new Item(stickDef);

            expect(item1.canStackWith(item2)).toBe(true);
        });

        test('canStackWith returns false for non-stackable items', () => {
            const item1 = new Item(rockDef);
            const item2 = new Item(rockDef);

            expect(item1.canStackWith(item2)).toBe(false);
        });

        test('canStackWith returns false for items of different types', () => {
            const item1 = new Item(stickDef);
            const item2 = new Item(rockDef);

            item2.isStackable = true; // make rock stackable for this test, so we can test type difference

            expect(item1.canStackWith(item2)).toBe(false);
        });

        test('addStack combines stack counts for stackable items', () => {
            const item1 = new Item(stickDef);
            item1.stackCount = 3;

            const item2 = new Item(stickDef);
            item2.stackCount = 2;

            item1.addStack(item2);

            expect(item1.stackCount).toBe(5);
        });

        test('addStack does not combine stacks if items cannot stack', () => {
            const item1 = new Item(stickDef);
            item1.stackCount = 3;

            const item2 = new Item(rockDef);
            item2.stackCount = 2;

            const result = item1.addStack(item2);

            expect(result).toBe(false);
            expect(item1.stackCount).toBe(3);
        });

        test('addItemToStack is sugar for addStack with single items', () => {
            const item1 = new Item(stickDef);
            item1.stackCount = 3;

            const item2 = new Item(stickDef);

            item1.addItemToStack(item2);

            expect(item1.stackCount).toBe(4);
        });

        test('extractOneFromStack reduces stack count and returns a new item', () => {
            const item = new Item(stickDef);
            item.stackCount = 3;

            const extractedItem = item.extractOneFromStack();

            expect(item.stackCount).toBe(2);
            expect(extractedItem).toBeInstanceOf(Item);
            expect(extractedItem.type).toBe(item.type);
            expect(extractedItem.id).not.toEqual(item.id);
        });

        test('extractOneFromStack returns null if stack count is 1', () => {
            const item = new Item(stickDef);

            const extractedItem = item.extractOneFromStack();

            expect(extractedItem).toBeNull();
            expect(item.stackCount).toBe(1);
        });
    });

    describe('Item - serializing', () => {

        test('forSerializing returns expected plain object', () => {
            const item = new Item(rockDef, 'rock-123');
            const serialized = item.forSerializing();

            expect(serialized).toEqual({
                id: item.id,
                type: item.type,
            });
        });

        test('forSerializing returns stacked plain object', () => {
            const item = new Item(stickDef, 'stick-123');
            item.stackCount = 5; // Simulate a stack of 5 sticks
            const serialized = item.forSerializing();

            expect(serialized).toEqual({
                id: item.id,
                type: item.type,
                stackCount: item.stackCount,
            });
        });

        test('serialize returns a JSON string of serializable fields', () => {
            const item = new Item(rockDef, 'rock-xyz');
            const json = item.serialize();

            expect(typeof json).toBe('string');
        });

        test('deserialize restores a full item instance from data', () => {
            const data = {
                id: 'restored-1',
                type: 'ROCK',
            };

            const item = Item.deserialize(data);

            expect(item).toBeInstanceOf(Item);
            expect(item.id).toBe('restored-1');
            expect(item.type).toBe(rockDef.type);
            expect(item.name).toBe(rockDef.name);
            expect(item.description).toBe(rockDef.description);
            expect(item.displaySymbol).toBe(rockDef.displaySymbol);
            expect(item.displayColor).toBe(rockDef.displayColor);
        });

        test('deserialize handles stacked item from data', () => {
            const data = {
                id: 'restored-2',
                type: 'STICK',
                stackCount: 3,
            };

            const item = Item.deserialize(data);

            expect(item).toBeInstanceOf(Item);
            expect(item.id).toBe('restored-2');
            expect(item.type).toBe(stickDef.type);
            expect(item.name).toBe(stickDef.name);
            expect(item.description).toBe(stickDef.description);
            expect(item.displaySymbol).toBe(stickDef.displaySymbol);
            expect(item.displayColor).toBe(stickDef.displayColor);
            expect(item.stackCount).toBe(data.stackCount);
        });

        test('deserialize returns null and logs if item type is unknown', () => {
            console.log = jest.fn();

            const data = {
                id: 'bad-id',
                type: 'BAD_TYPE',
                name: 'Bogus',
                displaySymbol: '?',
                displayColor: '#000',
            };

            const item = Item.deserialize(data);

            expect(item).toBeNull();
            expect(console.log).toHaveBeenCalled();
        });

    });

});
