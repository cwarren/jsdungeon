import { TurnQueue } from './gameTime';
import { devTrace } from './util';
import { Repository } from './repositoryClass';

jest.mock('./util', () => ({
    devTrace: jest.fn(),
}));

describe('TurnQueue', () => {
    let turnQueue;
    let mockEntity1, mockEntity2;
    let gameState;

    beforeEach(() => {
        gameState = {
            status: 'ACTIVE',
            handlePlayerActionTime: jest.fn(),
            entityRepo: new Repository('entities'),
        };
        turnQueue = new TurnQueue(gameState);

        mockEntity1 = { gameState: gameState, id: 'entity-1', type: 'test1' };
        mockEntity2 = { gameState: gameState, id: 'entity-2', type: 'test2' };

        gameState.entityRepo.add(mockEntity1);
        gameState.entityRepo.add(mockEntity2);
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
            gameState: gameState,
            type: 'test',
            setActionStartingTime: jest.fn(),
            takeTurn: jest.fn().mockReturnValue(10),
            movement: { isRunning: false },
        };
        turnQueue.addEntity(entity, 5);

        console.log(gameState);
        console.log(turnQueue);
        console.log(turnQueue.queue);
        
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

    test('should return correct serialization object from forSerializing', () => {
        turnQueue.addEntity(mockEntity1, 5);
        turnQueue.addEntity(mockEntity2, 10);
        turnQueue.elapsedTime = 100;
        turnQueue.previousActionTime = 50;

        const serializedData = turnQueue.forSerializing();
        expect(serializedData).toEqual({
            queue: [
                { entity: 'entity-1', time: 5 },
                { entity: 'entity-2', time: 10 }
            ],
            elapsedTime: 100,
            previousActionTime: 50
        });
    });

    test('should serialize to a JSON string', () => {
        turnQueue.addEntity(mockEntity1, 5);
        turnQueue.addEntity(mockEntity2, 10);
        turnQueue.elapsedTime = 100;
        turnQueue.previousActionTime = 50;

        const jsonString = JSON.stringify(turnQueue.forSerializing());
        const parsed = JSON.parse(jsonString);

        expect(parsed).toEqual({
            queue: [
                { entity: 'entity-1', time: 5 },
                { entity: 'entity-2', time: 10 }
            ],
            elapsedTime: 100,
            previousActionTime: 50
        });
    });

    test('should deserialize and restore TurnQueue correctly', () => {
        const serializedData = {
            queue: [
                { entity: 'entity-1', time: 5 },
                { entity: 'entity-2', time: 10 }
            ],
            elapsedTime: 100,
            previousActionTime: 50
        };

        const deserializedQueue = TurnQueue.deserialize(serializedData, gameState);

        expect(deserializedQueue).toBeInstanceOf(TurnQueue);
        expect(deserializedQueue.elapsedTime).toBe(100);
        expect(deserializedQueue.previousActionTime).toBe(50);
        expect(deserializedQueue.queue.length).toBe(2);
        expect(deserializedQueue.queue[0].entity).toBe(mockEntity1);
        expect(deserializedQueue.queue[0].time).toBe(5);
        expect(deserializedQueue.queue[1].entity).toBe(mockEntity2);
        expect(deserializedQueue.queue[1].time).toBe(10);
    });

    test('should handle missing entities during deserialization', () => {
        const serializedData = {
            queue: [
                { entity: 'entity-1', time: 5 },
                { entity: 'missing-entity', time: 10 }
            ],
            elapsedTime: 100,
            previousActionTime: 50
        };

        const deserializedQueue = TurnQueue.deserialize(serializedData, gameState);

        expect(deserializedQueue).toBeInstanceOf(TurnQueue);
        expect(deserializedQueue.queue.length).toBe(2);
        expect(deserializedQueue.queue[0].entity).toBe(mockEntity1);
        expect(deserializedQueue.queue[1].entity).toBe('missing-entity');
    });
});