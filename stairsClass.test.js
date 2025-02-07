import { Stairs } from './stairsClass.js';
import { Structure } from './structureClass.js';
import { devTrace } from './util.js';
jest.mock('./util.js', () => ({
    devTrace: jest.fn(),
}));

describe('Stairs', () => {
  let stairs;
  const worldLevel = {gs: 'test'};

  beforeEach(() => {
    stairs = new Stairs(worldLevel, 1, 2, 3, 'STAIRS_DOWN', '>', '#fff', null);
  });

  test('should initialize with correct values', () => {
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