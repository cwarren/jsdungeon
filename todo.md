to start server: 
PS E:\code\jsdungeon> docker-compose up --build

* implement entity sleeping
* * hook up sleeping stuff in turn taking (same place(s) as running)

* add some kind of delay in the continuous action loops (sleeping and running, for now) so that players can see the world update during the continuous action

* add to entity a general interruptContinuousActivity, which stops running, sleeping, and any future continuous activity

* make any game play command interrupt all continuous activities

* stats for entities / stat system (what they are and mean; what effect they have)
* * begin richer combat stuff in general

* more mob stuff
* * simple status sheets for mobs (for display in info block when attacking or otherwise interacting with that mob)

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

* implement map screen
* * map view - very zoomed out, to fit screen; centered on level center, not avatar, structures and avatar drawn larger than cells; avatar highlighted
* * * maybe base size and center on seen cells, not whole level (track up-est, down-est, left-est, and right-est seen cells to aid in these calcs)

* healing currently is checked when an entity takes it's turn, which could lead to some weird healing bursts for slow-acting entities. Consider moving it to a global check (anchored at world level, triggered by game time?)

* when an entity dies, remove it from the damagedBy lists of other entities
* * maybe have to add to entities a list of thing's they've damaged... though that could get messy, especially for the avatar
* * decide whether death credits able to go to already dead things is a feature or a bug...

* when running, stop if a mob becomes newly visible
* when running, stop if a structure becomes newly visible
* when running, stop if approaching a corner
* when running, turn corners when running in a corridor
* when running, change adjacency interrupts to interrupt on newly adjacent only

* resolve duped info between direction deltas in gameActions and adjacency directions in GridCell

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

* current minichar display is unregisters when game becomes over. while this is OK, it hides the final char info from the player. consider shifting the de-registration to a different point so that the player can see info about there character and the point the game ended
* * maybe when GAME_OVER ui state is popped? feels a bit messy....


* when entering a level for the first time then time runs based on time on previous level - this should not happen when entering a level for the first time
* * though, it doesn't really break things... just means some mobs may fight if they're hostile to each other... which shouldn't be much of a problem outside development, since eventually most mobs will not be hostile to each other...


* magic (probably use activate-able items under the hood...?)

* special traits (e.g. extra mana channels, which lets an avatar equip more magic items than normal)

* CHECK AND FIX
* * keep an eye on time issues with running - seems OK at the moment, but tricky....
* * address hack of directly accessing lastNaturalHealingTime when gameTime wraps (in normalizeQueueTimes)
* ISSUE! running tests with "this.populateLevelWithEntities(firstLevel); // DEV FUNCTION" active in gameStateClass drops things into an infinite loop
* * figure out which test surfaces this
* * * this seems to happen for worldLevelClass.integration.test.js, but only when running the full test suite (npx jest) and only some of the time
* * figure out why the infinite processing happens
* * fix it
* * * test to expose? depends on the particular issue/reason....
