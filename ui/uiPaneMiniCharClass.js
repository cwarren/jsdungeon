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

    getDisplayTextFromInfo(charInfo) {
        let displayText = `<p class='charName'>${charInfo.name}</p>`
        + `Health: ${Math.floor(charInfo.curHealth)} of ${charInfo.maxHealth}<br/>`
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