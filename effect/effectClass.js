// NOTE: this is effectively an abstract class and is mostly just organizational - every effect
//  has types, but the core of the effect lives in the sub-classes of this (e.g. EffDamage) and
//  may be wildly varied and have specific kinds of handling

class Effect {
  constructor(effectTypes = []) {
    this.types = effectTypes;
  }
}

export { Effect };