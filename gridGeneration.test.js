import { generateGrid_empty, setWorldLevelForGridCells } from './gridGeneration';
import { GridCell } from './gridCellClass';

describe('generateGrid_empty', () => {
    test('should generate an empty grid with specified dimensions', () => {
        const width = 10;
        const height = 10;
        const grid = generateGrid_empty(width, height);
        expect(grid).toBeDefined();
        expect(grid.length).toBe(width);
        expect(grid[0].length).toBe(height);
        grid.forEach(col => {
            col.forEach(cell => {
                expect(cell).toBeInstanceOf(GridCell);
                expect(cell.terrain).toBe('FLOOR');
            });
        });
    });

    test('should generate an empty grid with cells of the given type', () => {
        const width = 5;
        const height = 5;
        const grid = generateGrid_empty(width, height, 'WALL');
        expect(grid).toBeDefined();
        expect(grid.length).toBe(width);
        expect(grid[0].length).toBe(height);
        grid.forEach(col => {
            col.forEach(cell => {
                expect(cell).toBeInstanceOf(GridCell);
                expect(cell.terrain).toBe('WALL');
            });
        });
    });

    test('should generate an empty grid with zero dimensions', () => {
        const width = 0;
        const height = 0;
        const grid = generateGrid_empty(width, height);
        expect(grid).toBeDefined();
        expect(grid.length).toBe(width);
    });
});

describe('setWorldLevelForGridCells', () => {
    let grid;
    let worldLevel;

    beforeEach(() => {
        worldLevel = {
            levelNumber: 1,
            levelWidth: 10,
            levelHeight: 10,
        };
        grid = Array.from({ length: 10 }, (_, x) =>
            Array.from({ length: 10 }, (_, y) => {
                const cell = new GridCell('FLOOR');
                cell.setPosition(x, y, 1);
                return cell;
            })
        );
    });

    test('should set the world level for all grid cells', () => {
        setWorldLevelForGridCells(worldLevel, grid);
        grid.forEach(col => {
            col.forEach(cell => {
                expect(cell.worldLevel).toBe(worldLevel);
            });
        });
    });

    test('should handle an empty grid', () => {
        const emptyGrid = [];
        setWorldLevelForGridCells(worldLevel, emptyGrid);
        expect(emptyGrid.length).toBe(0);
    });
});