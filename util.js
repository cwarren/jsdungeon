function constrainValue(valToConstrain,min,max) {
    if (valToConstrain < min) { return min; }   
    if (valToConstrain > max) { return max; }
    return valToConstrain;  
}

function createHelpText(keyBindings, actionMap, secondaryActionMap) {
    let helpText = "Commands:\n\n";

    for (const [key, action] of Object.entries(keyBindings)) {
        if (actionMap[action]) {
            const { name, description } = actionMap[action];
            helpText += `${key.padEnd(10)} - ${name.padEnd(20)} : ${description}\n`;
        } else if (secondaryActionMap[action]) {
            const { name, description } = secondaryActionMap[action];
            helpText += `${key.padEnd(10)} - ${name.padEnd(20)} : ${description}\n`;
        } else {
            helpText += `${key.padEnd(10)} - ${action.padEnd(20)} : (No description available)\n`;
        }
    }

    return helpText;
}

const DEV_TRACE_LEVEL = 5;
function devTrace(level, msg, ...objects) {
    if (level <= DEV_TRACE_LEVEL) {
        console.log(msg, ...objects);
    }
}

export { constrainValue, createHelpText, devTrace };