import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";

class UIPaneMainRendererProseSection extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
    }

    //=====================

    draw() {
        super.draw();
        // TODO: implement draw method for UIPaneMainRendererProseSection
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("ui state: PROSE_SECTION", 50, 50);
    }

    //=====================
}

export { UIPaneMainRendererProseSection };