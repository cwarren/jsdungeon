import { UIPaneMainRendererInventory } from './uiPaneMainRendererInventoryClass.js';
import { UIPaneMainRenderer } from './uiPaneMainRendererClass.js';

// jest.mock('./uiPaneMainRendererClass.js', () => {
//     return {
//         UIPaneMainRenderer: jest.fn().mockImplementation(() => ({
//             draw: jest.fn(),
//         })),
//     };
// });

describe('UIPaneMainRendererInventory', () => {
    let uiMock, canvasMock, inventoryRenderer;

    beforeEach(() => {
        uiMock = {
            gameState: {
                avatar: {
                    inventory: {
                        count: jest.fn(),
                    },
                },
            },
        };
        canvasMock = { getContext: jest.fn() };
        // canvasMock.getContext.mockReturnValue({
        //     fillStyle: null,
        //     font: null,
        //     fillText: jest.fn(),
        // });
        inventoryRenderer = new UIPaneMainRendererInventory(uiMock, canvasMock);
    });

    test('should inherit from UIPaneMainRenderer', () => {
        expect(inventoryRenderer).toBeInstanceOf(UIPaneMainRenderer);
    });

    test('getListItemLabels should return ITEM_LIST_LABELS', () => {
        const labels = inventoryRenderer.getListItemLabels();
        expect(labels).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']);
    });

    test('getListOffset should return the current listOffset', () => {
        inventoryRenderer.listOffset = 5;
        expect(inventoryRenderer.getListOffset()).toBe(5);
    });

    test('scrollDown should increase listOffset but not exceed max offset', () => {
        uiMock.gameState.avatar.inventory.count.mockReturnValue(15);

        // small and fixed list of labels for testing
        inventoryRenderer.getListItemLabels = () => { return ['a', 'b', 'c', 'd', 'e']; };
        inventoryRenderer.listOffset = 9;

        // scroll from 9 to 10
        inventoryRenderer.scrollDown();
        expect(inventoryRenderer.listOffset).toBe(10); 

        // don't scroll past 10 (15 items - 5 labels = max offset of 10)
        inventoryRenderer.scrollDown();
        expect(inventoryRenderer.listOffset).toBe(10); 
    });

    test('scrollUp should decrease listOffset', () => {
        inventoryRenderer.listOffset = 5;
        inventoryRenderer.scrollUp();
        expect(inventoryRenderer.listOffset).toBe(4);
    });

    test('scrollUp should not decrease listOffset if already at 0', () => {
        inventoryRenderer.listOffset = 0;
        inventoryRenderer.scrollUp();
        expect(inventoryRenderer.listOffset).toBe(0);
    });


    test('isValidSelection should return true for valid selection keys', () => {
        uiMock.gameState.avatar.inventory.count.mockReturnValue(10);

        // small and fixed list of labels for testing
        inventoryRenderer.getListItemLabels = () => { return ['a', 'b', 'c', 'd', 'e']; };

        expect(inventoryRenderer.isValidSelection('a')).toBe(true);
        expect(inventoryRenderer.isValidSelection('c')).toBe(true);
        expect(inventoryRenderer.isValidSelection('e')).toBe(true);
    });

    test('isValidSelection should return false for selection key outside inventory count', () => {
        uiMock.gameState.avatar.inventory.count.mockReturnValue(3);

        // small and fixed list of labels for testing
        inventoryRenderer.getListItemLabels = () => { return ['a', 'b', 'c', 'd', 'e']; };

        expect(inventoryRenderer.isValidSelection('a')).toBe(true);
        expect(inventoryRenderer.isValidSelection('c')).toBe(true);
        expect(inventoryRenderer.isValidSelection('e')).toBe(false);
    });

    test('isValidSelection should return false for invalid selection keys', () => {
        uiMock.gameState.avatar.inventory.count.mockReturnValue(5);

        // small and fixed list of labels for testing
        inventoryRenderer.getListItemLabels = () => { return ['a', 'b', 'c', 'd', 'e']; };

        expect(inventoryRenderer.isValidSelection('f')).toBe(false);
        expect(inventoryRenderer.isValidSelection('z')).toBe(false);
        expect(inventoryRenderer.isValidSelection('1')).toBe(false);
    });

    test('isValidSelection should handle empty inventory', () => {
        uiMock.gameState.avatar.inventory.count.mockReturnValue(0);

        // small and fixed list of labels for testing
        inventoryRenderer.getListItemLabels = () => { return ['a', 'b', 'c', 'd', 'e']; };

        expect(inventoryRenderer.isValidSelection('a')).toBe(false);
        expect(inventoryRenderer.isValidSelection('b')).toBe(false);
    });

});