import { formatNumberForMessage } from '../util.js';

const miniCharElement = document.getElementById("minichar");

class UIPaneMiniChar {
    constructor(avatar) {
        this.avatar = avatar;
        if (avatar) {
            this.avatar.registerPaneMiniChar(this);
        }
    }

    getPageElement() {
        return miniCharElement;
    }

    clearMiniChar() {
        this.getPageElement().innerHTML = "";
    }

    refreshMiniChar(charInfo) {
        this.clearMiniChar();
        this.getPageElement().innerHTML = this.getDisplayTextFromInfo(charInfo);
    }

    getHealthText(charInfo) {
        let healthColor = "green";;
        if (charInfo.curHealth < 0.15 * charInfo.maxHealth) {
            healthColor = "red";
        } else if (charInfo.curHealth < 0.35 * charInfo.maxHealth) {
            healthColor = "orange";
        } else if (charInfo.curHealth < 0.6 * charInfo.maxHealth) {
            healthColor = "yellow";
        } else if (charInfo.curHealth < 0.8 * charInfo.maxHealth) {
            healthColor = "yellowgreen";
        }
        const healthStyle = `style='color:${healthColor};'`;
        const healthText = `<span ${healthStyle}>${Math.floor(charInfo.curHealth)} of ${charInfo.maxHealth}</span>`;
        return healthText;
    }
    getCarryWeightText(charInfo) {
        let carryWeightColor = "red";
        if (charInfo.carryWeighCurrent < 0.9 * charInfo.carryWeightCapacity) {
            carryWeightColor = "green";
        } else if (charInfo.carryWeighCurrent < 1.0 * charInfo.carryWeightCapacity) {
            carryWeightColor = "yellowgreen";
        } else if (charInfo.carryWeighCurrent < 1.2 * charInfo.carryWeightCapacity) {
            carryWeightColor = "yellow";
        } else if (charInfo.carryWeighCurrent < 1.5 * charInfo.carryWeightCapacity) {
            carryWeightColor = "orange";
        }
        const carryWeightStyle = `style='color:${carryWeightColor};'`;
        const carryWeightText = `<span ${carryWeightStyle}>${formatNumberForMessage(charInfo.carryWeighCurrent)} of ${formatNumberForMessage(charInfo.carryWeightCapacity)}</span>`;
        return carryWeightText;
    }       

    getDisplayTextFromInfo(charInfo) {

        const healthText = this.getHealthText(charInfo);
        const carryWeightText = this.getCarryWeightText(charInfo);

        let displayText = `<p class='charName'>${charInfo.name}</p>`
        + `Health: ${healthText}<br/>`
        + '<br/>'
        + `Burden: ${carryWeightText}<br/>`
        + '<br/>'
        + `AP: ${charInfo.curAdvancementPoints}<br/>`
        + '<br/>'
        + `depth: ${charInfo.worldDepth}<br/>`
        + 'time at depth:<br/>'
        + `${charInfo.timeOnLevel}`
        ;

        return displayText;
    }
}

export { UIPaneMiniChar, miniCharElement };