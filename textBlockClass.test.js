import { TextBlock } from './textBlockClass';
import { devTrace } from './util.js';
jest.mock('./util.js', () => ({
    devTrace: jest.fn(),
    constrainValue: jest.requireActual('./util.js').constrainValue,
}));

describe('TextBlock', () => {
    let textBlock;

    beforeEach(() => {
        const baseText = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5";
        textBlock = new TextBlock(baseText);
    });

    test('should initialize with base text', () => {
        expect(textBlock.baseText).toBe("Line 1\nLine 2\nLine 3\nLine 4\nLine 5");
        expect(textBlock.textRows).toEqual(["Line 1", "Line 2", "Line 3", "Line 4", "Line 5"]);
        expect(textBlock.rowCursor).toBe(0);
    });

    test('should return display text', () => {
        expect(textBlock.getDisplayText()).toBe("Line 1\nLine 2\nLine 3\nLine 4\nLine 5");
    });

    test('should return display text rows', () => {
        expect(textBlock.getDisplayTextRows()).toEqual(["Line 1", "Line 2", "Line 3", "Line 4", "Line 5"]);
    });

    test('scrollTo should set the cursor to the given value, bounded by 0 and the length of textRows', () => {
        textBlock.scrollTo(3);
        expect(textBlock.rowCursor).toBe(3);
        expect(textBlock.getDisplayTextRows()).toEqual(["Line 4", "Line 5"]);

        textBlock.scrollTo(-1);
        expect(textBlock.rowCursor).toBe(0);
        expect(textBlock.getDisplayTextRows()).toEqual(["Line 1", "Line 2", "Line 3", "Line 4", "Line 5"]);

        textBlock.scrollTo(10);
        expect(textBlock.rowCursor).toBe(5);
        expect(textBlock.getDisplayTextRows()).toEqual([]);
    });

    test('should scroll up', () => {
        textBlock.scrollTo(3);
        textBlock.scrollUp(1);
        expect(textBlock.rowCursor).toBe(2);
        expect(textBlock.getDisplayTextRows()).toEqual(["Line 3", "Line 4", "Line 5"]);
    });

    test('should scroll down', () => {
        textBlock.scrollDown(2);
        expect(textBlock.rowCursor).toBe(2);
        expect(textBlock.getDisplayTextRows()).toEqual(["Line 3", "Line 4", "Line 5"]);
    });

    test('should not scroll up past the first row', () => {
        textBlock.scrollUp(1);
        expect(textBlock.rowCursor).toBe(0);
        expect(textBlock.getDisplayTextRows()).toEqual(["Line 1", "Line 2", "Line 3", "Line 4", "Line 5"]);
    });

    test('should not scroll down past the last row', () => {
        textBlock.scrollDown(10);
        expect(textBlock.rowCursor).toBe(5);
        expect(textBlock.getDisplayTextRows()).toEqual([]);
    });


});