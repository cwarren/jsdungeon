import { WorldLevelSpecification } from './worldLevelSpecificationClass.js';
import { getRandomListItem, constrainValue } from './util.js';

// Mock utility functions
jest.mock('./util.js', () => ({
  devTrace: jest.fn(),
  getRandomListItem: jest.fn((list) => list[0]), // Always return the first available item for predictable tests
  constrainValue: jest.fn((val, min, max) => Math.min(Math.max(val, min), max)), // Simulated bound check
}));

describe('WorldLevelSpecification', () => {
  test('should initialize with correct values', () => {
    const spec = new WorldLevelSpecification('EMPTY', 50, 40);
    expect(spec.type).toBe('EMPTY');
    expect(spec.width).toBe(50);
    expect(spec.height).toBe(40);
    expect(spec.typeGenerationParams).toBeNull();
  });

  test('should default to EMPTY when an invalid type is provided', () => {
    const spec = new WorldLevelSpecification('INVALID_TYPE', 30, 30);
    expect(spec.type).toBe('EMPTY');
  });

  test('should retrieve level types by attribute', () => {
    expect(WorldLevelSpecification.getLevelTypesByAttribute('DEV')).toEqual(['EMPTY', 'RANDOM']);
    expect(WorldLevelSpecification.getLevelTypesByAttribute('CIVILIZED')).toEqual([
      'TOWN', 'ROOMS_SUBDIVIDE', 'ROOMS_RANDOM'
    ]);
    expect(WorldLevelSpecification.getLevelTypesByAttribute('NATURAL')).toEqual([
      'BURROW', 'NEST', 'CAVES_SHATTERED', 'CAVES', 'CAVES_LARGE', 'CAVES_HUGE'
    ]);
  });

  test('should generate world level spec correctly', () => {
    const specGenerationParams = { type: 'TOWN', width: 60, height: 50 };
    const generatedSpec = WorldLevelSpecification.generateWorldLevelSpec(specGenerationParams);

    expect(generatedSpec.type).toBe('TOWN');
    expect(generatedSpec.width).toBe(60);
    expect(generatedSpec.height).toBe(50);
  });

  test('should select a type based on an attribute', () => {
    const specGenerationParams = { typeAttribute: 'NATURAL' };
    const type = WorldLevelSpecification.getGenTypeFromSpecGenParams(specGenerationParams);

    expect(WorldLevelSpecification.getLevelTypesByAttribute('NATURAL')).toContain(type);
  });

  test('should generate width using constraints if not explicitly provided', () => {
    const specGenerationParams = { minWidth: 25, maxWidth: 100 };
    const width = WorldLevelSpecification.getGenWidthFromSpecGenParams(specGenerationParams);

    expect(constrainValue).toHaveBeenCalledWith(25, 20, 240);
    expect(constrainValue).toHaveBeenCalledWith(100, 20, 240);
    expect(width).toBeGreaterThanOrEqual(25);
    expect(width).toBeLessThanOrEqual(100);
  });

  test('should generate height using constraints if not explicitly provided', () => {
    const specGenerationParams = { minHeight: 30, maxHeight: 90 };
    const height = WorldLevelSpecification.getGenHeightFromSpecGenParams(specGenerationParams);

    expect(constrainValue).toHaveBeenCalledWith(30, 20, 240);
    expect(constrainValue).toHaveBeenCalledWith(90, 20, 240);
    expect(height).toBeGreaterThanOrEqual(30);
    expect(height).toBeLessThanOrEqual(90);
  });

  test('should default to min/max bounds when width/height constraints are not given', () => {
    const width = WorldLevelSpecification.getGenWidthFromSpecGenParams({});
    const height = WorldLevelSpecification.getGenHeightFromSpecGenParams({});

    expect(width).toBeGreaterThanOrEqual(20);
    expect(width).toBeLessThanOrEqual(240);
    expect(height).toBeGreaterThanOrEqual(20);
    expect(height).toBeLessThanOrEqual(240);
  });
});
