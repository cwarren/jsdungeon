// NOTE: this is effectively an abstract class - it's never instantiated directly; only sub-classes for 
// specific effect generators (e.g. EffGenDamage) are actually used directly

class EffectGenerator {
  constructor(effectTypes = []) {
    this.types = effectTypes;
  }

  // override this
  getEffect() {
    return null;
  }
}

export { EffectGenerator };