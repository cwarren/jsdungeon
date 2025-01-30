import { findCellOfTerrainNearPlace, getRandomCellOfTerrainInGrid, findEmptyCellTerrainNearPlace, getRandomEmptyCellOfTerrainInGrid, determineCellViewability, applyCellularAutomataSmoothing, computeBresenhamLine, determineCheapestMovementPath } from './gridUtils';
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

describe('computeBresenhamLine', () => {
    test('should compute a straight horizontal line', () => {
        const result = computeBresenhamLine(0, 0, 5, 0);
        expect(result).toEqual([
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 0],
            [5, 0]
        ]);
    });

    test('should compute a straight vertical line', () => {
        const result = computeBresenhamLine(0, 0, 0, 5);
        expect(result).toEqual([
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3],
            [0, 4],
            [0, 5]
        ]);
    });

    test('should compute a diagonal line', () => {
        const result = computeBresenhamLine(0, 0, 5, 5);
        expect(result).toEqual([
            [0, 0],
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
            [5, 5]
        ]);
    });

    test('should compute a line with a steep slope', () => {
        const result = computeBresenhamLine(0, 0, 2, 5);
        expect(result).toEqual([
            [0, 0],
            [0, 1],
            [1, 2],
            [1, 3],
            [2, 4],
            [2, 5]
        ]);
    });
});

describe('determineCheapestMovementPath', () => {
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
                cell.isTraversible = true;
                cell.entryMovementCost = 1;
                return cell;
            })
        );
    });

    test('should find the cheapest path between two cells', () => {
        const startCell = worldLevel.grid[0][0];
        const endCell = worldLevel.grid[9][9];
        const path = determineCheapestMovementPath(startCell, endCell, worldLevel);
        expect(path.length).toBeGreaterThan(0);
        expect(path[0]).toBe(startCell);
        expect(path[path.length - 1]).toBe(endCell);
    });

    test('should return an empty path if the end cell is not traversible', () => {
        const startCell = worldLevel.grid[0][0];
        const endCell = worldLevel.grid[9][9];
        endCell.isTraversible = false;
        const path = determineCheapestMovementPath(startCell, endCell, worldLevel);
        expect(path).toEqual([]);
    });

    test('should find the cheapest path avoiding non-traversible cells', () => {
        const startCell = worldLevel.grid[0][0];
        const endCell = worldLevel.grid[9][9];
        worldLevel.grid[5][5].isTraversible = false;
        const path = determineCheapestMovementPath(startCell, endCell, worldLevel);
        expect(path.length).toBeGreaterThan(0);
        expect(path[0]).toBe(startCell);
        expect(path[path.length - 1]).toBe(endCell);
        expect(path).not.toContain(worldLevel.grid[5][5]);
    });
});