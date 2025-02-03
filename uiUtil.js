const charMiniElement = document.getElementById("charmini");
const listDisplayElement = document.getElementById("listdisplay");
const infoElement = document.getElementById("info");

function updateCharacterSummary() {
  charMiniElement.textContent = `Health: ${gameState.avatar.health}`;
}

function updateInfoPanel(content) {
  infoElement.textContent = content;
}

function updateListDisplay(items) {
  listDisplayElement.innerHTML = items.map(item => `<div>${item}</div>`).join("");
}

export {updateCharacterSummary, updateInfoPanel, updateListDisplay};