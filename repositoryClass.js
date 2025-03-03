class Repository {
    constructor() {
        this.items = new Map(); // Or use an object for simple cases
    }

    add(item) {
        this.items.set(item.id, item);
    }

    get(id) {
        return this.items.get(id);
    }

    remove(id) {
        this.items.delete(id);
    }

    serialize() {
        return JSON.stringify([...this.items.entries()].map(([id, entity]) => ({
            id,
            data: item.serialize(),
        })));
    }

    deserialize(serializedData, deserializer) {
        const data = JSON.parse(serializedData);
        this.items.clear();
        for (const { id, data } of data) {
            const item = deserializer(data);
            this.items.set(id, item);
        }
    }
}

export { Repository };