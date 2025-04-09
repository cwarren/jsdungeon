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
});