import { executeGameCommand } from "../gameCommands.js";
import { devTrace } from "../util.js";
import { uiPaneInfo } from "./ui.js";

class UIPaneMainEventHandler {
    constructor(ui, canvas) {
        this.ui = ui;
        this.canvas = canvas;

        this.pressedKeys = new Set();
        this.inputMode = null;
        this.textInputPrompt = null;
        this.inputCallback = null;
        this.inputCancelledCallback = null;
        this.currentInputText = "";
        this.priorInfo = '';

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

            if (this.inputMode) {
                this.handleTextInput(event);
                return;
            }

            executeGameCommand(event.key, event);
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
        console.log("updateTextInputDisplay");
        console.log("this.ui", this.ui);

        uiPaneInfo.setInfo(`${this.textInputPrompt}: ${this.currentInputText}_`);
    }
}

export { UIPaneMainEventHandler };
