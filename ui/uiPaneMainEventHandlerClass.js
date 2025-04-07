import { executeGameCommand } from "../commands_actions/gameCommands.js";
import { devTrace, constrainValue } from "../util.js";
import { uiPaneInfo, uiPaneList } from "./ui.js";

const LIST_SELECTION_KEYS = ['a','b','c','d','e','f','g','h','i','j','k'];
const LIST_SHOW_COUNT = LIST_SELECTION_KEYS.length;

class UIPaneMainEventHandler {
    constructor(ui, canvas) {
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


        this.initializeEventListeners();
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

            // TODO: this is a messy way to handle the modes - consolidate modes so we don't need a new mode for every command...
            if (["AVATAR_NAME","GAME_TO_LOAD"].includes(this.inputMode)) {
                this.handleTextInput(event);
                return;
            } else if (["INVENTORY_SHOW","INVENTORY_DROP"].includes(this.inputMode)) { 
                this.handleListBasedInput(event);
                return;
            }
            executeGameCommand(this.ui.gameState, event.key, event);
            this.ui.resizeCanvas();
        }
    }

    /*** TEXT INPUT HANDLING ***/

    startTextInput(mode, prompt, callback, cancellationCallback = null) {
        devTrace(2, `Entering text input mode: ${mode}`);
        this.inputMode = mode;
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

    startListBasedInput(mode, listForInput, prompt, callback, cancellationCallback = null) {
        devTrace(2, `Entering list-based input mode: ${mode}`);
        this.inputMode = mode;
        this.listInputPrompt = prompt;
        this.inputCallback = callback;
        this.inputCancelledCallback = cancellationCallback;
        this.listForInput = listForInput;
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
        if (event.key.length === 1 && validSelectionKeys.includes(event.key)) {
            if (this.inputCallback) {
                const selectionIdx = this.listDisplayOffset + LIST_SELECTION_KEYS.indexOf(event.key);
                this.inputCallback(this.ui.gameState, this.listForInput, selectionIdx);
            }
            this.stopListBasedInput();
            return;
        }

        // simple list nav
        if (event.key === "ArrowUp") {
            this.listDisplayOffset = constrainValue(this.listDisplayOffset-1,0,this.listForInput.length-LIST_SELECTION_KEYS.length-1);
        }
        if (event.key === "ArrowDown") {
            this.listDisplayOffset = constrainValue(this.listDisplayOffset+1,0,this.listForInput.length-LIST_SELECTION_KEYS.length-1);
        }

        this.updateListBasedInputDisplay();
    }

    
    updateListBasedInputDisplay() {
        console.log('updateListBasedInputDisplay');
        console.log(this);
        if (this.listForInput == null) {
            uiPaneList.clearList();
            return;
        }
        
        if (this.listForInput.length == 0) {
            uiPaneList.setList('Empty',[]);
            return;
        }

        // show list items from the current offset up to the selection keys supported
        // TODO: could do this better using .slice and .map
        let displayList = [];
        for (let idx = 0; idx < LIST_SHOW_COUNT; idx++) {
            const listIdx = idx + this.listDisplayOffset;
            if (listIdx >= this.listForInput.length) { break; }
            const listItemToShow = this.listForInput[listIdx];
            let listItemText = '';
            if (typeof listItemToShow == "string") {
                listItemText = listItemToShow;
            } else if (listItemToShow.name) {
                listItemText = listItemToShow.name;
            } else {
                listItemText = 'UNKNOWN';
            }
            displayList.push({displayText: `${LIST_SELECTION_KEYS[idx]}: ${listItemText}`});
        }
        console.log('updateListBasedInputDisplay - displayList',displayList);
        uiPaneList.setList('',displayList);
    }
}

export { UIPaneMainEventHandler };
