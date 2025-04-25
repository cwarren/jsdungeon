import { constrainValue } from "../util.js";

const INITIAL_ZOOM_FACTOR = .6;

class UIPaneMainRenderer {
    constructor(ui, canvas) {
        this.ui = ui;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        this.uiRenderSettings = {
            zoomFactorMin: 0.3,
            zoomFactorMax: 3,
            zoomFactor: 0.6,
            baseCellSize: 30,
            gridCellSpacing: 1,
        };
    }

    // NOTE: zoom alteration is implemented here... but not every game mode rendering pays attention to it
    zoomIn(factor = 1.1) {
        this.zoomAlter(factor);
    }
    zoomOut(factor = 0.9) {
        this.zoomAlter(factor);
    }
    zoomAlter(factor = 1) {
        this.uiRenderSettings.zoomFactor = 
        constrainValue(this.uiRenderSettings.zoomFactor * factor, this.uiRenderSettings.zoomFactorMin, this.uiRenderSettings.zoomFactorMax);
    }
    zoomReset() {
        this.uiRenderSettings.zoomFactor = INITIAL_ZOOM_FACTOR;
    }

    getGridRenderSettings(worldLevel) {
        const cellSize = this.uiRenderSettings.baseCellSize * this.uiRenderSettings.zoomFactor;
        const gridSpacing = this.uiRenderSettings.gridCellSpacing;
        const offsetX = (this.canvas.width - (worldLevel.levelWidth * (cellSize + gridSpacing))) / 2;
        const offsetY = (this.canvas.height - (worldLevel.levelHeight * (cellSize + gridSpacing))) / 2;
        return {cellSize, gridSpacing, offsetX, offsetY,}
    }

    clear() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        const mainElement = document.getElementById("main");
        this.canvas.width = mainElement.clientWidth;
        this.canvas.height = mainElement.clientHeight;
        // sub-class overrides, leading with super();
    }

    // this is used to provide screen-specific help information beyond just the commands the screen supports
    getExplanationText() {
        // sub-class overrides
        return '';
    }

    handleWasSurfaced() {
        // sub-class overrides for any special handling when the screen is pushed onto the stack
        // (e.g. help renderer changes makes canvas invisible and help text visible)
        return false;
    }
    handleWasBuried() {
        // sub-class overrides for any special handling when the screen is popped off the stack
        // (e.g. help renderer changes makes canvas visible and help text invisible)
        return false;
    }
}

export { UIPaneMainRenderer };