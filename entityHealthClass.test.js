import { EntityHealth, DEFAULT_NATURAL_HEALING_TICKS, DEFAULT_NATURAL_HEALING_RATE } from './entityHealthClass';

jest.mock('./util', () => ({
  devTrace: jest.fn(),
  constrainValue: jest.fn((value, min, max) => Math.min(Math.max(value, min), max)),
}));

describe('EntityHealth', () => {
  let entityHealth;

  beforeEach(() => {
    entityHealth = new EntityHealth({}, 100);
  });

  test('should initialize with correct values', () => {
    expect(entityHealth.maxHealth).toBe(100);
    expect(entityHealth.health).toBe(100);
    expect(entityHealth.naturalHealingRate).toBe(0.001);
    expect(entityHealth.naturalHealingTicks).toBe(250);
  });

  test('should throw error for invalid maxHealth', () => {
    expect(() => new EntityHealth({}, -100)).toThrow("maxHealth must be greater than 0");
  });

  test('should take damage correctly', () => {
    entityHealth.takeDamage(30);
    expect(entityHealth.health).toBe(70);
  });

  test('should throw error for negative damage', () => {
    expect(() => entityHealth.takeDamage(-30)).toThrow("Damage must be a non-negative value");
  });

  test('should heal correctly', () => {
    entityHealth.takeDamage(30);
    entityHealth.heal(20);
    expect(entityHealth.health).toBe(90);
  });

  test('should throw error for negative heal amount', () => {
    expect(() => entityHealth.heal(-20)).toThrow("Heal amount must be a non-negative value");
  });

  test('should not heal beyond max health', () => {
    entityHealth.heal(20);
    expect(entityHealth.health).toBe(100);
  });

  test('should heal naturally over time', () => {
    entityHealth.takeDamage(50);
    entityHealth.healNaturally(DEFAULT_NATURAL_HEALING_TICKS);
    expect(entityHealth.health).toBeCloseTo(50.1, 2); // 100 - 50 + (0.001 * 100 * 1)
  });

  test('should heal naturally over multiple intervals', () => {
    entityHealth.takeDamage(50);
    entityHealth.healNaturally(2 * DEFAULT_NATURAL_HEALING_TICKS);
    expect(entityHealth.health).toBeCloseTo(50.2, 2); // 100 - 50 + (0.001 * 100 * 2)
  });

  test('should not heal if not enough time has passed', () => {
    entityHealth.takeDamage(50);
    entityHealth.healNaturally(100);
    expect(entityHealth.health).toBe(50); // No healing should occur
  });

  test('should update lastNaturalHealTime correctly', () => {
    entityHealth.takeDamage(50);
    entityHealth.healNaturally(500);
    expect(entityHealth.lastNaturalHealTime).toBe(500);
  });

  test('should return correct health status', () => {
    const status = entityHealth.getHealthStatus();
    expect(status.currentHealth).toBe(100);
    expect(status.maxHealth).toBe(100);
  });

  test('should return true if entity is alive', () => {
    expect(entityHealth.isAlive()).toBe(true);
  });

  test('should return false if entity is dead', () => {
    entityHealth.takeDamage(100);
    expect(entityHealth.isAlive()).toBe(false);
  });
});