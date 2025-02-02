to start server: 
PS E:\code\jsdungeon> docker-compose up --build

* create a class (or classes) for the ui stuff instead of just a jumbled library

* add info text for current level (change when level changes)(with hooks for avatar knowldedge of level)

* update minichar display...
* * when things start
* * when avatar status changes (override status-changing methods - call parent, then update minichar)
* * avatar has a getMiniCharBlock function, which generates text to display depending on avatar status
* * NOTE: may have to set mini char font to fixed width

* make world level specs richer
* * object instead of array, so fields can be usefully named and more easily extended
* * dimensions spec style - FIXED vs BOUNDED
* * * FIXED - look for specific width and height
* * * BOUNDED - look for max and min for width and height
* * update world level generator to take a level spec object instead of particular fields
* * * update constructor implementation to account for dimensions spec style
* * * FUTURE: consider a richer LevelSpec class

* revisit entity relationships
* * maybe default entity relation, then relation type lists for exceptions?
* * maybe a super default for the avatar - all entities hostile to avatar unless there's an explicit exception?
* * * maybe a default on the recipient side instead
logic:
1. relation = get default "what others think of me" from target, if it exists
2. if self has any relation overrides, check those for target and relation = that override
3. if relation not set, relation = get default "what I think of others" from self if it exists
4. if still not set, relation is NEUTRAL_TO

* shift bulk of determineVisibleCells into grid utils

* move world level specs from ui into game state (new game)

* more mob stuff
* * stats for mobs / stat system (what they are and mean; what effect they have)
* * simple status sheets for mobs (for display in info block)

* more more mob stuff
* * mobs on other levels
* * * random mobs for level
* * * * gating mobs by depth
* * * * gating mobs by level type
* * * * advancing weaker mobs for deeper than normal levels (by degree out-of-depth)
* * * * * implement basic mob advancement using advancement points, then give out-of-depth mobs extra advancement points
* * dynamically calculated baseKillPoints, depending on mob power levels
* * * eventually, a few different formulas coded for this, and mob spec indicates which to use
* * more mob types spec-ed
* * more detailed info in mob type specs

* healing currently is checked when an entity takes it's turn, which could lead to some weird healing bursts for slow-acting entities. Consider moving it to a global check (anchored at world level, triggered by game time?)

* currently on avatar death the UI is left in gameplay mode - should probably switch it to lost mode (and similar for game won (don't need to worry about abandon, since that only happens from meta screen and is already covered))

* when an entity dies, remove it from the damagedBy lists of other entities
* * maybe have to add to entities a list of thing's they've damaged... though that could get messy, especially for the avatar
* * decide whether death credits able to go to already dead things is a feature or a bug...

* when running, stop if a mob becomes newly visible
* when running, stop if a structure becomes newly visible
* when running, stop if approaching a corner
* when running, turn corners when running in a corridor
* when running, change adjacency interrupts to interrupt on newly adjacent only

* resolve duped info between direction deltas in gameActions and adjacency directions in GridCell

* ? refactor UI stuff into UI Manager objects (diff for each display area)

* grid display enhancements
* * zoom in / out
* * center on avatar
* * map view - very zoomed out, to fit screen; centered on level center, not avatar, structures and avatar drawn larger than cells; avatar highlighted
* * * maybe base size and center on seen cells, not whole level (track up-est, down-est, left-est, and right-est seen cells to aid in these calcs)

* support for multi-input commands, e.g. first command is "dig" and second input is a direction, or first command is 'sleep' and second input is a duration
* support for command confirmations, e.g. 'Are you sure you want to attack the town sheriff? (y/n)'
* support for targeted commands, first of which is look / examine

* add grid overlayTopOntoBottom and grid carveTopIntoBottom into grid utils
* * chance for a level to have puddles (overlay)
* * chance for a level to have a river through it (carve)


* create a basic item class

* create an item container class

* equipment
* * slots
* * equippables
* * UI mode
* * entity calcs use equipped things

* create AI modules that can be plugged into entities rather than stuffing all the options directly in the entity class

* activate-able items

* mob AI movement
* * trigger moveFlee when life is low (reset to normal when sufficiently healed)
* * advanced - flee from location
* * very advanced - flee from hostile mobs

* richer combat

* ranged combat

* when entering a level for the first time then time runs based on time on previous level - this should not happen when entering a level for the first time
* * though, it doesn't really break things... just means some mobs may fight if they're hostile to each other... which shouldn't be much of a problem outside development, since eventually most mobs will not be hostile to each other...


* magic (probably use activate-able items under the hood...?)

* special traits (e.g. extra mana channels, which lets an avatar equip more magic items than normal)

* CHECK AND FIX
* * keep an eye on time issues with running - seems OK at the moment, but tricky....

