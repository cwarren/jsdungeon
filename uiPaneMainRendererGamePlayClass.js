import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";

class UIPaneMainRendererGamePlay extends UIRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
    }

    //=====================

    draw() {
        const currentLevel = this.ui.gameState.getCurrentWorldLevel();
        if (!currentLevel) return;
        this.drawWorldLevel(currentLevel);
    }

    //=====================

    drawWorldLevel(worldLevel) {
        drawWorldLevelGrid(worldLevel);
        drawWorldLevelStructures(worldLevel);
        drawWorldLevelItems(worldLevel);
        drawWorldLevelEntities(worldLevel);
    }

    drawWorldLevelGrid(worldLevel) {
        const {cellSize, gridSpacing, offsetX, offsetY} = this.getGridRenderSettings(worldLevel);
        for (let col = 0; col < worldLevel.levelWidth; col++) {
            for (let row = 0; row < worldLevel.levelHeight; row++) {
                const cell = worldLevel.grid[col][row];
                if (this.gameState.avatar.vision.visibleCells.has(cell)) {
                    drawGridCell(cell, offsetX, offsetY, cellSize, gridSpacing);
                } else if (this.gameState.avatar.vision.seenCells.has(cell)) {
                    drawGridCellFaint(cell, offsetX, offsetY, cellSize, gridSpacing);
                }
            }
        }
    }

    drawGridCell(cell, offsetX, offsetY, cellSize, gridSpacing) {
        this.ctx.fillStyle = cell.color;
        this.ctx.fillRect(
            offsetX + cell.x * (cellSize + gridSpacing),
            offsetY + cell.y * (cellSize + gridSpacing),
            cellSize,
            cellSize
        );
    }

    drawGridCellFaint(cell, offsetX, offsetY, cellSize, gridSpacing) {
        this.ctx.fillStyle = cell.color;
        this.ctx.globalAlpha = 0.6;
        this.ctx.fillRect(
            offsetX + cell.x * (cellSize + gridSpacing),
            offsetY + cell.y * (cellSize + gridSpacing),
            cellSize,
            cellSize
        );
        this.ctx.globalAlpha = 1;
    }

    drawWorldLevelStructures(worldLevel) {
        const {cellSize, gridSpacing, offsetX, offsetY} = this.getGridRenderSettings(worldLevel);
        worldLevel.levelStructures.forEach(structure => {
            const structureCell = structure.getCell();
            if (this.gameState.avatar.vision.visibleCells.has(structureCell) || this.gameState.avatar.vision.seenCells.has(structureCell)) {
                this.drawStructure(structure, offsetX, offsetY, cellSize, gridSpacing);
            }
        });
    }

    drawStructure(structure, offsetX, offsetY, cellSize, gridSpacing) {
        this.ctx.fillStyle = structure.displayColor;
        this.ctx.font = `${cellSize * 0.8}px Arial`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(
            structure.displaySymbol,
            offsetX + structure.x * (cellSize + gridSpacing) + cellSize / 2,
            offsetY + structure.y * (cellSize + gridSpacing) + cellSize / 2
        );
    }

    drawWorldLevelItems(worldLevel) {
        // Placeholder for drawing items
    }

    drawWorldLevelEntities(worldLevel) {
        const {cellSize, gridSpacing, offsetX, offsetY} = this.getGridRenderSettings(worldLevel);
        worldLevel.levelEntities.forEach(entity => {
            if (entity.isVisibleTo(gameState.avatar)) {
                this.drawEntity(entity, offsetX, offsetY, cellSize, gridSpacing);
            }
        });

        // Draw the avatar if it's in this world level
        const avatar = this.gameState.avatar;
        if (avatar && avatar.z === worldLevel.levelNumber) {
            this.drawEntity(avatar, offsetX, offsetY, cellSize, gridSpacing);
        }
    }

    drawEntity(entity, offsetX, offsetY, cellSize, gridSpacing) {
        ctx.fillStyle = entity.displayColor;
        ctx.font = `${cellSize * 0.8}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            entity.displaySymbol,
            offsetX + entity.location.x * (cellSize + gridSpacing) + cellSize / 2,
            offsetY + entity.location.y * (cellSize + gridSpacing) + cellSize / 2
        );
    }

    drawPathHighlight(gridCellList, highlightColor = "red") {
        if (gridCellList === 0) return;

        const currentLevel = this.gameState.world[this.gameState.currentLevel];
        if (!currentLevel) return;
        const {cellSize, gridSpacing, offsetX, offsetY} = this.getGridRenderSettings(currentLevel);

        this.ctx.fillStyle = highlightColor;
        gridCellList.forEach(cell => {
            const x = offsetX + cell.x * (cellSize + gridSpacing) + cellSize / 2;
            const y = offsetY + cell.y * (cellSize + gridSpacing) + cellSize / 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, cellSize * 0.2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}

export { UIPaneMainRendererGamePlay };