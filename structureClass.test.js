import { Structure } from './structureClass';
import { gameState } from './gameStateClass';

describe('Structure', () => {
    let structure;

    beforeEach(() => {
        gameState.world = [
            {
                grid: Array.from({ length: 10 }, (_, x) =>
                    Array.from({ length: 10 }, (_, y) => ({
                        x,
                        y,
                        z: 0,
                        terrain: 'FLOOR'
                    }))
                )
            }
        ];
        structure = new Structure(5, 5, 0, 'wall', '#', '#fff');
    });

    test('should create a structure with specified properties', () => {
        expect(structure.x).toBe(5);
        expect(structure.y).toBe(5);
        expect(structure.z).toBe(0);
        expect(structure.type).toBe('wall');
        expect(structure.displaySymbol).toBe('#');
        expect(structure.displayColor).toBe('#fff');
    });

    test('should return the correct cell from getCell', () => {
        const cell = structure.getCell();
        expect(cell).toEqual({ x: 5, y: 5, z: 0, terrain: 'FLOOR' });
    });
});