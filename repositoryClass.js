class Repository {
    constructor(name = '') {
        this.name = name;
        this.items = new Map(); // Or use an object for simple cases
    }

    add(item) {
        this.items.set(item.id, item);
    }

    get(id) {
        const itm = this.items.get(id);
        if (! itm ) { return null; }
        return itm;
    }

    remove(id) {
        this.items.delete(id);
    }

    clear() {
        this.items = new Map();
    }

    serialize() {
        return JSON.stringify({
            name: this.name,
            items: this.getSerializedItemsArray()
        });
    }

    getSerializedItemsArray() {
        return [...this.items.entries()].map(
            ([id, item]) => ({
                id,
                data: item.serialize(),
            })
        );
    }

    deserialize(serializedData, deserializer) {
        const data = JSON.parse(serializedData);
        this.name = data.name;
        this.items.clear();
        for (const { id, dataIten } of data.items) {
            const item = deserializer(dataIten);
            this.items.set(id, item);
        }
    }
}

export { Repository };