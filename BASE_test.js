import { GameState } from './gameStateClass.js';
import { WorldLevelSpecification } from './world/worldLevelSpecificationClass.js';

const WORLD_LEVEL_SPECS_FOR_TESTING = [
    WorldLevelSpecification.generateWorldLevelSpec({ type: 'EMPTY', width: 10, height: 10, populationParams: {entityPopulation: 'NONE', itemPopulation: 'NONE'}, } ),
];

jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
    rollDice: jest.fn(() => 100),
    valueCalc: jest.requireActual('../util.js').valueCalc,
    formatNumberForMessage: jest.fn(() => '10'),
    generateId: jest.requireActual('../util.js').generateId,
    idOf: jest.requireActual('../util.js').idOf,
}));

jest.mock('../ui/ui.js', () => ({
    uiPaneMessages: { addMessage: jest.fn() },
}));

describe('ClassName', () => {
    let avatar;
    let gameState;
  
    beforeEach(() => {
      gameState = new GameState();
      gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
    });
  
    test('should do something', () => {
      expect(true).toBe(true);
    });

});