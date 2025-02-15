import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";

class UIPaneMainRendererEquipment extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
    }

    //=====================

    draw() {
        super.draw();
        // TODO: implement draw method for UIPaneMainRendererEquipment
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("ui state: EQUIPMENT", 50, 50);
    }

    //=====================
}

export { UIPaneMainRendererEquipment };