
import { UIPaneMainRendererCharacterSheet } from './uiPaneMainRendererCharacterSheetClass.js';
import { UIPaneMainRendererCustomGraphics } from './uiPaneMainRendererCustomGraphicsClass.js';
import { UIPaneMainRendererEquipment } from './uiPaneMainRendererEquipmentClass.js';
import { UIPaneMainRendererGameMeta } from './uiPaneMainRendererGameMetaClass.js';
import { UIPaneMainRendererGameOver } from './uiPaneMainRendererGameOverClass.js';
import { UIPaneMainRendererGamePlay } from './uiPaneMainRendererGamePlayClass.js';
import { UIPaneMainRendererHelp } from './uiPaneMainRendererHelpClass.js';
import { UIPaneMainRendererInventory } from './uiPaneMainRendererInventoryClass.js';
import { UIPaneMainRendererMessageHistory } from './uiPaneMainRendererMessageHistoryClass.js';
import { UIPaneMainRendererMapScreen } from './uiPaneMainRendererMapScreenClass.js';
import { UIPaneMainRendererProseSection } from './uiPaneMainRendererProseSectionClass.js';
import { UIPaneMainStateManager } from './uiPaneMainStateManagerClass.js';
import { UIPaneMainEventHandler } from './uiPaneMainEventHandlerClass.js';

class UIPaneMain {
    constructor(gameState) {
        this.gameState = gameState;
        this.canvas = document.getElementById("gameCanvas");
        this.stateManager = new UIPaneMainStateManager(this);
        this.eventHandler = new UIPaneMainEventHandler(this, this.canvas);
        this.renderers = {
            "CHARACTER_SHEET": new UIPaneMainRendererCharacterSheet(this, this.canvas),
            "CUSTOM_GRAPHICS": new UIPaneMainRendererCustomGraphics(this, this.canvas),
            "EQUIPMENT": new UIPaneMainRendererEquipment(this, this.canvas),
            "GAME_META": new UIPaneMainRendererGameMeta(this, this.canvas),
            "GAME_OVER": new UIPaneMainRendererGameOver(this, this.canvas),
            "GAME_PLAY": new UIPaneMainRendererGamePlay(this, this.canvas),
            "HELP": new UIPaneMainRendererHelp(this, this.canvas),
            "INVENTORY": new UIPaneMainRendererInventory(this, this.canvas),
            "MAP_SCREEN": new UIPaneMainRendererMapScreen(this, this.canvas),
            "MESSAGE_HISTORY": new UIPaneMainRendererMessageHistory(this, this.canvas),
            "PROSE_SECTION": new UIPaneMainRendererProseSection(this, this.canvas),
        };
        this.renderers['HELP'].initializeHelpTextBlocks();
    }

    setGameState(gameState) {
        this.gameState = gameState;
    }

    getCurrentUIState() {
        return this.stateManager.getCurrentUIState();
    }

    pushUIState(newState) {
        this.getCurrentRenderer().handleWasBuried();
        this.stateManager.pushUIState(newState);
        this.getCurrentRenderer().handleWasSurfaced();
        this.resizeCanvas(); // Redraw to reflect new state
    }

    popUIState() {
        this.getCurrentRenderer().handleWasBuried();
        this.stateManager.popUIState();
        this.getCurrentRenderer().handleWasSurfaced();
        this.resizeCanvas(); // Redraw to reflect new state
    }

    resetUIState() {
        this.getCurrentRenderer().handleWasBuried();
        this.stateManager.resetUIState();
        this.getCurrentRenderer().handleWasSurfaced();
        this.resizeCanvas(); // Redraw to reflect new state
    }

    getCurrentHelpTextBlock() {
        return this.renderers['HELP'].currentHelpTextBlock;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth * 0.9;
        this.canvas.height = window.innerHeight * 0.9;
        this.drawUI();
    }

    getCurrentRenderer() {
        return this.renderers[this.getCurrentUIState()];
    }

    drawUI() {
        const renderer = this.getCurrentRenderer();
        if (!renderer) { 
            console.log("No renderer for current UI state", this.getCurrentUIState());
            return;
        }
        renderer.clear();
        renderer.draw();
    }

    zoomIn(factor = 1.1) {
        this.getCurrentRenderer().zoomIn(factor);
        this.resizeCanvas(); // Redraw to reflect new state
    }
    zoomOut(factor = 0.9) {
        this.getCurrentRenderer().zoomOut(factor);
        this.resizeCanvas(); // Redraw to reflect new state
    }
    zoomReset() {
        this.getCurrentRenderer().zoomReset();
        this.resizeCanvas(); // Redraw to reflect new state
    }
}

export { UIPaneMain };