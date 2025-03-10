import { EntityVision } from './entityVisionClass';
import { GAME_STATE } from '../gameStateClass.js';
import { devTrace } from '../util.js';
jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
    generateId: jest.requireActual('../util.js').generateId,
}));

jest.mock('../gameStateClass', () => ({
    GAME_STATE: {
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
    },
}));

const ENITY_VISION_RANGE = 5;

describe('EntityVision', () => {
    let entity;
    let entityVision;
    let otherEntity;
    let otherEntityOutOfSight;
    let otherEntityHidden;

    beforeEach(() => {
        entity = {
            type: 'testEntity',
            location: {
                x: 2,
                y: 2,
                z: 0,
                getWorldLevel: jest.fn(() => GAME_STATE.world[0]),
                getManhattenDistanceToEntity: jest.fn(() => 2),
            },
            getCell: jest.fn(() => GAME_STATE.world[0].grid[2][2]),
            getRelationshipTo: jest.fn(() => 'HOSTILE_TO'),
        };
        GAME_STATE.world[0].grid[2][2].entity = entity;

        otherEntity = {
            type: 'otherEntity',
            location: {
                x: 3,
                y: 3,
                z: 0,
                getWorldLevel: jest.fn(() => GAME_STATE.world[0]),
            },
            getCell: jest.fn(() => GAME_STATE.world[0].grid[3][3]),
        };
        GAME_STATE.world[0].grid[3][3].entity = otherEntity;

        otherEntityOutOfSight = {
            type: 'otherEntityOutOfSight',
            location: {
                x: 9,
                y: 9,
                z: 0,
                getWorldLevel: jest.fn(() => GAME_STATE.world[0]),
            },
            getCell: jest.fn(() => GAME_STATE.world[0].grid[9][9]),
        };
        GAME_STATE.world[0].grid[9][9].entity = otherEntityOutOfSight;

        otherEntityHidden = {
            type: 'otherEntityHidden',
            location: {
                x: 4,
                y: 2,
                z: 0,
                getWorldLevel: jest.fn(() => GAME_STATE.world[0]),
            },
            getCell: jest.fn(() => GAME_STATE.world[0].grid[4][2]),
        };
        GAME_STATE.world[0].grid[3][2].isOpaque = true;
        GAME_STATE.world[0].grid[4][2].entity = otherEntityHidden;

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
        expect(vision.visibleCells).toEqual(vision.seenCells);
        expect(vision.visibleCells.has(GAME_STATE.world[0].grid[2][2])).toBe(false); // can't see the hidden cell
        expect(vision.visibleCells.has(GAME_STATE.world[0].grid[2][4])).toBe(true); // can see non-hidden cell in range
        expect(vision.visibleCells.has(GAME_STATE.world[0].grid[1][7])).toBe(false); // cannot see cell out of range
    });

    test('entity should correctly determine visible cells for non-integer vision radius', () => {
        GAME_STATE.world[0].grid[3][2].isOpaque = false; // remove the usual opaque cell for this test - just muddies the waters
        const vision = new EntityVision(otherEntity, 2.5);
        vision.determineVisibleCells();
        expect(vision.visibleCells.size).toBe(21); // 9-box, plus 3 on each side
        expect(vision.visibleCells).toEqual(vision.seenCells);
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
        // TODO: implement tests for forSerializing, serialize, deserialize
    });
});