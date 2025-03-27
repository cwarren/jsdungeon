import { idOf } from "../util";

class ItemIdContainer {
    constructor(itemList = []) {
        this.itemList = itemList.map(itm => idOf(itm));
    }

    forSerializing() {
        return [...this.itemList];
    }

    serialize() {
        return JSON.stringify(this.forSerializing());
    }

    static deserialize(data) {
        return new ItemIdContainer(data);
    }

    //================

    has(itemObjectOrId) {
        return this.itemList.includes(idOf(itemObjectOrId));
    }

    add(itemObjectOrId) {
        if (! this.has(itemObjectOrId)) {
            this.itemList.push(idOf(itemObjectOrId));
        }
    }

    remove(itemObjectOrId) {
        const itemId = idOf(itemObjectOrId);
        const index = this.itemList.indexOf(itemId);
        if (index !== -1) {
            this.itemList.splice(index, 1);
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

}

export { ItemIdContainer };