import { executeGameCommand } from "../commands_actions/gameCommands.js";
import { devTrace, constrainValue } from "../util.js";
import { uiPaneInfo, uiPaneList } from "./ui.js";

const LIST_SELECTION_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
const LIST_SHOW_COUNT = LIST_SELECTION_KEYS.length;

class UIPaneMainEventHandler {
    constructor(ui, canvas, setupListeners = true) {
        this.ui = ui;
        this.canvas = canvas;

        this.pressedKeys = new Set();
        this.inputMode = null;
        this.priorInfo = '';

        this.inputCallback = null;
        this.inputCancelledCallback = null;

        this.textInputPrompt = null;
        this.currentInputText = "";

        this.listForInput = null;
        this.listDisplayOffset = 0;

        this.secondaryInputPrompt = null;
        this.secondaryInputValidator = null;

        if (setupListeners) {
            this.initializeEventListeners();
        }
    }

    initializeEventListeners() {
        window.addEventListener("resize", () => this.ui.resizeCanvas());
        this.initializeCanvasClickListeners();
        this.initializeWindowKeyListeners();
    }

    initializeCanvasClickListeners() {
        this.canvas.addEventListener("click", (event) => {
            this.handleCanvasClick(event);
        });
    }

    handleCanvasClick(event) {
        const clickedCell = this.getClickedCell(event);
        if (!clickedCell) return;
        devTrace(2, "Clicked Cell:", clickedCell);

        // Any click-based logic goes here - e.g., set avatar movement path to clicked cell
    }

    getClickedCell(clickEvent) {
        const currentLevel = this.ui.gameState.getCurrentWorldLevel();
        if (!currentLevel) return;

        // No cells to click on if not showing gameplay nor map
        if (this.ui.getCurrentUIState() !== "GAME_PLAY" && this.ui.getCurrentUIState() !== "MAP_SCREEN") return;

        const { cellSize, gridSpacing, offsetX, offsetY } = this.ui.getCurrentRenderer().getGridRenderSettings(currentLevel);

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = clickEvent.clientX - rect.left;
        const mouseY = clickEvent.clientY - rect.top;

        const col = Math.floor((mouseX - offsetX) / (cellSize + gridSpacing));
        const row = Math.floor((mouseY - offsetY) / (cellSize + gridSpacing));

        if (col >= 0 && col < currentLevel.levelWidth && row >= 0 && row < currentLevel.levelHeight) {
            return currentLevel.grid[col][row];
        }
        return null;
    }

    initializeWindowKeyListeners() {
        window.addEventListener("keydown", (event) => this.handleKeyDown(event));
        window.addEventListener("keyup", (event) => this.pressedKeys.delete(event.key));
        window.addEventListener("blur", () => this.pressedKeys.clear());
    }

    handleKeyDown(event) {
        if (!this.pressedKeys.has(event.key)) {
            devTrace(3, "key event", event);
            this.pressedKeys.add(event.key);

            if (this.inputMode == "TEXT_INPUT") {
                this.handleTextInput(event);
                return;
            } else if (this.inputMode == "LIST_INPUT") {
                this.handleListBasedInput(event);
                return;
            } else if (this.inputMode == "TWO_STAGE_INPUT") {
                this.handleTwoStageInput(event);
                return;
            }

            executeGameCommand(this.ui.gameState, event.key, event);
            this.ui.resizeCanvas();
        }
    }

    /*** TEXT INPUT HANDLING ***/

    startTextInput(prompt, callback, cancellationCallback = null) {
        devTrace(2, `Entering text input mode`);
        this.inputMode = "TEXT_INPUT";
        this.textInputPrompt = prompt;
        this.inputCallback = callback;
        this.inputCancelledCallback = cancellationCallback;
        this.currentInputText = "";
        this.priorInfo = uiPaneInfo.getInfo();
        uiPaneInfo.setInfo(`${this.textInputPrompt}: ${this.currentInputText}_`);
    }

    stopTextInput() {
        devTrace(2, "Exiting text input mode.");
        this.inputMode = null;
        this.textInputPrompt = null;
        this.inputCallback = null;
        this.inputCancelledCallback = null;
        this.currentInputText = "";
        uiPaneInfo.setInfo(this.priorInfo);
        this.priorInfo = '';
    }

    handleTextInput(event) {
        if (event.key === "Escape") {
            if (this.inputCancelledCallback) {
                this.inputCancelledCallback();
            }
            this.stopTextInput();
            return;
        }

        if (event.key === "Enter" && this.inputCallback) {
            this.inputCallback(this.currentInputText);
            this.stopTextInput();
            return;
        }

        if (event.key === "Backspace") {
            this.currentInputText = this.currentInputText.slice(0, -1);
        } else if (event.key.length === 1) {
            this.currentInputText += event.key;
        }

        this.updateTextInputDisplay();
    }

    updateTextInputDisplay() {
        uiPaneInfo.setInfo(`${this.textInputPrompt}: ${this.currentInputText}_`);
    }

    /*** LIST-BASED INPUT HANDLING ***/

    startListBasedInput(listForInput, prompt, callback, cancellationCallback = null) {
        devTrace(2, `Entering list-based input mode`);
        this.inputMode = "LIST_INPUT";
        this.listForInput = listForInput;
        this.listInputPrompt = prompt;
        this.inputCallback = callback;
        this.inputCancelledCallback = cancellationCallback;
        this.listDisplayOffset = 0;
        this.priorInfo = uiPaneInfo.getInfo();
        uiPaneInfo.setInfo(`${this.listInputPrompt}<br\><br\>ESC to cancel, arrows to scroll up or down, letter to select`);
        this.updateListBasedInputDisplay();
    }

    stopListBasedInput() {
        devTrace(2, "Exiting list-based input mode.");
        this.inputMode = null;
        this.listInputPrompt = null;
        this.inputCallback = null;
        this.inputCancelledCallback = null;
        this.listForInput = null;
        this.listDisplayOffset = 0;
        uiPaneInfo.setInfo(this.priorInfo);
        this.updateListBasedInputDisplay();
        this.priorInfo = '';
    }

    // NOTE: a valid selection ends list-based input
    handleListBasedInput(event) {
        // exit list-input mode
        if (event.key === "Escape") {
            if (this.inputCancelledCallback) {
                this.inputCancelledCallback();
            }
            this.stopListBasedInput();
            return;
        }

        // select / activate a given list item
        const validSelectionKeys = LIST_SELECTION_KEYS.slice(0, this.listForInput.length);
        const actionKey = event.key.toLowerCase();
        if (actionKey.length === 1 && validSelectionKeys.includes(actionKey)) {
            if (this.inputCallback) {
                const isBulkAction = actionKey != event.key; // shift key pressed
                const selectionIdx = this.listDisplayOffset + LIST_SELECTION_KEYS.indexOf(actionKey);
                this.inputCallback(this.ui.gameState, this.listForInput, selectionIdx, isBulkAction);
            }
            this.stopListBasedInput();
            return;
        }

        // simple list nav
        if (event.key === "ArrowUp") {
            this.listDisplayOffset = constrainValue(this.listDisplayOffset - 1, 0, this.listForInput.length - LIST_SELECTION_KEYS.length - 1);
        }
        if (event.key === "ArrowDown") {
            this.listDisplayOffset = constrainValue(this.listDisplayOffset + 1, 0, this.listForInput.length - LIST_SELECTION_KEYS.length - 1);
        }

        this.updateListBasedInputDisplay();
    }


    updateListBasedInputDisplay() {
        if (this.listForInput == null) {
            uiPaneList.clearList();
            return;
        }

        if (this.listForInput.length == 0) {
            uiPaneList.setList('Empty', []);
            return;
        }

        // show list items from the current offset up to the selection keys supported
        const displayList = this.listForInput
            .slice(this.listDisplayOffset, this.listDisplayOffset + LIST_SHOW_COUNT)
            .map((listItemToShow, idx) => {
                const listItemText = this.getDisplayTextForListItem(listItemToShow);
                return { displayText: `${LIST_SELECTION_KEYS[idx]}: ${listItemText}` };
            });

        uiPaneList.setList('', displayList);
    }

    getDisplayTextForListItem(item) {
        let listItemText = 'UNKNOWN';

        if (typeof item == "string") {
            listItemText = item;
        } else if (item.name) {
            listItemText = item.name;
            if (item.stackCount && item.stackCount > 1) {
                listItemText += ` (# ${item.stackCount})`;
            }
        }

        return listItemText
    }

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    /*** TWO-STAGE INPUT HANDLING ***/
    // support for a primary command that requires a secondary input, e.g. dig -> which direction

    startTwoStageInput(prompt, secondaryInputValidator, callback, cancellationCallback = null) {
        devTrace(2, `Entering two-stage input mode`);
        this.inputMode = "TWO_STAGE_INPUT";
        this.secondaryInputPrompt = prompt;
        this.secondaryInputValidator = secondaryInputValidator;
        this.inputCallback = callback;
        this.inputCancelledCallback = cancellationCallback;
        this.priorInfo = uiPaneInfo.getInfo();
        uiPaneInfo.setInfo(`${this.secondaryInputPrompt}<br\><br\>ESC to cancel`);
    }

    stopTwoStageInput() {
        devTrace(2, "Exiting two-stage input mode.");
        this.inputMode = null;
        this.secondaryInputPrompt = null;
        this.secondaryInputValidator = null;
        this.inputCallback = null;
        this.inputCancelledCallback = null;
        uiPaneInfo.setInfo(this.priorInfo);
        this.priorInfo = '';
    }

    // NOTE: a valid secondary command ends two-stage input
    handleTwoStageInput(event) {
        // exit two-stage mode
        if (event.key === "Escape") {
            if (this.inputCancelledCallback) {
                this.inputCancelledCallback();
            }
            this.stopTwoStageInput();
            return;
        }

        if (!this.secondaryInputValidator(this.ui.gameState, event.key)) {
            devTrace(2, "Invalid secondary input");
            // TODO: tell user
            return;
        }

        this.inputCallback(this.ui.gameState, event.key);
        this.stopTwoStageInput();
        return;
    }

}

export { UIPaneMainEventHandler };
