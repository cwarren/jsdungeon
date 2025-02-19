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