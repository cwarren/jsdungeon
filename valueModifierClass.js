class ValueModifier {
    constructor(initialModifierLayers = []) {
        this.modifierLayers = initialModifierLayers;
    }

    /**
     * Adds a new modifier layer.
     * @param {ModifierLayer} modifierLayer - an instance of a ModifierLayer object (see class def below), containing multipliers and flats.
     */
    addModifierLayer(modifierLayer) {
        if (!modifierLayer.multipliers) modifier.multipliers = [];
        if (!modifierLayer.flats) modifier.flats = [];
        this.modifierLayers.push(modifierLayer);
    }

    /**
     * Applies the stored modifiers to a base value.
     * @param {number} baseValue - The initial value before modifications.
     * @returns {number} - The modified value after applying all layers.
     */
    appliedTo(baseValue) {
        let curValue = baseValue;

        this.modifierLayers.forEach(modifierLayer => {
            if (modifierLayer.multipliers && Array.isArray(modifierLayer.multipliers)) {
                modifierLayer.multipliers.forEach(multiplier => {
                    curValue *= multiplier;
                });
            }
    
            if (modifierLayer.flats && Array.isArray(modifierLayer.flats)) {
                modifierLayer.flats.forEach(flat => {
                    curValue += flat;
                });
            }
        });
    
        return curValue;
    }
}

class ModifierLayer {
    constructor(initialMultipliers = [], initialFlats = []) {
        this.multipliers = initialMultipliers;
        this.flats = initialFlats;
    }
}


export { ValueModifier, ModifierLayer };
