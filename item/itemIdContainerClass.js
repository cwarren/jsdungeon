import { idOf } from "../util.js";

// TODO: add a way to sort the container easily (maybe a flag on keeping it sorted or not?)

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
        if (this.has(itemObjectOrId)) { return; } // no duplicates allowed
        
        // stack it if possible...
        const stackableItem = this.getStackMatchingItem(itemObjectOrId);
        if (stackableItem) {
            stackableItem.addItemToStack(itemObjectOrId);
            this.baseRepository.remove(idOf(itemObjectOrId)); // remove the item from the repository, since it got combined with the stack
            return;
        }
        
        // ...otherwise add it to the container
        this.itemIdList.push(idOf(itemObjectOrId));
    }

    // it the item is stacked, removes one from the stack, otherwise removes the item from the container
    remove(itemObjectOrId) {
        const itemId = idOf(itemObjectOrId);
        const index = this.itemIdList.indexOf(itemId);
        if (index !== -1) {
            const item = this.baseRepository.get(itemId);
            if (item && item.isStackable && item.stackCount > 1) {
                item.stackCount -= 1;
            } else {
                this.itemIdList.splice(index, 1);
            }
        }
    }

    // this is similar to remove, but it returns the item object from the base repository instead of just removing it from the container
    // also, for stacked items it removes one from the stack instead of removing the item from the container, and returns a new item with stackCount of 1
    extractItem(itemObjectOrId) {
        const itemId = idOf(itemObjectOrId);
        const index = this.itemIdList.indexOf(itemId);
        if (index !== -1) {
            const item = this.baseRepository.get(itemId);
            if (item && item.isStackable && item.stackCount > 1) {
                const extractedItem = item.extractOneFromStack();
                this.baseRepository.add(extractedItem); // add the extracted item to the repository
                return extractedItem;
            } else {
                this.itemIdList.splice(index, 1);
                return item;
            }
        }
        return null;
    }

    extractFirst() {
        if (this.itemIdList.length == 0) { return null; }
        return this.extractItem(this.itemIdList[0]).id;
    }

    extractFirstEntry() {
        return this.itemIdList.shift();
    }

    extractAll() {
        const extracted = this.itemIdList;
        this.itemIdList = [];
        return extracted;
    }

    giveItemTo(itemObjectOrId, otherItemContainer) {
        if (this.has(itemObjectOrId)) {
            const extractedItem = this.extractItem(itemObjectOrId);
            otherItemContainer.add(extractedItem);
        } else {
            console.log(`item ${idOf(itemObjectOrId)} does not exist in this container and so cannot be given`);
        }
    }

    takeItemFrom(itemObjectOrId, otherItemContainer) {
        if (otherItemContainer.has(itemObjectOrId)) {
            const extractedItem = otherItemContainer.extractItem(itemObjectOrId);
            this.add(extractedItem);
        } else {
            console.log(`item ${idOf(itemObjectOrId)} does not exist in the other container and so cannot be taken`);
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

    getStackMatchingItem(itemObjectOrId) {
        if (typeof itemObjectOrId == "string") {
            itemObjectOrId = this.baseRepository.get(itemObjectOrId);
        }
        const stackableItemId = this.itemIdList.find(itmId => {
            const item = this.baseRepository.get(itmId);
            if (!item) {
                return false;
            }
            return item.canStackWith(itemObjectOrId);
        });
        if (stackableItemId) {
            return this.baseRepository.get(stackableItemId);
        }
        return null;
    }
}

export { ItemIdContainer };