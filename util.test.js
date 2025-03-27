import {
    devTrace,
    formatNumberForMessage,
    formatNumberForShortDisplay,
    rollDice,
    rollDiceGroup,
    getRandomListItem,
    getListIntersection,
    constrainValue,
    createHelpText,
    generateId,
    idOf,
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

describe('formatNumberForShortDisplay', () => {
    test('returns exact number when no rounding needed', () => {
        expect(formatNumberForShortDisplay(100)).toBe('100');
        expect(formatNumberForShortDisplay(42.5, 1)).toBe('42.5');
    });

    test('rounds to the specified decimal places', () => {
        expect(formatNumberForShortDisplay(3.14159, 2)).toBe('~ 3.14(+)');
        expect(formatNumberForShortDisplay(2.499, 0)).toBe('~ 2(+)');
    });

    test('handles negative numbers correctly', () => {
        expect(formatNumberForShortDisplay(-3.14159, 2)).toBe('~ -3.14(-)');
        expect(formatNumberForShortDisplay(-2.499, 0)).toBe('~ -2(-)');
    });

    test('appends minus sign when number is slightly less than rounded value', () => {
        expect(formatNumberForShortDisplay(1.99, 0)).toBe('~ 2(-)');
        expect(formatNumberForShortDisplay(-1.99, 0)).toBe('~ -2(+)');
    });

    test('appends plus sign when number is slightly more than rounded value', () => {
        expect(formatNumberForShortDisplay(2.01, 0)).toBe('~ 2(+)');
        expect(formatNumberForShortDisplay(-2.01, 0)).toBe('~ -2(-)');
    });

    test('handles values close to the difference threshold correct at different places', () => {
        expect(formatNumberForShortDisplay(0.0004, 3)).toBe('~ 0.000(+)');
        expect(formatNumberForShortDisplay(-0.0000005, 3)).toBe('-0.000');

        expect(formatNumberForShortDisplay(5.0004, 0)).toBe('5');
        expect(formatNumberForShortDisplay(-5.0006, 0)).toBe('-5');
    });


    test('handles values close to the difference threshold', () => {
        expect(formatNumberForShortDisplay(0.0000005, 3)).toBe('0.000');
        expect(formatNumberForShortDisplay(-0.0000005, 3)).toBe('-0.000');

        expect(formatNumberForShortDisplay(2.0000005, 3)).toBe('2.000');
        expect(formatNumberForShortDisplay(-2.0000005, 3)).toBe('-2.000');

        expect(formatNumberForShortDisplay(5.0005, 0)).toBe('5');
        expect(formatNumberForShortDisplay(-5.0005, 0)).toBe('-5');

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

describe("generateId", () => {
    beforeEach(() => {
        // Reset the counter before each test to ensure predictable behavior
        global.idCounter = 0;
    });

    test("generates an ID with the default prefix", () => {
        const id = generateId();
        expect(id).toMatch(/^id-/); // Ensures it starts with "id-"
    });

    test("generates an ID with a custom prefix", () => {
        const id = generateId("user");
        expect(id).toMatch(/^user-/); // Ensures it starts with "user-"
    });

    test("ensures the generated ID contains a timestamp", () => {
        const id = generateId();
        const parts = id.split("-");
        const timestamp = parts[1];

        expect(timestamp).toBeDefined();
        expect(parseInt(timestamp, 36)).toBeGreaterThan(0); // Should be a valid timestamp
    });

    test("ensures the generated ID contains a random part", () => {
        const id = generateId();
        const parts = id.split("-");
        const randomPart = parts[2];

        expect(randomPart).toBeDefined();
        expect(randomPart.length).toBe(5); // Ensures the random part is 5 characters long
    });

    test("ensures the counter increments on successive calls", () => {
        const id1 = generateId();
        const id2 = generateId();

        const counter1 = parseInt(id1.split("-")[3], 36);
        const counter2 = parseInt(id2.split("-")[3], 36);

        expect(counter2).toBe(counter1 + 1);
    });

    test("checks that generated IDs are unique over multiple calls", () => {
        const ids = new Set();
        for (let i = 0; i < 100; i++) {
            ids.add(generateId());
        }
        expect(ids.size).toBe(100); // Ensures all IDs are unique
    });
});

describe('idOf', () => {
    test('should return the orig value when passed a non-object', () => {
        const res = idOf('a-plain-id');

        expect(res).toEqual('a-plain-id');
    });

    test('should return the object when passed an object', () => {
        const res = idOf({id: 'an-object-id'});

        expect(res).toEqual('an-object-id');
    });
});

