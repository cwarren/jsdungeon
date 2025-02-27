resource pools

the attributes are a matrix, crossing realm (body-mind-spirit) with type (power-control-resistance-recovery).

Consider a resource pool for each realm. 
I'm already thinking about:
* SP (stamina pool) - this is body-oriented, for combat and movement and physical active or toggleable skills or actions
* MP (mojo pool) [mojo is shorthand for one of magical, mystical, mental, miracle] - this is spirit-oriented, for mojo actions and effects
could add
* FP (focus pool) - this is mind-oriented, for non-physical active or toggle-able skills or actions


Develop this idea further when getting into skills and such....


follow-up thoughts:
* there's already a body-oriented pool with HP - maybe don't need SP? but... stamina might be the blended pool, derived from body, mind, and spirit (I think I like that...)
* * SP as it's often concieved is essentially just a different kind of mana points for different kinds of things
* * * if keeping SP, need to make sure it's more mechanically distinct from mana, e.g.
* * * * goes down when physical things are done, but by a multiplicative %, not a flat cost
* * * * not "spent" explicitly - just happens
* * * * current level is used as a factor in certain calculations, and occasionally a threshold limiter (somewhat akin to focus below, but where focus is more threshold-y, stamina is more factor-y)
* * * * passive restoration is very low
* * * * active restoration (resting / sleeping) is very high

maybe mind-body-spirit have slightly different mechanics
* body - health pool / points - other things remove them, if you hit 0 you die, you recover them over time
* * this is the classic hit points

* mind - focus points - maybe this is not a spend-type resource but instead a threshold-type resource and factor-type resource, focus of 0 doesn't stop you completely, but it stops you from doing anything complicated and generally reduces your capabilities and makes even simple things harder
* * the things that depend on focus don't generally use up focus, but they require focus to be above a certain level
* * certain things can reduce focus, but they're more like debuffs than depletions
* * an entity has a max focus, which (excluding exception mechanics like items and buffs and such) depends on their attributes (mostly the mind ones)
* * the entity's effective focus is generally lower than their max focus - most people are not at their max focus most of the time
* * * typically say .6 of max
* * * may go down based on environment
* * * accumulates penalties over time - removed by sleeping for a certain amount of time (the details on this TBD, but likely non-linear)
* * * * NOTE: not calling it a debuff because (to me) that implies a duration-based effect, but in this situation they simply pile up / accumulate and don't go away until specific action it take to deal with them
* * * active effects may buff it for a while
* * * * e.g. a Concentrate skill, which temporarily raises focus to 1/2 way (as an example - varies with skill level) between current level and max
* * * * e.g. a focusing aid may give a flat increase up to (or maybe even above) the max
* * mechanically, focus comes into play 2 main ways
* * * as a threshold - certain skills require a focus of a certain level to be able to use the skill - this is more common for active skills
* * * as a factor - used in the calculation of skill outcomes / evaluations - this is more common for passive skills
* * specialized things (classes, supporting skills, etc.) may alter / magnify effective focus for certain skills / situations
* * focus probably has a lot of non-linear stuff going on in terms of recovery targets, increases and decreases, etc.
* * * also a lot of specific triggered things - e.g.
* * * * dropping below a certain HP threshold dings your (but won't ding it again until you go above a certain threshold)
* * * * a structure or location that aligns with the entities interests will increase effective focus when within range of it and for a time after
* * * * a brief break / rest will increase focus if it's below a certain threshold... or if it's been reduced within a given amount of recent time

* spirit - mojo pool - deliberately spent, and recovered over time, you need to have them to be able to spend them
* * this is the classic mana points

In general, I like where this is going.... (at least for now - may end up too simulation-y )

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
* * attributes: dexterity (major), awareness (moderate), refinement (minor), strength (moderate), psyche (minor)
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

NOTE: advancement options include some improvement of base values that drive all the above - so 'real' base value is the base from the entity def, plus any advancement improvement, then that is fed into any calculations as the base

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
