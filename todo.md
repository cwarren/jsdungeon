* more mobs
* * mobs on other levels
* * more mob types spec-ed
* * more detailed info in mob type specs

* healing over time
* * healing rate for entities

* mob AI movement
* * basic movement stuff
* * * local random walk
* * * random destination
* * * move towards nearest visible mob to which current mob is hostile
* * * flee from location
* * * flee from hostile mobs

* currently on avatar death the UI is left in gameplay mode - should probably switch it to lost mode (and similar for game won (don't need to worry about abandon, since that only happens from meta screen and is already covered))

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

* CHECK AND FIX
* * keep an eye on time issues with running - seems OK at the moment, but tricky....

