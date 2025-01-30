import { findCellOfTerrainNearPlace, getRandomCellOfTerrainInGrid, findEmptyCellTerrainNearPlace, getRandomEmptyCellOfTerrainInGrid, determineCellViewability, applyCellularAutomataSmoothing } from './gridUtils';
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

describe('determineCellViewability', () => {
    let worldLevel;

    beforeEach(() => {
        worldLevel = {
            levelNumber: 1,
            levelWidth: 10,
            levelHeight: 10,
        };
        worldLevel.grid = Array.from({ length: 10 }, (_, x) =>
            Array.from({ length: 10 }, (_, y) => {
                const cell = new GridCell('WALL');
                cell.setPosition(x, y, 1);
                cell.setWorldLevel(worldLevel);
                return cell;
            })
        );
    });

    test('should determine if a cell is viewable', () => {
        worldLevel.grid[5][5].isOpaque = false;
        determineCellViewability(worldLevel.grid);
        expect(worldLevel.grid[5][5].isViewable).toBe(true);
    });

    test('should determine if a cell is not viewable', () => {
        worldLevel.grid[5][5].isOpaque = true;
        worldLevel.grid[4][5].isOpaque = true;
        worldLevel.grid[6][5].isOpaque = true;
        worldLevel.grid[5][4].isOpaque = true;
        worldLevel.grid[5][6].isOpaque = true;
        determineCellViewability(worldLevel.grid);
        expect(worldLevel.grid[5][5].isViewable).toBe(false);
    });

    test('should determine if a cell is viewable due to adjacent non-opaque cell', () => {
        worldLevel.grid[5][5].isOpaque = true;
        worldLevel.grid[4][5].isOpaque = false;
        determineCellViewability(worldLevel.grid);
        expect(worldLevel.grid[5][5].isViewable).toBe(true);
    });
});

describe('applyCellularAutomataSmoothing', () => {
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

    test('should smooth the grid using cellular automata', () => {
        const smoothedGrid = applyCellularAutomataSmoothing(grid, 'WALL');
        expect(smoothedGrid).toBeDefined();
        expect(smoothedGrid.length).toBe(10);
        expect(smoothedGrid[0].length).toBe(10);
    });

    test('should convert cells to FLOOR if they have fewer than 5 WALL neighbors', () => {
        grid[1][1].terrain = 'WALL';
        grid[1][2].terrain = 'FLOOR';
        grid[2][1].terrain = 'FLOOR';
        grid[2][2].terrain = 'FLOOR';
        grid[0][1].terrain = 'FLOOR';
        const smoothedGrid = applyCellularAutomataSmoothing(grid, 'WALL');
        expect(smoothedGrid[1][1].terrain).toBe('FLOOR');
    });

    test('should keep cells as WALL if they have 5 or more WALL neighbors', () => {
        grid[1][1].terrain = 'WALL';
        grid[1][2].terrain = 'WALL';
        grid[2][1].terrain = 'WALL';
        grid[2][2].terrain = 'WALL';
        grid[0][1].terrain = 'WALL';
        const smoothedGrid = applyCellularAutomataSmoothing(grid, 'WALL');
        expect(smoothedGrid[1][1].terrain).toBe('WALL');
    });
});