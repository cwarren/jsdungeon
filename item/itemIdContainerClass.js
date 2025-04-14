import { idOf } from "../util.js";

// TODO: add a way to sort the container easily (maybe a flag on keeping it sorted or not?)
// NOTE: consider adding a reference item repo on instantiation so it doesn't need to be passed in when needed

class ItemIdContainer {
    constructor(baseRepository, itemList = []) {
        this.baseRepository = baseRepository;
        if (!this.baseRepository) {
            throw new Error("ItemIdContainer: baseRepository is not defined");
        }

        this.itemIdList = [];
        if (itemList.length > 0) {
            this.itemIdList = itemList.map(itm => idOf(itm));
        }
    }

    //================

    setBaseRepository(baseRepository) {
        this.baseRepository = baseRepository;
    }

    //================

    forSerializing() {
        return [...this.itemIdList];
    }

    serialize() {
        return JSON.stringify(this.forSerializing());
    }

    static deserialize(baseRepository, listOfItemsOrIds) {
        return new ItemIdContainer(baseRepository, listOfItemsOrIds);
    }

    //================

    has(itemObjectOrId) {
        return this.itemIdList.includes(idOf(itemObjectOrId));
    }

    isEmpty() {
        return this.itemIdList.length == 0;
    }

    count() {
        return this.itemIdList.length;
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

    getItems() {
        return this.itemIdList.map(itmId => this.baseRepository.get(itmId));
    }

    getFirstItem() {
        if (! this.itemIdList[0] ) { return null; }
        return this.baseRepository.get(this.itemIdList[0]);
    }
}

export { ItemIdContainer };