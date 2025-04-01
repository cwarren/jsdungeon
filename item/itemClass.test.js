import { Item } from './itemClass.js';
import { getItemDef } from './itemDefinitions.js';
import { generateId } from '../util.js';

jest.mock('../util.js', () => ({
    generateId: jest.fn(() => 'mock-id-123'),
}));

describe('Item', () => {
    const rockDef = getItemDef('ROCK');

    beforeEach(() => {
        jest.clearAllMocks();
    });

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
        const item = new Item(rockDef);

        expect(generateId).toHaveBeenCalled();
        expect(item.id).toBe('mock-id-123');
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


    describe('Item - serializing', () => {

        test('forSerializing returns expected plain object', () => {
            const item = new Item(rockDef, 'rock-123');
            const serialized = item.forSerializing();

            expect(serialized).toEqual({
                id: item.id,
                type: item.type,
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
