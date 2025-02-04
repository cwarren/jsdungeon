const messagesElement = document.getElementById("messages");
const MAX_MESSAGES_TO_SHOW = 5;

class UIPaneMessages {
    constructor() {
        
    }

    addMessage(message) {
        const newMessage = document.createElement("div");
        newMessage.textContent = message;
        newMessage.classList.add("message-entry", "message-new");
    
        while (messagesElement.children.length >= MAX_MESSAGES_TO_SHOW) {
            messagesElement.removeChild(messagesElement.firstChild);
        }
    
        Array.from(messagesElement.children).forEach(msg => msg.classList.remove("message-new"));

        messagesElement.appendChild(newMessage);
        messagesElement.scrollTop = messagesElement.scrollHeight;
    }

    clearMessages() {
        messagesElement.innerHTML = "";
    }

    setMessage(message) {
      this.clearMessages();
      this.addMessage(message);
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

export { UIPaneMessages };