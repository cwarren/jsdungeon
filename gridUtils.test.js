import { findCellOfTerrainNearPlace, getRandomCellOfTerrainInGrid, findEmptyCellTerrainNearPlace, getRandomEmptyCellOfTerrainInGrid } from './gridUtils';
import { GridCell } from './gridCellClass';

describe('findCellOfTerrainNearPlace', () => {
    let grid;

    beforeEach(() => {
        grid = Array.from({ length: 10 }, (_, x) =>
            Array.from({ length: 10 }, (_, y) => {
                const cell = new GridCell('FLOOR');
                cell.setPosition(x, y, 1);
                return cell;
            })
        );
    });

    test('should find a cell of specified terrain near a place', () => {
        grid[6][5].terrain = 'WALL';
        const result = findCellOfTerrainNearPlace('WALL', 5, 5, grid);
        expect(result).toBe(grid[6][5]);
    });

    test('should return null if no cell of specified terrain is found near a place', () => {
        const result = findCellOfTerrainNearPlace('WALL', 5, 5, grid);
        expect(result).toBeNull();
    });
});

describe('getRandomCellOfTerrainInGrid', () => {
    let grid;

    beforeEach(() => {
        grid = Array.from({ length: 10 }, (_, x) =>
            Array.from({ length: 10 }, (_, y) => {
                const cell = new GridCell('FLOOR');
                cell.setPosition(x, y, 1);
                return cell;
            })
        );
    });

    test('should return a random cell of specified terrain', () => {
        grid[6][5].terrain = 'WALL';
        const result = getRandomCellOfTerrainInGrid('WALL', grid);
        expect(result.terrain).toBe('WALL');
    });

    test('should return null if no cell of specified terrain is found in the grid', () => {
        const result = getRandomCellOfTerrainInGrid('WALL', grid);
        expect(result).toBeNull();
    });
});

describe('findEmptyCellTerrainNearPlace', () => {
    let grid;

    beforeEach(() => {
        grid = Array.from({ length: 10 }, (_, x) =>
            Array.from({ length: 10 }, (_, y) => {
                const cell = new GridCell('FLOOR');
                cell.setPosition(x, y, 1);
                return cell;
            })
        );
    });

    test('should find an empty cell of specified terrain near a place', () => {
        grid[6][5].terrain = 'WALL';
        grid[6][5].entity = null;
        grid[6][5].structure = null;
        const result = findEmptyCellTerrainNearPlace('WALL', 5, 5, grid);
        expect(result).toBe(grid[6][5]);
    });

    test('should return null if no empty cell of specified terrain is found near a place', () => {
        grid[6][5].terrain = 'WALL';
        grid[6][5].entity = { type: 'entity' };
        const result = findEmptyCellTerrainNearPlace('WALL', 5, 5, grid);
        expect(result).toBeNull();
    });
});

describe('getRandomEmptyCellOfTerrainInGrid', () => {
    let grid;

    beforeEach(() => {
        grid = Array.from({ length: 10 }, (_, x) =>
            Array.from({ length: 10 }, (_, y) => {
                const cell = new GridCell('FLOOR');
                cell.setPosition(x, y, 1);
                return cell;
            })
        );
    });

    test('should return a random empty cell of specified terrain', () => {
        grid[6][5].terrain = 'WALL';
        grid[6][5].entity = null;
        grid[6][5].structure = null;
        const result = getRandomEmptyCellOfTerrainInGrid('WALL', grid);
        expect(result.terrain).toBe('WALL');
        expect(result.entity).toBeNull();
        expect(result.structure).toBeNull();
    });

    test('should return null if no empty cell of specified terrain is found in the grid', () => {
        grid.forEach(row => row.forEach(cell => {
            cell.terrain = 'WALL';
            cell.entity = { type: 'entity' };
        }));
        const result = getRandomEmptyCellOfTerrainInGrid('WALL', grid);
        expect(result).toBeNull();
    });
});