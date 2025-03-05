import { Repository } from "./repositoryClass";

describe("Repository", () => {
    let repository;
    let mockItem;

    beforeEach(() => {
        repository = new Repository("TestRepo");
        mockItem = {
            id: "item-1",
            data: { name: "Test Item" },
            serialize: jest.fn(() => JSON.stringify({ name: "Test Item" })),
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
        expect(repository.get("item-1")).toBeUndefined();
    });

    test("can reset the repository", () => {
        repository.add(mockItem);
        expect(repository.get("item-1")).toBe(mockItem);

        repository.clear();
        expect(repository.get("item-1")).toBeUndefined();
        expect(repository.items.size).toEqual(0);
    });


    test("returns undefined when retrieving a non-existent item", () => {
        expect(repository.get("non-existent-id")).toBeUndefined();
    });

    test("getSerializedItemsArray returns correctly structured serialized items", () => {
        const mockItem1 = {
            id: "item-1",
            serialize: jest.fn(() => JSON.stringify({ name: "Item One" })),
        };
        const mockItem2 = {
            id: "item-2",
            serialize: jest.fn(() => JSON.stringify({ name: "Item Two" })),
        };

        repository.add(mockItem1);
        repository.add(mockItem2);

        const serializedArray = repository.getSerializedItemsArray();

        expect(serializedArray).toEqual([
            { id: "item-1", data: JSON.stringify({ name: "Item One" }) },
            { id: "item-2", data: JSON.stringify({ name: "Item Two" }) },
        ]);

        expect(mockItem1.serialize).toHaveBeenCalled();
        expect(mockItem2.serialize).toHaveBeenCalled();
    });

    test("repository serializes correctly", () => {
        repository.add(mockItem);
        const serialized = repository.serialize();
        expect(mockItem.serialize).toHaveBeenCalled();
        expect(JSON.parse(serialized)).toEqual({
            name: "TestRepo",
            items: [{ id: "item-1", data: "{\"name\":\"Test Item\"}" }],
        });
    });

    test("deserializes correctly and restores items with correct name", () => {
        const serializedData = JSON.stringify({
            name: "RestoredRepo",
            items: [
                { id: "item-1", dataIten: { name: "Restored Item" } },
            ],
        });
        const mockDeserializer = jest.fn((data) => ({ id: "item-1", ...data }));

        repository.deserialize(serializedData, mockDeserializer);

        expect(repository.name).toBe("RestoredRepo");
        expect(repository.get("item-1")).toEqual({ id: "item-1", name: "Restored Item" });
        expect(mockDeserializer).toHaveBeenCalledWith({ name: "Restored Item" });
    });

    test("deserialization clears existing items before restoring new ones", () => {
        repository.add(mockItem);

        const serializedData = JSON.stringify({
            name: "NewRepo",
            items: [
                { id: "item-2", dataIten: { name: "New Item" } },
            ],
        });
        const mockDeserializer = jest.fn((data) => ({ id: "item-2", ...data }));

        repository.deserialize(serializedData, mockDeserializer);

        expect(repository.get("item-1")).toBeUndefined();
        expect(repository.get("item-2")).toEqual({ id: "item-2", name: "New Item" });
        expect(repository.name).toBe("NewRepo");
    });

    test("serializes an empty repository correctly", () => {
        expect(repository.serialize()).toBe(JSON.stringify({ name: "TestRepo", items: [] }));
    });

    test("deserializes an empty string without errors", () => {
        repository.deserialize(JSON.stringify({ name: "EmptyRepo", items: [] }), jest.fn());
        expect(repository.items.size).toBe(0);
        expect(repository.name).toBe("EmptyRepo");
    });

    test("ensures each item in deserialization calls the deserializer", () => {
        const serializedData = JSON.stringify({
            name: "MultiRepo",
            items: [
                { id: "item-1", dataIten: { name: "Item One" } },
                { id: "item-2", dataIten: { name: "Item Two" } },
            ],
        });
        const mockDeserializer = jest.fn((data) => ({ id: data.name, ...data }));

        repository.deserialize(serializedData, mockDeserializer);

        expect(mockDeserializer).toHaveBeenCalledTimes(2);
        expect(repository.get("item-1")).toEqual({ id: "Item One", name: "Item One" });
        expect(repository.get("item-2")).toEqual({ id: "Item Two", name: "Item Two" });
    });

    test("removing a non-existent item does not throw an error", () => {
        expect(() => repository.remove("non-existent-id")).not.toThrow();
    });
});