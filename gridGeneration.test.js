import {
    generateGrid_empty,
    generateGrid_random,
    generateGrid_caves,
    generateGrid_caves_shattered,
    generateGrid_caves_large,
    generateGrid_caves_huge,
    generateGrid_burrow,
    generateGrid_nest,
    generateGrid_roomsAndCorridors_random,
    generateGrid_roomsAndCorridors_subdivide,
    generateGrid_town,
    generateGrid_puddles,
    setWorldLevelForGridCells
} from './gridGeneration.js';

import { GridCell } from './gridCellClass.js';

import { constrainValue, devTrace } from './util.js';
jest.mock('./util.js', () => ({
    devTrace: jest.fn(),
    constrainValue: jest.requireActual('./util.js').constrainValue,
}));

describe('Grid Generation - Integration Tests', () => {
    const testWidth = 20;
    const testHeight = 15;

    function basicValidateGrid(grid, width, height) {
        expect(grid.length).toBe(width);
        expect(grid[0].length).toBe(height);
        expect(grid.flat().every(cell => cell instanceof GridCell)).toBe(true);
    }

    test('generateGrid_empty creates a fully FLOOR grid', () => {
        const grid = generateGrid_empty(testWidth, testHeight);
        basicValidateGrid(grid, testWidth, testHeight);
        grid.forEach(col => col.forEach(cell => expect(cell.terrain).toBe("FLOOR")));
    });

    test('generateGrid_random creates a grid with mixed terrain', () => {
        const grid = generateGrid_random(testWidth, testHeight);
        basicValidateGrid(grid, testWidth, testHeight);
        const uniqueTerrains = new Set(grid.flat().map(cell => cell.terrain));
        expect(uniqueTerrains.size).toBeGreaterThan(1); // Ensures terrain variation
    });

    test('generateGrid_caves creates a cave-like structure', () => {
        const grid = generateGrid_caves(testWidth, testHeight);
        basicValidateGrid(grid, testWidth, testHeight);
        expect(grid.flat().some(cell => cell.terrain === "WALL")).toBe(true);
        expect(grid.flat().some(cell => cell.terrain === "FLOOR")).toBe(true);
    });

    test('generateGrid_caves_shattered creates a loosely structured cave', () => {
        const grid = generateGrid_caves_shattered(testWidth, testHeight);
        basicValidateGrid(grid, testWidth, testHeight);
        expect(grid.flat().some(cell => cell.terrain === "WALL")).toBe(true);
        expect(grid.flat().some(cell => cell.terrain === "FLOOR")).toBe(true);
    });

    test('generateGrid_caves_large creates a more open cave system', () => {
        const grid = generateGrid_caves_large(testWidth, testHeight);
        basicValidateGrid(grid, testWidth, testHeight);
        expect(grid.flat().some(cell => cell.terrain === "WALL")).toBe(true);
        expect(grid.flat().some(cell => cell.terrain === "FLOOR")).toBe(true);
    });

    test('generateGrid_caves_huge creates very open cave systems', () => {
        const grid = generateGrid_caves_huge(testWidth, testHeight);
        basicValidateGrid(grid, testWidth, testHeight);
        expect(grid.flat().some(cell => cell.terrain === "WALL")).toBe(true);
        expect(grid.flat().some(cell => cell.terrain === "FLOOR")).toBe(true);
    });

    test('generateGrid_burrow creates a winding, narrow cave system', () => {
        const grid = generateGrid_burrow(testWidth, testHeight);
        basicValidateGrid(grid, testWidth, testHeight);
        expect(grid.flat().some(cell => cell.terrain === "FLOOR")).toBe(true);
        expect(grid.flat().some(cell => cell.terrain === "WALL")).toBe(true);
        expect(grid.flat().some(cell => cell.terrain === "FLOOR")).toBe(true);
    });

    test('generateGrid_nest creates tunnels with some structure', () => {
        const grid = generateGrid_nest(testWidth, testHeight);
        basicValidateGrid(grid, testWidth, testHeight);
        expect(grid.flat().some(cell => cell.terrain === "WALL")).toBe(true);
        expect(grid.flat().some(cell => cell.terrain === "FLOOR")).toBe(true);
    });

    test('generateGrid_roomsAndCorridors_random creates multiple rooms', () => {
        const grid = generateGrid_roomsAndCorridors_random(testWidth, testHeight);
        basicValidateGrid(grid, testWidth, testHeight);
        expect(grid.flat().some(cell => cell.terrain === "WALL")).toBe(true);
        expect(grid.flat().some(cell => cell.terrain === "FLOOR")).toBe(true);
    });

    test('generateGrid_roomsAndCorridors_subdivide creates connected room networks', () => {
        const grid = generateGrid_roomsAndCorridors_subdivide(testWidth, testHeight);
        basicValidateGrid(grid, testWidth, testHeight);
        expect(grid.flat().some(cell => cell.terrain === "WALL")).toBe(true);
        expect(grid.flat().some(cell => cell.terrain === "FLOOR")).toBe(true);
    });

    test('generateGrid_town creates buildings with doors', () => {
        const grid = generateGrid_town(testWidth, testHeight);
        basicValidateGrid(grid, testWidth, testHeight);
        expect(grid.flat().some(cell => cell.terrain === "WALL")).toBe(true);
        expect(grid.flat().some(cell => cell.terrain === "FLOOR")).toBe(true);
    });

    test('generateGrid_puddles creates scattered water terrain', () => {
        const grid = generateGrid_puddles(testWidth, testHeight);
        basicValidateGrid(grid, testWidth, testHeight);
        expect(grid.flat().some(cell => cell.terrain === "WATER_SHALLOW")).toBe(true);
        expect(grid.flat().some(cell => cell.terrain === "WALL")).toBe(false);
        expect(grid.flat().some(cell => cell.terrain === "FLOOR")).toBe(true);
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