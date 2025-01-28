* mob AI movement
* * create a basic mob that should move
* * basic movement stuff
* * * random destination (WANDER_AIMLESS)
* * * move towards nearest visible mob to which current mob is hostile, or aimless otherwise (WANDER_AGGRESSIVE)
* * * advanced - flee from location
* * * advanced - flee from hostile mobs

* more mobs
* * mobs on other levels
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

* ui panes
* * mini char
* * messages
* * info

* support for multi-input commands, e.g. first command is "dig" and second input is a direction, or first command is 'sleep' and second input is a duration
* support for command confirmations, e.g. 'Are you sure you want to attack the town sheriff? (y/n)'

* add grid overlayTopOntoBottom and grid carveTopIntoBottom into grid utils 

* create an item class

* create an item container class

* create AI modules that can be plugged into entities rather than stuffing all the options directly in the entity class

* CHECK AND FIX
* * keep an eye on time issues with running - seems OK at the moment, but tricky....

