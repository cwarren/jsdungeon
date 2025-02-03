import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";

class UIPaneMainRendererGameOver extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
    }

    //=====================

    draw() {
        // TODO: implement draw method for UIPaneMainRendererGameOver
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("ui state: GAME_OVER", 50, 50);
        let gameStateMessage = "You won! :)";
        if (this.ui.gameState.status == "LOST") { gameStateMessage = "You lost. :("; }
        if (this.ui.gameState.status == "ABANDONED") { gameStateMessage = "You abandoned that game."; }
        this.ctx.fillText(gameStateMessage, 100, 100);
    }

    //=====================
}

export { UIPaneMainRendererGameOver };