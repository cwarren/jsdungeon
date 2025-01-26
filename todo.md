* handle turns / timing for differnt world levels
* * give each world level it's own turn queue
* * * when entering a level
* * * * if no turn queue, initialize one, otherwise
* * * * calc standard turns since avatar left the level
* * * * if less than threshold, resume time as normal, otherwise
* * * * * remove the avatar from the turn queue for the new level
* * * * * advance time for the level being entered for the time since avatar left, up to some limit (~100 std turns)
* * * * * add the avatar to the front of the queue for the level being entered

* mobs on other levels

* healing over time
* * healing rate for entities

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

* mob AI basics
* * if adjacent to a hostile mob, attack it
* * basic movement stuff
* * * local random walk
* * * random destination
* * * move towards nearest visible mob to which current mob is hostile
* * * flee from location
* * * flee from hostile mobs

* support for multi-input commands, e.g. first command is "dig" and second input is a direction, or first command is 'sleep' and second input is a duration
* support for command confirmations, e.g. 'Are you sure you want to attack the town sheriff? (y/n)'

* add grid overlayTopOntoBottom and grid carveTopIntoBottom into grid utils 

* create an item class

* create an item container class

* CHECK AND FIX
* * seems to be something weird with the turn-taking system and maybe not all entities being added to it
* * had a situation where an entity was shown, but didn't actually exist (at least, not in the cell shown)
* * potential play exploit with stair traversal and action timing - think about how to resolve that
* * * consider tracking time away from that level, and then advanced turns player-less for that duration (up to some not-too-high limit)
* * keep an eye on time issues with running - seems OK at the moment, but tricky....

