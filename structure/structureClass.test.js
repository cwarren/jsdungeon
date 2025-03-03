import { Structure } from './structureClass.js';
import { GAME_STATE } from '../gameStateClass.js';
import { WorldLevelSpecification } from '../world/worldLevelSpecificationClass.js';
import { devTrace, generateId } from '../util.js';
jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
    rollDice: jest.requireActual('../util.js').rollDice,
    valueCalc: jest.requireActual('../util.js').valueCalc,
    generateId: jest.requireActual('../util.js').generateId,
}));

const WORLD_LEVEL_SPECS_FOR_TESTING= [
    WorldLevelSpecification.generateWorldLevelSpec({type: 'EMPTY', width: 10, height: 10}),
  ];
  
describe('Structure', () => {
    let structure;

    beforeEach(() => {
        GAME_STATE.reset();
        GAME_STATE.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
        structure = new Structure(GAME_STATE.world[0], 5, 5, 0, 'wall', '#', '#fff');
    });

    test('should create a structure with specified properties', () => {
        expect(structure.id.length).toBeGreaterThan(1);
        expect(structure.worldLevel).toBe(GAME_STATE.world[0]);
        expect(structure.x).toBe(5);
        expect(structure.y).toBe(5);
        expect(structure.z).toBe(0);
        expect(structure.type).toBe('wall');
        expect(structure.displaySymbol).toBe('#');
        expect(structure.displayColor).toBe('#fff');

        expect(GAME_STATE.structureRepo.get(structure.id)).toBe(structure);
    });

    test('should create a structure with given id', () => {
        const s = new Structure(GAME_STATE.world[0], 5, 5, 0, 'wall', '#', '#fff', 'foo');
        expect(s.id).toEqual('foo');
    });

    test('should return the correct cell from getCell', () => {
        const cell = structure.getCell();
        expect(cell).toEqual(GAME_STATE.world[0].grid[5][5]);
    });
});