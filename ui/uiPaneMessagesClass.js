import { MessageArchive } from "./messageArchiveClass.js";
const messagesElement = document.getElementById("messages");
const MAX_MESSAGES_TO_SHOW = 5;

class UIPaneMessages {
    constructor() {
        this.messageArchive = new MessageArchive();
    }

    addMessage(message) {
        this.messageArchive.addMessage(message);
        this.displayMessages();
    }

    displayMessages(numToDisplay = MAX_MESSAGES_TO_SHOW) {
        this.clearMessageDisplay();
        const messages = this.messageArchive.getRecentMessages(numToDisplay);
        messages.forEach(message => {
            const newMessage = document.createElement("div");
            newMessage.textContent = message.text;
            newMessage.classList.add("message-entry");
            if (message.status === 'newest') {
                newMessage.classList.add("message-newest");
            }
            if (message.status === 'current') {
                newMessage.classList.add("message-current");
            }
            if (message.status === 'aged') {
                newMessage.classList.add("message-aged");
            }
            messagesElement.appendChild(newMessage);
        });
        messagesElement.scrollTop = messagesElement.scrollHeight;
    }

    clearMessageDisplay() {
        messagesElement.innerHTML = "";
    }

    setMessage(message) {
        this.addMessage(message);
        this.clearMessageDisplay();
        this.displayMessages(1);
    }

    ageMessages() {
        if (messagesElement.firstChild) {
            if (messagesElement.firstChild.classList.contains('message-aged')) {
                messagesElement.removeChild(messagesElement.firstChild);
                Array.from(messagesElement.children).forEach(msg => msg.classList.remove("message-new"));
            } else {
                Array.from(messagesElement.children).forEach(msg => msg.classList.add("message-aged"));
            }
        }
    }
}

export { UIPaneMessages, messagesElement };