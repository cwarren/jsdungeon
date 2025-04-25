class UIPaneMainStateManager {

  static uiStates = [
    "GAME_PLAY",
    "CHARACTER_SHEET",
    "INVENTORY",
    "EQUIPMENT",
    "MAP_SCREEN",
    "GAME_META",
    "GAME_OVER",
    "PROSE_SECTION",
    "CUSTOM_GRAPHICS",
    "HELP",
  ];

  constructor(ui) {
    this.ui = ui;
    this.uiStateStack = ["GAME_META", "GAME_PLAY"];
  }

  getCurrentUIState() {
    return this.uiStateStack.length > 0 ? this.uiStateStack[this.uiStateStack.length - 1] : "GAME_PLAY";
  }

  pushUIState(newState) {
    this.uiStateStack.push(newState);
  }

  popUIState() {
    if (this.uiStateStack.length > 1) {
      // Prevent popping the last state
      return this.uiStateStack.pop();
    }
  }

  setUIState(newState) {
    this.uiStateStack = [newState];
    resizeCanvas();  // Redraw to reflect new state
  }

  resetUIState() {
    this.uiStateStack = ["GAME_META"];
  }
}

export { UIPaneMainStateManager };