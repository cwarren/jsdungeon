import { ItemIdContainer } from './itemIdContainerClass.js';
import { Repository } from '../repositoryClass';
import { Item } from './itemClass.js';

jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
    rollDice: jest.fn(() => 100),
    generateId: jest.requireActual('../util.js').generateId,
    idOf: jest.requireActual('../util.js').idOf,
}));

describe('ItemIdContainer', () => {
    let itemRepo;
    let testItem1;
    let testItem2;    
    let testItem3;    

    let container;
    let sourceContainer;
    let targetContainer;

    beforeEach(() => {
        itemRepo = new Repository('test-items');
        
        testItem1 = Item.makeItem("ROCK");
        itemRepo.add(testItem1);
        
        testItem2 = Item.makeItem("STICK");
        itemRepo.add(testItem2);

        testItem3 = Item.makeItem("ROCK");
        itemRepo.add(testItem3);

        container = new ItemIdContainer(itemRepo);
        sourceContainer = new ItemIdContainer(itemRepo);
        targetContainer = new ItemIdContainer(itemRepo);

    });

    test('initializes empty by default', () => {
        expect(container.itemIdList).toEqual([]);
        expect(container.baseRespository).toBe(itemRepo);
    });

    test('throws error if no base repo provided on initialization', () => {
        expect(() => {
            const badContainer = new ItemIdContainer();
        }).toThrow();
    });

    test('initializes with prefilled items', () => {
        const prefilled = new ItemIdContainer(itemRepo, [testItem1, testItem2.id]);
        expect(prefilled.itemIdList).toEqual([testItem1.id, testItem2.id]);
    });

    test('adds items and avoids duplicates', () => {
        container.add(testItem1);
        container.add(testItem1); // should not add again
        container.add(testItem2.id);
        expect(container.itemIdList).toEqual([testItem1.id, testItem2.id]);
    });

    test('checks if an item exists', () => {
        container.add(testItem1);
        expect(container.has(testItem1.id)).toBe(true);
        expect(container.has(testItem1)).toBe(true);
        expect(container.has('nonexistent')).toBe(false);
    });

    test('checks if an item container is empty', () => {
        expect(container.isEmpty()).toBe(true);
        container.add(testItem1);
        expect(container.isEmpty()).toBe(false);
        container.remove(testItem1);
        expect(container.isEmpty()).toBe(true);
    });

    test('says how many items contained', () => {
        expect(container.isEmpty()).toBe(true);
        expect(container.count()).toEqual(0);

        container.add(testItem1);
        expect(container.count()).toEqual(1);

        container.add(testItem2);
        expect(container.count()).toEqual(2);

        container.remove(testItem1);
        expect(container.count()).toEqual(1);
    });

    test('removes items by id', () => {
        container.add(testItem1);
        container.add(testItem2);
        container.remove(testItem1.id);
        expect(container.itemIdList).toEqual([testItem2.id]);
    });

    test('removing non-existent item does nothing', () => {
        container.add(testItem1);
        container.remove('nonexistent');
        expect(container.itemIdList).toEqual([testItem1.id]);
    });

    test('extracting the first item removes it from the container and returns the id for that item',  () => {
        container.add(testItem1);
        container.add(testItem2);
        container.add(testItem3);

        const extractedItemId = container.extractFirst();

        expect(extractedItemId).toEqual(testItem1.id);
        expect(container.has(testItem1)).toBe(false);
        expect(container.has(testItem2)).toBe(true);
        expect(container.has(testItem3)).toBe(true);
    });

    test('extracting all items removes them from the container and returns the ids for them',  () => {
        container.add(testItem1);
        container.add(testItem2);
        container.add(testItem3);

        const extractedItemIds = container.extractAll();

        expect(extractedItemIds).toEqual([testItem1.id, testItem2.id, testItem3.id]);
        expect(container.isEmpty()).toBe(true);
    });

    test('gives item to another container', () => {
        container.add(testItem1);
        container.giveItemTo(testItem1, targetContainer);

        expect(container.itemIdList).toEqual([]);
        expect(targetContainer.itemIdList).toEqual([testItem1.id]);
    });

    test('does not give if item is not present', () => {
        container.giveItemTo(testItem1, targetContainer);

        expect(container.itemIdList).toEqual([]);
        expect(targetContainer.itemIdList).toEqual([]);
    });

    test('takes item from another container', () => {
        sourceContainer.add(testItem1);
        container.takeItemFrom(testItem1, sourceContainer);

        expect(container.itemIdList).toEqual([testItem1.id]);
        expect(sourceContainer.itemIdList).toEqual([]);
    });

    test('does not take if item not in source', () => {
        sourceContainer.add(testItem2);
        container.takeItemFrom(testItem1, sourceContainer);

        expect(container.itemIdList).toEqual([]);
        expect(sourceContainer.itemIdList).toEqual([testItem2.id]);
    });

    describe('ItemIdContainer - getItems', () => {
    
        test('returns full item objects from a repository using stored IDs', () => {
            container.add(testItem1);
            container.add(testItem2);
            const results = container.getItems();
    
            expect(results).toEqual([testItem1,testItem2]);
        });
    
        test('includes null for missing items in the repository', () => {
            const containerWithJunk = new ItemIdContainer(itemRepo, [testItem1.id, 'missing-item']);

            const results = containerWithJunk.getItems();
    
            expect(results).toEqual([
                testItem1,
                null,
            ]);
        });

        test('returns full item object for first item', () => {
            container.add(testItem1);

            const results = container.getFirstItem();
    
            expect(results).toEqual(testItem1);
        });

    });

    describe('ItemIdContainer - serializing', () => {
        test('forSerializing returns array of item IDs', () => {
            container.add(testItem1);
            container.add(testItem2);
            expect(container.forSerializing()).toEqual([testItem1.id,testItem2.id]);
        });

        test('deserializes from data', () => {
            const data = [testItem1.id,testItem2.id];
            const restored = ItemIdContainer.deserialize(itemRepo, data);
            expect(restored.itemIdList).toEqual([testItem1.id,testItem2.id]);
        });
    });
});
