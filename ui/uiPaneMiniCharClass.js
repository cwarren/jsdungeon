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
        // console.log(charInfo);
        this.getPageElement().innerHTML = this.getDisplayTextFromInfo(charInfo);
    }

    getDisplayTextFromInfo(charInfo) {
        let displayText = `<p class='charName'>${charInfo.name}</p>`
        + `Health: ${Math.floor(charInfo.curHealth)} of ${charInfo.maxHealth}<br/>`
        + '<div class="smallText">'
        + `heals ${formatNumberForMessage(charInfo.naturalHealAmount)}<br/>`
        + `per ${charInfo.naturalHealInterval} time<br/>`
        + '</div>'
        + '<br/>'
        + `AP: ${charInfo.curAdvancementPoints}<br/>`
        + '<br/>'
        + 'time on this level:<br/>'
        + `${charInfo.timeOnLevel}`
        ;

        return displayText;
    }
}

export { UIPaneMiniChar, miniCharElement };