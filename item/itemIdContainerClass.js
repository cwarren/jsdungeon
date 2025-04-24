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

        this.limitless = true;
        this.capacityCount = 0;
        this.capacityVolume = 0;
        this.currentVolume = 0;
    }

    //================

    setBaseRepository(baseRepository) {
        this.baseRepository = baseRepository;
    }

    setLimitless(limitless) {
        this.limitless = limitless;
    }
    setCapacityCount(capacityCount) {
        this.capacityCount = capacityCount;
        this.limitless = false; // if we set a capacity count, we are no longer limitless
    }
    setCapacityVolume(capacityVolume) {
        this.capacityVolume = capacityVolume;
        this.limitless = false; // if we set a capacity volume, we are no longer limitless
    }

    //================

    forSerializing() {
        return {
            itemIds: [...this.itemIdList],
            limitless: this.limitless,
            capacityCount: this.capacityCount,
            capacityVolume: this.capacityVolume,
            currentVolume: this.currentVolume,
        };
    }

    serialize() {
        return JSON.stringify(this.forSerializing());
    }

    static deserialize(baseRepository, data) {
        const deserialized = new ItemIdContainer(baseRepository, data.itemIds);
        deserialized.setLimitless(data.limitless);
        deserialized.setCapacityCount(data.capacityCount);
        deserialized.setCapacityVolume(data.capacityVolume);
        deserialized.currentVolume = data.currentVolume;
        return deserialized;
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

    hasRoomFor(itemObjectOrId) {
        if (this.limitless) { return true; } // limitless containers can always take more items

        if (this.capacityCount > 0 && this.itemIdList.length >= this.capacityCount) {
            return false; // container is full by count
        }

        if (this.capacityVolume > 0) {
            const item = typeof itemObjectOrId === "string"
                ? this.baseRepository.get(itemObjectOrId)
                : itemObjectOrId;
            if (item) {
                const itemVolume = item.getExtendedVolume() || 0;
                if (this.currentVolume + itemVolume > this.capacityVolume) {
                    return false; // container has no room by volume
                }
            }
        }

        return true;
    }

    getTotalExtendedWeight() {
        return this.getItems().reduce((total, item) => {
            if (item) {
                return total + item.getExtendedWeight();
            }
            return total;
        }
        , 0);
    }

    //================

    add(itemObjectOrId) {
        if (this.has(itemObjectOrId)) { return; } // no duplicates allowed
        const item = typeof itemObjectOrId === "string"
            ? this.baseRepository.get(itemObjectOrId)
            : itemObjectOrId;

        // stack it if possible...
        const stackableItem = this.getStackMatchingItem(itemObjectOrId);
        if (stackableItem) {
            stackableItem.addItemToStack(item);
            this.currentVolume += item.getExtendedVolume();
            this.baseRepository.remove(idOf(item)); // remove the item from the repository, since it got combined with the stack
            return;
        }

        // ...otherwise add it to the container
        this.itemIdList.push(item.id);
        this.currentVolume += item.getExtendedVolume();
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
            this.currentVolume -= item.volume;
        }

    }

    // this is similar to remove, but it returns the item object from the base repository instead of just removing it from the container
    // also, for stacked items it removes one from the stack instead of removing the item from the container, and returns a new item with stackCount of 1
    extractItem(itemObjectOrId) {
        const itemId = idOf(itemObjectOrId);
        const index = this.itemIdList.indexOf(itemId);
        if (index !== -1) {
            const item = this.baseRepository.get(itemId);
            this.currentVolume -= item.volume;
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
        const item = this.baseRepository.get(this.itemIdList[0]);
        this.currentVolume -= item.volume;
        return this.extractItem(this.itemIdList[0]).id;
    }

    extractFirstEntry() {
        const itemId = this.itemIdList[0];
        const item = this.baseRepository.get(itemId);
        this.currentVolume -= item.getExtendedVolume();
        return this.itemIdList.shift();
    }

    extractAll() {
        const extracted = this.itemIdList;
        this.itemIdList = [];
        this.currentVolume = 0;
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
        if (!this.itemIdList[0]) { return null; }
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