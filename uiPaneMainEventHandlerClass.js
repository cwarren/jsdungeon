import { executeGameCommand } from "./gameCommands.js";
import { devTrace } from "./util.js";

class UIPaneMainEventHandler {
    constructor(ui, canvas) {
        this.ui = ui;
        this.canvas = canvas;

        this.pressedKeys = new Set();

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        window.addEventListener('resize', () => this.ui.resizeCanvas());
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
        if (!clickedCell) { return; }
        devTrace(2,"Clicked Cell:", clickedCell);

        // any click-based logic goes here - e.g. set avatar movement path to clicked cell
    }

    getClickedCell(clickEvent) {
        const currentLevel = this.ui.gameState.getCurrentWorldLevel();
        if (!currentLevel) return;

        // no cells to click on if not showing game play nor map
        if (this.ui.getCurrentUIState() != "GAME_PLAY" && this.ui.getCurrentUIState() != "MAP_SCREEN") { return; }

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
        window.addEventListener("keydown", (event) => {
            if (!this.pressedKeys.has(event.key)) {
                devTrace(3,"key event", event);
                this.pressedKeys.add(event.key);
                executeGameCommand(event.key, event);
                this.ui.resizeCanvas();
            }
        });

        window.addEventListener("keyup", (event) => {
            this.pressedKeys.delete(event.key);
        });
    }
}

export { UIPaneMainEventHandler };