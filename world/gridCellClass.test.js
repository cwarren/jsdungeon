import { GridCell } from './gridCellClass';
import { devTrace } from '../util.js';
jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
}));

describe('GridCell', () => {
    let gridCell;
    let worldLevel;

    beforeEach(() => {
        worldLevel = {
            levelNumber: 1,
            levelWidth: 10,
            levelHeight: 10,
        };
        worldLevel.grid = Array.from({ length: 10 }, (_, x) =>
            Array.from({ length: 10 }, (_, y) => {
                const cell = new GridCell('FLOOR');
                cell.setPosition(x, y, 1);
                cell.setWorldLevel(worldLevel);
                return cell;
            })
        );
        gridCell = new GridCell('FLOOR');
        gridCell.setPosition(5, 5, 1);
        gridCell.setWorldLevel(worldLevel);
    });

    test('should set position', () => {
        gridCell.setPosition(3, 4, 2);
        expect(gridCell.x).toBe(3);
        expect(gridCell.y).toBe(4);
        expect(gridCell.z).toBe(2);
    });

    test('should attach to world level', () => {
        gridCell.attatchToWorldLevel(2, 3, worldLevel);
        expect(gridCell.x).toBe(2);
        expect(gridCell.y).toBe(3);
        expect(gridCell.worldLevel).toBe(worldLevel);
        expect(gridCell.z).toBe(worldLevel.levelNumber);
    });

    test('should set world level', () => {
        gridCell.setWorldLevel(worldLevel);
        expect(gridCell.worldLevel).toBe(worldLevel);
        expect(gridCell.z).toBe(worldLevel.levelNumber);
    });

    test('should get adjacent cells', () => {
        const adjacentCells = gridCell.getAdjacentCells();
        expect(adjacentCells.length).toBe(8);
        expect(adjacentCells).toContain(worldLevel.grid[4][4]);
        expect(adjacentCells).toContain(worldLevel.grid[6][6]);
        expect(adjacentCells).toContain(worldLevel.grid[5][4]);
        expect(adjacentCells).toContain(worldLevel.grid[5][6]);
    });

    test('should get delta to other cell', () => {
        const otherCell = new GridCell('FLOOR');
        otherCell.setPosition(7, 8, 1);
        const delta = gridCell.getDeltaToOtherCell(otherCell);
        expect(delta).toEqual({ dx: 2, dy: 3 });
    });

    test('should check if any cell has property of value', () => {
        const cellList = [new GridCell('FLOOR'), new GridCell('WALL')];
        cellList[0].testProperty = 'value1';
        cellList[1].testProperty = 'value2';
        expect(GridCell.anyCellHasPropertyOfValue(cellList, 'testProperty', 'value1')).toBe(true);
        expect(GridCell.anyCellHasPropertyOfValue(cellList, 'testProperty', 'value3')).toBe(false);
    });

    test('should create a detached GridCell', () => {
        const newCell = GridCell.createDetached('WALL');
        expect(newCell).toBeInstanceOf(GridCell);
        expect(newCell.terrain).toBe('WALL');
        expect(newCell.isTraversible).toBe(false);
        expect(newCell.entryMovementCost).toBe(Infinity);
        expect(newCell.isOpaque).toBe(true);
        expect(newCell.color).toBe('#222');
    });

    test('should create a detached GridCell at specific position', () => {
        const newCell = GridCell.createDetachedAt(1, 2, 'WATER_SHALLOW');
        expect(newCell).toBeInstanceOf(GridCell);
        expect(newCell.x).toBe(1);
        expect(newCell.y).toBe(2);
        expect(newCell.terrain).toBe('WATER_SHALLOW');
        expect(newCell.isTraversible).toBe(true);
        expect(newCell.entryMovementCost).toBe(30);
        expect(newCell.isOpaque).toBe(false);
        expect(newCell.color).toBe('#00BFFF');
    });

    test('should create an attached GridCell', () => {
        const newCell = GridCell.createAttached(3, 4, worldLevel, 'WATER_DEEP');
        expect(newCell).toBeInstanceOf(GridCell);
        expect(newCell.x).toBe(3);
        expect(newCell.y).toBe(4);
        expect(newCell.worldLevel).toBe(worldLevel);
        expect(newCell.z).toBe(worldLevel.levelNumber);
        expect(newCell.terrain).toBe('WATER_DEEP');
        expect(newCell.isTraversible).toBe(true);
        expect(newCell.entryMovementCost).toBe(120);
        expect(newCell.isOpaque).toBe(false);
        expect(newCell.color).toBe('#00008B');
    });
});