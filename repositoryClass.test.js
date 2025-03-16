import { Repository } from "./repositoryClass";

describe("Repository", () => {
    let repository;
    let mockItem;

    beforeEach(() => {
        repository = new Repository("TestRepo");
        mockItem = {
            id: "item-1",
            data: { name: "Test Item" },
            forSerializing: jest.fn(() => { return { id: 'item-1', name: "Test Item" } }),
        };
    });

    test("initializes with an empty map and correct name", () => {
        expect(repository.items.size).toBe(0);
        expect(repository.name).toBe("TestRepo");
    });

    test("can add an item and retrieve it by ID", () => {
        repository.add(mockItem);
        expect(repository.get("item-1")).toBe(mockItem);
    });

    test("can remove an item by ID", () => {
        repository.add(mockItem);
        repository.remove("item-1");
        expect(repository.get("item-1")).toBeNull();
    });

    test("can reset the repository", () => {
        repository.add(mockItem);
        expect(repository.get("item-1")).toBe(mockItem);

        repository.clear();
        expect(repository.get("item-1")).toBeNull();
        expect(repository.items.size).toEqual(0);
    });


    test("returns null when retrieving a non-existent item", () => {
        expect(repository.get("non-existent-id")).toBeNull();
    });

    test("removing a non-existent item does not throw an error", () => {
        expect(() => repository.remove("non-existent-id")).not.toThrow();
    });

    describe("Repository - serializing", () => {

        test("getItemsArrayForSerializing returns correctly structured serialized items", () => {
            const mockItem1 = {
                id: "item-1",
                forSerializing: jest.fn(() => { return { id: 'item-1', name: "Item One" } }),
            };
            const mockItem2 = {
                id: "item-2",
                forSerializing: jest.fn(() => { return { id: 'item-2', name: "Item Two" } }),
            };

            repository.add(mockItem1);
            repository.add(mockItem2);

            const itemsForSerializing = repository.getItemsArrayForSerializing();

            expect(itemsForSerializing).toEqual([
                { id: 'item-1', name: "Item One" },
                { id: 'item-2', name: "Item Two" },
            ]);

            expect(mockItem1.forSerializing).toHaveBeenCalled();
            expect(mockItem2.forSerializing).toHaveBeenCalled();
        });

        test("repository serializes correctly", () => {
            repository.add(mockItem);

            const serialized = repository.serialize();
            
            expect(mockItem.forSerializing).toHaveBeenCalled();
            
            expect(JSON.parse(serialized)).toEqual({
                name: "TestRepo",
                items: [ {id: 'item-1', name: "Test Item"} ],
            });
        });

        test("deserializes correctly and restores items with correct name", () => {
            const serializedData = {
                name: "RestoredRepo",
                items: [
                    { id: "item-1", name: "Restored Item" },
                ],
            };
            const mockItemDeserializer = jest.fn((data) => ({ ...data }));

            const newRepo = Repository.deserialize(serializedData, mockItemDeserializer);

            expect(newRepo.name).toBe("RestoredRepo");
            expect(newRepo.get("item-1")).toEqual({ id: "item-1", name: "Restored Item" });
            expect(mockItemDeserializer).toHaveBeenCalledWith({ id: "item-1", name: "Restored Item" });
        });

        test("deserialization clears existing items before restoring new ones", () => {
            repository.add(mockItem);

            const serializedData ={
                name: "NewRepo",
                items: [
                    { id: "item-2", name: "New Item 2" },
                ],
            };
            const mockItemDeserializer = jest.fn((data) => ({ ...data }));

            const newRepo = Repository.deserialize(serializedData, mockItemDeserializer);

            expect(newRepo.get("item-1")).toBeNull();
            expect(newRepo.get("item-2")).toEqual({ id: "item-2", name: "New Item 2" });
            expect(newRepo.name).toBe("NewRepo");
        });

        test("serializes an empty repository correctly", () => {
            expect(repository.serialize()).toBe(JSON.stringify({ name: "TestRepo", items: [] }));
        });

        test("deserializes an empty items list without errors", () => {
            const newRepo = Repository.deserialize({ name: "EmptyRepo", items: [] }, jest.fn());
            expect(newRepo.items.size).toBe(0);
            expect(newRepo.name).toBe("EmptyRepo");
        });

        test("ensures each item in deserialization calls the deserializer", () => {
            const serializedData = {
                name: "MultiRepo",
                items: [
                    { id: "item-1", name: "Item One" },
                    { id: "item-2", name: "Item Two" },
                ],
            };
            const mockItemDeserializer = jest.fn((data) => ({ ...data }));

            const newRepo = Repository.deserialize(serializedData, mockItemDeserializer);

            expect(mockItemDeserializer).toHaveBeenCalledTimes(2);
            expect(newRepo.get("item-1")).toEqual({ id: "item-1", name: "Item One" });
            expect(newRepo.get("item-2")).toEqual({ id: "item-2", name: "Item Two" });
        });

        test("deserialization correctly passes additional arguments to deserializer", () => {
            const serializedData = {
                name: "RepoWithArgs",
                items: [
                    { id: "item-1", name: "Item One" },
                ],
            };
            const mockItemDeserializer = jest.fn((data, arg1, arg2) => ({...data, arg1, arg2 }));

            const newRepo = Repository.deserialize(serializedData, mockItemDeserializer, "extra1", "extra2");

            expect(mockItemDeserializer).toHaveBeenCalledWith({ id: "item-1", name: "Item One" }, "extra1", "extra2");
            expect(newRepo.get("item-1")).toEqual({ id: "item-1", name: "Item One", arg1: "extra1", arg2: "extra2" });
        });

    });


});