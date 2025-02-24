import { Avatar } from './avatarClass.js';
import { Entity, DEFAULT_ACTION_COST } from './entityClass.js';
import { gameState } from '../gameStateClass.js';
import { devTrace, rollDice, formatNumberForMessage, valueCalc } from '../util.js';
import { EffDamage } from '../effect/effDamageClass.js';
import { EffectGenerator } from '../effect/effectGeneratorClass.js';
import { uiPaneMain, uiPaneMessages } from "../ui/ui.js";
import { UIPaneMiniChar, miniCharElement } from '../ui/uiPaneMiniCharClass.js';
import { WorldLevelSpecification } from '../world/worldLevelSpecificationClass.js';

const WORLD_LEVEL_SPECS_FOR_TESTING= [
    WorldLevelSpecification.generateWorldLevelSpec({type: 'EMPTY', width: 10, height: 10}),
  ];

jest.mock('../util.js', () => ({
  devTrace: jest.fn(),
  rollDice: jest.fn(() => 100), // Mock rollDice to always return 3
  valueCalc: jest.requireActual('../util.js').valueCalc,
  formatNumberForMessage: jest.fn(() => '10'),
}));

jest.mock('../ui/ui.js', () => ({
  uiPaneMessages: { addMessage: jest.fn() },
  uiPaneMain: { 
    resetUIState: jest.fn(), 
    pushUIState: jest.fn(),
  },
}));

jest.mock('../ui/uiPaneMiniCharClass.js', () => ({
  // UIPaneMiniChar.getPageElement: jest.fn(() => {return {innerHTML: ''};}),
  UIPaneMiniChar: jest.requireActual('../ui/uiPaneMiniCharClass.js').UIPaneMiniChar
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


  test('should register minichar pane', () =>{
    const uiPaneMiniChar = new UIPaneMiniChar(null);
    uiPaneMiniChar.getPageElement = jest.fn(() => {return {innerHTML: ''}; });
    
    expect(avatar.paneMiniChar).toBeNull();
    expect(uiPaneMiniChar.avatar).toBeNull();

    avatar.registerPaneMiniChar(uiPaneMiniChar);
    expect(avatar.paneMiniChar).toBe(uiPaneMiniChar);
    expect(uiPaneMiniChar.avatar).toBe(avatar);
  });
  test('should unregister minichar pane', () =>{
    const uiPaneMiniChar = new UIPaneMiniChar(null);
    uiPaneMiniChar.getPageElement = jest.fn(() => {return {innerHTML: ''}; });
    avatar.registerPaneMiniChar(uiPaneMiniChar);
    expect(avatar.paneMiniChar).toBe(uiPaneMiniChar);
    expect(uiPaneMiniChar.avatar).toBe(avatar);

    avatar.unregisterPaneMiniChar();
    expect(avatar.paneMiniChar).toBeNull();
    expect(uiPaneMiniChar.avatar).toBeNull();
  });

  test('should die and lose game', () => {
    const uiPaneMiniChar = new UIPaneMiniChar(null);
    uiPaneMiniChar.getPageElement = jest.fn(() => {return {innerHTML: ''}; });
    jest.spyOn(uiPaneMiniChar, 'clearMiniChar');
    avatar.registerPaneMiniChar(uiPaneMiniChar);

    avatar.die();
    expect(gameState.loseGame).toHaveBeenCalled();
    expect(Entity.prototype.die).toHaveBeenCalled();
    expect(uiPaneMain.pushUIState).toHaveBeenCalledWith("GAME_OVER");
    expect(uiPaneMiniChar.clearMiniChar).toHaveBeenCalled();
    expect(avatar.paneMiniChar).toBeNull();
    expect(uiPaneMiniChar.avatar).toBeNull();
  });

  test('should get melee attack effect generators', () => {
    const effGens = avatar.getMeleeHitEffectGenerators();
    effGens.forEach( efGe => {
      expect(efGe).toBeInstanceOf(EffectGenerator);
    });
  });

  test('should get melee attack action cost', () => {
    const actionTime = avatar.getMeleeAttackActionCost();
    expect(actionTime).toBe(DEFAULT_ACTION_COST);
  });

  test('should show natural healing message', () => {
    avatar.showNaturalHealingMessage('Healing message');
    // added .not for healing messages suppressed for now - later this will have a settings flag
    expect(uiPaneMessages.addMessage).not.toHaveBeenCalledWith('Healing message');
  });
});