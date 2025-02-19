resource pools

the attributes are a matrix, crossing realm (body-mind-spirit) with type (power-control-resistance-recovery).

Consider a resource pool for each realm. 
I'm already thinking about:
* SP (stamina pool) - this is body-oriented, for combat and movement and physical active or toggleable skills or actions
* MP (mojo pool) [mojo is shorthand for one of magical, mystical, mental, miracle] - this is spirit-oriented, for mojo actions and effects
could add
* FP (focus pool) - this is mind-oriented, for non-physical active or toggle-able skills or actions


Develop this idea further when getting into skills and such....

-------------------------

core formulas

The basics of the game revolve around exploration and melee combat (for now) - move around, find enemies, run into enemies, which attacks them, which deals damage to them and eventually kills them.

An entity's capabilities in that area depend on:
* inherent modifiers
* attributes
* items (to be implemented)
* skills  (to be implemented)
* circumstances (to be implemented, intersects with items and skills most likely, though probably some innate)
* * environment
* * positioning
* * attacker & defender specials
* temporary modifiers (buffs and debuffs)
These dependencies may have flat effects, multiplier effects, or other more complex effects


Core game play factors - these are things that need wrapper methods on their values, and the formulas involve all the above dependencies.

movement/exploration factors
* vision radius
* searching (to be implemented)
* * effectiveness / effects
* * cost
* * * time
* * * focus(?)
* movement cost (NOTE: entry movement cost for grid cells is not currently handled; this is part of the circumstances dependency)
* * time
* * stamina

combat factors
* max health
* current health
* natural health recovery amt
* natural health recovery rate
* precision
* evasion
* effects caused by hitting
* effects mitigated on being hit
* combat action cost
* * time
* * stamina

combat side-factors
* knowledge of enemy
* * study
* * kills

For initial implementation, need
* getVisionRadius
* * attributes: fortitude (minor), awareness (major), psyche (minor)
* getMaxHealth (or determinMaxHealth)
* * attributes: fortitude (major), strength (minor), stability (minor), aura (minor), depth (moderate)
* getNaturalHealthRecoveryAmount
* * attributes: recovery (major), fortitude (minor), flow (minor)
* getNaturalHealthRecoveryFrequency
* * attributes: recovery (major), fortitude (moderate), will (minor), refinement (minor), flow (minor)
* getPrecision
* * attributes: dexterity (major), awareness (moderate), refinement (minor), strength (minor), psyche (minor)
* getEvasion
* * attributes: dexterity (major), awareness (major), refinement (moderate)
* getAttackEffects
* * attributes: strength (major), dexterity (minor), aura (minor)
* mitigateEffect
* * attributes: fortitude (major), stability (moderate), depth (minor), dexterity (minor), awareness (minor)
* getMovementCostTime
* * attributes: strength (minor), dexterity (moderate), fortitude (major), psyche (minor), awareness (moderate)
* getAttackCostTime
* * attributes: strength (moderate), dexterity (moderate), awareness (moderate), pysche (minor), aura (minor), refinement (minor)

* getMaxStamina (or determinMaxStamina)
* * attributes: fortitude (major), strength (minor), stability (moderate), will (moderate), refinement (minor), depth (moderate)
* getNaturalStaminaRecoveryAmount
* * attributes: recovery (major), fortitude (moderate), stability (minor), psyche (minor), aura (minor) flow (minor)
* getNaturalStaminaRecoveryFrequency
* * attributes: recovery (major), fortitude (major), aura (moderate)
* getMovementCostStamina
* * attributes: dexterity (moderate), fortitude (moderate), awareness (moderate), stability (minor), will (minor), refinement (minor), depth (minor)
* getAttackCostStamina
* * attributes: strength (moderate), dexterity (major), fortitude (major), awareness (minor), stability (moderate), aura (minor), depth (minor)

-------------------------

value ranges and calculations

The grain size needs to be large enough to have a single grain be meaningful, and small enough to allow for significant variance.

Usually, calculations should not result in hard limits - e.g. nothing like "evasion is so high it's impossible for anything to hit", though soft limits are fine.

The values display to the user may be a scaled down version of the actual values (e.g. internal uses a 1-1000 range, but /10 to show the user a 1-100 range).

In general, ranges don't have real limits - ranges like 1-100 or 1-1000 suggest typical kinds of values, but nothing's preventing actual values to exceed the nominal max; the calculations should still work for any values involved.

HOWEVER, it is often useful to have a base / center value - e.g. if base strength is 10, then an attacker with 12 strength might get a 1.2x multiplier on damage done (or flat +2, or whatever)

Calculations follow a mult-before-flat modifer approach, and there are modifer sequences which need to be appropriately named

((((base(layer 1) value * base(layer 1) multipliers) + base(layer 1) flats) * layer 2 multipliers) + layer 2 flats) * layer 3 multipliers) + layer 3 flats ....

valueCalc (baseVal, modifierLayers)
* base value is a number
* modifiers is an array of objects, each of which has multipliers (array) and flats (array)
* calc starts with cur value = base value, then
* * for each modiferLayer
* * * 1. for each multiplier, cur value *= multiplier
* * * 2. for each flat, cur value += flat
* NOTE: should be fine if modifier layers are partly or completely empty (though completely empty would be kind of pointless.... but it shouldn't break)
