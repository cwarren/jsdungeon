import { Stairs } from './stairsClass.js';
import { Structure } from './structureClass.js';
import { devTrace } from '../util.js';
import { Repository } from '../repositoryClass.js';
jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
    generateId: jest.requireActual('../util.js').generateId,
}));

describe('Stairs', () => {
  let stairs;
  const worldLevel = {
    gs: 'test',
    gameState: {structureRepo: new Repository('stru')}
  };

  beforeEach(() => {
    stairs = new Stairs(worldLevel, 1, 2, 3, 'STAIRS_DOWN', '>', '#fff', null);
  });

  test('should initialize with correct values', () => {
    expect(stairs.id.length).toBeGreaterThan(1);
    expect(stairs.worldLevel).toBe(worldLevel);
    expect(stairs.x).toBe(1);
    expect(stairs.y).toBe(2);
    expect(stairs.z).toBe(3);
    expect(stairs.type).toBe('STAIRS_DOWN');
    expect(stairs.displaySymbol).toBe('>');
    expect(stairs.displayColor).toBe('#fff');
    expect(stairs.connectsTo).toBeNull();
  });

  test('should extend Structure class', () => {
    expect(stairs).toBeInstanceOf(Structure);
  });
});