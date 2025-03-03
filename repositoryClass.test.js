import { Repository } from "./repositoryClass";

describe("Repository", () => {
    let repository;
    let mockItem;

    beforeEach(() => {
        repository = new Repository();
        mockItem = {
            id: "item-1",
            data: { name: "Test Item" },
            serialize: jest.fn(() => JSON.stringify({ name: "Test Item" })),
        };
    });

    test("initializes with an empty map", () => {
        expect(repository.items.size).toBe(0);
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
        console.log(repository);
        const serialized = repository.serialize();
        console.log(serialized);
        expect(mockItem.serialize).toHaveBeenCalled();
        expect(serialized).toEqual('[{"id":"item-1","data":"{\\\"name\\\":\\\"Test Item\\\"}"}]');
        expect(JSON.parse(serialized)).toEqual(
            [{ "id": "item-1", "data": "{\"name\":\"Test Item\"}" }]
        );
    });

    test("deserializes correctly and restores items", () => {
        const serializedData = JSON.stringify([
            { id: "item-1", data: { name: "Restored Item" } },
        ]);
        const mockDeserializer = jest.fn((data) => ({ id: "item-1", ...data }));

        repository.deserialize(serializedData, mockDeserializer);

        expect(repository.get("item-1")).toEqual({ id: "item-1", name: "Restored Item" });
        expect(mockDeserializer).toHaveBeenCalledWith({ name: "Restored Item" });
    });

    test("deserialization clears existing items before restoring new ones", () => {
        repository.add(mockItem);

        const serializedData = JSON.stringify([
            { id: "item-2", data: { name: "New Item" } },
        ]);
        const mockDeserializer = jest.fn((data) => ({ id: "item-2", ...data }));

        repository.deserialize(serializedData, mockDeserializer);

        expect(repository.get("item-1")).toBeUndefined();
        expect(repository.get("item-2")).toEqual({ id: "item-2", name: "New Item" });
    });
});
