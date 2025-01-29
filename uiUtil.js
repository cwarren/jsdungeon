const charMiniElement = document.getElementById("charmini");
const mainElement = document.getElementById("main");
const listDisplayElement = document.getElementById("listdisplay");
const messagesElement = document.getElementById("messages");
const infoElement = document.getElementById("info");

const MAX_MESSAGES_TO_SHOW = 5;
function addMessage(message) {
    const newMessage = document.createElement("div");
    newMessage.textContent = message;
    newMessage.classList.add("message-entry");

    while (messagesElement.children.length >= MAX_MESSAGES_TO_SHOW) {
        messagesElement.removeChild(messagesElement.firstChild);
    }

    messagesElement.appendChild(newMessage);
    messagesElement.scrollTop = messagesElement.scrollHeight;
}
function clearMessages() {
    messagesElement.innerHTML = "";
}
function setMessage(message) {
  clearMessages();
  addMessage(message);
}
function ageMessages() {
    if (messagesElement.firstChild) {
        if (messagesElement.firstChild.classList.contains('message-aged')) {
            messagesElement.removeChild(messagesElement.firstChild);
        } else {
            messagesElement.firstChild.classList.add('message-aged');
        }
    }
}

function updateCharacterSummary() {
  charMiniElement.textContent = `Health: ${gameState.avatar.health}`;
}

function updateInfoPanel(content) {
  infoElement.textContent = content;
}

function updateListDisplay(items) {
  listDisplayElement.innerHTML = items.map(item => `<div>${item}</div>`).join("");
}

export {addMessage, clearMessages, setMessage, ageMessages, updateCharacterSummary, updateInfoPanel, updateListDisplay};