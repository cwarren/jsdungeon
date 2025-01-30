import { devTrace, formatNumberForMessage, rollDice, rollDiceGroup, getRandomListItem, getListIntersection, constrainValue, createHelpText } from './util';

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

    test('should return rounded number with "about" if it is not an integer', () => {
        expect(formatNumberForMessage(5.7)).toBe('about 6');
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