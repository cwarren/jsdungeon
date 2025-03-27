import { idOf } from "../util.js";

class ItemIdContainer {
    constructor(itemList = []) {
        this.itemIdList = [];
        if (itemList.length > 0) {
            this.itemIdList = itemList.map(itm => idOf(itm));
        }
    }

    forSerializing() {
        return [...this.itemIdList];
    }

    serialize() {
        return JSON.stringify(this.forSerializing());
    }

    static deserialize(data) {
        return new ItemIdContainer(data);
    }

    //================

    has(itemObjectOrId) {
        return this.itemIdList.includes(idOf(itemObjectOrId));
    }

    add(itemObjectOrId) {
        if (! this.has(itemObjectOrId)) {
            this.itemIdList.push(idOf(itemObjectOrId));
        }
    }

    remove(itemObjectOrId) {
        const itemId = idOf(itemObjectOrId);
        const index = this.itemIdList.indexOf(itemId);
        if (index !== -1) {
            this.itemIdList.splice(index, 1);
        }
    }

    passItemTo(itemObjectOrId, otherItemContainer) {
        if (this.has(itemObjectOrId)) {
            this.remove(itemObjectOrId);
            otherItemContainer.add(itemObjectOrId);
        }
    }

    takeItemFrom(itemObjectOrId, otherItemContainer) {
        if (otherItemContainer.has(itemObjectOrId)) {
            otherItemContainer.remove(itemObjectOrId);
            this.add(itemObjectOrId);
        }
    }

    //================

    getItems(itemRepository) {
        return this.itemIdList.map(itmId => itemRepository.get(itmId));
    }
}

export { ItemIdContainer };