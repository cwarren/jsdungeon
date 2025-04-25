import { formatNumberForMessage } from "../util.js";
import { getHealthTextColor, getCarryWeightTextColor } from './uiUtil.js';

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
        const healthStyle = `style='color:${getHealthTextColor(charInfo)};'`;
        const healthText = `<span ${healthStyle}>${Math.floor(charInfo.curHealth)} of ${charInfo.maxHealth}</span>`;
        return healthText;
    }

    getCarryWeightText(charInfo) {
        const carryWeightStyle = `style='color:${getCarryWeightTextColor(charInfo)};'`;
        const carryWeightText = `<span ${carryWeightStyle}>${formatNumberForMessage(charInfo.carryWeightCurrent)} of ${formatNumberForMessage(charInfo.carryWeightCapacity)}</span>`;
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