
import { UIPaneMainRendererCharacterSheet } from './uiPaneMainRendererCharacterSheetClass.js';
import { UIPaneMainRendererCustomGraphics } from './uiPaneMainRendererCustomGraphicsClass.js';
import { UIPaneMainRendererEquipment } from './uiPaneMainRendererEquipmentClass.js';
import { UIPaneMainRendererGameMeta } from './uiPaneMainRendererGameMetaClass.js';
import { UIPaneMainRendererGameOver } from './uiPaneMainRendererGameOverClass.js';
import { UIPaneMainRendererGamePlay } from './uiPaneMainRendererGamePlayClass.js';
import { UIPaneMainRendererHelp } from './uiPaneMainRendererHelpClass.js';
import { UIPaneMainRendererInventory } from './uiPaneMainRendererInventoryClass.js';
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
            "PROSE_SECTION": new UIPaneMainRendererProseSection(this, this.canvas),
        };
    }

    getCurrentUIState() {
        return this.stateManager.getCurrentUIState();
    }

    pushUIState(newState) {
        this.stateManager.pushUIState(newState);
        this.resizeCanvas(); // Redraw to reflect new state
    }

    popUIState() {
        this.stateManager.popUIState();
        this.resizeCanvas(); // Redraw to reflect new state
    }

    resizeCanvas() {
        this.renderer.resizeCanvas(window.innerWidth * 0.9, window.innerHeight * 0.9);
        this.drawUI();
    }

    drawUI() {
        const renderer = this.renderers[this.getCurrentUIState()];
        if (!renderer) { 
            console.log("No renderer for current UI state", this.getCurrentUIState());
            return;
        }
        renderer.clear();
        renderer.draw();
    }
}

export { UIPaneMain };