import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";

class UIPaneMainRendererGameMeta extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
    }

    //=====================

    draw() {
        // TODO: implement draw method for UIPaneMainRendererGameMeta
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("ui state: GAME_META", 50, 50);
    }

    //=====================
}

export { UIPaneMainRendererGameMeta };