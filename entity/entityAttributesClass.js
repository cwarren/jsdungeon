import { rollDice } from "../util.js";

class EntityAttributes {
  /**
   * Creates an instance of EntityAttributes - these are the primary numeric descriptors of the entity and drive many game mechanics.
   * @param {Object} ofEntity - The entity this health belongs to.
   */
  constructor(ofEntity) {
    this.ofEntity = ofEntity;

    this.strength = 1;
    this.dexterity = 1;
    this.fortitude = 1;
    this.recovery = 1;

    this.psyche = 1;
    this.awareness = 1;
    this.stability = 1;
    this.will = 1;

    this.aura = 1;
    this.refinement = 1;
    this.depth = 1;
    this.flow = 1;
  }

  setAttributes(attrObj) {
    for (const key of EntityAttributes.ATTRIBUTE_ORDERING) {
      if (attrObj[key] !== undefined) {
        this[key] = attrObj[key];
      }
    }
  }

  rollAttributes(attrObj) {
    for (const key of EntityAttributes.ATTRIBUTE_ORDERING) {
      if (attrObj[key] !== undefined) {
        this[key] = rollDice(attrObj[key]);
      }
    }
  }

  getAttributeSummary() {
    let summary = {};
    for (const key of EntityAttributes.ATTRIBUTE_ORDERING) {
        summary[key] = this[key];
    }
    return summary;
  }

  // THIS IS AN EXTREMELY IMPORTANT NUMBER!!!!
  static BASE_VALUE = 100; // this is the "normal" / "average" value for each attribute - generally, above this gives bonuses, below gives penalties
  // This number is used in many calculations

  static ATTRIBUTE_ORDERING = [
    'strength', 'dexterity', 'fortitude', 'recovery',
    'psyche', 'awareness', 'stability', 'will',
    'aura', 'refinement', 'depth', 'flow',
  ];

  static ATTRIBUTE_INFORMATION = {
    strength: {
      name: 'strength',
      abbreviation: 'str',
      realm: 'body',
      type: 'power',
      description: 'the raw force your body can create',
      exampleImpact: 'impacts speed, damage driven by your muscles, how much you can carry, etc.'
    },
    dexterity: {
      name: 'dexterity',
      abbreviation: 'dex',
      realm: 'body',
      type: 'control',
      description: 'precision in using your body, and also your reaction speed',
      exampleImpact: 'impacts speed, ability to hit things, careful work, etc.'
    },
    fortitude: {
      name: 'fortitude',
      abbreviation: 'for',
      realm: 'body',
      type: 'resistance',
      description: 'your resistance to damage and other bodily degradation',
      exampleImpact: 'impacts your health, stamina, and resistance to damage and other physical effects'
    },
    recovery: {
      name: 'recovery',
      abbreviation: 'rec',
      realm: 'body',
      type: 'recovery',
      description: 'how well and how quickly you deal with damage to your body and other impairments',
      exampleImpact: 'impacts how you get back health and stamina, and to shake off physical shocks and effects'
    },
    //--------------------
    psyche: {
      name: 'psyche',
      abbreviation: 'psy',
      realm: 'mind',
      type: 'power',
      description: 'you capabilities with logic, memory, visualization; your imagination and creativity; the strength and complexity of your emotions',
      exampleImpact: 'impacts your ability to understand and use complex skills and abilities, and to figure out solutions'
    },
    awareness: {
      name: 'awareness',
      abbreviation: 'awa',
      realm: 'mind',
      type: 'control',
      description: 'noticing and reacting to things externally and internally, directing your attention and thoughts and feelings',
      exampleImpact: 'impacts how well you notice things, your ability to avoid distractions, your application of the theoretical to the real, etc.'
    },
    stability: {
      name: 'stability',
      abbreviation: 'sta',
      realm: 'mind',
      type: 'resistance',
      description: 'your resistance to mental effects, magical and mundane',
      exampleImpact: 'your ability to avoid deception and tricks, resistance to persuasion, deal with challenges and stress, etc.'
    },
    will: {
      name: 'will',
      abbreviation: 'wil',
      realm: 'mind',
      type: 'recovery',
      description: 'how quickly and effectively you bounce back from mental and sensory impairment',
      exampleImpact: 'impacts how much sleep you need, how quickly you recover from mental shocks and sensory overload'
    },
    //--------------------
    aura: {
      name: 'aura',
      abbreviation: 'aur',
      realm: 'spirit',
      type: 'power',
      description: 'how strong your spirit is',
      exampleImpact: 'impacts the magnitude of your mojo effects, and your passive spiritual influence on others'
    },
    refinement: {
      name: 'refinement',
      abbreviation: 'ref',
      realm: 'spirit',
      type: 'control',
      description: 'the degree of control you have over your spirit',
      exampleImpact: 'impacts your fine control of mojo effects, your efficiency, and your active spiritual influence on others'
    },
    depth: {
      name: 'depth',
      abbreviation: 'dep',
      realm: 'spirit',
      type: 'resistance',
      description: 'the size and quality of your spirit',
      exampleImpact: 'impacts your pool of spiritual power (MP), and your resistance to spiritual influence'
    },
    flow: {
      name: 'flow',
      abbreviation: 'flo',
      realm: 'spirit',
      type: 'recovery',
      description: 'how well your spirit withstands and recovers from change',
      exampleImpact: 'impacts how quickly you regain energy (MP), and how quickly you deal with lingering spiritual damage or other effects'
    },
  };
}

export { EntityAttributes };