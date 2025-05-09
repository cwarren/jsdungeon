import { EntityVision } from './entityVisionClass';
import { devTrace } from '../util.js';
jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
    generateId: jest.requireActual('../util.js').generateId,
}));

const ENITY_VISION_RANGE = 5;

describe('EntityVision', () => {
    let entity;
    let entityVision;
    let otherEntity;
    let otherEntityOutOfSight;
    let otherEntityHidden;
    let gameState;

    beforeEach(() => {
        gameState = {
            world: [
                {
                    grid: Array.from({ length: 10 }, (_, x) =>
                        Array.from({ length: 10 }, (_, y) => ({
                            x,
                            y,
                            z: 0,
                            entity: null,
                            isOpaque: false,
                        }))
                    ),
                },
            ],
        };
        entity = {
            gameState: gameState,
            type: 'testEntity',
            location: {
                x: 2,
                y: 2,
                z: 0,
                getWorldLevel: jest.fn(() => gameState.world[0]),
                getManhattenDistanceToEntity: jest.fn(() => 2),
            },
            getCell: jest.fn(() => gameState.world[0].grid[2][2]),
            getRelationshipTo: jest.fn(() => 'HOSTILE_TO'),
        };
        gameState.world[0].grid[2][2].entity = entity;

        otherEntity = {
            gameState: gameState,
            type: 'otherEntity',
            location: {
                x: 3,
                y: 3,
                z: 0,
                getWorldLevel: jest.fn(() => gameState.world[0]),
            },
            getCell: jest.fn(() => gameState.world[0].grid[3][3]),
        };
        gameState.world[0].grid[3][3].entity = otherEntity;

        otherEntityOutOfSight = {
            gameState: gameState,
            type: 'otherEntityOutOfSight',
            location: {
                x: 9,
                y: 9,
                z: 0,
                getWorldLevel: jest.fn(() => gameState.world[0]),
            },
            getCell: jest.fn(() => gameState.world[0].grid[9][9]),
        };
        gameState.world[0].grid[9][9].entity = otherEntityOutOfSight;

        otherEntityHidden = {
            gameState: gameState,
            type: 'otherEntityHidden',
            location: {
                x: 4,
                y: 2,
                z: 0,
                getWorldLevel: jest.fn(() => gameState.world[0]),
            },
            getCell: jest.fn(() => gameState.world[0].grid[4][2]),
        };
        gameState.world[0].grid[3][2].isOpaque = true;
        gameState.world[0].grid[4][2].entity = otherEntityHidden;

        entityVision = new EntityVision(entity, ENITY_VISION_RANGE);
    });

    test('should initialize with correct values', () => {
        expect(entityVision.ofEntity).toBe(entity);
        expect(entityVision.viewRadius).toBe(ENITY_VISION_RANGE);
        expect(entityVision.visibleCells).toEqual(new Set());
        expect(entityVision.seenCells).toEqual(new Set());
    });

    test('entity can see otherEntity', () => {
        entityVision.determineVisibleCells();
        expect(entityVision.canSeeEntity(otherEntity)).toBe(true);
    });

    test('entity can be seen by otherEntity', () => {
        const otherEntityVision = new EntityVision(otherEntity, 4);
        otherEntityVision.determineVisibleCells();
        expect(otherEntityVision.canSeeEntity(entity)).toBe(true);
    });

    test('entity cannot see otherEntityOutOfSight', () => {
        entityVision.determineVisibleCells();
        expect(entityVision.canSeeEntity(otherEntityOutOfSight)).toBe(false);
    });

    test('entity cannot see otherEntityHidden', () => {
        entityVision.determineVisibleCells();
        expect(entityVision.canSeeEntity(otherEntityHidden)).toBe(false);
    });

    test('entity should correctly determine visible cells', () => {
        const vision = new EntityVision(otherEntityHidden, 3);
        vision.determineVisibleCells();
        expect(vision.visibleCells.size).toBe(24); // 25 in a 5x5 square minus one hidden on the other side of an opaque cell
        expect(vision.visibleCells.size).toEqual(vision.seenCells.size);
        expect(vision.visibleCells.has(gameState.world[0].grid[2][2])).toBe(false); // can't see the hidden cell
        expect(vision.visibleCells.has(gameState.world[0].grid[2][4])).toBe(true); // can see non-hidden cell in range
        expect(vision.visibleCells.has(gameState.world[0].grid[1][7])).toBe(false); // cannot see cell out of range
    });

    test('entity should correctly determine visible cells for non-integer vision radius', () => {
        gameState.world[0].grid[3][2].isOpaque = false; // remove the usual opaque cell for this test - just muddies the waters
        const vision = new EntityVision(otherEntity, 2.5);
        vision.determineVisibleCells();
        expect(vision.visibleCells.size).toBe(21); // 9-box, plus 3 on each side
        expect(vision.visibleCells.size).toEqual(vision.seenCells.size);
    });

    // NOTE: determineVisibleCellsInGrid is tested via determineVisibleCells, in entity should correctly determine visible cells

    test('should get visible entity info', () => {
        entityVision.determineVisibleCells();
        const visibleEntities = entityVision.getVisibleEntityInfo();
        expect(visibleEntities.length).toBe(1);
        expect(visibleEntities[0].entity).toBe(otherEntity);
        expect(visibleEntities[0].relation).toBe('HOSTILE_TO');
        expect(visibleEntities[0].manhattenDistance).toBe(2);
    });

    describe('EntityVision - serialization', () => {
        test('should return correct serialization object from forSerializing', () => {
            entityVision.seenCells.add("1,1,0");
            entityVision.seenCells.add("2,2,0");

            const serializedData = entityVision.forSerializing();
            expect(serializedData).toEqual({
                viewRadius: ENITY_VISION_RANGE,
                seenCells: ["1,1,0", "2,2,0"]
            });
        });

        test('should serialize to a JSON string', () => {
            entityVision.seenCells.add("3,3,0");
            entityVision.seenCells.add("4,4,0");

            const jsonString = entityVision.serialize();
            const parsed = JSON.parse(jsonString);

            expect(parsed).toEqual({
                viewRadius: ENITY_VISION_RANGE,
                seenCells: ["3,3,0", "4,4,0"]
            });
        });

        test('should deserialize correctly', () => {
            const serializedData = {
                viewRadius: 4,
                seenCells: ["5,5,0", "6,6,0"]
            };

            const deserializedVision = EntityVision.deserialize(serializedData, entity);
            expect(deserializedVision).toBeInstanceOf(EntityVision);
            expect(deserializedVision.viewRadius).toBe(4);
            expect(deserializedVision.seenCells).toEqual(new Set(["5,5,0", "6,6,0"]));
        });

        test('should maintain seenCells across serialization/deserialization', () => {
            entityVision.seenCells.add("7,7,0");
            entityVision.seenCells.add("8,8,0");

            const jsonString = entityVision.serialize();
            const deserializedVision = EntityVision.deserialize(JSON.parse(jsonString), entity);

            expect(deserializedVision.seenCells).toEqual(new Set(["7,7,0", "8,8,0"]));
        });
    });
});