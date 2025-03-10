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

    // TODO: replace this with the static deserialize pattern used elsewhere
    static deserialize(serializedData, deserializer, ...args) {
        const data = JSON.parse(serializedData);
        const repo = new Repository(data.name);
        for (const { id, dataIten } of data.items) {
            const item = deserializer(dataIten, ...args);
            repo.add(item);
        }
        return repo;
    }
}

export { Repository };