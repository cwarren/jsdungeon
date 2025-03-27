import { ItemIdContainer } from './itemIdContainerClass'; // adjust path if needed

jest.mock('../util', () => ({
    idOf: (objOrId) => (typeof objOrId === 'string' ? objOrId : objOrId.id),
}));

describe('ItemIdContainer', () => {
    let container;
    const item1 = { id: 'item-1' };
    const item2 = { id: 'item-2' };
    const item3 = { id: 'item-3' };

    beforeEach(() => {
        container = new ItemIdContainer();
    });

    test('initializes empty by default', () => {
        expect(container.itemList).toEqual([]);
    });

    test('initializes with prefilled items', () => {
        const prefilled = new ItemIdContainer([item1, 'item-2']);
        expect(prefilled.itemList).toEqual(['item-1', 'item-2']);
    });

    test('adds items and avoids duplicates', () => {
        container.add(item1);
        container.add(item1); // should not add again
        container.add('item-2');
        expect(container.itemList).toEqual(['item-1', 'item-2']);
    });

    test('checks if an item exists', () => {
        container.add(item1);
        expect(container.has('item-1')).toBe(true);
        expect(container.has(item1)).toBe(true);
        expect(container.has('nonexistent')).toBe(false);
    });

    test('removes items', () => {
        container.add(item1);
        container.add(item2);
        container.remove('item-1');
        expect(container.itemList).toEqual(['item-2']);
    });

    test('removing non-existent item does nothing', () => {
        container.add(item1);
        container.remove('nonexistent');
        expect(container.itemList).toEqual(['item-1']);
    });

    test('passes item to another container', () => {
        const target = new ItemIdContainer();
        container.add(item1);
        container.passItemTo(item1, target);

        expect(container.itemList).toEqual([]);
        expect(target.itemList).toEqual(['item-1']);
    });

    test('does not pass if item is not present', () => {
        const target = new ItemIdContainer();
        container.passItemTo('item-1', target);

        expect(container.itemList).toEqual([]);
        expect(target.itemList).toEqual([]);
    });

    test('takes item from another container', () => {
        const source = new ItemIdContainer(['item-1']);
        container.takeItemFrom('item-1', source);

        expect(container.itemList).toEqual(['item-1']);
        expect(source.itemList).toEqual([]);
    });

    test('does not take if item not in source', () => {
        const source = new ItemIdContainer(['item-2']);
        container.takeItemFrom('item-1', source);

        expect(container.itemList).toEqual([]);
        expect(source.itemList).toEqual(['item-2']);
    });

    describe('ItemIdContainer - serializing', () => {
        test('forSerializing returns array of item IDs', () => {
            container.add(item1);
            container.add(item2);
            expect(container.forSerializing()).toEqual(['item-1', 'item-2']);
        });

        test('deserializes from data', () => {
            const data = ['item-1', 'item-2'];
            const restored = ItemIdContainer.deserialize(data);
            expect(restored.itemList).toEqual(['item-1', 'item-2']);
        });
    });
});
