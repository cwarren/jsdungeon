import { Avatar } from './avatarClass.js';
import { Entity, DEFAULT_ACTION_COST } from './entityClass.js';
import { gameState } from './gameStateClass.js';
import { devTrace, rollDice } from './util.js';
import { Damage } from './damageClass.js';
import { uiPaneMain, uiPaneMessages } from "./ui.js";
import { WorldLevelSpecification } from './worldLevelSpecificationClass.js';

const WORLD_LEVEL_SPECS_FOR_TESTING= [
    WorldLevelSpecification.generateWorldLevelSpec({type: 'EMPTY', width: 10, height: 10}),
  ];

jest.mock('./util.js', () => ({
  devTrace: jest.fn(),
  rollDice: jest.fn(() => 3), // Mock rollDice to always return 3
}));

jest.mock('./ui.js', () => ({
  uiPaneMessages: { addMessage: jest.fn() },
  uiPaneMain: { 
    resetUIState: jest.fn(), 
    pushUIState: jest.fn(),
  },
}));

describe('Avatar', () => {
  let avatar;

  beforeEach(() => {
    gameState.reset();
    gameState.initialize(WORLD_LEVEL_SPECS_FOR_TESTING);
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
    expect(avatar.healNaturally).toHaveBeenCalled();
  });

  test('should die and lose game', () => {
    avatar.die();
    expect(gameState.loseGame).toHaveBeenCalled();
    expect(Entity.prototype.die).toHaveBeenCalled();
    expect(uiPaneMain.pushUIState).toHaveBeenCalledWith("GAME_OVER");
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