import { TurnQueue } from './gameTime';
import { devTrace } from './util';
import { gameState } from './gameStateClass';

jest.mock('./util', () => ({
    devTrace: jest.fn(),
}));

jest.mock('./gameStateClass', () => ({
    gameState: {
        status: 'ACTIVE',
        handlePlayerActionTime: jest.fn(),
    },
}));

describe('TurnQueue', () => {
    let turnQueue;

    beforeEach(() => {
        turnQueue = new TurnQueue();
    });

    test('should initialize with empty queue and zero elapsed time', () => {
        expect(turnQueue.queue).toEqual([]);
        expect(turnQueue.elapsedTime).toBe(0);
        expect(turnQueue.previousActionTime).toBe(0);
    });

    test('should clear the queue', () => {
        turnQueue.queue = [{ entity: { type: 'test' }, time: 1 }];
        turnQueue.clear();
        expect(turnQueue.queue).toEqual([]);
        expect(devTrace).toHaveBeenCalledWith(5, 'clearing turn queue', turnQueue);
    });

    test('should add entity to the queue with initial time', () => {
        const entity = { type: 'test' };
        turnQueue.addEntity(entity, 5);
        expect(turnQueue.queue).toEqual([{ entity, time: 5 }]);
        expect(devTrace).toHaveBeenCalledWith(4, 'add entity to turn queue at 5', entity, turnQueue);
    });

    test('should add entity to the queue without initial time', () => {
        const entity = { type: 'test' };
        turnQueue.addEntity(entity);
        expect(turnQueue.queue).toEqual([{ entity, time: 1 }]);
        expect(devTrace).toHaveBeenCalledWith(4, 'add entity to turn queue at null', entity, turnQueue);
    });

    test('should add entity at the beginning of the queue', () => {
        const entity1 = { type: 'test1' };
        const entity2 = { type: 'test2' };
        turnQueue.addEntity(entity1, 5);
        turnQueue.addEntityAtBeginningOfTurnQueue(entity2);
        expect(turnQueue.queue).toEqual([{ entity: entity2, time: 4 }, { entity: entity1, time: 5 }]);
        expect(devTrace).toHaveBeenCalledWith(4, 'add entity to turn queue at beginning', entity2, turnQueue);
    });

    test('should set entities in the queue', () => {
        const entities = [{ type: 'test1' }, { type: 'test2' }];
        turnQueue.setEntities(entities);
        expect(turnQueue.queue.length).toBe(2);
        expect(devTrace).toHaveBeenCalledWith(5, 'set turn queue entities', entities, turnQueue);
    });

    test('should set entities in the queue excluding avatar', () => {
        const entities = [{ type: 'test1' }, { type: 'AVATAR' }];
        turnQueue.setEntitiesSansAvatar(entities);
        expect(turnQueue.queue.length).toBe(1);
        expect(turnQueue.queue[0].entity.type).toBe('test1');
        expect(devTrace).toHaveBeenCalledWith(5, 'set turn queue entities, sans avatar', entities, turnQueue);
    });

    test('should remove entity from the queue', () => {
        const entity = { type: 'test' };
        turnQueue.addEntity(entity, 5);
        turnQueue.removeEntity(entity);
        expect(turnQueue.queue).toEqual([]);
        expect(devTrace).toHaveBeenCalledWith(4, 'remove entity from turn queue', entity, turnQueue);
    });

    test('should order the queue by time', () => {
        const entity1 = { type: 'test1' };
        const entity2 = { type: 'test2' };
        turnQueue.addEntity(entity1, 5);
        turnQueue.addEntity(entity2, 3);
        turnQueue.ordering();
        expect(turnQueue.queue).toEqual([{ entity: entity2, time: 3 }, { entity: entity1, time: 5 }]);
        expect(devTrace).toHaveBeenCalledWith(9, 'order turn queue by time', turnQueue);
    });

    test('should handle next turn', () => {
        const entity = {
            type: 'test',
            setActionStartingTime: jest.fn(),
            takeTurn: jest.fn().mockReturnValue(10),
            movement: { isRunning: false },
        };
        turnQueue.addEntity(entity, 5);
        const result = turnQueue.nextTurn();
        expect(result).toBe(entity);
        expect(turnQueue.previousActionTime).toBe(5);
        expect(entity.setActionStartingTime).toHaveBeenCalledWith(5);
        expect(entity.takeTurn).toHaveBeenCalled();
        expect(turnQueue.queue.length).toBe(1);
        expect(turnQueue.queue[0].time).toBe(15);
        expect(devTrace).toHaveBeenCalledWith(4, 'do next turn on turn queue', turnQueue);
    });

    test('should return null if queue is empty in next turn', () => {
        const result = turnQueue.nextTurn();
        expect(result).toBeNull();
    });

    test('should return null if game state is not active in next turn', () => {
        gameState.status = 'INACTIVE';
        const entity = { type: 'test' };
        turnQueue.addEntity(entity, 5);
        const result = turnQueue.nextTurn();
        expect(result).toBeNull();
    });
});