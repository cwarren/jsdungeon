import { generateId } from "../util.js";
import { getItemDef } from "./itemDefinitions.js";

class Item {
    constructor(itemDef, id = null) {
        this.id = id ? id : generateId();
        this.type = itemDef.type;
        this.name = itemDef.name;
        this.displaySymbol = itemDef.displaySymbol;
        this.displayColor = itemDef.displayColor;
    }

    static makeItem(type, id = null) {
        const itemDef = getItemDef(type);
        if (!itemDef) {
            console.log(`No definition for unknown item type ${type} - aborting item creation`);
            return null;
        }
        return new Item(itemDef, id);
    }

    forSerializing() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            displaySymbol: this.displaySymbol,
            displayColor: this.displayColor,
        };
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

        item.name=data.name;
        item.displaySymbol=data.displaySymbol;
        item.displayColor=data.displayColor;

        return item;
    }

}

export { Item };