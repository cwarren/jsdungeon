* running

* combat system

* default actions / move-into actions
* * attack, for hostile mobs
* * * mob relationships / attitude

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

* make level generation dynamic rather than having them all created as part of world initialization

* add grid overlayTopOntoBottom and grid carveTopIntoBottom into grid utils 

* create an item class

* create an item container class

* CHECK AND FIX
* * potential play exploit with stair traversal and action timing - think about how to resolve that
* * * consider tracking time away from that level, and then advanced turns player-less for that duration (up to some not-too-high limit)


