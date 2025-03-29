import { getRandomListItem, constrainValue } from '../util.js';

const DEFAULT_LEVEL_WIDTH = 80;
const LEVEL_WIDTH_BOUND_LOWER = 20;
const LEVEL_WIDTH_BOUND_UPPER = 240;
const DEFAULT_LEVEL_HEIGHT = 60;
const LEVEL_HEIGHT_BOUND_LOWER = 20;
const LEVEL_HEIGHT_BOUND_UPPER = 240;
const DEFAULT_LEVEL_TYPE = 'EMPTY';

class WorldLevelSpecification {
  constructor(type, width, height) {
    if (WorldLevelSpecification.getLevelTypesByAttribute('ALL').includes(type)) {
      this.type = type;
    } else {
      console.log(`unknown type for WorldLevelSpecification: ${type} - using EMPTY instead`);
      this.type = DEFAULT_LEVEL_TYPE;
    }
    this.width = width;
    this.height = height;
    this.gridTypeGenerationParams = null;
  }

  // -----------------------------------

  static generateWorldLevelSpec(specGenerationParams) {
    let genType = WorldLevelSpecification.getGenTypeFromSpecGenParams(specGenerationParams);
    let genWidth = WorldLevelSpecification.getGenWidthFromSpecGenParams(specGenerationParams);
    let genHeight = WorldLevelSpecification.getGenHeightFromSpecGenParams(specGenerationParams);
    const spec = new WorldLevelSpecification(genType, genWidth, genHeight);
    if (specGenerationParams.gridTypeGenerationParams) {
      spec.gridTypeGenerationParams = specGenerationParams.gridTypeGenerationParams;
    }
    if (specGenerationParams.populationParams) {
      spec.populationParams = specGenerationParams.populationParams;
    }
    return spec;
  }

  // -----------------------------------

  static getGenTypeFromSpecGenParams(specGenerationParams) {
    if (specGenerationParams.type && WorldLevelSpecification.getLevelTypesByAttribute('ALL').includes(specGenerationParams.type)) {
      return specGenerationParams.type;
    }

    if (specGenerationParams.typeAttribute) {
      const typesHavingAttribute = WorldLevelSpecification.getLevelTypesByAttribute(specGenerationParams.typeAttribute);
      if (typesHavingAttribute.length > 0) {
        return getRandomListItem(typesHavingAttribute);
      }
    }

    return DEFAULT_LEVEL_TYPE;
  }

  static getGenWidthFromSpecGenParams(specGenerationParams) {
    if (specGenerationParams.width) {
      return specGenerationParams.width;
    }

    let useMin, useMax;
    if (specGenerationParams.minWidth && specGenerationParams.maxWidth) {
      useMin = constrainValue(specGenerationParams.minWidth, LEVEL_WIDTH_BOUND_LOWER, LEVEL_WIDTH_BOUND_UPPER);
      useMax = constrainValue(specGenerationParams.maxWidth, LEVEL_WIDTH_BOUND_LOWER, LEVEL_WIDTH_BOUND_UPPER);

    } else {
      useMin = LEVEL_WIDTH_BOUND_LOWER;
      useMax = LEVEL_WIDTH_BOUND_UPPER;
    }
    return useMin + Math.floor(Math.random() * (useMax - useMin + 1));
  }

  static getGenHeightFromSpecGenParams(specGenerationParams) {
    if (specGenerationParams.height) {
      return specGenerationParams.height;
    }

    let useMin, useMax;
    if (specGenerationParams.minHeight && specGenerationParams.maxHeight) {
      useMin = constrainValue(specGenerationParams.minHeight, LEVEL_HEIGHT_BOUND_LOWER, LEVEL_HEIGHT_BOUND_UPPER);
      useMax = constrainValue(specGenerationParams.maxHeight, LEVEL_HEIGHT_BOUND_LOWER, LEVEL_HEIGHT_BOUND_UPPER);
    } else {
      useMin = LEVEL_HEIGHT_BOUND_LOWER;
      useMax = LEVEL_HEIGHT_BOUND_UPPER;
    }
    return useMin + Math.floor(Math.random() * (useMax - useMin + 1));
  }

  // -----------------------------------

  static getLevelTypesByAttribute(attr) {
    return this.levelTypes
      .filter(level => level.attributes.includes(attr))
      .map(level => level.typeIdentifier);
  }

  static levelTypes = [
    { typeIdentifier: "EMPTY", attributes: ['ALL', 'DEV'] },
    { typeIdentifier: "TOWN", attributes: ['ALL', 'CIVILIZED'] },
    { typeIdentifier: "ROOMS_SUBDIVIDE", attributes: ['ALL', 'CIVILIZED'] },
    { typeIdentifier: "ROOMS_RANDOM", attributes: ['ALL', 'CIVILIZED'] },
    { typeIdentifier: "PUDDLES", attributes: ['ALL', 'WATER', 'NATURAL_LAYER'] },
    { typeIdentifier: "BURROW", attributes: ['ALL', 'NATURAL'] },
    { typeIdentifier: "NEST", attributes: ['ALL', 'NATURAL'] },
    { typeIdentifier: "CAVES_SHATTERED", attributes: ['ALL', 'NATURAL'] },
    { typeIdentifier: "CAVES", attributes: ['ALL', 'NATURAL'] },
    { typeIdentifier: "CAVES_LARGE", attributes: ['ALL', 'NATURAL'] },
    { typeIdentifier: "CAVES_HUGE", attributes: ['ALL', 'NATURAL'] },
    { typeIdentifier: "RANDOM", attributes: ['ALL', 'DEV'] },
  ];



}

export { WorldLevelSpecification };