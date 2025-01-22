* default actions / move-into actions
* * attack, for hostile mobs
* * * mob relationships / attitude

* create a basic combat system
* * health points
* * attacking
* * * dealing damage
* * * taking damage
* * * * tracking hostility (maybe - maybe too early for this)
* * healing
* * death (& removal from the world)

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

* add grid overlayTopOntoBottom and grid carveTopIntoBottom into grid utils 

* create an item class

* create an item container class

* CHECK AND FIX
* * move the turnQueue into the game state (so that if I do game saving the current queue will be saved)
* * potential play exploit with stair traversal and action timing - think about how to resolve that
* * * consider tracking time away from that level, and then advanced turns player-less for that duration (up to some not-too-high limit)
* * keep an eye on time issues with running - seems OK at the moment, but tricky....


