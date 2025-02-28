import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";
import { EntityAttributes } from "../entity/entityAttributesClass.js";
import { formatNumberForShortDisplay } from "../util.js"; 

class UIPaneMainRendererCharacterSheet extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
    }

    //=====================

    draw() {
        super.draw();

        function fnum(n, p=0) {
            return formatNumberForShortDisplay(n, p);
        }

        const avatar = this.ui.gameState.avatar;
        if (!avatar) return;

        const ctx = this.ctx;
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";

        let x = 50, y = 50;
        const lineHeight = 25;
        const colWidth = 200;  // Space between columns
        const bodyX = x, mindX = x + colWidth, spiritX = x + colWidth * 2;

        // Character Name & Advancement
        ctx.fillText(`${avatar.name}`, x, y);
        y += lineHeight;
        ctx.fillText(`ADVANCEMENT: ${fnum(avatar.currentAdvancementPoints)} available, ${0} spent`, x, y);
        y += lineHeight * 2;

        // Column Headers
        ctx.fillText("  [body]", bodyX, y);
        ctx.fillText("  [mind]", mindX, y);
        ctx.fillText("  [spirit]", spiritX, y);
        y += lineHeight;

        // Attributes
        const attributes = [
            ["strength", "psyche", "aura"],
            ["dexterity", "awareness", "refinement"],
            ["fortitude", "stability", "depth"],
            ["recovery", "will", "flow"]
        ];

        for (let attrRow of attributes) {
            ctx.fillText(`${EntityAttributes.ATTRIBUTE_INFORMATION[attrRow[0]].abbreviation.toUpperCase()}: ${fnum(avatar.attributes[attrRow[0]])}`, bodyX, y);
            ctx.fillText(`${EntityAttributes.ATTRIBUTE_INFORMATION[attrRow[1]].abbreviation.toUpperCase()}: ${fnum(avatar.attributes[attrRow[1]])}`, mindX, y);
            ctx.fillText(`${EntityAttributes.ATTRIBUTE_INFORMATION[attrRow[2]].abbreviation.toUpperCase()}: ${fnum(avatar.attributes[attrRow[2]])}`, spiritX, y);
            y += lineHeight;
        }

        y += lineHeight; // Space before resource pools

        // Resource Pools
        ctx.fillText(`HP: ${fnum(avatar.health.curHealth)} / ${fnum(avatar.health.maxHealth)}`, bodyX, y);
        ctx.fillText(`Foc: XX / XX`, mindX, y); // Placeholder until focus pool is implemented
        ctx.fillText(`MP: XX / XX`, spiritX, y); // Placeholder until mojo pool is implemented

        // Resource Recovery
        y += lineHeight * 1;
        ctx.fillText(`+ ${fnum(avatar.health.getHealAmountPerInterval(),3)} per ${fnum(avatar.health.naturalHealingTicks)}t`, bodyX, y);
        ctx.fillText(`+ XX`, mindX, y);
        ctx.fillText(`+ XX`, spiritX, y);


        y += lineHeight * 2;

        // View Distance
        ctx.fillText(`View Distance: ${fnum(avatar.vision.viewRadius, 1)}`, x, y);
    }

    //=====================
}

export { UIPaneMainRendererCharacterSheet };