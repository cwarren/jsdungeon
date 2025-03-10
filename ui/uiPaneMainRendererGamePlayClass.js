import { UIPaneMainRenderer } from "./uiPaneMainRendererClass.js";

class UIPaneMainRendererGamePlay extends UIPaneMainRenderer {
    constructor(ui, canvas) {
        super(ui, canvas);
    }

    //===================== 

    draw() {
        super.draw();
        const currentLevel = this.ui.gameState.getCurrentWorldLevel();
        if (!currentLevel) return;

        const avatar = this.ui.gameState.avatar;
        if (avatar) {
            const centerCell = avatar.getCell();
            this.drawWorldLevel(currentLevel, centerCell);
        } else {
            this.drawWorldLevel(currentLevel);
        }
    }

    //=====================

    drawWorldLevel(worldLevel, centerCell = null) {
        this.drawWorldLevelGrid(worldLevel, centerCell);
        this.drawWorldLevelStructures(worldLevel, centerCell);
        this.drawWorldLevelItems(worldLevel, centerCell);
        this.drawWorldLevelEntities(worldLevel, centerCell);
    }


    // override to handle centering
    getGridRenderSettings(worldLevel, centerCell = null) {
        const cellSize = this.uiRenderSettings.baseCellSize * this.uiRenderSettings.zoomFactor;
        const gridSpacing = this.uiRenderSettings.gridCellSpacing;

        if (centerCell) {
            const canvasCenterX = this.canvas.width / 2;
            const canvasCenterY = this.canvas.height / 2;
            const offsetX = canvasCenterX - centerCell.x * (cellSize + gridSpacing);
            const offsetY = canvasCenterY - centerCell.y * (cellSize + gridSpacing);
            return { cellSize, gridSpacing, offsetX, offsetY };
        }

        // Default centering the entire world level
        const offsetX = (this.canvas.width - (worldLevel.levelWidth * (cellSize + gridSpacing))) / 2;
        const offsetY = (this.canvas.height - (worldLevel.levelHeight * (cellSize + gridSpacing))) / 2;
        return { cellSize, gridSpacing, offsetX, offsetY };
    }


    drawWorldLevelGrid(worldLevel, centerCell = null) {
        const { cellSize, gridSpacing, offsetX, offsetY } = this.getGridRenderSettings(worldLevel, centerCell);
        for (let col = 0; col < worldLevel.levelWidth; col++) {
            for (let row = 0; row < worldLevel.levelHeight; row++) {
                const cell = worldLevel.grid[col][row];
                if (this.ui.gameState.avatar.vision.visibleCells.has(cell)) {
                    this.drawGridCell(cell, offsetX, offsetY, cellSize, gridSpacing);
                } else if (this.ui.gameState.avatar.vision.seenCells.has(`${cell.x},${cell.y},${cell.z}`)) {
                    this.drawGridCellFaint(cell, offsetX, offsetY, cellSize, gridSpacing);
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

    drawWorldLevelStructures(worldLevel, centerCell = null) {
        const { cellSize, gridSpacing, offsetX, offsetY } = this.getGridRenderSettings(worldLevel, centerCell);
        worldLevel.levelStructures.forEach(structure => {
            const structureCell = structure.getCell();
            if (this.ui.gameState.avatar.vision.visibleCells.has(structureCell) ||
                this.ui.gameState.avatar.vision.seenCells.has(`${structureCell.x},${structureCell.y},${structureCell.z}`)) {
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

    drawWorldLevelEntities(worldLevel, centerCell = null) {
        const { cellSize, gridSpacing, offsetX, offsetY } = this.getGridRenderSettings(worldLevel, centerCell);
        worldLevel.levelEntities.forEach(entity => {
            if (entity.isVisibleTo(this.ui.gameState.avatar)) {
                this.drawEntity(entity, offsetX, offsetY, cellSize, gridSpacing);
            }
        });

        const avatar = this.ui.gameState.avatar;
        if (avatar && avatar.z === worldLevel.levelNumber) {
            this.drawEntity(avatar, offsetX, offsetY, cellSize, gridSpacing);
        }
    }

    drawEntity(entity, offsetX, offsetY, cellSize, gridSpacing) {
        this.ctx.fillStyle = entity.displayColor;
        this.ctx.font = `${cellSize * 0.8}px Arial`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(
            entity.displaySymbol,
            offsetX + entity.location.x * (cellSize + gridSpacing) + cellSize / 2,
            offsetY + entity.location.y * (cellSize + gridSpacing) + cellSize / 2
        );
    }

    drawPathHighlight(gridCellList, highlightColor = "red") {
        if (gridCellList === 0) return;

        const currentLevel = this.ui.gameState.getCurrentWorldLevel();
        if (!currentLevel) return;
        const { cellSize, gridSpacing, offsetX, offsetY } = this.getGridRenderSettings(currentLevel);

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