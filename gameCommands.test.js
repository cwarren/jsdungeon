import { executeGameCommand, getLookupKey, getActionKey, executeUIAction, executeGameAction, keyBinding, gameActionsMap } from './gameCommands';
import { uiPaneMain, getCurrentUIState } from './ui.js';
import { gameState } from './gameStateClass.js';
import { uiActionsMap } from './uiActions.js';
import { devTrace } from './util.js';
jest.mock('./util.js', () => ({
    devTrace: jest.fn(),
}));

jest.mock('./ui.js', () => ({
    getCurrentUIState: jest.fn(),
    uiPaneMain: {
        getCurrentUIState: jest.fn(),
    }
}));

jest.mock('./gameStateClass.js', () => ({
    gameState: {
        handlePlayerActionTime: jest.fn(),
        avatar: {
            interruptOngoingActions: jest.fn(),
        }
    },
}));

describe('gameCommands', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        keyBinding['HELP'] = { '?': 'PUSH_HELP' };
    });

    describe('getLookupKey', () => {
        test('should return CTRL-key if ctrlKey is pressed', () => {
            const event = { ctrlKey: true };
            expect(getLookupKey('a', event)).toBe('CTRL-a');
        });

        test('should return key if ctrlKey is not pressed', () => {
            const event = { ctrlKey: false };
            expect(getLookupKey('a', event)).toBe('a');
        });
    });

    describe('getActionKey', () => {
        test('should return action key from keyBinding', () => {
            expect(getActionKey('GAME_PLAY', '8')).toBe('MOVE_U');
        });
    });

    describe('executeUIAction', () => {
        test('should execute UI action if actionKey exists', () => {
            const mockAction = jest.fn();
            uiActionsMap['PUSH_HELP'] = { action: mockAction };
            expect(executeUIAction('PUSH_HELP')).toBe(true);
            expect(mockAction).toHaveBeenCalled();
        });

        test('should return false if actionKey does not exist', () => {
            expect(executeUIAction('NON_EXISTENT_ACTION')).toBe(false);
        });
    });

    describe('executeGameAction', () => {
        test('should execute game action and handle player action time', () => {
            const mockAction = jest.fn().mockReturnValue(10);
            const actionDef = { name: 'Move Up', action: mockAction };
            const key = 'w';
            const event = { ctrlKey: false };

            executeGameAction(actionDef, key, event);

            expect(mockAction).toHaveBeenCalledWith(key, event);
            expect(gameState.handlePlayerActionTime).toHaveBeenCalledWith(10);
        });
    });

    describe('executeGameCommand', () => {
        test('should execute UI control action', () => {
            const mockAction = jest.fn();
            uiActionsMap['PUSH_HELP'] = { name: "Help", description: "Details about the commands available", action: mockAction };
            const key = '?';
            const event = { ctrlKey: false };

            uiPaneMain.getCurrentUIState.mockReturnValue('HELP');
            keyBinding['HELP'] = { '?': 'PUSH_HELP' };

            executeGameCommand(key, event);

            expect(mockAction).toHaveBeenCalled();
            expect(gameState.avatar.interruptOngoingActions).toHaveBeenCalled();
        });

        test('should execute gameplay action and handle player action time', () => {
            const mockAction = jest.fn().mockReturnValue(10);
            gameActionsMap['MOVE_UP'] = { name: 'Move Up', action: mockAction };
            const key = 'w';
            const event = { ctrlKey: false };

            uiPaneMain.getCurrentUIState.mockReturnValue('GAME_PLAY');
            keyBinding['GAME_PLAY'] = { 'w': 'MOVE_UP' };

            executeGameCommand(key, event);

            expect(mockAction).toHaveBeenCalledWith(key, event);
            expect(gameState.handlePlayerActionTime).toHaveBeenCalledWith(10);
        });

        test('should log message if no action is bound for key', () => {
            console.log = jest.fn();
            const key = 'x';
            const event = { ctrlKey: false };

            uiPaneMain.getCurrentUIState.mockReturnValue('GAME_PLAY');
            keyBinding['GAME_PLAY'] = {};

            executeGameCommand(key, event);

            expect(console.log).toHaveBeenCalledWith('No action bound for key: GAME_PLAY x');
        });

        test('should handle ctrl key combination', () => {
            const mockAction = jest.fn();
            uiActionsMap['PUSH_HELP'] = { action: mockAction };
            const key = 'h';
            const event = { ctrlKey: true };

            uiPaneMain.getCurrentUIState.mockReturnValue('HELP');
            keyBinding['HELP'] = { 'CTRL-h': 'PUSH_HELP' };

            executeGameCommand(key, event);

            expect(mockAction).toHaveBeenCalled();
        });
    });
});