import { MessageArchive } from "./messageArchiveClass.js";
import { constrainValue } from "../util.js";
const messagesElement = document.getElementById("messages");
const MAX_MESSAGES_TO_SHOW = 5;

class UIPaneMessages {
    constructor() {
        this.messageArchive = new MessageArchive();
        this.displayCount = 0;
        this.reduceDisplayCount = false;
    }

    createMessageHtml(message) {
        const messageHtml = document.createElement("div");
        messageHtml.textContent = message.text;
        messageHtml.classList.add("message-entry");
        messageHtml.classList.add(this.messageArchive.getCssClassForAgeStatus(message.ageStatus));
        return messageHtml;
    }

    addMessage(message) {
        this.messageArchive.addMessage(message);
        this.displayCount = constrainValue(this.displayCount + 1, 0, MAX_MESSAGES_TO_SHOW);
        this.displayMessages();
    }

    displayMessages(numToDisplay = MAX_MESSAGES_TO_SHOW) {
        this.clearMessageDisplay();
        const messages = this.messageArchive.getRecentMessages(Math.min(this.displayCount, numToDisplay));
        messages.forEach(message => {
            messagesElement.appendChild(this.createMessageHtml(message));
        });
        messagesElement.scrollTop = messagesElement.scrollHeight;
    }

    clearMessageDisplay() {
        messagesElement.innerHTML = "";
    }

    setMessage(message) {
        this.addMessage(message);
        this.clearMessageDisplay();
        this.displayCount = 1;
        this.displayMessages();
    }

    ageMessages() {
        this.messageArchive.ageMessages();
        this.displayMessages();
        if (this.messageArchive.messages.length > 0) {
            if (this.messageArchive.getRecentMessages()[0].ageStatus === 'aged') {
                if (this.reduceDisplayCount) {
                    this.displayCount = constrainValue(this.displayCount - 1, 0, MAX_MESSAGES_TO_SHOW);
                }
                this.reduceDisplayCount = !this.reduceDisplayCount;
            }
        }
    }
}

export { UIPaneMessages, messagesElement };