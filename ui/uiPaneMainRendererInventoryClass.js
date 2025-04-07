import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";

const ITEM_LIST_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const MAX_ITEM_LIST_COUNT = ITEM_LIST_LABELS.length;

class UIPaneMainRendererInventory extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
        this.listOffset = 0;
    }

    //=====================

    draw() {
        super.draw();
        // TODO: implement draw method for UIPaneMainRendererInventory
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";

        const avatar = this.ui.gameState.avatar;
        if (!avatar) return;
        const inventory = avatar.inventory;
        if (!inventory) return;

        const itemsList = inventory.getItems(this.ui.gameState.itemRepo);
        if (!itemsList || itemsList.length == 0) {
            this.ctx.fillText("Inventory is empty", 50, 50);
            return;
        }

        let x = 30, y = 30;
        const lineHeight = 25;
        const itemListStartY = 60;
        const itemLabelX = 30;
        const itemNameX = 60;
        const itemDescriptionX = 300;

        this.ctx.fillText(`You're carrying`, x, y);

        const itemsToDisplay = itemsList.slice(this.listOffset, this.listOffset + MAX_ITEM_LIST_COUNT);
        let displayCounter = 0;
        y = itemListStartY;
        itemsToDisplay.forEach(itm => {
            this.ctx.fillText(`${ITEM_LIST_LABELS[displayCounter]})`, itemLabelX, y);
            this.ctx.fillText(`${itm.name}`, itemNameX, y);
            this.ctx.fillText(`${itm.description}`, itemDescriptionX, y);
            y += lineHeight;
            displayCounter++;
            
        });
    }

    //=====================
}

export { UIPaneMainRendererInventory };