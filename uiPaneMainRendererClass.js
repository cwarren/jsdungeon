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

    getGridRenderSettings(worldLevel) {
        const cellSize = this.uiRenderSettings.baseCellSize * this.uiRenderSettings.zoomFactor;
        const gridSpacing = this.uiRenderSettings.gridCellSpacing;
        const offsetX = (this.canvas.width - (worldLevel.levelWidth * (cellSize + gridSpacing))) / 2;
        const offsetY = (this.canvas.height - (worldLevel.levelHeight * (cellSize + gridSpacing))) / 2;
        return {cellSize, gridSpacing, offsetX, offsetY,}
    }

    clear() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        // Override in subclass
        console.log("UIRenderer draw method called - should be overridden in subclass");
    }

}

export { UIPaneMainRenderer };