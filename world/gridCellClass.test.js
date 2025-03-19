import { GridCell } from './gridCellClass';
import { devTrace } from '../util.js';
import { Repository } from '../repositoryClass.js';

jest.mock('../util.js', () => ({
    devTrace: jest.fn(),
}));

describe('GridCell', () => {
    let gridCell;
    let worldLevel;
    let structureRepo;
    let entityRepo;
    let mockStructure;
    let mockEntity;

    beforeEach(() => {
        structureRepo = new Repository('stru');
        entityRepo = new Repository('enti');

        worldLevel = {
            levelNumber: 1,
            levelWidth: 10,
            levelHeight: 10,
            gameState: {
                structureRepo,
                entityRepo
            },
        };
        worldLevel.grid = Array.from({ length: 10 }, (_, x) =>
            Array.from({ length: 10 }, (_, y) => {
                const cell = new GridCell('FLOOR');
                cell.setPosition(x, y, 1);
                cell.setWorldLevel(worldLevel);
                return cell;
            })
        );
        gridCell = new GridCell('FLOOR');
        gridCell.setPosition(5, 5, 1);
        gridCell.setWorldLevel(worldLevel);

        // Mock structure and entity with IDs
        mockStructure = { id: 'structure-1' };
        mockEntity = { id: 'entity-1' };

        structureRepo.add(mockStructure);
        entityRepo.add(mockEntity);

        gridCell.structure = mockStructure;
        gridCell.entity = mockEntity;
    });

    describe('GridCell - serialization', () => {

        test('should return correct serialization object from forSerializing', () => {
            const serializedData = gridCell.forSerializing();
            expect(serializedData).toEqual({
                terrain: gridCell.terrain,
                x: 5,
                y: 5,
                z: 1,
                structure: 'structure-1', // Ensures ID is stored instead of full object
                entity: 'entity-1' // Ensures ID is stored instead of full object
            });
        });

        test('should serialize to a JSON string', () => {
            const jsonString = gridCell.serialize();
            const parsed = JSON.parse(jsonString);

            expect(parsed).toEqual({
                terrain: gridCell.terrain,
                x: 5,
                y: 5,
                z: 1,
                structure: 'structure-1',
                entity: 'entity-1'
            });
        });

        test('should deserialize and restore GridCell object correctly', () => {
            const serializedData = gridCell.serialize();
            const parsedData = JSON.parse(serializedData);

            const deserializedCell = GridCell.deserialize(parsedData, worldLevel);

            expect(deserializedCell).toBeInstanceOf(GridCell);
            expect(deserializedCell.x).toBe(5);
            expect(deserializedCell.y).toBe(5);
            expect(deserializedCell.z).toBe(1);
            expect(deserializedCell.terrain).toBe('FLOOR');

            // Ensure structure and entity are resolved correctly
            expect(deserializedCell.structure).toBe(mockStructure);
            expect(deserializedCell.entity).toBe(mockEntity);
        });

        test('should handle deserialization with missing structure and entity', () => {
            const serializedData = gridCell.serialize();
            const parsedData = JSON.parse(serializedData);

            // Simulate the structure/entity being missing
            structureRepo.remove('structure-1');
            entityRepo.remove('entity-1');

            const deserializedCell = GridCell.deserialize(parsedData, worldLevel);

            expect(deserializedCell.structure).toBeNull();
            expect(deserializedCell.entity).toBeNull();
        });
    });

    test('should set position', () => {
        gridCell.setPosition(3, 4, 2);
        expect(gridCell.x).toBe(3);
        expect(gridCell.y).toBe(4);
        expect(gridCell.z).toBe(2);
    });

    test('should attach to world level', () => {
        gridCell.attatchToWorldLevel(2, 3, worldLevel);
        expect(gridCell.x).toBe(2);
        expect(gridCell.y).toBe(3);
        expect(gridCell.worldLevel).toBe(worldLevel);
        expect(gridCell.z).toBe(worldLevel.levelNumber);
    });

    test('should set world level', () => {
        gridCell.setWorldLevel(worldLevel);
        expect(gridCell.worldLevel).toBe(worldLevel);
        expect(gridCell.z).toBe(worldLevel.levelNumber);
    });

    test('should get adjacent cells', () => {
        const adjacentCells = gridCell.getAdjacentCells();
        expect(adjacentCells.length).toBe(8);
        expect(adjacentCells).toContain(worldLevel.grid[4][4]);
        expect(adjacentCells).toContain(worldLevel.grid[6][6]);
        expect(adjacentCells).toContain(worldLevel.grid[5][4]);
        expect(adjacentCells).toContain(worldLevel.grid[5][6]);
    });

    test('should get delta to other cell', () => {
        const otherCell = new GridCell('FLOOR');
        otherCell.setPosition(7, 8, 1);
        const delta = gridCell.getDeltaToOtherCell(otherCell);
        expect(delta).toEqual({ dx: 2, dy: 3 });
    });

    test('should check if any cell has property of value', () => {
        const cellList = [new GridCell('FLOOR'), new GridCell('WALL')];
        cellList[0].testProperty = 'value1';
        cellList[1].testProperty = 'value2';
        expect(GridCell.anyCellHasPropertyOfValue(cellList, 'testProperty', 'value1')).toBe(true);
        expect(GridCell.anyCellHasPropertyOfValue(cellList, 'testProperty', 'value3')).toBe(false);
    });

    test('should create a detached GridCell', () => {
        const newCell = GridCell.createDetached('WALL');
        expect(newCell).toBeInstanceOf(GridCell);
        expect(newCell.terrain).toBe('WALL');
        expect(newCell.isTraversible).toBe(false);
        expect(newCell.entryMovementCost).toBe(Infinity);
        expect(newCell.isOpaque).toBe(true);
        expect(newCell.color).toBe('#222');
    });

    test('should create a detached GridCell at specific position', () => {
        const newCell = GridCell.createDetachedAt(1, 2, 'WATER_SHALLOW');
        expect(newCell).toBeInstanceOf(GridCell);
        expect(newCell.x).toBe(1);
        expect(newCell.y).toBe(2);
        expect(newCell.terrain).toBe('WATER_SHALLOW');
        expect(newCell.isTraversible).toBe(true);
        expect(newCell.entryMovementCost).toBe(30);
        expect(newCell.isOpaque).toBe(false);
        expect(newCell.color).toBe('#00BFFF');
    });

    test('should create an attached GridCell', () => {
        const newCell = GridCell.createAttached(3, 4, worldLevel, 'WATER_DEEP');
        expect(newCell).toBeInstanceOf(GridCell);
        expect(newCell.x).toBe(3);
        expect(newCell.y).toBe(4);
        expect(newCell.worldLevel).toBe(worldLevel);
        expect(newCell.z).toBe(worldLevel.levelNumber);
        expect(newCell.terrain).toBe('WATER_DEEP');
        expect(newCell.isTraversible).toBe(true);
        expect(newCell.entryMovementCost).toBe(120);
        expect(newCell.isOpaque).toBe(false);
        expect(newCell.color).toBe('#00008B');
    });
});