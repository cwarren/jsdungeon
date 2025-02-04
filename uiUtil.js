// const charMiniElement = document.getElementById("minichar");
const listDisplayElement = document.getElementById("listdisplay");

// function updateCharacterSummary() {
//   charMiniElement.textContent = `Health: ${gameState.avatar.health}`;
// }

function updateListDisplay(items) {
  listDisplayElement.innerHTML = items.map(item => `<div>${item}</div>`).join("");
}

export {updateListDisplay};