
const textActionsMap = {
    LINE_UP: { name: "Line up", description: "Move one line towards the beginning of the text", action: lineUp },
    LINE_DOWN: { name: "Line down", description: "Move one line towards the end of the text", action: lineDown },
    SCROLL_UP: { name: "Scroll up", description: "Move several lines towards the beginning of the text", action: scrollUp },
    SCROLL_DOWN: { name: "Scroll down", description: "Move several lines towards the end of the text", action: scrollDown },
};

// TODO: figure out how to get the relevant textBlock (instance of TextBlock) passed to these functions... or some other approach such as getting it from ui function

function lineUp(textBlock) {
    console.log("lineUp");
    textBlock.scrollUp();
    return 0;
}

function lineDown(textBlock) {
    console.log("lineDown");
    textBlock.scrollDown();
    return 0;
}

function scrollUp(textBlock) {
    console.log("scrollUp");
    textBlock.scrollUp(12);
    return 0;
}

function scrollDown(textBlock) {
    console.log("scrollDown");
    textBlock.scrollDown(12);
    return 0;
}

//=====================

//=====================

//=====================


export { textActionsMap };
