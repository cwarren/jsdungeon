import { Structure } from './structureClass';
import { gameState } from './gameStateClass';

describe('Structure', () => {
    let structure;

    beforeEach(() => {
        gameState.reset();
        gameState.initialize([[10, 10, 'EMPTY']]);
        structure = new Structure(gameState.world[0], 5, 5, 0, 'wall', '#', '#fff');
    });

    test('should create a structure with specified properties', () => {
        expect(structure.worldLevel).toBe(gameState.world[0]);
        expect(structure.x).toBe(5);
        expect(structure.y).toBe(5);
        expect(structure.z).toBe(0);
        expect(structure.type).toBe('wall');
        expect(structure.displaySymbol).toBe('#');
        expect(structure.displayColor).toBe('#fff');
    });

    test('should return the correct cell from getCell', () => {
        const cell = structure.getCell();
        expect(cell).toEqual(gameState.world[0].grid[5][5]);
    });
});