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
        this.helpContainer = document.getElementById("helpContainer");
    }

    handleWasSurfaced() {
        this.canvas.style.display = "none";
        this.helpContainer.style.display = "block";
    }
    handleWasBuried() {
        this.helpContainer.style.display = "none";
        this.canvas.style.display = "block";
    }

    //=====================

    draw() {
        const helpFor = this.ui.stateManager.uiStateStack[this.ui.stateManager.uiStateStack.length - 2]; // help is always in the context of the screen in which it was called
        const helpTextBlock = this.helpTextBlocks[helpFor];
        this.currentHelpTextBlock = helpTextBlock;

        if (!helpTextBlock) {
            this.helpContainer.innerHTML = "<p>No help text available</p>";
        } else {
            const displayTextRows = helpTextBlock.getDisplayTextRows();
            this.helpContainer.innerHTML = displayTextRows.map(row => `<p>${row}</p>`).join("");
        }
    }

    //=====================

    hideHelp() {
        this.helpContainer.style.display = "none";
        this.canvas.style.display = "block";
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