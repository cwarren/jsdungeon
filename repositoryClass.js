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

    forSerializing() {
        return {
            name: this.name,
            items: this.getItemsArrayForSerializing()
        }
    }

    getItemsArrayForSerializing() {
        return [...this.items.entries()].map(
            ([id, item]) => (
                item.forSerializing()
            )
        );
    }

    serialize() {
        return JSON.stringify(this.forSerializing());
    }

    static deserialize(data, itemDeserializer, ...itemDeserializerArgs) {
        const repo = new Repository(data.name);
        for (const itemData of data.items) {
            const item = itemDeserializer(itemData, ...itemDeserializerArgs);
            repo.add(item);
        }
        return repo;
    }
}

export { Repository };