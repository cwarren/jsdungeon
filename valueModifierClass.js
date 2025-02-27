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

    /**
     * Combines multiple ValueModifiers into a new one.
     * @param {...ValueModifier} valueModifiers - Any number of ValueModifier instances to combine.
     * @returns {ValueModifier} - A new ValueModifier containing combined layers
     */
    static combine(...valueModifiers) {
        const maxLayers = Math.max(...valueModifiers.map(vm => vm.modifierLayers.length), 0);
    
        const combinedLayers = Array.from({ length: maxLayers }, (_, i) => {
            const layersToCombine = valueModifiers
                .map(vm => vm.modifierLayers[i])
                .filter(layer => layer !== undefined);
    
            return ModifierLayer.combine(...layersToCombine);
        });
    
        return new ValueModifier(combinedLayers);
    }
}

class ModifierLayer {
    constructor(initialMultipliers = [], initialFlats = []) {
        this.multipliers = initialMultipliers;
        this.flats = initialFlats;
    }

    /**
     * Combines multiple ModifierLayers into a new one.
     * @param {...ModifierLayer} layers - Any number of ModifierLayer instances to combine.
     * @returns {ModifierLayer} - A new ModifierLayer containing combined multipliers and flats.
     */
    static combine(...layers) {
        const combinedMultipliers = layers.flatMap(layer => layer.multipliers);
        const combinedFlats = layers.flatMap(layer => layer.flats);

        return new ModifierLayer(combinedMultipliers, combinedFlats);
    }
}


export { ValueModifier, ModifierLayer };
