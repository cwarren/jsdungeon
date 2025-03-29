import { ItemIdContainer } from './itemIdContainerClass.js';
import { Repository } from '../repositoryClass';

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
        expect(container.itemIdList).toEqual([]);
    });

    test('initializes with prefilled items', () => {
        const prefilled = new ItemIdContainer([item1, 'item-2']);
        expect(prefilled.itemIdList).toEqual(['item-1', 'item-2']);
    });

    test('adds items and avoids duplicates', () => {
        container.add(item1);
        container.add(item1); // should not add again
        container.add('item-2');
        expect(container.itemIdList).toEqual(['item-1', 'item-2']);
    });

    test('checks if an item exists', () => {
        container.add(item1);
        expect(container.has('item-1')).toBe(true);
        expect(container.has(item1)).toBe(true);
        expect(container.has('nonexistent')).toBe(false);
    });

    test('checks if an item container is empty', () => {
        expect(container.isEmpty()).toBe(true);
        container.add(item1);
        expect(container.isEmpty()).toBe(false);
        container.remove(item1);
        expect(container.isEmpty()).toBe(true);
    });

    test('says how many items contained', () => {
        expect(container.isEmpty()).toBe(true);
        expect(container.count()).toEqual(0);

        container.add(item1);
        expect(container.count()).toEqual(1);

        container.add(item2);
        expect(container.count()).toEqual(2);

        container.remove(item1);
        expect(container.count()).toEqual(1);
    });

    test('removes items', () => {
        container.add(item1);
        container.add(item2);
        container.remove('item-1');
        expect(container.itemIdList).toEqual(['item-2']);
    });

    test('removing non-existent item does nothing', () => {
        container.add(item1);
        container.remove('nonexistent');
        expect(container.itemIdList).toEqual(['item-1']);
    });

    test('extracting the first item removes it from the container and returns the id for that item',  () => {
        container.add(item1);
        container.add(item2);
        container.add(item3);

        const extractedItemId = container.extractFirst();

        expect(extractedItemId).toEqual('item-1');
        expect(container.has(item1)).toBe(false);
        expect(container.has(item2)).toBe(true);
        expect(container.has(item3)).toBe(true);
    });

    test('extracting all items removes them from the container and returns the ids for them',  () => {
        container.add(item1);
        container.add(item2);
        container.add(item3);

        const extractedItemIds = container.extractAll();

        expect(extractedItemIds).toEqual(['item-1', 'item-2', 'item-3']);
        expect(container.isEmpty()).toBe(true);
    });

    test('gives item to another container', () => {
        const target = new ItemIdContainer();
        container.add(item1);
        container.giveItemTo(item1, target);

        expect(container.itemIdList).toEqual([]);
        expect(target.itemIdList).toEqual(['item-1']);
    });

    test('does not give if item is not present', () => {
        const target = new ItemIdContainer();
        container.giveItemTo('item-1', target);

        expect(container.itemIdList).toEqual([]);
        expect(target.itemIdList).toEqual([]);
    });

    test('takes item from another container', () => {
        const source = new ItemIdContainer(['item-1']);
        container.takeItemFrom('item-1', source);

        expect(container.itemIdList).toEqual(['item-1']);
        expect(source.itemIdList).toEqual([]);
    });

    test('does not take if item not in source', () => {
        const source = new ItemIdContainer(['item-2']);
        container.takeItemFrom('item-1', source);

        expect(container.itemIdList).toEqual([]);
        expect(source.itemIdList).toEqual(['item-2']);
    });

    describe('ItemIdContainer - getItems', () => {
        let itemRepo;
    
        beforeEach(() => {
            itemRepo = new Repository('test-items');
            itemRepo.add({ id: 'item-1', name: 'Sword' });
            itemRepo.add({ id: 'item-2', name: 'Shield' });
        });
    
        test('returns full item objects from a repository using stored IDs', () => {
            container = new ItemIdContainer(['item-1', 'item-2']);
            const results = container.getItems(itemRepo);
    
            expect(results).toEqual([
                { id: 'item-1', name: 'Sword' },
                { id: 'item-2', name: 'Shield' },
            ]);
        });
    
        test('includes null for missing items in the repository', () => {
            container = new ItemIdContainer(['item-1', 'missing-item']);
            const results = container.getItems(itemRepo);
    
            expect(results).toEqual([
                { id: 'item-1', name: 'Sword' },
                null,
            ]);
        });
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
            expect(restored.itemIdList).toEqual(['item-1', 'item-2']);
        });
    });
});
