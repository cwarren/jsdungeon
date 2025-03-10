import { EntityAttributes } from './entityAttributesClass.js';

describe('EntityAttributes', () => {
    let entity;
    let attributes;

    beforeEach(() => {
        entity = { name: "Test Entity" }; // Mock entity
        attributes = new EntityAttributes(entity);
    });

    test('should initialize with default attribute values', () => {
        expect(attributes.ofEntity).toBe(entity);
        EntityAttributes.ATTRIBUTE_ORDERING.forEach(attr => {
            expect(attributes[attr]).toBe(1);
        });
    });

    test('should set attributes correctly', () => {
        const newAttributes = {
            strength: 5,
            dexterity: 3,
            fortitude: 7,
            recovery: 4,
            psyche: 6,
            awareness: 2,
            stability: 8,
            will: 3,
            aura: 9,
            refinement: 1,
            depth: 10,
            flow: 5,
        };

        attributes.setAttributes(newAttributes);

        EntityAttributes.ATTRIBUTE_ORDERING.forEach(attr => {
            expect(attributes[attr]).toBe(newAttributes[attr]);
        });
    });

    test('should not set attributes that are not in ATTRIBUTE_ORDERING', () => {
        const invalidAttributes = { strength: 5, randomAttr: 999 };
        attributes.setAttributes(invalidAttributes);

        expect(attributes.strength).toBe(5);
        expect(attributes).not.toHaveProperty('randomAttr');
    });

    test('should return a correct attribute summary', () => {
        const expectedSummary = {};
        EntityAttributes.ATTRIBUTE_ORDERING.forEach(attr => {
            expectedSummary[attr] = 1;
        });

        expect(attributes.getAttributeSummary()).toEqual(expectedSummary);
    });

    test('ATTRIBUTE_INFORMATION should contain correct data', () => {
        Object.keys(EntityAttributes.ATTRIBUTE_INFORMATION).forEach(attr => {
            const info = EntityAttributes.ATTRIBUTE_INFORMATION[attr];
            expect(info).toHaveProperty('name');
            expect(info).toHaveProperty('abbreviation');
            expect(info).toHaveProperty('realm');
            expect(info).toHaveProperty('type');
            expect(info).toHaveProperty('description');
            expect(info).toHaveProperty('exampleImpact');
        });
    });

    describe('EntityAttributes - serialization', () => {

        test('should serialize correctly', () => {
            const serializedData = attributes.forSerializing();
            expect(serializedData).toEqual({
                strength: 1,
                dexterity: 1,
                fortitude: 1,
                recovery: 1,
                psyche: 1,
                awareness: 1,
                stability: 1,
                will: 1,
                aura: 1,
                refinement: 1,
                depth: 1,
                flow: 1
            });
        });

        test('should serialize to JSON string correctly', () => {
            const jsonString = attributes.serialize();
            const parsed = JSON.parse(jsonString);

            expect(parsed).toEqual({
                strength: 1,
                dexterity: 1,
                fortitude: 1,
                recovery: 1,
                psyche: 1,
                awareness: 1,
                stability: 1,
                will: 1,
                aura: 1,
                refinement: 1,
                depth: 1,
                flow: 1
            });
        });

        test('should deserialize correctly', () => {
            const data = {
                strength: 5,
                dexterity: 3,
                fortitude: 7,
                recovery: 4,
                psyche: 6,
                awareness: 2,
                stability: 8,
                will: 3,
                aura: 9,
                refinement: 1,
                depth: 10,
                flow: 5
            };

            const deserializedAttributes = EntityAttributes.deserialize(data, entity);
            expect(deserializedAttributes).toBeInstanceOf(EntityAttributes);
            expect(deserializedAttributes.ofEntity).toBe(entity);
            expect(deserializedAttributes.strength).toBe(5);
            expect(deserializedAttributes.dexterity).toBe(3);
            expect(deserializedAttributes.fortitude).toBe(7);
            expect(deserializedAttributes.recovery).toBe(4);
            expect(deserializedAttributes.psyche).toBe(6);
            expect(deserializedAttributes.awareness).toBe(2);
            expect(deserializedAttributes.stability).toBe(8);
            expect(deserializedAttributes.will).toBe(3);
            expect(deserializedAttributes.aura).toBe(9);
            expect(deserializedAttributes.refinement).toBe(1);
            expect(deserializedAttributes.depth).toBe(10);
            expect(deserializedAttributes.flow).toBe(5);
        });

    });

});
