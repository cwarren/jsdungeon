import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";

class UIPaneMainRendererGameMeta extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
    }

    //=====================

    draw() {
        super.draw();
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";

        this.ctx.fillText(`Current Game: ${this.ui.gameState.status}`, 10, 80);
       
        if (this.ui.gameState.status == 'ACTIVE') {
            this.ctx.fillText(`S: Save the current game`, 10, 110);
            this.ctx.fillText(`A: Abandon the current game`, 10, 140);
        } else {
            this.ctx.fillText(`N: Start a new game`, 10, 110);
            this.ctx.fillText(`L: Load a saved game`, 10, 140);
        }

        this.ctx.fillText(`Escape: return to previous screen`, 10, 170);
    }

    //=====================
}

export { UIPaneMainRendererGameMeta };