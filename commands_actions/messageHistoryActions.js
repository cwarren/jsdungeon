import { uiPaneMain } from "../ui/ui.js";

const SCROLL_BLOCK_SIZE = 8; // number of lines to scroll up/down when using the scroll actions

const messageHistoryActionsMap = {
    LINE_UP: { name: "Line up", description: "Move one line towards the beginning of the text", action: lineUp },
    LINE_DOWN: { name: "Line down", description: "Move one line towards the end of the text", action: lineDown },
    SCROLL_UP: { name: "Scroll up", description: "Move several lines towards the beginning of the text", action: scrollUp },
    SCROLL_DOWN: { name: "Scroll down", description: "Move several lines towards the end of the text", action: scrollDown },
};

function lineUp(gameState, key, event) {
    uiPaneMain.renderers["MESSAGE_HISTORY"].scrollUp();
    return 0;
}

function lineDown(gameState, key, event) {
    uiPaneMain.renderers["MESSAGE_HISTORY"].scrollDown();
    return 0;
}

function scrollUp(gameState, key, event) {
    for (let i = 0; i < SCROLL_BLOCK_SIZE; i++) {
        uiPaneMain.renderers["MESSAGE_HISTORY"].scrollUp();
    }
    return 0;
}

function scrollDown(gameState, key, event) {
    for (let i = 0; i < SCROLL_BLOCK_SIZE; i++) {
        uiPaneMain.renderers["MESSAGE_HISTORY"].scrollDown();
    }
    return 0;
}

//=====================

//=====================

//=====================


export { messageHistoryActionsMap };
