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

    isEmpty() {
        return this.itemIdList.length == 0;
    }

    //================

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

    extractFirst() {
        return this.itemIdList.shift();
    }

    extractAll() {
        const extracted = this.itemIdList;
        this.itemIdList = [];
        return extracted;
    }

    giveItemTo(itemObjectOrId, otherItemContainer) {
        if (this.has(itemObjectOrId)) {
            this.remove(itemObjectOrId);
            otherItemContainer.add(itemObjectOrId);
        } else {
            console.log(`item ${idOf(itemObjectOrId)} does not exist in source container and so cannot be transferred`);
        }
    }

    takeItemFrom(itemObjectOrId, otherItemContainer) {
        if (otherItemContainer.has(itemObjectOrId)) {
            otherItemContainer.remove(itemObjectOrId);
            this.add(itemObjectOrId);
        } else {
            console.log(`item ${idOf(itemObjectOrId)} does not exist in source container and so cannot be transferred`);
        }
    }

    //================

    getItems(itemRepository) {
        return this.itemIdList.map(itmId => itemRepository.get(itmId));
    }
}

export { ItemIdContainer };