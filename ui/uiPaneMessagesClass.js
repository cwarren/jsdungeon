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

    static createMessageHtml(message) {
        const messageHtml = document.createElement("div");
        messageHtml.textContent = message.text;
        messageHtml.classList.add("message-entry");
        if (message.ageStatus === 'new' || message.ageStatus === 'newest') {
            messageHtml.classList.add("message-new");
        }
        if (message.ageStatus === 'current') {
            messageHtml.classList.add("message-current");
        }
        if (message.ageStatus === 'aged') {
            messageHtml.classList.add("message-aged");
        }
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
            messagesElement.appendChild(UIPaneMessages.createMessageHtml(message));
        });
        messagesElement.scrollTop = messagesElement.scrollHeight;
    }

    clearMessageDisplay() {
        messagesElement.innerHTML = "";
    }

    // TODO: figure out handling for setMessage
    setMessage(message) {
        this.addMessage(message);
        this.clearMessageDisplay();
        this.displayMessages(1);
    }

    ageMessages() {
        this.messageArchive.ageMessages();
        this.displayMessages();
        if (this.messageArchive.getRecentMessages()[0].ageStatus === 'aged') {
            if (this.reduceDisplayCount) {
                this.displayCount = constrainValue(this.displayCount - 1, 0, MAX_MESSAGES_TO_SHOW);
            }
            this.reduceDisplayCount = !this.reduceDisplayCount;
        }
    }
}

export { UIPaneMessages, messagesElement };