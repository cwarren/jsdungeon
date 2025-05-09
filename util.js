function rollDice(dString) {
    const cleanedDString = (dString+'').replace(/\s+/g, ''); // strip whitespace
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
    if (valToConstrain < min || max < min) { return min; }   
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

function formatNumberForMessage(num) {
    if (Number.isInteger(num)) {
        return num.toString();
    } else {
        const displayNum = Math.round(num);
        if (Math.abs(num - displayNum) < 0.001) {
            return displayNum.toString();
        }
        if (num < displayNum) {
            return `a bit less than ${displayNum}`;
        } else {
            return `a bit more than ${displayNum}`;
        }
    }
}

function formatNumberForShortDisplay(num, places=0) {
    let displayNum = (num).toFixed(places);
    const placeBase = Math.pow(10,places);
    const diffThreshold = 1/placeBase * .001;
    if (Math.abs(num - displayNum) < diffThreshold) {
        return `${displayNum}`;
    }
    if (num < displayNum) {
        return `~ ${displayNum}(-)`;
    } else {
        return `~ ${displayNum}(+)`;
    }
}

function prefixArticleTo(noun) {
    if (typeof noun !== 'string' || noun.length === 0) {
        return noun;
    }

    const lowerNoun = noun.trim().toLowerCase();
    const vowels = ['a', 'e', 'i', 'o', 'u'];

    // Handle special cases where the first letter doesn't match the first sound
    const irregularAn = ['honest', 'hour', 'honor', 'heir'];
    const irregularA = ['university', 'unicorn', 'european', 'one', 'use'];

    if (irregularAn.includes(lowerNoun)) {
        return `an ${noun}`;
    }

    if (irregularA.includes(lowerNoun)) {
        return `a ${noun}`;
    }

    const firstChar = lowerNoun[0];
    const article = vowels.includes(firstChar) ? 'an' : 'a';

    return `${article} ${noun}`;
}

let idCounter = 0;
function generateId(prefix = "id") {
    const timestamp = Date.now().toString(36); // Base-36 timestamp
    const randomPart = Math.random().toString(36).substr(2, 5); // 5 random chars
    const counter = (idCounter++).toString(36); // Incremental counter for uniqueness
    return `${prefix}-${timestamp}-${randomPart}-${counter}`;
}

function idOf(itemObjectOrId) {
    if (typeof itemObjectOrId === 'object' && itemObjectOrId !== null) {
        return itemObjectOrId.id;
    }
    return itemObjectOrId;
}

export {
    rollDice,
    rollDiceGroup,
    generateRandomDiceString,
    getRandomListItem,
    getListIntersection,
    constrainValue,
    createHelpText,
    devTrace,
    formatNumberForMessage,
    formatNumberForShortDisplay,
    prefixArticleTo,
    generateId,
    idOf
};