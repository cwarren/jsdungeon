import { UIPaneMain } from "./uiPaneMainClass.js";
import { UIPaneMessages } from "./uiPaneMessagesClass.js";
import { UIPaneInfo } from "./uiPaneInfoClass.js";

let uiPaneMain;
let uiPaneMessages;
let uiPaneInfo;

function setupUi(gameState) {
  uiPaneMain = new UIPaneMain(gameState);
  uiPaneMessages = new UIPaneMessages();  
  uiPaneInfo = new UIPaneInfo();  
}

export {
  uiPaneMain, uiPaneMessages, uiPaneInfo, setupUi,
};
