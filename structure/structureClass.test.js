import { Structure } from './structureClass.js';
import { gameState } from '../gameStateClass.js';
import { WorldLevelSpecification } from '../world/worldLevelSpecificationClass.js';
import { devTrace } from '../util.js';
jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
    rollDice: jest.requireActual('../util.js').rollDice,
    valueCalc: jest.requireActual('../util.js').valueCalc,
}));

const WORLD_LEVEL_SPECS_FOR_TESTING= [
    WorldLevelSpecification.generateWorldLevelSpec({type: 'EMPTY', width: 10, height: 10}),
  ];
  
describe('Structure', () => {
    let structure;

    beforeEach(() => {
        gameState.reset();
        gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
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