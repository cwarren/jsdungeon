import { UIPaneMain } from "./uiPaneMainClass.js";
import { UIPaneMessages } from "./uiPaneMessagesClass.js";
import { UIPaneInfo } from "./uiPaneInfoClass.js";
import { UIPaneMiniChar } from "./uiPaneMiniCharClass.js";

let uiPaneMain;
let uiPaneMessages;
let uiPaneInfo;
let uiPaneMiniChar;

function setupUi(gameState) {
  uiPaneMain = new UIPaneMain(gameState);
  uiPaneMessages = new UIPaneMessages();  
  uiPaneInfo = new UIPaneInfo();  
  uiPaneMiniChar = new UIPaneMiniChar(gameState.avatar);
  uiPaneMain.resetUIState();
  uiPaneMain.drawUI();
}

export {
  uiPaneMain, uiPaneMessages, uiPaneInfo, uiPaneMiniChar, setupUi,
};
