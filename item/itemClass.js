import { generateId } from "../util.js";
import { getItemDef } from "./itemDefinitions.js";

class Item {
    constructor(itemDef, id = null) {
        this.id = id ? id : generateId();
        this.type = itemDef.type;
        this.name = itemDef.name;
        this.description = itemDef.description;
        this.displaySymbol = itemDef.displaySymbol;
        this.displayColor = itemDef.displayColor;

        this.isStackable = itemDef.isStackable || false;
        this.stackCount = 1;
    }

    static makeItem(type, id = null) {
        const itemDef = getItemDef(type);
        if (!itemDef) {
            console.log(`No definition for unknown item type ${type} - aborting item creation`);
            return null;
        }
        return new Item(itemDef, id);
    }

    // STACKING

    // IMPORTANT NOTE: stacking implementation here does NOT handle the removal of the other 
    // stack from the game world! Item repo (et al) management is outside the scope of this class
    // and needs to be handled by the caller!

    canStackWith(otherItem) {
        if (!this.isStackable) {
            console.log(`Item ${this.name} is not stackable`);
            return false;
        }
        if (!otherItem.isStackable) {
            console.log(`Item ${otherItem.name} is not stackable`);
            return false;
        }
        if (this.type !== otherItem.type) {
            console.log(`Cannot stack ${this.name} with ${otherItem.name} - different types`);
            return false;
        }
        return true;
    }
   
    addStack(otherStack) {
        if (!this.canStackWith(otherStack)) {
            console.log(`Cannot stack ${this.name} with ${otherStack.name}`);
            return false;
        }
        this.stackCount += otherStack.stackCount;
    }

    addItemToStack(item) {
        this.addStack(item); // items are just stacks of 1, so this is just sugar for addStack
    }

    extractOneFromStack() {
        if (this.stackCount <= 1) {
            console.log(`Cannot extract from stack of ${this.name} - stack is already at 1`);
            return null;
        }
        this.stackCount -= 1;
        const extractedItem =Item.makeItem(this.type);
        return extractedItem;
    }

    // SERIALIZING AND DESERIALIZING

    forSerializing() {
        const plainObjectVersion = {
            id: this.id,
            type: this.type,
        };
        if (this.stackCount > 1) {
            plainObjectVersion.stackCount = this.stackCount;
        }
        return plainObjectVersion;
    }

    serialize() {
        return JSON.stringify(this.forSerializing());
    }

    static deserialize(data) {
        const item = Item.makeItem(data.type, data.id);
        if (! item) {
            console.log('Could not deserialize item from data', data);
            return null;
        }
        if (data.stackCount) {
            item.stackCount = data.stackCount;
        }

        return item;
    }

}

export { Item };