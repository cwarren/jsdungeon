import { Stairs } from './stairsClass.js';
import { Structure } from './structureClass.js';
import { devTrace } from '../util.js';
import { Repository } from '../repositoryClass.js';

jest.mock('../util.js', () => ({
  devTrace: jest.fn(),
  generateId: jest.requireActual('../util.js').generateId,
}));

describe('Stairs', () => {
  let stairs, targetStairs, structureRepo, worldLevel;

  beforeEach(() => {
    structureRepo = new Repository('stru');
    worldLevel = {
      gs: 'test',
      gameState: { structureRepo }
    };

    targetStairs = new Stairs(worldLevel, 1, 2, 4, 'STAIRS_UP', '<', '#fff', null);
    stairs = new Stairs(worldLevel, 1, 2, 3, 'STAIRS_DOWN', '>', '#fff', targetStairs);

    // Ensure both stairs are in the structure repository
    structureRepo.add(targetStairs);
    structureRepo.add(stairs);
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
    expect(stairs.connectsTo).toBe(targetStairs);
  });

  test('should extend Structure class', () => {
    expect(stairs).toBeInstanceOf(Structure);
  });

  test('should return correct serialization object from forSerializing', () => {
    const serializedData = stairs.forSerializing();
    expect(serializedData).toEqual({
      id: stairs.id,
      x: 1,
      y: 2,
      z: 3,
      type: 'STAIRS_DOWN',
      displaySymbol: '>',
      displayColor: '#fff',
      connectsTo: targetStairs.id, // Ensures ID is stored, not full object
    });
  });

  test('should serialize to a JSON string', () => {
    const jsonString = stairs.serialize();
    const parsed = JSON.parse(jsonString);

    expect(parsed).toEqual({
      id: stairs.id,
      x: 1,
      y: 2,
      z: 3,
      type: 'STAIRS_DOWN',
      displaySymbol: '>',
      displayColor: '#fff',
      connectsTo: targetStairs.id, // Ensures serialization stores only the ID
    });
  });

  test('should deserialize and restore Stairs object correctly', () => {
    const serializedData = stairs.serialize();
    const parsedData = JSON.parse(serializedData);

    const deserializedStairs = Stairs.deserialize(parsedData, worldLevel);

    expect(deserializedStairs).toBeInstanceOf(Stairs);
    expect(deserializedStairs.id).toBe(stairs.id);
    expect(deserializedStairs.worldLevel).toBe(worldLevel);
    expect(deserializedStairs.x).toBe(1);
    expect(deserializedStairs.y).toBe(2);
    expect(deserializedStairs.z).toBe(3);
    expect(deserializedStairs.type).toBe('STAIRS_DOWN');
    expect(deserializedStairs.displaySymbol).toBe('>');
    expect(deserializedStairs.displayColor).toBe('#fff');
    expect(deserializedStairs.connectsTo).toBe(targetStairs); // Ensures lookup worked
  });

  test('should correctly link paired stairs on deserialization', () => {
    // stairs must be bi-directionally linked correctly for this test
    targetStairs.connectsTo = stairs;

    const stairsData = JSON.parse(stairs.serialize());
    const targetStairsData = JSON.parse(targetStairs.serialize());

    // clear out the repo, so simulate deserialization in a fresh environment
    structureRepo.clear();

    // Deserialize stairs first (connectsTo will not yet be resolved)
    const restoredStairs1 = Stairs.deserialize(stairsData, worldLevel);
    expect(restoredStairs1.connectsTo).toBe(targetStairs.id); // No actual connection yet, just the ID

    // Deserialize targetStairs, which should establish bidirectional linking
    const restoredStairs2 = Stairs.deserialize(targetStairsData, worldLevel);
    expect(restoredStairs2.connectsTo).toBe(restoredStairs1);
    expect(restoredStairs1.connectsTo).toBe(restoredStairs2); // Backlink should be restored

    // Ensure both were added to structureRepo
    expect(worldLevel.gameState.structureRepo.get(restoredStairs1.id)).toBe(restoredStairs1);
    expect(worldLevel.gameState.structureRepo.get(restoredStairs2.id)).toBe(restoredStairs2);
  });

  test('should leave the connection as the id on deserialization when the world level is not yet available', () => {
    // stairs must be bi-directionally linked correctly for this test
    targetStairs.connectsTo = stairs;

    const stairsData = JSON.parse(stairs.serialize());
    const targetStairsData = JSON.parse(targetStairs.serialize());

    // clear out the repo, so simulate deserialization in a fresh environment
    structureRepo.clear();

    // Deserialize stairs first (connectsTo just has the target stairs id since there's no world level)
    const restoredStairs1 = Stairs.deserialize(stairsData);
    expect(restoredStairs1.connectsTo).toEqual(targetStairs.id); // No connection yet

    // Deserialize targetStairs, which should establish bidirectional linking
    const restoredStairs2 = Stairs.deserialize(targetStairsData);
    expect(restoredStairs2.connectsTo).toEqual(stairs.id);

    // Ensure both were NOT added to structureRepo since the world level wasn't available
    expect(worldLevel.gameState.structureRepo.get(restoredStairs1.id)).toBeNull();
    expect(worldLevel.gameState.structureRepo.get(restoredStairs2.id)).toBeNull();
  });

  test('should correctly reconnect stairs to their paired stairs when reconnect is called', () => {
    // Store only IDs for reconnect testing
    stairs.connectsTo = targetStairs.id;
    targetStairs.connectsTo = stairs.id;

    stairs.reconnect(structureRepo);

    expect(stairs.connectsTo).toBe(targetStairs);
    expect(targetStairs.connectsTo).toBe(stairs);
  });

  test('should do nothing if connectsTo is already resolved', () => {
    const originalConnection = stairs.connectsTo;
    stairs.reconnect(structureRepo);
    expect(stairs.connectsTo).toBe(originalConnection); // Should remain unchanged
  });

  test('should not throw an error if reconnect is called with a missing structureRepo entry', () => {
    stairs.connectsTo = 'non-existent-id';
    expect(() => stairs.reconnect(structureRepo)).not.toThrow();
    expect(stairs.connectsTo).toBe('non-existent-id'); // Should remain unresolved
  });

});
