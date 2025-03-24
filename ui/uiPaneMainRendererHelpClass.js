import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";
import { keyBinding, actionMaps } from "../commands_actions/gameCommands.js";
import { createHelpText, devTrace } from "../util.js";
import { TextBlock } from "./textBlockClass.js";
import { uiActionsMap } from "../commands_actions/uiActions.js";

class UIPaneMainRendererHelp extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
        this.helpTextBlocks = {};
        this.currentHelpTextBlock = null;
    }

    //=====================

    draw() {
        super.draw();
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        const lineHeight = 24; // Space between lines
        const startX = 50;
        let startY = 50;

        const helpFor = this.ui.stateManager.uiStateStack[this.ui.stateManager.uiStateStack.length - 2]; // help is always in the context of the screen in which it was called
        const helpTextBlock = this.helpTextBlocks[helpFor];
        this.currentHelpTextBlock = helpTextBlock;

        if (!helpTextBlock) {
            this.ctx.fillText("No help text available", startX, startY);
            return;
        }

        const displayTextRows = helpTextBlock.getDisplayTextRows();

        for (let i = 0; i < displayTextRows.length; i++) {
            if (startY + lineHeight > this.canvas.height) break; // Stop drawing if the current line would go below the bottom of the canvas
            this.ctx.fillText(displayTextRows[i], startX, startY);
            startY += lineHeight;
        }
    }

    //=====================

    initializeHelpTextBlocks() {
            for (const commandSetIdentifier in keyBinding) {
            if (actionMaps[commandSetIdentifier]) {
                const commandHelpText = createHelpText(keyBinding[commandSetIdentifier], actionMaps[commandSetIdentifier], uiActionsMap);
                const additionHelpInfo = this.ui.renderers[commandSetIdentifier].getExplanationText();
                this.helpTextBlocks[commandSetIdentifier] = new TextBlock(commandHelpText + additionHelpInfo);
            }
        }
    }
}

export { UIPaneMainRendererHelp };