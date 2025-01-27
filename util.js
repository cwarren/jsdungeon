function rollDice(dString) {
    const cleanedDString = dString.replace(/\s+/g, ''); // strip whitespace
    const dicePattern = /([+-]?\d*)d(\d+)|([+-]?\d+)/g;
    let total = 0;
    let matches = [...cleanedDString.matchAll(dicePattern)];

    for (let match of matches) {
        if (match[1] !== undefined) {
            total += rollDiceGroup(match[1], match[2]);
        } else {
            total += parseInt(match[3], 10);
        }
    }

    return total;
}

function rollDiceGroup(numDiceStr, dieSizeStr) {
    const numDice = parseInt(numDiceStr, 10) || (numDiceStr === "-" ? -1 : 1);
    const dieSize = parseInt(dieSizeStr, 10);
    
    let rollResults = 0;
    for (let i = 0; i < Math.abs(numDice); i++) {
        rollResults += Math.floor(Math.random() * dieSize) + 1;
    }
    return numDice > 0 ? rollResults : -rollResults;
}

// generates a string like "2d6 + 4d10 - 3 + 1d8", mainly for use in validating rollDice
function generateRandomDiceString() {
    const numTerms = Math.floor(Math.random() * 4) + 2; // 2 to 5 terms
    const diceSizes = [4, 6, 8, 10, 12, 20, 100]; // Common dice sizes
    const operators = [" + ", " - "];

    let dString = "";

    for (let i = 0; i < numTerms; i++) {
        let includeDice = Math.random() < 0.7; // 70% chance of rolling dice, 30% for a flat number
        let operator = i === 0 ? "" : operators[Math.floor(Math.random() * operators.length)];

        if (includeDice) {
            let numDice = Math.floor(Math.random() * 4) + 1; // 1 to 4 dice
            let dieSize = diceSizes[Math.floor(Math.random() * diceSizes.length)];
            dString += `${operator}${numDice}d${dieSize}`;
        } else {
            let flatNum = Math.floor(Math.random() * 10) + 1; // Flat modifier from 1 to 10
            dString += `${operator}${flatNum}`;
        }
    }

    return dString.trim();
}

function getRandomListItem(list) {
    if (!Array.isArray(list) || list.length === 0) {
        return null; // Handle empty or invalid array
    }
    return list[Math.floor(Math.random() * list.length)];
}

function getListIntersection(list1, list2) {
    const set2 = new Set(list2);
    return list1.filter(item => set2.has(item));
}

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

export { rollDice, rollDiceGroup, generateRandomDiceString, getRandomListItem, getListIntersection, constrainValue, createHelpText, devTrace };