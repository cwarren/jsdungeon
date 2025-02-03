import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";
import { keyBinding, actionMaps } from "./gameCommands.js";
import { createHelpText, devTrace } from "./util.js";

class UIPaneMainRendererHelp extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
        this.helpTextBlocks = {};
        this.initializeHelpTextBlocks(keyBinding, actionMaps);
    }

    //=====================

    draw() {
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        const lineHeight = 24; // Space between lines
        const startX = 50;
        let startY = 50;

        const helpFor = this.ui.stateManager.uiStateStack[this.ui.stateManager.uiStateStack.length - 2]; // help is always in the context of the screen in which it was called
        const helpTextBlock = this.helpTextBlocks[helpFor];

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

    initializeHelpTextBlocks(keyBindings, actionMaps) {
        for (const commandSet in keyBindings) {
            if (actionMaps[commandSet]) {
                this.helpTextBlocks[commandSet] = new TextBlock(
                    createHelpText(keyBindings[commandSet], actionMaps[commandSet], uiActionsMap)
                );
            }
        }
    }
}

export { UIPaneMainRendererHelp };