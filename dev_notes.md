# To add a new UI mode:

1. create an appropriate actions js file, which has
1.a. the actions map for the UI (see gameActions.js as an example) (likely empy initially, or calling stubbed functions)
1.b. the implementations of the actions (not present, or maybe stubbed with just a console log of the action)

2. add to UI actions the action to switch to the new UI mode

3. add to ui.js...
3.a. a draw function for the new mode (initially with a simple message indicating you're in the proper mode)
3.b. a case in drawUI to route to the new mode

4. add to gameCommands...
4.a. import of the new actions map
4.b. key bindings to get into the new mode from the appropriate modes (typically a PUSH_<NEW_MODE> binding)
4.c. key bindings for the new mode to leave (Escape -> pop ui state)

5. validate basic mode navigation

6. tackle the specialized functionality of the new game mode, implemention relevant ui drawws, actions, and key bindings as needed

