import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";

class UIPaneMainRendererGameMeta extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
    }

    //=====================

    // draw() {
    //     console.log('################ drawing game meta');
    //     console.log('canvas', this.canvas);
    //     console.log('context', this.ctx);
    //     // TODO: implement draw method for UIPaneMainRendererGameMeta
    //     this.ctx.fillStyle = "white";
    //     this.ctx.font = "20px Arial";
    //     this.ctx.fillText("ui state: GAME_META", 50, 50);
    // }

    draw() {
        super.draw();
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("ui state: GAME_META", 10, 50);
    }

    //=====================
}

export { UIPaneMainRendererGameMeta };