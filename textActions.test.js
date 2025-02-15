import { TextBlock } from './textBlockClass.js';
import { textActionsMap } from './textActions.js';
import { uiPaneMain } from './ui/ui.js';
import { devTrace } from './util.js';
jest.mock('./util.js', () => ({
    devTrace: jest.fn(),
    constrainValue: jest.requireActual('./util.js').constrainValue,
}));

jest.mock('./ui/ui.js', () => ({
    uiPaneMain: {
        initializeCanvasClickListeners: jest.fn(),
        initializeEventListeners: jest.fn(),
        getCurrentHelpTextBlock: jest.fn(),
    }
}));

describe('textActions', () => {
    let textBlock;

    beforeEach(() => {
        const baseText = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10\nLine 11\nLine 12\nLine 13\nLine 14\nLine 15\nLine 16\nLine 17\nLine 18\nLine 19";
        textBlock = new TextBlock(baseText);
        uiPaneMain.getCurrentHelpTextBlock.mockReturnValue(textBlock);
    });

    test('LINE_UP should move one line up', () => {
        textBlock.scrollDown(3);
        textActionsMap.LINE_UP.action(textBlock);
        expect(textBlock.rowCursor).toBe(2);
        expect(textBlock.getDisplayTextRows()).toEqual(["Line 3", "Line 4", "Line 5", "Line 6", "Line 7", "Line 8", "Line 9", "Line 10", "Line 11", "Line 12", "Line 13", "Line 14", "Line 15", "Line 16", "Line 17", "Line 18", "Line 19",]);
    });

    test('LINE_DOWN should move one line down', () => {
        textActionsMap.LINE_DOWN.action(textBlock);
        expect(textBlock.rowCursor).toBe(1);
        expect(textBlock.getDisplayTextRows()).toEqual(["Line 2", "Line 3", "Line 4", "Line 5", "Line 6", "Line 7", "Line 8", "Line 9", "Line 10", "Line 11", "Line 12", "Line 13", "Line 14", "Line 15", "Line 16", "Line 17", "Line 18", "Line 19",]);
    });

    test('SCROLL_UP should move several lines up', () => {
        textBlock.scrollDown(15);
        textActionsMap.SCROLL_UP.action(textBlock);
        expect(textBlock.rowCursor).toBe(3);
        expect(textBlock.getDisplayTextRows()).toEqual(["Line 4", "Line 5", "Line 6", "Line 7", "Line 8", "Line 9", "Line 10", "Line 11", "Line 12", "Line 13", "Line 14", "Line 15", "Line 16", "Line 17", "Line 18", "Line 19",]);
    });

    test('SCROLL_DOWN should move several lines down', () => {
        textActionsMap.SCROLL_DOWN.action(textBlock);
        expect(textBlock.rowCursor).toBe(12);
        expect(textBlock.getDisplayTextRows()).toEqual(["Line 13", "Line 14", "Line 15", "Line 16", "Line 17", "Line 18", "Line 19"]);
    });
});