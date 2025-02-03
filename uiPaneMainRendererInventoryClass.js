import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";

class UIPaneMainRendererInventory extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
    }

    //=====================

    draw() {
        // TODO: implement draw method for UIPaneMainRendererInventory
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("ui state: INVENTORY", 50, 50);
    }

    //=====================
}

export { UIPaneMainRendererInventory };