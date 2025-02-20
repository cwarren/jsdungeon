import {
    devTrace,
    formatNumberForMessage,
    rollDice,
    rollDiceGroup,
    getRandomListItem,
    getListIntersection,
    constrainValue,
    createHelpText,
    valueCalc
} from './util';

describe('devTrace', () => {
    const originalConsoleLog = console.log;
    beforeEach(() => {
        console.log = jest.fn();
    });
    afterEach(() => {
        console.log = originalConsoleLog;
    });

    test('should log message when level is less than or equal to DEV_TRACE_LEVEL', () => {
        devTrace(3, 'Test message', { key: 'value' });
        expect(console.log).toHaveBeenCalledWith('Test message', { key: 'value' });
    });

    test('should not log message when level is greater than DEV_TRACE_LEVEL', () => {
        devTrace(6, 'Test message', { key: 'value' });
        expect(console.log).not.toHaveBeenCalled();
    });
});

describe('formatNumberForMessage', () => {
    test('should return number as string if it is an integer', () => {
        expect(formatNumberForMessage(5)).toBe('5');
    });
    test('should return number as string if it is very close to an integer', () => {
        expect(formatNumberForMessage(5.0000001)).toBe('5');
    });

    test('should return rounded number with "a bit more than" if it is not an integer and is more than the rounded value', () => {
        expect(formatNumberForMessage(6.2)).toBe('a bit more than 6');
    });

    test('should return rounded number with "a bit less than" if it is not an integer and is less than the rounded value', () => {
        expect(formatNumberForMessage(5.7)).toBe('a bit less than 6');
    });
});

describe('rollDice', () => {
    beforeAll(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
    });

    afterAll(() => {
        global.Math.random.mockRestore();
    });

    test('should correctly parse and roll dice strings', () => {
        expect(rollDice('2d6')).toBe(8); // 2 * (6/2 + 1) = 8
        expect(rollDice('1d4 + 2d10')).toBe(15); // 1 * (4/2 + 1) + 2 * (10/2 + 1) = 15
        expect(rollDice('3d8 - 2')).toBe(13); // 3 * (8/2 + 1) - 2 = 13
        expect(rollDice('5')).toBe(5); // Flat number
        expect(rollDice('2d6 + 3 - 1d4')).toBe(8); // 2 * (6/2 + 1) + 3 - (4/2 + 1) = 8
    });
});

describe('rollDiceGroup', () => {
    beforeAll(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
    });

    afterAll(() => {
        global.Math.random.mockRestore();
    });

    test('should correctly roll a group of dice', () => {
        expect(rollDiceGroup('2', '6')).toBe(8); // 2 * (6/2 + 1) = 8
        expect(rollDiceGroup('1', '4')).toBe(3); // 1 * (4/2 + 1) = 3
        expect(rollDiceGroup('3', '8')).toBe(15); // 3 * (8/2 + 1) = 15
        expect(rollDiceGroup('-2', '6')).toBe(-8); // -2 * (6/2 + 1) = -8
    });
});

describe('getRandomListItem', () => {
    beforeAll(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
    });

    afterAll(() => {
        global.Math.random.mockRestore();
    });

    test('should return a random item from the list', () => {
        const list = ['a', 'b', 'c', 'd'];
        expect(getRandomListItem(list)).toBe('c');
    });
});

describe('getListIntersection', () => {
    test('should return the intersection of two lists', () => {
        const list1 = [1, 2, 3, 4];
        const list2 = [3, 4, 5, 6];
        expect(getListIntersection(list1, list2)).toEqual([3, 4]);
    });

    test('should return an empty array if there is no intersection', () => {
        const list1 = [1, 2];
        const list2 = [3, 4];
        expect(getListIntersection(list1, list2)).toEqual([]);
    });
});

describe('constrainValue', () => {
    test('should return the value if it is within the range', () => {
        expect(constrainValue(5, 1, 10)).toBe(5);
    });

    test('should return the min value if the value is less than the min', () => {
        expect(constrainValue(0, 1, 10)).toBe(1);
    });

    test('should return the max value if the value is greater than the max', () => {
        expect(constrainValue(15, 1, 10)).toBe(10);
    });
});

describe('createHelpText', () => {
    test('should create help text with action map descriptions', () => {
        const keyBindings = {
            'a': 'action1',
            'b': 'action2',
            'c': 'action3'
        };
        const actionMap = {
            'action1': { name: 'Action One', description: 'Description for action one' },
            'action2': { name: 'Action Two', description: 'Description for action two' }
        };
        const secondaryActionMap = {
            'action3': { name: 'Action Three', description: 'Description for action three' }
        };

        const expectedHelpText = `Commands:\n\n` +
            `a          - Action One           : Description for action one\n` +
            `b          - Action Two           : Description for action two\n` +
            `c          - Action Three         : Description for action three\n`;

        expect(createHelpText(keyBindings, actionMap, secondaryActionMap)).toBe(expectedHelpText);
    });

    test('should create help text with no description available for unknown actions', () => {
        const keyBindings = {
            'a': 'action1',
            'b': 'unknownAction'
        };
        const actionMap = {
            'action1': { name: 'Action One', description: 'Description for action one' }
        };
        const secondaryActionMap = {};

        const expectedHelpText = `Commands:\n\n` +
            `a          - Action One           : Description for action one\n` +
            `b          - unknownAction        : (No description available)\n`;

        expect(createHelpText(keyBindings, actionMap, secondaryActionMap)).toBe(expectedHelpText);
    });
});

describe('valueCalc', () => {
    
    test('should correctly apply multipliers and flats in order', () => {
        const baseValue = 100;
        const modifiers = [
            { multipliers: [1.1, 1.2], flats: [5, 10] }, // (100 * 1.1 * 1.2) + 5 + 10
            { multipliers: [0.9], flats: [-3] } // * 0.9 - 3
        ];
        const expectedValue = ((100 * 1.1 * 1.2) + 5 + 10) * 0.9 - 3;
        expect(valueCalc(baseValue, modifiers)).toBeCloseTo(expectedValue, 5);
    });

    test('should return base value when no modifiers are provided', () => {
        expect(valueCalc(50, [])).toBe(50);
    });

    test('should handle only multipliers', () => {
        const baseValue = 20;
        const modifiers = [{ multipliers: [2, 3], flats: [] }]; // 20 * 2 * 3
        expect(valueCalc(baseValue, modifiers)).toBe(120);
    });

    test('should handle only flats', () => {
        const baseValue = 30;
        const modifiers = [{ multipliers: [], flats: [5, 10] }]; // 30 + 5 + 10
        expect(valueCalc(baseValue, modifiers)).toBe(45);
    });

    test('should handle missing multipliers or flats fields', () => {
        const baseValue = 10;
        const modifiers = [{ multipliers: [2] }, { flats: [5] }]; // 10 * 2 + 5
        expect(valueCalc(baseValue, modifiers)).toBe(25);
    });

    test('should handle an empty object in modifier layers', () => {
        const baseValue = 15;
        const modifiers = [{}]; // No changes applied
        expect(valueCalc(baseValue, modifiers)).toBe(15);
    });

    test('should handle multiple empty modifier layers', () => {
        const baseValue = 25;
        const modifiers = [{}, {}, {}]; // No changes applied
        expect(valueCalc(baseValue, modifiers)).toBe(25);
    });

    test('should handle negative multipliers and flats', () => {
        const baseValue = 40;
        const modifiers = [
            { multipliers: [1.5, -2], flats: [-10, 5] } // (40 * 1.5 * -2) - 10 + 5
        ];
        const expectedValue = (40 * 1.5 * -2) - 10 + 5;
        expect(valueCalc(baseValue, modifiers)).toBe(expectedValue);
    });

});