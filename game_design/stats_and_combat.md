# thoughts on stats for entities

NOTE: shifting terminology from 'stats' to 'attributes' - the former may be used elsewhere with a different meaning (more data / statistics, like "total turns, total kills, etc.")

## general

Stats are a primary method and signal of progression / advancement in the game - they are expected to change over time.
Stats contribute to various calculations.
Other things may contribute to stats; stats are dynamic.

Stats should be universal across all entities - the avatar is special mostly through the player decisions / actions, not through abilities that are unique to it.

No intelligence stat, no wisdom stat - stats should reflect the mechanical and flavor impact more directly.


Dimensions - body, mind, spirit
Sub-dimensions - active: power, control; passive: resistance, recovery

body power - strength
body control - dexterity
body resistance - health, toughness, stamina
body recovery - health regeneration, physical debuff removal, stamina regen

mind power - reasoning, memory, visualization
mind control - senses, awareness, active charisma, intuition, focus
mind resistance - willpower, anti-deception
mind recovery - mental / sensory debuff removal

spirit power - mojo impact / effectiveness, passive charisma, aura
spirit control - mojo precision, mojo cost reduction, active charisma
spirit resistance - mojo pool, anti-deception
spirit recovery - mojo pool recovery, spirit debuff removal

appeal - a stand-alone? perhaps derived from the power & control stats across the primary dimensions?
speed - a combo of body power, body control, and mind control
* consider combat speed vs movement speed
endurance - a combo of body power, body resistance, mind control, mind resistance

Beyond the mechanical effects, the stats convey to the player a sense of what their character is like.

Skills are separate from stats, but impacted by them.

stat names & descriptions:
body power - strength - the raw force your body can create; impacts speed, damage driven by your muscles, how much you can carry, etc.
body control - dexterity - precision in using your body, and also your reaction speed; impacts speed, ability to hit things, careful work, etc.
body resistance - fortitude - your resistance to damage and other bodily degradation; impacts your health, stamina, and resistance to damage and other physical effects
body recovery - recovery - how well and how quickly you deal with damage to your body and other impairments; impacts how you get back health and stamina

mind power - reasoning - you capabilities with logic, memory, visualization, and imagination; impacts your ability to understand and use complex skills and abilities, and to figure out solutions
mind control - awareness - noticing and reacting to things externally and internally, directing your attention; impacts how well you notice things, your ability to avoid distractions, your application of the theoretical to the real, etc.
mind resistance - stability - your resistance to mental effects, magical and mundane; your ability to avoid deception and tricks, deal with challenges and stress, etc.
mind recovery - will - how quickly and effectively you bounce back from mental and sensory impairment; impacts how much sleep you need, how quickly you recover from mental shocks and sensory overload

spirit power - aura - how strong your spirit is; impacts the magnitude of your mojo effects, and your passive spiritual influence on others
spirit control - refinement - the degree of control you have over your spirit; impacts your fine control of mojo effects, your efficiency, and your active spiritual influence on others
spirit resistance - depth - the size and quality of your spirit; impacts your pool of spiritual power, and your resistance to spiritual influence
spirit recovery - flow - how well your spirit withstands and recovers from change; impacts how quickly you regain energy (MP), and how quickly you deal with lingering spiritual damage or other effects

## game play

Areas that stats impact game play:
* skills
* * combat - melee, range, evasion, armor, etc.
* * non-combat - social, craft, util, etc.
* * mojo - magical, mental, mystical, miracle
* combat mechanics - via combat skills & entity resources
* resistances - from damage mitigation to debuff duration to social pressure
* entity resources - health, stamina, mp, willpower(?); generally, things that have a max and a current; depletable and recoverable
* non-combat skills - social, utility, ???

### combat

One of the core elements of this kind of roguelike is combat - kill monsters, get stuff, get better.

Combat is about:
* hitting & being hit
* * fundamentally a contest of try to hit vs try to avoid
* effects of hitting & being hit
* * fundamentally a contest of try to apply affect vs try to resist effect

* tools - weapons & armor & such
* * tool quality / effectiveness
* * * modifiers
* * tool capability (what actions does it allow, what passives does it provide / cause)
* * * bases / limits
* * * possible/not-possible
* * * on hit
* * * on be hit
* * * on apply effect
* * * on receive effect

* ability to use the tool effectively
* * tool-specific skill
* * * possible/not-possible
* * * bases / limits
* * * modifiers
* * * enable / disable certain capabilities
* * wielder physical capability
* * * body power - modifiers
* * * body control - modifiers
* * * stamina / strain - resource management
* * wielder mental capability
* * * mental power - modifiers
* * * mental control - modifiers
* * * focus - resource management
* * * willpower - resource management
* * * senses / awareness - modifiers
* * perhaps wielder spiritual capability (for some tools?)
* * * spirit power - modifiers
* * * spirit control - modifiers
* * * mp - resource management

#### Combat Mechanics

The first contest is precision vs evasion.

The attacker generates a precision number. The defender generates an evasion number. Sum them, get a random value for that range, determine sub-range, determine extreme results (critical hit, critical dodge).

E.g. 
precision 32, evation 9
combat range is 41 - attack result is a random number 1-41 (1-32 = hit, 33-41 = miss)
criticality is calculated separately from the combat range (to avoid weirdness of small numbers, overlapping mechanics, etc.); for now, criticality range is 100 and criticality success is 1.

On a hit the attacker applies one or more effects to the defender. This is either a one-off effect (which happens immediately; usually resource depletion), or a duration effect which lasts a certain amount of time. Duration effects are either a condition (e.g. vulnerable, blind, confused, stunned, etc. - these may have a level beyond on/off) or a tick (e.g. bleeding, burning, etc. - these generally automatically apply some depletion effect or other one-off effect at set intervals).
Effects are generated by the attacker, and then mitigated by the defender.

Conditions may be binary or leveled. Leveled conditions have more impact the higher the level. A condition may have an associated tick, which alters the level over time. A leveled condition is removed if either the duration expires or the level is <= 0 at the start of the affected entity's turn.

Binary conditions aren't true booleans but instead leveled conditions with a max level of 1.

NOTE: current levels and level reductions may be fractions! Mechanics should not assume whole numbers nor equal values!

## implementation

For a given attack the attacker needs a getPrecision and the defender needs a getEvasion. Each needs to accept an Attack object, which has the attacker (entity), defender (entity), and Damager. The Damager already has a types list, which will include things like melee, aoe, ranged, etc. as well as things like fire, mental, chaos, blunt, etc. that are often more associated with the classic "damage type". The type information in the Damager may inform an entity's precision or evasion calculation.

Actually - Damager is really a specific type of a HitEffectGenerator. Generalize that


If the attack results in a hit, it is passed to the getHitEffects function, and results in a list of HitEffects (the simplest HitEffect is just some amount of damage, and initially the HitEffect list will contain only a single HitEffect, which is a Damage). The existing takeDamage function is still relevant, but it is superceded by a higher level beHit function which takes the list of hit effects and applies them - the application of a Damage hit effect is passed to takeDamage.

So, primary new and modified objects are
* Attack
* * attacker (Entity)
* * defender (Entity)
* * defenderHitEffectGenerators (list of EffectGenerator)
* * attackerHitEffectGenerators (list of EffectGenerator) (NOTE: this is for things like life steal, sacrifices, etc.; for now I'm expecting this will usually be empty, but it migth be a place where things like weapon skill growth is triggered)
* * possibly, defenderEvadeEffectGenerator and attackerEvadeEffectGenerator
* EffectGenerator
* * Damager is a specific type of EffectGenerator
* Effect
* * Damage is a specific type of Effect

And the primary functions (methods on Entity intances) are:
* createAttack(defender) - returns an Attack
* getPrecision(Attack) - returns a number
* getEvasion(Attack) - returns a number
* isHitCritical(Attack) - returns true/false
* isEvadeCritical(Attack) - returns true/false
* beHit(Attack) - runs each hitEffectGenerator in the attack and calls applyHitEffect to attacker or defender as appropriate with given HitEffect
* applyAttackEffect(sourceEntity, Effect)
* * for Damage type effects, calls takeDamageFrom
Also static method on the Entity class
* determnineAttackOutcome - returns HIT, CRITICAL_HIT, EVADE, CRITICAL_EVADE


### flow

1. attacker initiates an attack
2. create an Attack instance using the entity's createAttack method
2.1. populate at least the defenderHitEffectGenerators (for now this is enough)
3. determine the attack outcome
4. generate an apply each of the effects from the appropriate effectGenerators

---------------------

# how (and where) to handle value modifiers for attack effects?

The hit effect generators are determined very early in the process: attacker -> create attack (attacker.createAttack(defender)) -> get hit effect generators -> defender.beHit -> for each effect generator, generate the effect and apply it to the defender (with the attacker as the source)

The effect application happens within the entity to which the effect is being applied (the defender, in the case of a successful attack).

At the time of application, the system knows:
- the attacker (source)
- the defender (this)
- the effect which was generated

The effect has various types, and (for Damage effect) a base value. The types can be examined to determine what kind of value modifiers to apply... however, that has serious limitations. Thinking about two (or more) different weapons that are used, where the type of weapon changes which attributes and to what degree are used to modify the damage amount.

Basically, need a way to define the modifiers to use at the same time the damage source is set....?

Want to be able to say "this creature with these stats is making a melee attack with a long-sword":

precision
* the creature has some base numbers for melee attacks (precision)

* the creature has some modifers for melee attacks (precision)
OR
* the creature has some modifers for long sword attacks (precision)

* there are additioanl precision modifiers based on the defender (if the creature is notably good or bad at hitting this particular defender (by type, or individually))
* there are additional precision modifiers based on the defender (if the sword is notably good or bad at hitting this particular defender (by type or individually))

damage

* without a sword
* * the creature has some base damage for melee attacks (damage effect)
* * the creature has some modifers that are applied to that damage
* * there are additional modifiers based on the defender (if the creature does notably more or less damage to this particular defender (by type or individually))

* with a sword
* * the base damage is replaced with the sword's base damage
* * the modifiers are replaced with the modifiers the sword uses (which still depend on the the creature's attributes)
* * there are additional modifiers if the creature is notably good or bad with this sword (by type, or individually)
* * there are additional modifiers based on the defender (if the creature does notably more or less damage to this particular defender (by type or individually))
* * there are additional modifiers based on the defender (if the sword does notably more or less damage to this particular defender (by type or individually))

generalizing

base precision:
* creature or item

precision modifiers:
* base modifiers = creature or item
* also, creature vs defender
* if item, also:
* * creature using item
* * item vs defender

base damage:
* creature or item (this is the basic effect generator)

damage modifiers
* base modifiers = creature or item
* also, creature vs defender
* if item, also:
* * creature using item
* * item vs defender

NOTE: get rid of the item of 'item-less' attacks - creatures have various 'natural weapon' items that are used for the attacks. SO

base precision:
* primary item

precision modifiers:
* base modifiers from the item
* also, creature vs defender
* also,
* * creature using item
* * item vs defender
* other precision modifier sources
* * innate to creature
* * other items
* * et al


base damage:
* item (this is the basic effect generator)

damage modifiers
* base modifiers from the item
* also, creature vs defender
* also:
* * creature using item
* * item vs defender
* other damage modifier sources
* * innate to creature
* * other items
* * et al

=============

SO, items (weapons) need to define:
* characterists / types of the attack when using the weapon

* base precision when used to attack
* base precision modifiers when used to attack
* additional precision modifiers vs particular defenders

* effects generator used when the weapon hits
* * primary damage effect
* * * base damage when used to attack
* * * base damage modifiers when used to attack
* * * additional damage modifiers vs particular defenders
* * other on-hit effects
* * * condition under which the effect applies

==========================
==========================

I'm making this way too complicated up front....

An attack has a source weapon.

* the precision depends on
* * the weapon base
* * modifiers for how well the creature can use it
* * possible modifiers for attacker vs defender (ignore these for now)
* * possible modifiers for weapon vs defender (ignore these for now)
* * possible contextual modifiers (ignore these for now)

When it hits, the source weapon deals some damage. (maybe other effects too, but ignore those for now).
* the damage amount depends on
* * the weapon base
* * modifiers for how the creature's attributes impact that
* * possible modifiers for attacker vs defender (ignore these for now)
* * possible additional modifiers for weapon vs defender (ignore these for now)

An item (weapon or armor) is defined by:
* item type / name (e.g. SWORD_LONG)
* item tags (e.g. SWORD, WEAPON, ARMOR, etc.)
* item use tags (PRECISION, EVASION, DAMAGE, MELEE, PASSIVE_EQUIPPED, PASSIVE_CARRIED, ACTIVE, etc.)
* precision
* * base precision
* * user modifiers for precision
* * special target modifiers for precision (ignore these for now)
* * * attacker vs defender, weapon vs defender, context, etc.
* hit effects list
* * damage
* * * base damage (including types)
* * * user modifiers for damage
* * * special target modifiers for damage (ignore these for now)
* * * * attacker vs defender, weapon vs defender, context, etc.
* evasion
* * base evasion
* * user modifiers for evasion
* * special target modifiers for evasion (ignore these for now)
* * * defender vs attacker, defender vs weapon, context, etc.

For melee precision, merge the precision of all the attacker's items involved in the attack
* items isEquipped & flagged as all of:  MELEE, ATTACK, ACTIVE_PRECISION
* items isEquipped & flagged as all of:  MELEE, ATTACK, PASSIVE_EQUIPPED_PRECISION
* items flagged as all of:  MELEE, ATTACK, PASSIVE_CARRIED_PRECISION
Apply those merged modifers to a base of 0.
NOTE: modifers start with a tier 1 entry that has no multipliers and at least 1 flat modifer - this is the base (meaning, effectively they're summed when modifier sets are merged and then the merged version is applied to a starting value of 0)

For melee evasion, merge the evasion of all the defenders items involved in the defense
* items isEquipped & flagged as all of:  MELEE, ATTACK, ACTIVE_EVASION
* items isEquipped & flagged as all of:  MELEE, ATTACK, PASSIVE_EQUIPPED_EVASION
* items flagged as all of:  MELEE, ATTACK, PASSIVE_CARRIED_EVASION
NOTE: modifers start with a tier 1 entry that has no multipliers and at least 1 flat modifer - this is the base  (meaning, effectively they're summed when modifier sets are merged and then the merged version is applied to a starting value of 0)

For melee hit, generate (and accumulate) a hit effect for each item active in the attack
* items isEquipped & flagged as all of:  MELEE, ATTACK, ACTIVE_HIT_EFFECTS
* items isEquipped & flagged as all of:  MELEE, ATTACK, PASSIVE_HIT_EFFECTS
* items flagged as all of:  MELEE, ATTACK, PASSIVE_CARRIED_HIT_EFFECTS

----

For being hit
* the effect has
* * source causes (MELEE, ATTACK)
* * source entity
* * source item
* * types
* mitigate based on
* * defender items vs source causes (has all)
* * defender items vs source entity
* * defender items vs source item
* * defender items vs source types

Defender doesn't have inherent defences. Similar to attacks, entities have a natural defense item.

When handling a hit effect, apply mitigation modifers from items that are applicable to that hit effect
if the effect deals damage-
1. defender has a list/set of items
2. for each item
* items isEquipped & flagged as PASSIVE_EQUIPPED_MITIGATION
* items flagged as PASSIVE_CARRIED_MITIGATION
2.1. determine whether it can mitigate the hit effect (based on source causes, source entity, source item, and types), if so, accumulate the mitigation modifier
3. merge all the mitigation modifers
4. apply the merged modifiers to the effect damage

xxxx

item has
* precisionFlags: MELEE, ATTACK, ACTIVE, PASSIVE_EQUIPPED, PASSIVE_CARRIED, etc.
* evasionFlags: MELEE, ATTACK, ACTIVE, PASSIVE_EQUIPPED, PASSIVE_CARRIED, etc.
* damageFlags: MELEE, ATTACK, ACTIVE, PASSIVE_EQUIPPED, PASSIVE_CARRIED, etc.
* mitigationFlags: MELEE, ATTACK, ACTIVE, PASSIVE_EQUIPPED, PASSIVE_CARRIED, etc.

zzz

precision item filter:
* isPrimaryWeapon & precisionFlags include MELEE, ATTACK, and ACTIVE
* isEquipped & precisionFlags include MELEE, ATTACK, and PASSIVE_EQUIPPED
* precisionFlags include MELEE, ATTACK, and PASSIVE_CARRIED

evasion item filter:
* isPrimaryWeapon & evasionFlags include MELEE, ATTACK, and ACTIVE
* isEquipped & evasionFlags include MELEE, ATTACK, and PASSIVE_EQUIPPED
* evasionFlags include MELEE, ATTACK, and PASSIVE_CARRIED

damage item filter:
* isPrimaryWeapon & damageFlags include MELEE, ATTACK, and ACTIVE
* isEquipped & damageFlags include MELEE, ATTACK, and PASSIVE_EQUIPPED
* damageFlags include MELEE, ATTACK, and PASSIVE_CARRIED

mitigation item filter:
* isPrimaryWeapon & mitigationFlags include MELEE, ATTACK, and ACTIVE
* isEquipped & mitigationFlags include MELEE, ATTACK, and PASSIVE_EQUIPPED
* mitigationFlags include MELEE, ATTACK, and PASSIVE_CARRIED


ITEM groups and categories
* item key
* item specs - all the fun mechanical stuff
* flagSpecial - indicates this isn't a 'real' item but instead something used for internal game mechanics (e.g. a 'buff' item)
* isPrimaryWeapon - this item comes into play for ACTIVE MELEE ATTACKs
* isEquipped - has one or more equip slots
* isCarried - all the 'real' items a character has are carried