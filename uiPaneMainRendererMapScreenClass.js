import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";

class UIPaneMainRendererMapScreen extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
    }

    //=====================

    draw() {
        // TODO: implement draw method for UIPaneMainRendererMapScreen
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("ui state: MAP_SCREEN", 50, 50);
    }

    //=====================
}

export { UIPaneMainRendererMapScreen };