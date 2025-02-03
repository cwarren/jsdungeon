
import { UIPaneMainRendererGamePlay } from './uiPaneMainRendererGamePlayClass.js';
import { UIPaneMainStateManager } from './uiPaneMainStateManagerClass.js';
import { UIPaneMainEventHandler } from './uiPaneMainEventHandlerClass.js';
import { keyBinding, actionMaps } from "./gameCommands.js";

class UIPaneMain {
    constructor(gameState) {
        this.gameState = gameState;
        this.canvas = document.getElementById("gameCanvas");
        this.stateManager = new UIPaneMainStateManager(this);
        this.eventHandler = new UIPaneMainEventHandler(this, this.canvas);
        this.renderers = {
            "GAME_PLAY": new UIPaneMainRendererGamePlay(this, this.canvas),
            "CHARACTER_SHEET": null,
            "INVENTORY": null,
            "EQUIPMENT": null,
            "MAP_SCREEN": null,
            "GAME_META": null,
            "GAME_OVER": null,
            "PROSE_SECTION": null,
            "CUSTOM_GRAPHICS": null,
        };

        this.helpTextBlocks = {};
        this.initializeHelpTextBlocks(keyBinding, actionMaps);
    }

    initializeHelpTextBlocks(keyBindings, actionMaps) {
        for (const commandSet in keyBindings) {
            if (actionMaps[commandSet]) {
                this.helpTextBlocks[commandSet] = new TextBlock(
                    createHelpText(keyBindings[commandSet], actionMaps[commandSet], uiActionsMap)
                );
            }
        }
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

        switch (getCurrentUIState()) {
            case "GAME_PLAY":
                this.rendererGamePlay.draw();
                break;
            case "CHARACTER_SHEET":
                drawCharacterSheet(gameState);
                break;
            case "INVENTORY":
                drawInventory(gameState);
                break;
            case "EQUIPMENT":
                drawEquipment(gameState);
                break;
            case "GAME_META":
                drawGameMeta();
                break;
            case "GAME_OVER":
                drawGameOver();
                break;
            case "PROSE_SECTION":
                drawProseSection(gameState);
                break;
            case "HELP":
                console.log("uiStateStack", uiStateStack);
                drawHelp();
                break;
            case "MAP_SCREEN":
                drawMapScreen(gameState);
                break;
            case "CUSTOM_GRAPHICS":
                drawCustomGraphics(gameState);
                break;
        }
    }
}

export { UIPaneMain };