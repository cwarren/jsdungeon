import { UIPaneMainEventHandler } from './uiPaneMainEventHandlerClass';
import { devTrace } from '../util.js';
import { uiPaneInfo, uiPaneList } from './ui.js';
import { executeGameCommand } from '../commands_actions/gameCommands.js';

jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
    constrainValue: jest.requireActual('../util.js').constrainValue,
}));

jest.mock('../commands_actions/gameCommands.js', () => ({
    executeGameCommand: jest.fn(),
}));

jest.mock('./ui.js', () => ({
    uiPaneInfo: {
        getInfo: jest.fn(() => 'Previous Info'),
        setInfo: jest.fn(),
    },
    uiPaneList: {
        clearList: jest.fn(),
        setList: jest.fn(),
    },
}));

describe('UIPaneMainEventHandler', () => {
    let uiMock, canvasMock, eventHandler;

    beforeEach(() => {
        uiMock = {
            resizeCanvas: jest.fn(),
            getCurrentUIState: jest.fn(),
            getCurrentRenderer: jest.fn(() => ({
                getGridRenderSettings: jest.fn(() => ({
                    cellSize: 10,
                    gridSpacing: 2,
                    offsetX: 5,
                    offsetY: 5,
                })),
            })),
            gameState: {
                getCurrentWorldLevel: jest.fn(() => ({
                    levelWidth: 10,
                    levelHeight: 10,
                    grid: Array.from({ length: 10 }, () => Array(10).fill('cell')),
                })),
            },
        };
        canvasMock = {
            addEventListener: jest.fn(),
            getBoundingClientRect: jest.fn(() => ({
                left: 0,
                top: 0,
            })),
        };
        eventHandler = new UIPaneMainEventHandler(uiMock, canvasMock, false);
    });

    test('should initialize with default values', () => {
        expect(eventHandler.ui).toBe(uiMock);
        expect(eventHandler.canvas).toBe(canvasMock);
        expect(eventHandler.pressedKeys).toEqual(new Set());
        expect(eventHandler.inputMode).toBe(null);
    });

    test('should handle keydown and execute game command', () => {
        const keyEvent = { key: 'a' };
        eventHandler.handleKeyDown(keyEvent);
        expect(executeGameCommand).toHaveBeenCalledWith(uiMock.gameState, 'a', keyEvent);
        expect(uiMock.resizeCanvas).toHaveBeenCalled();
    });

    describe('UIPaneMainEventHandler - text input', () => {
        test('should start and stop text input mode', () => {
            const callback = jest.fn();
            eventHandler.startTextInput('Enter text', callback);
            expect(eventHandler.inputMode).toBe('TEXT_INPUT');
            expect(uiPaneInfo.setInfo).toHaveBeenCalledWith('Enter text: _');

            eventHandler.stopTextInput();
            expect(eventHandler.inputMode).toBe(null);
            expect(uiPaneInfo.setInfo).toHaveBeenCalledWith('Previous Info');
        });

        test('should handle text input', () => {
            const callback = jest.fn();
            eventHandler.startTextInput('Enter text', callback);

            eventHandler.handleTextInput({ key: 'a' });
            expect(uiPaneInfo.setInfo).toHaveBeenCalledWith('Enter text: a_');

            eventHandler.handleTextInput({ key: 'Backspace' });
            expect(uiPaneInfo.setInfo).toHaveBeenCalledWith('Enter text: _');

            eventHandler.handleTextInput({ key: 'Enter' });
            expect(callback).toHaveBeenCalledWith('');
        });

        test('should handle text input cancellation', () => {
            const callback = jest.fn();
            eventHandler.startTextInput('Enter text', callback);

            eventHandler.handleTextInput({ key: 'Escape' });

            expect(uiPaneInfo.setInfo).toHaveBeenCalledWith('Previous Info');
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('UIPaneMainEventHandler - list-based input', () => {
        test('should start and stop list-based input mode', () => {
            const callback = jest.fn();
            const list = ['Option 1', 'Option 2'];
            eventHandler.startListBasedInput(list, 'Choose an option', callback);

            expect(eventHandler.inputMode).toBe('LIST_INPUT');
            expect(uiPaneInfo.setInfo).toHaveBeenCalledWith(
                'Choose an option<br><br>ESC to cancel, arrows to scroll up or down, letter to select'
            );

            eventHandler.stopListBasedInput();
            expect(eventHandler.inputMode).toBe(null);
            expect(uiPaneInfo.setInfo).toHaveBeenCalledWith('Previous Info');
        });

        test('should handle list-based item selection', () => {
            const callback = jest.fn();
            const list = ['Option 1', 'Option 2', 'Option 3'];
            eventHandler.startListBasedInput(list, 'Choose an option', callback);

            eventHandler.handleListBasedInput({ key: 'a' });
            
            expect(callback).toHaveBeenCalledWith(uiMock.gameState, list, 0, false);
        });

        test('should handle list-based bulk item selection', () => {
            const callback = jest.fn();
            const list = ['Option 1', 'Option 2', 'Option 3'];
            eventHandler.startListBasedInput(list, 'Choose an option', callback);

            eventHandler.handleListBasedInput({ key: 'A' }); // uppercase for bulk selection
            
            expect(callback).toHaveBeenCalledWith(uiMock.gameState, list, 0, true);
        });

        test('should handle list-based nav', () => {
            const callback = jest.fn();
            const list = ['Option 1', 'Option 2', 'Option 3'];
            eventHandler.startListBasedInput(list, 'Choose an option', callback);

            eventHandler.handleListBasedInput({ key: 'ArrowDown' });

            expect(uiPaneList.setList).toHaveBeenCalled();
            expect(callback).not.toHaveBeenCalled();
        });

        test('should handle list-based cancellation', () => {
            const callback = jest.fn();
            const list = ['Option 1', 'Option 2', 'Option 3'];
            eventHandler.startListBasedInput(list, 'Choose an option', callback);

            eventHandler.handleListBasedInput({ key: 'Escape' });

            expect(uiPaneInfo.setInfo).toHaveBeenCalledWith('Previous Info');
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('UIPaneMainEventHandler - two-stage input', () => {
        test('should start and stop two-stage input mode', () => {
            const callback = jest.fn();
            const validator = jest.fn(() => true);
            
            eventHandler.startTwoStageInput('Choose direction', validator, callback);

            expect(eventHandler.inputMode).toBe('TWO_STAGE_INPUT');
            expect(uiPaneInfo.setInfo).toHaveBeenCalledWith('Choose direction<br><br>ESC to cancel');

            eventHandler.stopTwoStageInput();

            expect(eventHandler.inputMode).toBe(null);
            expect(uiPaneInfo.setInfo).toHaveBeenCalledWith('Previous Info');
        });

        test('should handle two-stage input secondary input', () => {
            const callback = jest.fn();
            const validator = jest.fn(() => true);            
            eventHandler.startTwoStageInput('Choose direction', validator, callback);

            eventHandler.handleTwoStageInput({ key: 'ArrowUp' });

            expect(callback).toHaveBeenCalledWith(uiMock.gameState, 'ArrowUp');
            expect(validator).toHaveBeenCalledWith(uiMock.gameState, 'ArrowUp');
            expect(uiPaneInfo.setInfo).toHaveBeenCalledWith('Previous Info');
            expect(eventHandler.inputMode).toBe(null);
        });
 
        test('should handle two-stage input cancellation', () => {
            const callback = jest.fn();
            const validator = jest.fn(() => true);            
            eventHandler.startTwoStageInput('Choose direction', validator, callback);

            eventHandler.handleTwoStageInput({ key: 'Escape' });
            expect(eventHandler.inputMode).toBe(null);
            expect(callback).not.toHaveBeenCalled();
            expect(validator).not.toHaveBeenCalled();
            expect(uiPaneInfo.setInfo).toHaveBeenCalledWith('Previous Info');
        });
  
    });
});