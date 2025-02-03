import { Avatar } from './avatarClass.js';
import { Entity, DEFAULT_ACTION_COST } from './entityClass.js';
import { gameState } from './gameStateClass.js';
import { devTrace, rollDice } from './util.js';
import { Damage } from './damageClass.js';
import { uiPaneMessages } from "./ui.js";

jest.mock('./util.js', () => ({
  devTrace: jest.fn(),
  rollDice: jest.fn(() => 3), // Mock rollDice to always return 3
}));

// jest.mock('./gameStateClass.js', () => ({
//   gameState: {
//     loseGame: jest.fn(),
//   },
// }));

jest.mock('./ui.js', () => ({
  uiPaneMessages: { addMessage: jest.fn()},
}));

describe('Avatar', () => {
  let avatar;

  beforeEach(() => {
	gameState.reset();
	gameState.initialize([[10, 10, 'EMPTY']]);
    avatar = gameState.avatar;
    jest.spyOn(avatar, 'healNaturally'); 
	jest.spyOn(gameState, 'loseGame');
	jest.spyOn(Entity.prototype, 'die');
  });

  test('should initialize with correct values', () => {
    expect(avatar.type).toBe('AVATAR');
    expect(avatar.timeOnLevel).toBe(0);
    expect(avatar.meleeAttack).toBe(true);
  });

  test('should reset time on level', () => {
    avatar.timeOnLevel = 100;
    avatar.resetTimeOnLevel();
    expect(avatar.timeOnLevel).toBe(0);
  });

  test('should add time on level', () => {
    avatar.addTimeOnLevel(50);
    expect(avatar.timeOnLevel).toBe(50);
  });

  test('should take turn and wait for player input', () => {
    avatar.actionStartingTime = 100;
    const result = avatar.takeTurn();
    expect(result).toBe(0);
    expect(avatar.healNaturally).toHaveBeenCalledWith(100);
  });

  test('should die and lose game', () => {
    avatar.die();
    expect(gameState.loseGame).toHaveBeenCalled();
    expect(Entity.prototype.die).toHaveBeenCalled();
  });

  test('should get melee attack damage', () => {
    const damage = avatar.getMeleeAttackDamage();
    expect(damage).toBeInstanceOf(Damage);
    expect(damage.amount).toBe(3); // Mocked rollDice returns 3
  });

  test('should get melee attack action cost', () => {
    const actionCost = avatar.getMeleeAttackActionCost();
    expect(actionCost).toBe(DEFAULT_ACTION_COST);
  });

  test('should show natural healing message', () => {
    avatar.showNaturalHealingMessage('Healing message');
    expect(uiPaneMessages.addMessage).toHaveBeenCalledWith('Healing message');
  });
});