import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";
import { uiPaneMessages } from "./ui.js";
import { constrainValue } from "../util.js";

const MAX_MESSAGES_TO_SHOW = 24;

class UIPaneMainRendererMessageHistory extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
        this.messageHistoryContainer = document.getElementById("messageHistoryContainer");
        this.listOffsetFromEnd = MAX_MESSAGES_TO_SHOW;
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
        let messagesToShow = uiPaneMessages.messageArchive.getRecentMessages(this.listOffsetFromEnd)
            .slice(0, MAX_MESSAGES_TO_SHOW);

        if (messagesToShow.length === 0) {
            this.messageHistoryContainer.innerHTML = '<p class="no-messages-note">No messages to show</p>';
        }

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

    getListOffsetFromEnd() {
        return this.listOffsetFromEnd;
    }
    getMaxOffsetFromEnd() {
        return Math.min(uiPaneMessages.messageArchive.maxMessages, uiPaneMessages.messageArchive.messages.length);
    }
    scrollUp() {
        this.listOffsetFromEnd = constrainValue(
            this.listOffsetFromEnd + 1,
            MAX_MESSAGES_TO_SHOW,
            this.getMaxOffsetFromEnd()
        );
    }

    scrollDown() {
        this.listOffsetFromEnd = constrainValue(
            this.listOffsetFromEnd - 1,
            MAX_MESSAGES_TO_SHOW,
            this.getMaxOffsetFromEnd()
        );
    }

}

export { UIPaneMainRendererMessageHistory };