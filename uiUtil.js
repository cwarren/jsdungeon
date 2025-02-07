const listDisplayElement = document.getElementById("listdisplay");

function updateListDisplay(items) {
  listDisplayElement.innerHTML = items.map(item => `<div>${item}</div>`).join("");
}

export {updateListDisplay};