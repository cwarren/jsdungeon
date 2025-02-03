import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";

class UIPaneMainRendererCharacterSheet extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
    }

    //=====================

    draw() {
        super.draw();
        // TODO: implement draw method for UIPaneMainRendererCharacterSheet
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("ui state: CHARACTER_SHEET", 50, 50);
    }

    //=====================
}

export { UIPaneMainRendererCharacterSheet };