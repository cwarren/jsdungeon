import { uiPaneMain } from "../ui/ui.js";

const messageHistoryActionsMap = {
    LINE_UP: { name: "Line up", description: "Move one line towards the beginning of the text", action: lineUp },
    LINE_DOWN: { name: "Line down", description: "Move one line towards the end of the text", action: lineDown },
    SCROLL_UP: { name: "Scroll up", description: "Move several lines towards the beginning of the text", action: scrollUp },
    SCROLL_DOWN: { name: "Scroll down", description: "Move several lines towards the end of the text", action: scrollDown },
};

function lineUp(gameState, key, event) {
    console.log("### messageHistory lineUp");
    // uiPaneMain.getCurrentHelpTextBlock().scrollUp();
    return 0;
}

function lineDown(gameState, key, event) {
    console.log("### messageHistory lineDown");
    // uiPaneMain.getCurrentHelpTextBlock().scrollDown();
    return 0;
}

function scrollUp(gameState, key, event) {
    console.log("### messageHistory scrollUp");
    // uiPaneMain.getCurrentHelpTextBlock().scrollUp(12);
    return 0;
}

function scrollDown(gameState, key, event) {
    console.log("### messageHistory scrollDown");
    // uiPaneMain.getCurrentHelpTextBlock().scrollDown(12);
    return 0;
}

//=====================

//=====================

//=====================


export { messageHistoryActionsMap };
