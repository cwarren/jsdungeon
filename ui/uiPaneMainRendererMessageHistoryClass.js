import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";
import { keyBinding, actionMaps } from "../commands_actions/gameCommands.js";
import { uiActionsMap } from "../commands_actions/uiActions.js";
import { uiPaneMessages } from "./ui.js";

const MAX_MESSAGES_TO_SHOW = 25;

class UIPaneMainRendererMessageHistory extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
        this.messageHistoryContainer = document.getElementById("messageHistoryContainer");
        this.listOffset = 0;
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
        this.messageHistoryContainer.innerHTML = '';
        
        const messageList = document.createElement("ul");
        let messagesToShow = uiPaneMessages.messageArchive.getRecentMessages(MAX_MESSAGES_TO_SHOW + this.listOffset).slice(this.listOffset, this.listOffset + MAX_MESSAGES_TO_SHOW);
        messagesToShow.forEach(msg => {
            messageList.appendChild(uiPaneMessages.createMessageHtml(msg));
        });

        this.messageHistoryContainer.appendChild(messageList);
    }

    //=====================

    hideMessageHistory() {
        this.messageHistoryContainer.style.display = "none";
        this.canvas.style.display = "block";
    }

    //=====================

    getListOffset() {
        return this.listOffset;
    }
    scrollDown() {
        this.listOffset = Math.min(this.listOffset + 1, MAX_MESSAGES_TO_SHOW);
    }
    scrollUp() {
        this.listOffset = Math.max(this.listOffset - 1, 0);
    }
}

export { UIPaneMainRendererMessageHistory };