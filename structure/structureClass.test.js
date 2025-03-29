import { Structure } from './structureClass.js';
import { GameState } from '../gameStateClass.js';
import { WorldLevelSpecification } from '../world/worldLevelSpecificationClass.js';
import { devTrace, generateId } from '../util.js';
jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
    rollDice: jest.requireActual('../util.js').rollDice,
    valueCalc: jest.requireActual('../util.js').valueCalc,
    generateId: jest.requireActual('../util.js').generateId,
    idOf: jest.requireActual('../util.js').idOf,
}));

const WORLD_LEVEL_SPECS_FOR_TESTING= [
    WorldLevelSpecification.generateWorldLevelSpec({type: 'EMPTY', width: 10, height: 10, populationParams: {entityPopulation: 'NONE', itemPopulation: 'NONE'},}),
  ];
  
describe('Structure', () => {
    let structure;
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
        gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
        structure = new Structure(gameState.world[0], 5, 5, 0, 'wall', '#', '#fff');
    });

    test('should create a structure with specified properties', () => {
        expect(structure.id.length).toBeGreaterThan(1);
        expect(structure.worldLevel).toBe(gameState.world[0]);
        expect(structure.x).toBe(5);
        expect(structure.y).toBe(5);
        expect(structure.z).toBe(0);
        expect(structure.type).toBe('wall');
        expect(structure.displaySymbol).toBe('#');
        expect(structure.displayColor).toBe('#fff');

        expect(gameState.structureRepo.get(structure.id)).toBe(structure);
    });

    test('should create a structure with given id', () => {
        const s = new Structure(gameState.world[0], 5, 5, 0, 'wall', '#', '#fff', 'foo');
        expect(s.id).toEqual('foo');
    });

    test('should return the correct cell from getCell', () => {
        const cell = structure.getCell();
        expect(cell).toEqual(gameState.world[0].grid[5][5]);
    });

    test('should return correct serialization object from forSerializing', () => {
        const serializedData = structure.forSerializing();
        expect(serializedData).toEqual({
            id: structure.id,
            x: 5,
            y: 5,
            z: 0,
            type: 'wall',
            displaySymbol: '#',
            displayColor: '#fff',
        });
    });

    test('should serialize to a JSON string', () => {
        const jsonString = structure.serialize();
        const parsed = JSON.parse(jsonString);

        expect(parsed).toEqual({
            id: structure.id,
            x: 5,
            y: 5,
            z: 0,
            type: 'wall',
            displaySymbol: '#',
            displayColor: '#fff',
        });
    });

    test('should correctly deserialize from JSON data', () => {
        const serializedData = structure.serialize();
        const parsedData = JSON.parse(serializedData);

        const deserializedStructure = Structure.deserialize(parsedData, gameState.world[0]);

        expect(deserializedStructure).toBeInstanceOf(Structure);
        expect(deserializedStructure.id).toBe(structure.id);
        expect(deserializedStructure.worldLevel).toBe(gameState.world[0]);
        expect(deserializedStructure.x).toBe(5);
        expect(deserializedStructure.y).toBe(5);
        expect(deserializedStructure.z).toBe(0);
        expect(deserializedStructure.type).toBe('wall');
        expect(deserializedStructure.displaySymbol).toBe('#');
        expect(deserializedStructure.displayColor).toBe('#fff');

        expect(gameState.structureRepo.get(deserializedStructure.id)).toBe(deserializedStructure);
    });
});