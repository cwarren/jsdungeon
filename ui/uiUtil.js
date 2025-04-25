const listDisplayElement = document.getElementById("listdisplay");

function updateListDisplay(items) {
  listDisplayElement.innerHTML = items.map(item => `<div>${item}</div>`).join("");
}

function getHealthTextColor(charInfo) {
  let healthColor = "green";
  if (charInfo.curHealth < 0.15 * charInfo.maxHealth) {
      healthColor = "red";
  } else if (charInfo.curHealth < 0.35 * charInfo.maxHealth) {
      healthColor = "orange";
  } else if (charInfo.curHealth < 0.6 * charInfo.maxHealth) {
      healthColor = "yellow";
  } else if (charInfo.curHealth < 0.8 * charInfo.maxHealth) {
      healthColor = "yellowgreen";
  }
  return healthColor;
}

function getCarryWeightTextColor(charInfo) {
  let carryWeightColor = "red";
  if (charInfo.carryWeightCurrent < 0.9 * charInfo.carryWeightCapacity) {
      carryWeightColor = "green";
  } else if (charInfo.carryWeightCurrent < 1.0 * charInfo.carryWeightCapacity) {
      carryWeightColor = "yellowgreen";
  } else if (charInfo.carryWeightCurrent < 1.2 * charInfo.carryWeightCapacity) {
      carryWeightColor = "yellow";
  } else if (charInfo.carryWeightCurrent < 1.5 * charInfo.carryWeightCapacity) {
      carryWeightColor = "orange";
  }
  return carryWeightColor;
}

export {updateListDisplay, getHealthTextColor, getCarryWeightTextColor};