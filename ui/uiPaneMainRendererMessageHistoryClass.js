import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";
import { keyBinding, actionMaps } from "../commands_actions/gameCommands.js";
import { uiActionsMap } from "../commands_actions/uiActions.js";

class UIPaneMainRendererMessageHistory extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
        this.messageHistoryContainer = document.getElementById("messageHistoryContainer");
    }

    handleWasSurfaced() {
        this.canvas.style.display = "none";
        this.messageHistoryContainer.style.display = "block";
    }
    handleWasBuried() {
        this.messageHistoryContainer.style.display = "none";
        this.canvas.style.display = "block";
    }

    //=====================

    draw() {
        // this.currentHelpTextBlock = helpTextBlock;

        this.messageHistoryContainer.innerHTML = "<p>No messge history available</p>";

        // this.messageHistoryContainer.innerHTML = displayTextRows.map(row => `<p>${row}</p>`).join("");
    }

    //=====================

    hideMessageHistory() {
        this.messageHistoryContainer.style.display = "none";
        this.canvas.style.display = "block";
    }

    //=====================
}

export { UIPaneMainRendererMessageHistory };