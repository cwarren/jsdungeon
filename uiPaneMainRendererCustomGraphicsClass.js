import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";

class UIPaneMainRendererCustomGraphics extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
    }

    //=====================

    draw() {
        super.draw();
        // TODO: implement draw method for UIPaneMainRendererCustomGraphics
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("ui state: CUSTOM_GRAPHICS", 50, 50);
    }

    //=====================
}

export { UIPaneMainRendererCustomGraphics };